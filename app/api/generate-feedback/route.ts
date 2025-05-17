import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Added UsageType import
import { prisma } from "@/lib/prisma"

// Rate limit configuration is now imported and used directly
// const limiter = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500, // Max 500 users per minute
//   limit: 5, // 5 requests per minute
// })

import { NextRequest } from "next/server"

/**
 * Handles POST requests to generate and store feedback for a user's interview session.
 *
 * Authenticates the user, enforces rate limiting, validates the request body, verifies interview ownership, and saves generated feedback to the database.
 *
 * @param request - The incoming HTTP request containing the interview ID and transcript.
 * @returns A JSON response indicating success or an error with the appropriate HTTP status code.
 */
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
