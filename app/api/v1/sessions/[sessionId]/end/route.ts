// app/api/v1/sessions/[sessionId]/end/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession, deleteSession } from 'lib/session-store';

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const { sessionId } = params;

  let session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ code: "SESSION_NOT_FOUND", message: "Session ID doesn't exist" }, { status: 404 });
  }

  // Update session status to completed and calculate duration
  const startedAt = new Date(session.createdAt).getTime();
  const duration = Math.floor((Date.now() - startedAt) / 1000); // Duration in seconds

  session = updateSession(sessionId, {
    status: "completed",
    duration,
    endedAt: new Date().toISOString(),
  });

  if (!session) {
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to update session status" }, { status: 500 });
  }

  // In a real application, you would also trigger:
  // 1. Final transcript generation and storage (e.g., in a blob storage)
  // 2. Any final feedback processing
  // 3. Resource cleanup (e.g., closing WebRTC connections, releasing AI service resources)

  // For now, we'll just provide a placeholder transcript URL.
  const transcriptUrl = `/api/v1/sessions/${sessionId}/transcript`; // Placeholder

  return NextResponse.json({
    sessionId: session.sessionId,
    status: session.status,
    duration: session.duration,
    transcriptUrl,
  }, { status: 200 });
}
