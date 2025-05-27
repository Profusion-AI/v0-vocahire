import { NextRequest } from 'next/server';
import { createInterviewSession } from '@/src/genkit/flows/interview-session.flow';
import { generateInterviewFeedback } from '@/src/genkit/flows/generate-feedback.flow';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const sessionId = params.sessionId;

    // Verify session belongs to user
    const session = await prisma.interview.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade');
    if (upgrade !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // Note: In production with Next.js on Vercel, you'll need to use a separate
    // WebSocket server or a service like Pusher/Ably for real-time communication.
    // This is a placeholder for the WebSocket logic.
    
    return new Response('WebSocket support requires a dedicated server', { 
      status: 501,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  } catch (error) {
    console.error('Error in live session handler:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// POST endpoint to create a new live session
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    const session = await prisma.interview.findFirst({
      where: {
        id: params.sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    switch (action) {
      case 'initialize':
        // Initialize Live API session
        const genkitSession = await createInterviewSession({
          userId,
          jobRole: session.jobRole,
          difficulty: session.difficulty as 'entry' | 'mid' | 'senior',
          jobDescription: session.jobDescription || undefined,
          resume: data.resume || undefined,
        });

        // Store Live API credentials
        await prisma.interview.update({
          where: { id: params.sessionId },
          data: {
            liveApiEndpoint: genkitSession.liveApiEndpoint,
            wsToken: genkitSession.wsToken,
            systemPrompt: genkitSession.systemPrompt,
            status: 'IN_PROGRESS',
          },
        });

        return Response.json({
          success: true,
          data: {
            liveApiEndpoint: genkitSession.liveApiEndpoint,
            wsToken: genkitSession.wsToken,
            interviewStructure: genkitSession.interviewStructure,
          },
        });

      case 'save_transcript':
        // Save transcript chunk
        await prisma.interview.update({
          where: { id: params.sessionId },
          data: {
            transcript: {
              push: data.transcript,
            },
          },
        });

        return Response.json({ success: true });

      case 'end_session':
        // Generate feedback
        const finalSession = await prisma.interview.findUnique({
          where: { id: params.sessionId },
        });

        if (!finalSession || !finalSession.transcript) {
          return Response.json({ 
            success: false, 
            error: 'No transcript available' 
          }, { status: 400 });
        }

        const feedback = await generateInterviewFeedback({
          sessionId: params.sessionId,
          transcript: finalSession.transcript as any,
          jobRole: finalSession.jobRole,
          difficulty: finalSession.difficulty as 'entry' | 'mid' | 'senior',
          audioMetrics: data.audioMetrics,
        });

        // Update session with feedback
        await prisma.interview.update({
          where: { id: params.sessionId },
          data: {
            status: 'COMPLETED',
            endedAt: new Date(),
            feedbackSummary: feedback.detailedFeedback.map(f => f.feedback).join('\n\n'),
            overallScore: feedback.overallScore,
            structuredFeedback: feedback,
          },
        });

        return Response.json({
          success: true,
          data: { feedback },
        });

      default:
        return Response.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in live session action:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}