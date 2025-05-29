import { NextRequest } from 'next/server';
import { LiveAPISessionManager } from '@/lib/live-api-session-manager';
import { RealtimeInputSchema } from '@/src/genkit/schemas/types';
import { z } from 'zod';

// This is a placeholder for the actual WebSocket upgrade logic.
// Next.js App Router does not natively support WebSocket server directly within route handlers
// without a custom server or a library that abstracts this.
// For the purpose of this guide, we'll assume a `upgradeWebSocket` helper exists or
// that the environment supports `SOCKET` export for WebSocket handling.
// In a real-world scenario, this might involve a custom Node.js server or a Vercel Edge Function
// with WebSocket capabilities.

// Mock upgradeWebSocket for now, as it's not a standard Next.js feature
/**
 * Simulates upgrading an HTTP request to a WebSocket connection for local development and testing.
 *
 * Returns a mock WebSocket object and a 101 Switching Protocols response. The mock WebSocket provides stubbed methods and simulates an 'open' event asynchronously.
 *
 * @remark This is a mock implementation. Real WebSocket upgrades require a custom server setup and proper handling of the 'upgrade' header.
 *
 * @returns An object containing the mock WebSocket and the upgrade response.
 */
function upgradeWebSocket(request: NextRequest): { socket: WebSocket, response: Response } {
  // This is a simplified mock. Actual implementation would involve
  // handling the 'upgrade' header and creating a WebSocket connection.
  // For local development and testing, you might use a library like 'ws'
  // with a custom server.
  console.warn("`upgradeWebSocket` is a mock. Real WebSocket upgrade requires a custom server setup.");

  // Create a mock WebSocket object
  const mockSocket: WebSocket = {
    send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => { console.log("Mock WebSocket send:", data); },
    close: (code?: number, reason?: string) => { console.log("Mock WebSocket close:", code, reason); },
    readyState: WebSocket.OPEN,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    url: "ws://mock-url",
    binaryType: "arraybuffer",
    bufferedAmount: 0,
    extensions: "",
    protocol: "",
    onmessage: null, // Will be set by the handler
    onopen: null,   // Will be set by the handler
    onerror: null,  // Will be set by the handler
    onclose: null,  // Will be set by the handler
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {},
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {},
    dispatchEvent: (event: Event) => true,
  };

  // Create a mock Response object
  const mockResponse = new Response(null, { status: 101, statusText: "Switching Protocols" });

  // Simulate the 'open' event for the mock socket
  setTimeout(() => {
    if (mockSocket.onopen) {
      mockSocket.onopen(new Event('open'));
    }
  }, 0);

  return { socket: mockSocket, response: mockResponse };
}


/**
 * Handles WebSocket connections for real-time audio and text sessions using the Google Live API.
 *
 * Upgrades incoming HTTP requests to WebSocket connections, manages session lifecycle, and facilitates bidirectional communication between clients and the Google Live API. Supports receiving binary audio data, JSON control/text messages, and relays transcripts, audio, and errors back to the client. Cleans up sessions on disconnect or error.
 *
 * @param request - The incoming HTTP request to be upgraded to a WebSocket connection.
 * @returns A response that completes the WebSocket upgrade handshake.
 *
 * @remark The WebSocket upgrade logic is mocked and not suitable for production use without a custom server setup.
 */
