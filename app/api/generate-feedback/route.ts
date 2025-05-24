import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Added UsageType import
import { prisma } from "@/lib/prisma"
import { generateInterviewFeedback, parseFeedback } from "@/lib/openai"

// Rate limit configuration is now imported and used directly
// const limiter = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500, // Max 500 users per minute
//   limit: 5, // 5 requests per minute
// })

import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User is not authenticated." },
        },
        { status: 401 }
      )
    }

    const userId = auth.userId

    // Apply rate limiting
    const { isLimited, reset } = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.GENERATE_FEEDBACK)
    if (isLimited) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      )
    }

    // Process the request
    const body = await request.json()
    const { interviewId, transcript, fromLocalStorage, generateAsync } = body

    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 })
    }

    // Handle localStorage data (no database record yet)
    if (fromLocalStorage) {
      // Generate feedback without database record
      const rawFeedback = await generateInterviewFeedback(transcript)
      const parsedFeedback = parseFeedback(rawFeedback)
      
      // Track usage
      await trackUsage(userId, UsageType.FEEDBACK_GENERATION)
      
      // Return feedback without saving to database
      return NextResponse.json({ 
        success: true,
        feedback: {
          summary: rawFeedback,
          strengths: parsedFeedback
            .filter(item => item.rating === "Excellent" || item.rating === "Good")
            .map(item => `${item.category}: ${item.feedback}`)
            .join("\n\n"),
          areasForImprovement: parsedFeedback
            .filter(item => item.rating === "Satisfactory" || item.rating === "Needs Improvement")
            .map(item => `${item.category}: ${item.feedback}`)
            .join("\n\n"),
          transcriptScore: parsedFeedback.reduce((acc, item) => {
            const ratings: Record<string, number> = { "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0 };
            return acc + (ratings[item.rating] || 0);
          }, 0) / parsedFeedback.length,
        }
      })
    }

    // Regular flow - check database record
    if (!interviewId) {
      return NextResponse.json({ error: "Missing interview ID" }, { status: 400 })
    }

    // Check if the interview belongs to the user
    const interview = await prisma.interviewSession.findUnique({
      where: {
        id: interviewId,
        userId,
      },
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found or not authorized" }, { status: 404 })
    }

    // If async generation is requested, return immediately
    if (generateAsync) {
      // Start async generation
      generateAndSaveFeedback(interviewId, userId, transcript).catch(error => {
        console.error("Async feedback generation failed:", error)
      })
      
      return NextResponse.json({ 
        success: true,
        message: "Feedback generation started",
        interviewId
      })
    }

    // Generate feedback synchronously
    const rawFeedback = await generateInterviewFeedback(transcript)
    const parsedFeedback = parseFeedback(rawFeedback)

    // Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION)

    // Create feedback in the database
    const feedback = await prisma.feedback.create({
      data: {
        id: crypto.randomUUID(),
        sessionId: interviewId,
        userId: userId,
        summary: rawFeedback,
        strengths: parsedFeedback
          .filter(item => item.rating === "Excellent" || item.rating === "Good")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        areasForImprovement: parsedFeedback
          .filter(item => item.rating === "Satisfactory" || item.rating === "Needs Improvement")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        fillerWordCount: 0, // You could implement filler word counting logic here
        transcriptScore: parsedFeedback.reduce((acc, item) => {
          const ratings: Record<string, number> = { "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0 };
          return acc + (ratings[item.rating] || 0);
        }, 0) / parsedFeedback.length,
      },
    })

    // Return the feedback
    return NextResponse.json({ 
      success: true,
      feedback: {
        id: feedback.id,
        summary: feedback.summary,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areasForImprovement,
        fillerWordCount: feedback.fillerWordCount,
        transcriptScore: feedback.transcriptScore,
      }
    })
  } catch (error) {
    console.error("Error in generate-feedback route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}

// Async function to generate and save feedback
async function generateAndSaveFeedback(interviewId: string, userId: string, transcript: any[]) {
  try {
    // Update feedback status to generating
    await prisma.$executeRaw`
      UPDATE "InterviewSession" 
      SET "feedbackStatus" = 'generating', "updatedAt" = NOW()
      WHERE id = ${interviewId}
    `
    
    // Generate feedback
    const rawFeedback = await generateInterviewFeedback(transcript)
    const parsedFeedback = parseFeedback(rawFeedback)
    
    // Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION)
    
    // Create feedback in the database
    await prisma.feedback.create({
      data: {
        id: crypto.randomUUID(),
        sessionId: interviewId,
        userId: userId,
        summary: rawFeedback,
        strengths: parsedFeedback
          .filter(item => item.rating === "Excellent" || item.rating === "Good")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        areasForImprovement: parsedFeedback
          .filter(item => item.rating === "Satisfactory" || item.rating === "Needs Improvement")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        fillerWordCount: 0,
        transcriptScore: parsedFeedback.reduce((acc, item) => {
          const ratings: Record<string, number> = { "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0 };
          return acc + (ratings[item.rating] || 0);
        }, 0) / parsedFeedback.length,
      },
    })
    
    // Update feedback status to completed
    await prisma.$executeRaw`
      UPDATE "InterviewSession" 
      SET "feedbackStatus" = 'completed', "updatedAt" = NOW()
      WHERE id = ${interviewId}
    `
    
  } catch (error) {
    console.error("Failed to generate feedback:", error)
    
    // Update feedback status to failed
    try {
      await prisma.$executeRaw`
        UPDATE "InterviewSession" 
        SET "feedbackStatus" = 'failed', "updatedAt" = NOW()
        WHERE id = ${interviewId}
      `
    } catch (updateError) {
      console.error("Failed to update feedback status:", updateError)
    }
  }
}
