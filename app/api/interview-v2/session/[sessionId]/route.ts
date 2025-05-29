import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { liveAPISessionManager } from '@/lib/live-api-session-manager';
import { RealtimeInputSchema } from '@/src/genkit/schemas/types';

// Handle sending audio/text from client to Google Live API
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = getAuth(request);
  
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const input = RealtimeInputSchema.parse(body);
    
    // Await the params
    const { sessionId } = await params;
    
    // Get the active session
    const liveClient = liveAPISessionManager.getSession(sessionId);
    
    if (!liveClient) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send data to Google Live API
    if (input.audioChunk) {
      // Convert base64 to ArrayBuffer
      const audioBuffer = Buffer.from(input.audioChunk, 'base64').buffer;
      liveClient.sendAudio(audioBuffer as ArrayBuffer, input.timestamp, input.sequenceNumber);
    } else if (input.text) {
      liveClient.sendText(input.text, input.timestamp, input.sequenceNumber);
    } else if (input.controlMessage) {
      if (input.controlMessage.type === 'stop') {
        await liveAPISessionManager.closeSession(sessionId);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Session API] Error handling input:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process input',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}