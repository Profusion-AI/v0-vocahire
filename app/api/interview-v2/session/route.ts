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
    console.log('[API Route] Request received for /api/interview-v2/session.');
    console.log('[API Route] Parsed Session Config:', JSON.stringify(sessionConfig));

    // Create a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // API key will be fetched by LiveAPISessionManager from Secret Manager
    // No need to check here as it's handled in the session manager

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
          let liveSession;
          try {
            liveSession = await sessionManager.getOrCreateSession(sessionId, {
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
          } catch (apiKeyError) {
            console.error('[API Route] Failed to create Live API session - likely API key issue:', apiKeyError);
            
            // Send specific error message for API key issues
            controller.enqueue(
              encoder.encode(
                createSSEMessage({
                  type: 'error',
                  error: {
                    code: 'API_KEY_ERROR',
                    message: process.env.NODE_ENV === 'development' 
                      ? 'GOOGLE_AI_API_KEY not found. Please set it in your .env.local file for local development.'
                      : 'Failed to access Google AI API key. Please check Secret Manager configuration.',
                    details: apiKeyError instanceof Error ? apiKeyError.message : String(apiKeyError)
                  }
                })
              )
            );
            controller.close();
            return;
          }

          // After liveSession.connect();
          console.log(`[API Route] Server-side Live API connect for session ${sessionId} completed.`);

          // Add explicit handlers for liveSession errors/disconnects on the server side
          liveSession.on('error', (error: Error) => {
            console.error(`[API Route] Live API Session ${sessionId} (server-side) error:`, error);
            // Ensure this error is propagated to the client via SSE
            controller.enqueue(
              encoder.encode(
                createSSEMessage({
                  type: 'error',
                  error: {
                    code: 'LIVE_API_ERROR_SERVER', // Differentiate backend error
                    message: `Server-side Live API error: ${error.message}`
                  }
                })
              )
            );
            controller.close(); // Close client SSE stream if backend Live API fails
          });
          liveSession.on('close', () => { // Or 'disconnect' depending on LiveAPIClient
            console.log(`[API Route] Live API Session ${sessionId} (server-side) closed by Live API.`);
            controller.close(); // Ensure client SSE stream is also closed
          });
          liveSession.on('data', (data: any) => { // If your LiveAPIClient supports this for inbound data
              console.log(`[API Route] Received data from Live API for session ${sessionId}:`, data);
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
          
          // Send ready signal after successful connection
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'control',
                control: {
                  type: 'ready',
                  message: 'Live API session ready'
                }
              })
            )
          );

          // Set up heartbeat to keep connection alive
          const heartbeatInterval = setInterval(() => {
            try {
              controller.enqueue(
                encoder.encode(
                  createSSEMessage({
                    type: 'control',
                    control: {
                      type: 'heartbeat',
                      timestamp: new Date().toISOString()
                    }
                  })
                )
              );
            } catch (err) {
              // Connection closed, clean up
              clearInterval(heartbeatInterval);
              sessionManager.closeSession(sessionId);
            }
          }, 20000); // Send heartbeat every 20 seconds

          // Listen for client disconnection
          request.signal.addEventListener('abort', async () => {
            clearInterval(heartbeatInterval);
            await sessionManager.closeSession(sessionId);
            controller.close();
          });

        } catch (error) {
          console.error(`[API Route] Fatal error in SSE stream for session ${sessionId}:`, error);
          // Ensure client receives a final error and stream closes
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'error',
                error: {
                  code: 'STREAM_INIT_FAILED_SERVER',
                  message: `Server-side stream initialization failed: ${error instanceof Error ? error.message : String(error)}`
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
