import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Assuming UsageType is here
import { prisma } from "@/lib/prisma"
import { getOpenAIApiKey } from "@/lib/api-utils"


/**
 * Handles POST requests to create a realtime session for an authenticated user.
 *
 * Authenticates the user, enforces rate limits, checks for sufficient credits, and processes the session creation request. Returns appropriate error responses for unauthorized access, rate limit violations, or insufficient credits. On success, tracks usage and increments the rate limit counter.
 *
 * @returns A JSON response indicating success or the relevant error.
 */
export async function POST(request: NextRequest) {
  try {
    // Log start of request with timestamp
    console.log(`=== REALTIME SESSION REQUEST (${new Date().toISOString()}) ===`)
    const apiKey = getOpenAIApiKey()
    console.log("🔑 API key available:", !!apiKey, apiKey ? `(starts with ${apiKey.slice(0, 6)}...)` : "(not found)")

    // Authenticate the user with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again later. Limit: ${rateLimitResult.limit}, Current: ${rateLimitResult.current}, Reset in: ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)}s`,
        },
        { status: 429 },
      )
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
