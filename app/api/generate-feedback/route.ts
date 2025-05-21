import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
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
    const { interviewId, transcript } = body

    if (!interviewId || !transcript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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

    // Generate feedback
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