export async function SOCKET(request: NextRequest) {
  console.log('[API Route] WebSocket connection request received.');
  const { socket, response } = upgradeWebSocket(request);
  const sessionManager = LiveAPISessionManager.getInstance();

  let sessionId: string | null = null; // To store the session ID once known
  let lastAudioMetadata: { timestamp?: number; sequenceNumber?: number } = {}; // Track latest audio metadata

  socket.onopen = () => {
    console.log('[WebSocket] Client connected.');
    // No initial message to send here, client will send 'start'
  };

  socket.onmessage = async (event) => {
    try {
      // Handle binary audio data directly
      if (event.data instanceof ArrayBuffer) {
        if (!sessionId) {
          console.warn('[WebSocket] Binary audio received before session started.');
          socket.send(JSON.stringify({ type: 'error', error: { code: 'NO_SESSION', message: 'Session not established for binary audio.' } }));
          return;
        }
        const liveSession = sessionManager.getSession(sessionId);
        if (!liveSession) {
          console.warn(`[WebSocket] Session ${sessionId} not found for binary audio.`);
          socket.send(JSON.stringify({ type: 'error', error: { code: 'SESSION_NOT_FOUND', message: 'Session not found for binary audio.' } }));
          return;
        }
        // Assuming the ArrayBuffer is the raw audio data
        liveSession.sendAudio(event.data, lastAudioMetadata.timestamp, lastAudioMetadata.sequenceNumber);
        console.log(`[WebSocket] Binary audio chunk sent for session ${sessionId} (seq: ${lastAudioMetadata.sequenceNumber}).`);
        return; // Exit early for binary data
      }

      // Handle JSON messages (text, control, initial start)
      const message = JSON.parse(event.data.toString());
      console.log('[WebSocket] Received JSON message:', message);

      // Validate incoming message against RealtimeInputSchema
      const parsedInput = RealtimeInputSchema.parse(message);

      if (parsedInput.controlMessage?.type === 'start') {
        // This is the initial message to start a session
        sessionId = parsedInput.sessionId; // Store session ID
        console.log(`[WebSocket] Starting session: ${sessionId}`);

        // Create Google Live API session
        const liveSession = await sessionManager.getOrCreateSession(sessionId, {
          model: 'models/gemini-2.0-flash-exp', // Default model, can be configured
          systemInstruction: { parts: [{ text: parsedInput.systemInstruction }] },
        });

        // Bridge messages from Google Live API to client WebSocket
        liveSession.on('transcript', (transcript: any, echoedTimestamp?: number, echoedSequenceNumber?: number) => {
          socket.send(JSON.stringify({
            type: 'transcript',
            transcript,
            echoedTimestamp,
            echoedSequenceNumber,
          }));
        });
        liveSession.on('audio', (audioData: ArrayBuffer, echoedTimestamp?: number, echoedSequenceNumber?: number) => {
          const base64Audio = liveSession.arrayBufferToBase64(audioData);
          socket.send(JSON.stringify({
            type: 'audio',
            audio: {
              data: base64Audio,
              format: 'pcm16',
              sampleRate: 24000,
            },
            echoedTimestamp,
            echoedSequenceNumber,
          }));
        });
        liveSession.on('error', (error: Error) => {
          socket.send(JSON.stringify({ type: 'error', error: { code: 'LIVE_API_ERROR', message: error.message } }));
        });
        liveSession.on('ready', () => {
          socket.send(JSON.stringify({
            type: 'control',
            control: {
              type: 'ready',
              message: 'Live API session ready',
            }
          }));
        });

        // Connect to Google Live API
        await liveSession.connect();

      } else if (sessionId) {
        // Subsequent messages for an active session
        const liveSession = sessionManager.getSession(sessionId);
        if (!liveSession) {
          console.warn(`[WebSocket] Session ${sessionId} not found for subsequent message.`);
          socket.send(JSON.stringify({ type: 'error', error: { code: 'SESSION_NOT_FOUND', message: 'Session not found.' } }));
          return;
        }

        // Handle JSON messages for text and control
        if ((parsedInput as any).audioMetadata) {
          // This is metadata for subsequent binary audio
          lastAudioMetadata = {
            timestamp: parsedInput.timestamp,
            sequenceNumber: parsedInput.sequenceNumber,
          };
          console.log(`[WebSocket] Audio metadata stored: seq=${parsedInput.sequenceNumber}`);
        } else if (parsedInput.text) {
          liveSession.sendText(parsedInput.text);
        } else if (parsedInput.controlMessage?.type === 'interrupt') {
          liveSession.interrupt();
        } else if (parsedInput.controlMessage?.type === 'stop') {
          // Client explicitly stopping the session
          await sessionManager.closeSession(sessionId);
          socket.close(1000, 'Client requested close');
        } else {
          console.warn('[WebSocket] Unhandled JSON message type:', parsedInput);
        }
      } else {
        console.warn('[WebSocket] Message received before session started:', message);
        socket.send(JSON.stringify({ type: 'error', error: { code: 'NO_SESSION', message: 'Session not established.' } }));
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'error', error: { code: 'MESSAGE_PROCESSING_ERROR', message: error instanceof Error ? error.message : String(error) } }));
      }
    }
  };

  socket.onclose = async (event) => {
    console.log(`[WebSocket] Client disconnected: Code ${event.code}, Reason: ${event.reason}`);
    if (sessionId) {
      await sessionManager.closeSession(sessionId);
    }
  };

  socket.onerror = (error) => {
    console.error('[WebSocket] Socket error:', error);
    if (sessionId) {
      sessionManager.closeSession(sessionId); // Attempt to clean up session on error
    }
  };

  return response;
}
