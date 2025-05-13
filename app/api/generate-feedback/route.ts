import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Added UsageType import
import { prisma } from "@/lib/prisma"

// Rate limit configuration is now imported and used directly
// const limiter = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500, // Max 500 users per minute
//   limit: 5, // 5 requests per minute
// })

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User is not authenticated." },
        },
        { status: 401 }
      )
    }

    const userId = session.user.email

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
    // ... (your existing code to generate feedback)

    // Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION)

    // Save feedback to the database
await prisma.interviewSession.update({
  where: { id: interviewId },
  data: {
    feedback: {}, // Replace with actual feedback
  },
})

    // Return the response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in generate-feedback route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
