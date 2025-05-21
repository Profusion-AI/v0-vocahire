import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma" // Import prisma client

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
        id: crypto.randomUUID(),
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
