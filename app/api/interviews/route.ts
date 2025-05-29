import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { trackUsage, UsageType } from "@/lib/usage-tracking"
import { getOrCreatePrismaUser } from "@/lib/auth-utils"
import { z } from "zod"
import { InterviewSession, Prisma } from "@/prisma/generated/client"

export const dynamic = 'force-dynamic';

// Input validation schema
const CreateInterviewSchema = z.object({
  sessionId: z.string(),
  jobTitle: z.string(),
  resumeData: z.any().nullable(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    timestamp: z.number(),
    confidence: z.number().optional()
  })),
  startTime: z.number(),
  endTime: z.number(),
  duration: z.number(),
  metrics: z.object({
    totalUserMessages: z.number(),
    totalAssistantMessages: z.number(),
    averageResponseTime: z.number().optional()
  }).optional()
})

export async function GET(request: NextRequest) {
  const auth = getAuth(request)
  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Fetch the user's interviews from database
    const { prisma } = await import("@/lib/prisma");
    const interviews = await prisma.interviewSession.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        jobTitle: true,
      },
    });

    // Map results to desired structure
    const formattedInterviews = interviews.map((interview: InterviewSession) => ({
      id: interview.id,
      date: interview.createdAt.toISOString(),
      jobTitle: interview.jobTitle,
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
  const requestId = `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`[${requestId}] Starting interview save`)
  
  try {
    // 1. Authenticate user
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // 2. Parse and validate request body
    const body = await request.json()
    const validatedData = CreateInterviewSchema.parse(body)
    
    // 3. Get or create user in database
    const user = await getOrCreatePrismaUser(auth.userId)
    if (!user) {
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 })
    }
    
    // 4. Create interview session with transaction for data integrity
    const { prisma } = await import("@/lib/prisma");
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the interview session
      const interviewSession = await tx.interviewSession.create({
        data: {
          id: validatedData.sessionId,
          userId: user.id,
          jobTitle: validatedData.jobTitle,
          resumeSnapshot: validatedData.resumeData,
          startedAt: new Date(validatedData.startTime),
          endedAt: new Date(validatedData.endTime),
          durationSeconds: Math.floor(validatedData.duration / 1000), // Convert ms to seconds
        }
      })
      
      // Create transcript entries
      const transcriptEntries = validatedData.messages.map((msg, index) => ({
        id: `${interviewSession.id}-${index}`,
        sessionId: interviewSession.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        confidence: msg.confidence || null,
      }))
      
      await tx.transcript.createMany({
        data: transcriptEntries
      })
      
      // Track usage for analytics
      await trackUsage(user.id, UsageType.INTERVIEW_COMPLETED, {
        sessionId: interviewSession.id,
        duration: validatedData.duration,
        messageCount: validatedData.messages.length
      })
      
      return interviewSession
    })
    
    console.log(`[${requestId}] Interview saved successfully: ${result.id}`)
    
    // 5. Trigger async feedback generation (non-blocking)
    triggerFeedbackGeneration(result.id, validatedData.messages).catch(error => {
      console.error(`[${requestId}] Failed to trigger feedback generation:`, error)
    })
    
    return NextResponse.json({
      success: true,
      id: result.id,
      redirectUrl: `/feedback?session=${result.id}`
    })
    
  } catch (error) {
    console.error(`[${requestId}] Error saving interview:`, error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data",
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Failed to save interview",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Async feedback generation function
async function triggerFeedbackGeneration(sessionId: string, messages: any[]) {
  try {
    // Update status to generating
    const { prisma } = await import("@/lib/prisma");
    await prisma.$executeRaw`
      UPDATE "InterviewSession" 
      SET "feedbackStatus" = 'generating', "updatedAt" = NOW()
      WHERE id = ${sessionId}
    `
    
    // Call the feedback generation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Request": process.env.INTERNAL_API_SECRET || ""
      },
      body: JSON.stringify({
        sessionId,
        messages,
        generateAsync: true
      })
    })
    
    if (!response.ok) {
      throw new Error(`Feedback generation failed: ${response.status}`)
    }
    
    // Update status to completed
    await prisma.$executeRaw`
      UPDATE "InterviewSession" 
      SET "feedbackStatus" = 'completed', "updatedAt" = NOW()
      WHERE id = ${sessionId}
    `
    
  } catch (error) {
    // Update status to failed and log error
    console.error("Feedback generation error:", error)
    
    try {
      await prisma.$executeRaw`
        UPDATE "InterviewSession" 
        SET "feedbackStatus" = 'failed', "updatedAt" = NOW()
        WHERE id = ${sessionId}
      `
    } catch (updateError) {
      console.error("Failed to update feedback status:", updateError)
    }
  }
}