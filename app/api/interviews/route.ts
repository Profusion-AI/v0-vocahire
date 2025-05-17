import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma" // Import prisma client

/**
 * Retrieves a list of interview sessions for the authenticated user.
 *
 * Returns interview sessions associated with the current user, including their ID, creation date, duration, status, and feedback ID if available. Responds with 401 if the user is not authenticated, or 500 if a database error occurs.
 */
export async function GET(request: NextRequest) {
  const auth = getAuth(request)
  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Fetch the user's interviews from your database using auth.userId
    const interviews = await prisma.interviewSession.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: "desc", // Order by creation date, newest first
      },
      select: { // Select only necessary fields
        id: true,
        createdAt: true,
        endedAt: true,
        durationSeconds: true,
        feedback: {
          select: {
            id: true,
          },
        },
      },
    });

    // Map Prisma results to the desired structure
    const formattedInterviews = interviews.map(interview => ({
      id: interview.id,
      date: interview.createdAt.toISOString(),
      duration: interview.durationSeconds,
      status: interview.endedAt ? "completed" : "in_progress", // Determine status based on endedAt
      feedbackId: interview.feedback?.id || null,
    }));


    return NextResponse.json(formattedInterviews)
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch interviews" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

/**
 * Handles creation of a new interview session for the authenticated user.
 *
 * Parses the request body for interview details, validates required fields, and creates a new interview session record in the database. Responds with the new interview's ID, creation date, status, and job title.
 *
 * @returns A JSON response containing the new interview session's details, or an error message with appropriate HTTP status on failure.
 */
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
    const { jobTitle, company, interviewType, jdContext } = body; // Extract relevant fields from body

    if (!jobTitle) {
       return new NextResponse(JSON.stringify({ error: "Missing jobTitle" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a new interview record in your database using auth.userId
    const newInterview = await prisma.interviewSession.create({
      data: {
        userId: auth.userId,
        jobTitle: jobTitle,
        company: company || null, // Use null for optional fields if not provided
        interviewType: interviewType || null,
        jdContext: jdContext || null,
        // Other fields like webrtcSessionId, openaiSessionId, etc. will be added later in the session flow
      },
      select: { // Select only necessary fields for the response
        id: true,
        createdAt: true,
        jobTitle: true,
      }
    });

    return NextResponse.json({
      id: newInterview.id,
      date: newInterview.createdAt.toISOString(),
      status: "pending", // Initial status
      jobTitle: newInterview.jobTitle,
    })
  } catch (error) {
    console.error("Error creating interview:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to create interview" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
