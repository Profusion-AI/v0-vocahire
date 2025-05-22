import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Assuming UsageType is here
import { prisma } from "@/lib/prisma"
import { getOpenAIApiKey } from "@/lib/api-utils"


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

    // Check if user has enough credits with timeout
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, isPremium: true },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ]).catch(error => {
      console.error('Database query failed or timed out in /api/realtime-session:', error);
      // Return default user with zero credits to fail gracefully
      return { credits: 0, isPremium: false };
    });

    // Allow premium users to proceed without credit check
    if (user && user.isPremium) {
      console.log("Premium user detected, bypassing credit check");
    } else if (!user || Number(user.credits) <= 0) {
      return NextResponse.json({ error: "Insufficient VocahireCredits. Please purchase more VocahireCredits." }, { status: 403 })
    }

    // Process the request - Create OpenAI Realtime Session
    console.log("Creating OpenAI Realtime session for user:", userId);
    
    // Create a simple session response
    // In a full implementation, this would create an actual OpenAI Realtime session
    const sessionData = {
      sessionId: `session_${userId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: userId,
      status: 'created'
    };

    console.log("Session created:", sessionData);

    // Track usage with timeout (non-blocking)
    Promise.race([
      trackUsage(userId, UsageType.INTERVIEW_SESSION),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Usage tracking timeout')), 5000)
      )
    ]).catch(error => {
      console.error('Usage tracking failed:', error);
      // Don't fail the request if usage tracking fails
    });

    // Increment rate limit with timeout (non-blocking)
    Promise.race([
      incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Rate limit increment timeout')), 5000)
      )
    ]).catch(error => {
      console.error('Rate limit increment failed:', error);
      // Don't fail the request if rate limit increment fails
    });

    // Return the response
    return NextResponse.json({ 
      success: true, 
      session: sessionData 
    })
  } catch (error) {
    console.error("Error in realtime-session route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
