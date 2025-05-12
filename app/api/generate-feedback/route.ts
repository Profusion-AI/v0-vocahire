import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { trackUsage } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"

// Rate limit configuration: 5 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 5, // 5 requests per minute
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Apply rate limiting
    try {
      await limiter.check(userId)
    } catch (error) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Process the request
    const body = await request.json()
    const { interviewId, transcript } = body

    if (!interviewId || !transcript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the interview belongs to the user
    const interview = await prisma.interview.findUnique({
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
    await trackUsage(userId, "generate_feedback")

    // Save feedback to the database
    await prisma.interview.update({
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
