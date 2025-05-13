import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { trackUsage } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"

// Rate limit configuration: 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 10, // 10 requests per minute
})

export async function POST(request: NextRequest) {
  try {
    // Log start of request with timestamp
    console.log(`=== REALTIME SESSION REQUEST (${new Date().toISOString()}) ===`)
    const apiKey = getOpenAIApiKey()
    console.log("🔑 API key available:", !!apiKey, apiKey ? `(starts with ${apiKey.slice(0, 6)}...)` : "(not found)")

    // Get the session
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

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user || user.credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits. Please purchase more credits." }, { status: 403 })
    }

    // Process the request
    // ... (your existing code to create a realtime session)

    // Track usage
    await trackUsage(userId, UsageType.INTERVIEW_SESSION)

    // Increment rate limit
    await incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)

    // Return the response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in realtime-session route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
