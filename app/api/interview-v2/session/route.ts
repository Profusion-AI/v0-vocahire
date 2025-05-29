import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { liveAPISessionManager } from '@/lib/live-api-session-manager';
import { getOrCreatePrismaUser } from '@/lib/auth-utils';
import { z } from 'zod';
import { RealtimeInputSchema, RealtimeOutputSchema } from '@/src/genkit/schemas/types';

// GET endpoint for Server-Sent Events (SSE) stream
export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get session config from query parameters
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');
  const jobRole = searchParams.get('jobRole');
  const interviewType = searchParams.get('interviewType');
  const difficulty = searchParams.get('difficulty');
  const systemInstruction = searchParams.get('systemInstruction');

  if (!sessionId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify user
  const user = await getOrCreatePrismaUser(auth.userId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create response stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Helper to send SSE messages
        const sendMessage = (data: z.infer<typeof RealtimeOutputSchema>) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // In development without API key, send mock responses
        if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_AI_API_KEY) {
          console.log('[Session API] Running in mock mode - no Google AI API key configured');
          
          // Send ready message
          sendMessage({
            type: 'control',
            control: { type: 'ready' }
          });
          
          // Send mock greeting after a delay
          setTimeout(() => {
            sendMessage({
              type: 'transcript',
              transcript: {
                id: `mock-${Date.now()}`,
                role: 'assistant',
                text: `[MOCK MODE] Hello! I'm ready to conduct your ${interviewType} interview for the ${jobRole} position. Please note: This is a mock interview session for development. To use the real AI, please configure your Google AI API key.`,
                timestamp: new Date().toISOString()
              }
            });
          }, 1000);
          
          return;
        }

        // Create or get Google Live API session
        const liveClient = await liveAPISessionManager.getOrCreateSession(
          sessionId,
          {
            model: 'models/gemini-2.0-flash-live-001',
            systemInstruction: {
              parts: [{
                text: systemInstruction || 
                  `You are a professional interviewer conducting a ${interviewType} interview for the role of ${jobRole}. 
                   Difficulty level: ${difficulty}. 
                   Be professional, ask relevant questions, and provide constructive feedback.`
              }]
            },
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Aoede'
                  }
                }
              }
            }
          });

        // Connect to Google Live API
        await liveClient.connect();

        // Set up event handlers
        liveClient.on('ready', () => {
          console.log('[Session API] Google Live API ready');
          sendMessage({
            type: 'control',
            control: { type: 'ready' }
          });
        });

        liveClient.on('transcript', (data: any, timestamp?: number, sequenceNumber?: number) => {
          sendMessage({
            type: 'transcript',
            transcript: {
              id: data.id || `transcript-${Date.now()}`,
              role: data.type === 'user' ? 'user' : 'assistant',
              text: data.text,
              timestamp: new Date().toISOString()
            },
            echoedTimestamp: timestamp,
            echoedSequenceNumber: sequenceNumber
          });
        });

        liveClient.on('audio', (audioData: ArrayBuffer, timestamp?: number, sequenceNumber?: number) => {
          // Convert ArrayBuffer to base64
          const base64Audio = Buffer.from(audioData).toString('base64');
          sendMessage({
            type: 'audio',
            audio: {
              data: base64Audio,
              format: 'audio/pcm',
              sampleRate: 24000
            },
            echoedTimestamp: timestamp,
            echoedSequenceNumber: sequenceNumber
          });
        });

        liveClient.on('error', (error: any) => {
          console.error('[Session API] Google Live API error:', error);
          sendMessage({
            type: 'error',
            error: {
              code: 'LIVE_API_ERROR',
              message: error.message || 'An error occurred with the Live API'
            }
          });
        });

        liveClient.on('disconnected', () => {
          console.log('[Session API] Google Live API disconnected');
          sendMessage({
            type: 'control',
            control: { type: 'end' }
          });
          controller.close();
        });

        // Start the conversation
        setTimeout(() => {
          liveClient.sendText(
            `Hello! I'm ready to conduct your ${interviewType} interview for the ${jobRole} position. 
             Please introduce yourself and tell me about your background.`,
            Date.now(),
            0
          );
        }, 1000);

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          console.log('[Session API] Client disconnected');
          liveAPISessionManager.closeSession(sessionId);
        });

      } catch (error) {
        console.error('[Session API] Error in stream:', error);
        const errorMessage: z.infer<typeof RealtimeOutputSchema> = {
          type: 'error',
          error: {
            code: 'STREAM_ERROR',
            message: error instanceof Error ? error.message : 'Stream error occurred'
          }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
        controller.close();
      }
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}

// POST endpoint to create a session
export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const sessionConfig = RealtimeInputSchema.parse(body);

    // Verify user has credits
    const user = await getOrCreatePrismaUser(auth.userId);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return session info - client will use this to connect to SSE
    return new Response(JSON.stringify({ 
      success: true,
      sessionId: sessionConfig.sessionId,
      sseUrl: `/api/interview-v2/session?sessionId=${sessionConfig.sessionId}&userId=${sessionConfig.userId}&jobRole=${encodeURIComponent(sessionConfig.jobRole)}&interviewType=${sessionConfig.interviewType}&difficulty=${sessionConfig.difficulty}&systemInstruction=${encodeURIComponent(sessionConfig.systemInstruction || '')}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Session API] Error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: error.errors 
      }), { status: 400 });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}