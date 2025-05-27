import { defineFlow } from '@genkit-ai/core'; // Change import to @genkit-ai/core
import { defineStreamingFlow } from '@genkit-ai/flow'; // Import defineStreamingFlow
import { z } from 'zod';
import { ai } from '..';
import { LiveAPISessionManager } from '@/lib/live-api-session-manager';
import { GoogleLiveAPIClient } from '@/lib/google-live-api';
import { getSecret } from '@/lib/secret-manager'; // Keep getSecret for potential future use or other secrets
import {
  RealtimeInputSchema,
  RealtimeOutputSchema,
  ErrorSchema,
  SessionStatusSchema,
} from '../schemas/types';

// Store for active streaming contexts
const activeStreams = new Map<string, AbortController>();

// Get the singleton instance of LiveAPISessionManager
const liveAPISessionManager = LiveAPISessionManager.getInstance();

export const realtimeInterviewFlow = defineStreamingFlow( // Use defineStreamingFlow
  {
    name: 'realtimeInterviewFlow',
    inputSchema: RealtimeInputSchema,
    outputSchema: RealtimeOutputSchema,
    streamSchema: RealtimeOutputSchema,
  },
  async (input: z.infer<typeof RealtimeInputSchema>, { streamingCallback }: { streamingCallback: (chunk: z.infer<typeof RealtimeOutputSchema>) => Promise<void> }) => {
    const { sessionId, userId, jobRole, difficulty, systemInstruction } = input;
    
    try {
      // Check for existing stream
      if (activeStreams.has(sessionId)) {
        const existingController = activeStreams.get(sessionId)!;
        if (!existingController.signal.aborted) {
          throw new Error('Session already has an active stream');
        }
      }

      // Create abort controller for this stream
      const abortController = new AbortController();
      activeStreams.set(sessionId, abortController);

      // Handle control messages
      if (input.controlMessage) {
        return await handleControlMessage(input, streamingCallback);
      }

      // Get or create Live API session
      // Use getOrCreateSession which handles fetching the API key internally
      let liveClient = await liveAPISessionManager.getOrCreateSession(sessionId, {
        model: 'models/gemini-2.0-flash-exp',
        systemInstruction,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      
      // Ensure liveClient is not null before proceeding
      if (!liveClient) {
           await streamingCallback({
            type: 'error',
            data: {
              code: 'SESSION_CREATION_FAILED',
              message: 'Failed to get or create Live API session.',
              retryable: true,
              timestamp: new Date().toISOString(),
            },
          });
          activeStreams.delete(sessionId);
          throw new Error('Failed to get or create Live API session.');
      }


      // Set up event listeners for streaming
      setupLiveClientListeners(liveClient, sessionId, streamingCallback);

      // Connect to Live API
      await liveClient.connect();
      
      // Send connection established message
      await streamingCallback({
        type: 'control',
        data: { 
          status: 'connected',
          sessionId,
          timestamp: new Date().toISOString(),
        },
      });
      

      // Handle audio input
      if (input.audioChunk) {
        const audioBuffer = liveClient.base64ToArrayBuffer(input.audioChunk);
        liveClient.sendAudio(audioBuffer);
      }

      // Handle text input
      if (input.textInput) {
        liveClient.sendText(input.textInput);
        
        // Echo user text to transcript
        await streamingCallback({
          type: 'transcript',
          data: {
            speaker: 'user',
            text: input.textInput,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Keep the stream alive
      return new Promise<z.infer<typeof RealtimeOutputSchema>>((resolve, reject) => {
        // Set up abort handling
        abortController.signal.addEventListener('abort', () => {
          resolve({
            type: 'control',
            data: { status: 'stream_ended' },
          });
        });

        // Set up timeout (30 minutes)
        const timeout = setTimeout(() => {
          abortController.abort();
          liveAPISessionManager.endSession(sessionId);
        }, 30 * 60 * 1000);

        // Clean up on stream end
        const cleanup = () => {
          clearTimeout(timeout);
          activeStreams.delete(sessionId);
        };

        abortController.signal.addEventListener('abort', cleanup);
      });

    } catch (error) {
      console.error('Realtime interview flow error:', error);
      
      // Send error to client
      await streamingCallback({
        type: 'error',
        data: {
          code: 'FLOW_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: true,
          timestamp: new Date().toISOString(),
        },
      });

      // Clean up
      activeStreams.delete(sessionId);
      
      throw error;
    }
  }
);

function setupLiveClientListeners(
  client: GoogleLiveAPIClient,
  sessionId: string,
  streamingCallback: (chunk: z.infer<typeof RealtimeOutputSchema>) => Promise<void>
) {
  // Audio data handler
  client.on('audioData', async (audioBuffer: ArrayBuffer) => {
    try {
      await streamingCallback({
        type: 'audio',
        data: client.arrayBufferToBase64(audioBuffer),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error streaming audio:', error);
    }
  });

  // Transcript handler
  client.on('transcript', async ({ type, text }: { type: string; text: string }) => {
    try {
      await streamingCallback({
        type: 'transcript',
        data: {
          speaker: type === 'user' ? 'user' : 'ai',
          text,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error streaming transcript:', error);
    }
  });

  // Ready handler
  client.on('ready', async () => {
    try {
      await streamingCallback({
        type: 'control',
        data: {
          status: 'ready',
          message: 'Live API connection established',
        },
      });
    } catch (error) {
      console.error('Error sending ready status:', error);
    }
  });

  // Error handler
  client.on('error', async (error: any) => {
    console.error('Live API error:', error);
    try {
      await streamingCallback({
        type: 'error',
        data: {
          code: 'LIVE_API_ERROR',
          message: error.message || 'Live API error occurred',
          retryable: true,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (streamError) {
      console.error('Error streaming error:', streamError);
    }
  });

  // Disconnection handler
  client.on('disconnected', async () => {
    try {
      await streamingCallback({
        type: 'control',
        data: {
          status: 'disconnected',
          message: 'Live API connection lost',
        },
      });
    } catch (error) {
      console.error('Error sending disconnect status:', error);
    }

    // Clean up session
    liveAPISessionManager.endSession(sessionId);
  });

  // Turn complete handler
  client.on('turnComplete', async () => {
    try {
      await streamingCallback({
        type: 'control',
        data: {
          status: 'turn_complete',
          message: 'AI finished speaking',
        },
      });
    } catch (error) {
      console.error('Error sending turn complete:', error);
    }
  });
}

async function handleControlMessage(
  input: z.infer<typeof RealtimeInputSchema>,
  streamingCallback: (chunk: z.infer<typeof RealtimeOutputSchema>) => Promise<void>
): Promise<z.infer<typeof RealtimeOutputSchema>> {
  const { sessionId, controlMessage } = input;
  
  if (!controlMessage) {
    throw new Error('Control message is required');
  }

  const client = liveAPISessionManager.getSession(sessionId);

  // Ensure client is not null before using it
  if (!client) {
      throw new Error(`Live API client not found for session: ${sessionId}`);
  }

  switch (controlMessage.type) {
    case 'stop':
      // End the session
      await liveAPISessionManager.endSession(sessionId);
      
      // Abort the stream
      const controller = activeStreams.get(sessionId);
      if (controller) {
        controller.abort();
      }
      
      return {
        type: 'control',
        data: {
          status: 'session_ended',
          timestamp: new Date().toISOString(),
        },
      };

    case 'interrupt':
      // Interrupt current AI response
      client.interrupt();
      
      await streamingCallback({
        type: 'control',
        data: {
          status: 'interrupted',
          timestamp: new Date().toISOString(),
        },
      });
      
      return {
        type: 'control',
        data: { status: 'interrupted' },
      };

    case 'ping':
      // Health check
      const status = client.getConnectionState();
      
      return {
        type: 'control',
        data: {
          status: 'pong',
          connectionState: status,
          timestamp: new Date().toISOString(),
        },
      };

    default:
      throw new Error(`Unknown control message type: ${controlMessage.type}`);
  }
}

// Helper function to end all active streams (for cleanup)
export async function endAllActiveStreams(): Promise<void> {
  const promises: Promise<void>[] = [];
  
  for (const [sessionId, controller] of activeStreams.entries()) {
    if (!controller.signal.aborted) {
      controller.abort();
      promises.push(liveAPISessionManager.endSession(sessionId));
    }
  }
  
  await Promise.all(promises);
  activeStreams.clear();
}
