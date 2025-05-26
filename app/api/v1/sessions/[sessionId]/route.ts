// app/api/v1/sessions/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'lib/session-store'; // Using the in-memory store for now

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const { sessionId } = params;

  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ code: "SESSION_NOT_FOUND", message: "Session ID doesn't exist" }, { status: 404 });
  }

  // Return a subset of session data relevant for this endpoint
  return NextResponse.json({
    sessionId: session.sessionId,
    status: session.status, // e.g., initializing, active, completed, failed
    startedAt: session.createdAt, // Assuming createdAt is when it started
    duration: Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000), // Approximate duration in seconds
    messageCount: session.messageCount || 0, // Placeholder, update as WebSocket messages are handled
    lastActivity: session.lastActivity || session.createdAt, // Placeholder
  }, { status: 200 });
}
