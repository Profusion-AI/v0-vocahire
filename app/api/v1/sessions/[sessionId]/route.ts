import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getSession } from 'lib/session-store';

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
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

    // Ensure the user retrieving the session is the owner of the session
    if (session.userId !== auth.userId) {
      return NextResponse.json({ code: "FORBIDDEN", message: "You do not have permission to view this session" }, { status: 403 });
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status, // e.g., initializing, active, completed, failed
      startedAt: session.startedAt,
      duration: session.duration || 0, // In seconds, default to 0 if not calculated yet
      messageCount: session.messageCount || 0,
      lastActivity: session.lastActivity,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error retrieving session ${sessionId}:`, error);

    return NextResponse.json({ 
      code: "INTERNAL_ERROR",
      message: "Failed to retrieve interview session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
