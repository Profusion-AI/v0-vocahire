import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runFlow } from 'genkit';
import { realtimeInterviewFlow } from '@/src/genkit/flows/realtime-interview.flow';
import { z } from 'zod';
import { RealtimeInputSchema, RealtimeOutputSchema } from '@/src/genkit/schemas/types';

// Helper to create SSE response
function createSSEStream() {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('event: connected\ndata: {"type":"control","data":{"status":"sse_connected"}}\n\n'));
    },
    
    async pull(controller) {
      // Keep connection alive with periodic pings
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
      controller.enqueue(encoder.encode(':ping\n\n'));
    },
    
    cancel() {
      console.log('SSE stream cancelled');
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const input = RealtimeInputSchema.parse(body);

    // Validate user owns the session
    if (input.userId !== userId) {
      return new Response('Forbidden', { status: 403 });
    }

    // Create SSE stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Run the flow with streaming
    runFlow(realtimeInterviewFlow, {
      ...input,
      streamingCallback: async (chunk: z.infer<typeof RealtimeOutputSchema>) => {
        const message = `event: ${chunk.type}\ndata: ${JSON.stringify(chunk)}\n\n`;
        await writer.write(encoder.encode(message));
      },
    }).catch(async (error) => {
      console.error('Flow error:', error);
      const errorMessage = `event: error\ndata: ${JSON.stringify({
        type: 'error',
        data: {
          code: 'FLOW_ERROR',
          message: error.message || 'Unknown error',
          retryable: true,
        }
      })}\n\n`;
      await writer.write(encoder.encode(errorMessage));
      await writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}