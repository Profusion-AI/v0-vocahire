import { getRedisClient } from "./redis"
import { type NextRequest, NextResponse } from "next/server"

export type RateLimitConfig = {
  // Maximum number of requests allowed in the time window
  limit: number

  // Time window in seconds
  windowInSeconds: number

  // Identifier for the rate limit (e.g., 'feedback', 'interview')
  identifier: string
}

// Default configurations for different API endpoints
export const RATE_LIMIT_CONFIGS = {
  FEEDBACK: {
    limit: 10,
    windowInSeconds: 60 * 60, // 1 hour
    identifier: "feedback",
  },
  INTERVIEW: {
    limit: 5,
    windowInSeconds: 60 * 60 * 24, // 24 hours
    identifier: "interview",
  },
  REALTIME_SESSION: {
    limit: 10,
    windowInSeconds: 60 * 60, // 1 hour
    identifier: "realtime_session",
  },
}

/**
 * Rate limiting middleware for API routes
 * @param userId User ID to rate limit
 * @param config Rate limit configuration
 * @returns Object with isLimited flag and reset time
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig,
): Promise<{ isLimited: boolean; reset: number; current: number; limit: number }> {
  const redis = getRedisClient()
  const key = `rate_limit:${config.identifier}:${userId}`

  try {
    // Get current count
    const currentCount = (await redis.get<number>(key)) || 0

    // Check if rate limited
    if (currentCount >= config.limit) {
      // Get TTL to determine when the rate limit resets
      const ttl = await redis.ttl(key)
      const resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : config.windowInSeconds * 1000)

      return {
        isLimited: true,
        reset: resetTime,
        current: currentCount,
        limit: config.limit,
      }
    }

    return {
      isLimited: false,
      reset: Date.now() + config.windowInSeconds * 1000,
      current: currentCount,
      limit: config.limit,
    }
  } catch (error) {
    console.error(`Rate limit check failed for user ${userId}:`, error)
    // Fail open - if Redis fails, allow the request
    return {
      isLimited: false,
      reset: Date.now() + config.windowInSeconds * 1000,
      current: 0,
      limit: config.limit,
    }
  }
}

/**
 * Increment the rate limit counter for a user
 * @param userId User ID to increment counter for
 * @param config Rate limit configuration
 */
export async function incrementRateLimit(userId: string, config: RateLimitConfig): Promise<void> {
  const redis = getRedisClient()
  const key = `rate_limit:${config.identifier}:${userId}`

  try {
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, config.windowInSeconds)
    await pipeline.exec()
  } catch (error) {
    console.error(`Failed to increment rate limit for user ${userId}:`, error)
    // Non-critical error, just log it
  }
}

/**
 * Helper function to create a rate limited API route
 * @param handler Your API route handler
 * @param config Rate limit configuration
 * @returns Rate limited API route handler
 */
export function withRateLimit(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
  config: RateLimitConfig,
  getUserId: (req: NextRequest) => Promise<string | null>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const userId = await getUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rateLimitResult = await checkRateLimit(userId, config)

    if (rateLimitResult.isLimited) {
      const resetDate = new Date(rateLimitResult.reset).toISOString()
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again later.`,
          reset: resetDate,
          current: rateLimitResult.current,
          limit: rateLimitResult.limit,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": (rateLimitResult.limit - rateLimitResult.current).toString(),
            "X-RateLimit-Reset": Math.ceil(rateLimitResult.reset / 1000).toString(),
          },
        },
      )
    }

    // Process the request
    const response = await handler(req, userId)

    // Increment the rate limit counter after successful processing
    await incrementRateLimit(userId, config)

    // Add rate limit headers to the response
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString())
    response.headers.set("X-RateLimit-Remaining", (rateLimitResult.limit - rateLimitResult.current - 1).toString())
    response.headers.set("X-RateLimit-Reset", Math.ceil(rateLimitResult.reset / 1000).toString())

    return response
  }
}
