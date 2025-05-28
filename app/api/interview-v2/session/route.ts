import { NextRequest } from 'next/server';
// Removed unused GenKit flow imports since we're using Live API directly
import { LiveAPISessionManager } from '@/lib/live-api-session-manager';
import { 
  SessionConfigSchema,
  // type SessionConfig, // Commented out unused type import
  type StreamingMessage 
} from '@/src/genkit/schemas/types';

// Helper to create SSE message
function createSSEMessage(data: StreamingMessage): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate session config
    const body = await request.json();
    const sessionConfig = SessionConfigSchema.parse(body);

    // Create a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if we have the required API key
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'AI service not properly configured. Please contact support.'
          }
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get session manager instance
    const sessionManager = LiveAPISessionManager.getInstance();

    // Set up SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection status
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'session_status',
                sessionStatus: {
                  sessionId,
                  status: 'active',
                  startTime: new Date().toISOString(),
                  duration: 0,
                  transcript: []
                }
              })
            )
          );

          // Create Live API session
          const liveSession = await sessionManager.getOrCreateSession(sessionId, {
            model: 'models/gemini-2.0-flash-exp',
            systemInstruction: {
              parts: [{
                text: `You are an AI interviewer conducting a professional interview for the position of ${sessionConfig.jobPosition}.
                
Job Description: ${sessionConfig.jobDescription}
 
Conduct a natural, conversational interview. Ask relevant questions about the candidate's experience, skills, and fit for the role.
Listen carefully to their responses and ask follow-up questions as appropriate.
Maintain a professional but friendly tone throughout the interview.
 
Start by introducing yourself and asking the candidate to tell you about themselves.`
              }]
            },
            generationConfig: {
              temperature: 0.7,
              candidateCount: 1
            },
            tools: []
          });

          // Handle messages from the client
          // const handleClientMessage = async (message: any) => { // Commented out unused function
          //   try {
          //     const parsed = JSON.parse(message);
              
          //     switch (parsed.type) {
          //       case 'audio':
          //         // Send audio to Live API
          //         if (parsed.data && liveSession) {
          //           await liveSession.send({
          //             realtimeInput: {
          //               mediaChunks: [{
          //                 mimeType: 'audio/pcm;rate=16000',
          //                 data: parsed.data
          //               }]
          //             }
          //           });
          //         }
          //         break;
                  
          //       case 'control':
          //         if (parsed.action === 'stop') {
          //           // Clean up and close
          //           await sessionManager.closeSession(sessionId);
          //           controller.close();
          //         }
          //         break;
          //     }
          //   } catch (error) {
          //     console.error('Error handling client message:', error);
          //   }
          // };

          // Listen for Live API responses
          liveSession.on('transcript', (transcript: any) => {
            controller.enqueue(
              encoder.encode(
                createSSEMessage({
                  type: 'transcript',
                  transcript: {
                    id: `transcript_${Date.now()}`,
                    role: transcript.role || 'assistant',
                    text: transcript.text,
                    timestamp: new Date().toISOString()
                  }
                })
              )
            );
          });

          liveSession.on('audio', (audioData: ArrayBuffer) => {
            // Convert audio to base64 for transmission
            const base64Audio = liveSession.arrayBufferToBase64(audioData);
            controller.enqueue(
              encoder.encode(
                createSSEMessage({
                  type: 'audio',
                  audio: {
                    data: base64Audio,
                    format: 'pcm16',
                    sampleRate: 24000
                  }
                })
              )
            );
          });

          liveSession.on('error', (error: Error) => {
            controller.enqueue(
              encoder.encode(
                createSSEMessage({
                  type: 'error',
                  error: {
                    code: 'LIVE_API_ERROR',
                    message: error.message
                  }
                })
              )
            );
          });

          // Start the Live API session
          await liveSession.connect();

          // Listen for client disconnection
          request.signal.addEventListener('abort', async () => {
            await sessionManager.closeSession(sessionId);
            controller.close();
          });

        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'error',
                error: {
                  code: 'STREAM_ERROR',
                  message: error instanceof Error ? error.message : 'Unknown error'
                }
              })
            )
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create session'
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
