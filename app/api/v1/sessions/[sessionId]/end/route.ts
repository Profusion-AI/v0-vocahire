import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getSession, updateSession, deleteSession } from '@/lib/session-store';

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const auth = getAuth(request);
  const { sessionId } = params;

  if (!auth.userId) {
    return NextResponse.json({ code: "AUTH_INVALID", message: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ code: "SESSION_NOT_FOUND", message: "Session ID doesn't exist" }, { status: 404 });
    }

    // Ensure the user ending the session is the owner of the session
    if (session.userId !== auth.userId) {
      return NextResponse.json({ code: "FORBIDDEN", message: "You do not have permission to end this session" }, { status: 403 });
    }

    // Update session status to completed
    const now = new Date();
    const updatedSession = await updateSession(sessionId, {
      status: "completed",
      endedAt: now.toISOString(),
      // Calculate duration if startTime is available in session data
      duration: session.startedAt ? Math.floor((now.getTime() - new Date(session.startedAt).getTime()) / 1000) : 0,
      lastActivity: now.toISOString(),
    });

    if (!updatedSession) {
      throw new Error("Failed to update session status to completed.");
    }

    // TODO: Trigger final transcript generation and persistence if not already done via WebSocket
    // For now, return a placeholder transcript URL.
    const transcriptUrl = `/api/v1/sessions/${sessionId}/transcript`;

    // Optionally delete session from real-time store after a short delay 
    // or when transcripts are fully persisted to avoid stale data, 
    // but keep it in a long-term database for history.
    // await deleteSession(sessionId);

    return NextResponse.json({
      sessionId: updatedSession.sessionId,
      status: updatedSession.status,
      duration: updatedSession.duration,
      transcriptUrl,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error ending session ${sessionId}:`, error);

    return NextResponse.json({ 
      code: "INTERNAL_ERROR",
      message: "Failed to end interview session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
