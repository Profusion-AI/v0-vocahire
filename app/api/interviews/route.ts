import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const auth = getAuth(request)
  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // In a real implementation, you would fetch the user's interviews from your database using auth.userId
  // For now, we'll return mock data
  const mockInterviews = [
    {
      id: "interview-1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 583, // seconds
      status: "completed",
      feedbackId: "feedback-1",
    },
    {
      id: "interview-2",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 612, // seconds
      status: "completed",
      feedbackId: "feedback-2",
    },
  ]

  return NextResponse.json(mockInterviews)
}

export async function POST(request: NextRequest) {
  const auth = getAuth(request)
  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await request.json()

    // In a real implementation, you would create a new interview record in your database using auth.userId
    // For now, we'll just return a mock response
    return NextResponse.json({
      id: "new-interview-" + Date.now(),
      date: new Date().toISOString(),
      status: "scheduled",
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
