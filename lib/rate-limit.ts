import { getRedisClient } from "./redis"

export const RATE_LIMIT_CONFIGS = {
  REALTIME_SESSION: {
    limit: 10, // 10 sessions per hour
    window: 60 * 60, // 1 hour in seconds
    prefix: "rate_limit:realtime_session:",
  },
  GENERATE_FEEDBACK: {
    limit: 20, // 20 feedback generations per hour
    window: 60 * 60, // 1 hour in seconds
    prefix: "rate_limit:generate_feedback:",
  },
  UPLOAD: {
    limit: 50, // 50 uploads per hour
    window: 60 * 60, // 1 hour in seconds
    prefix: "rate_limit:upload:",
  },
}

export async function checkRateLimit(
  userId: string,
  config: { limit: number; window: number; prefix: string },
): Promise<{ isLimited: boolean; current: number; limit: number; reset: number }> {
  try {
    const redis = getRedisClient()
    const key = `${config.prefix}${userId}`

    // Get the current count
    const count = (await redis.get<number>(key)) || 0

    // Get the TTL of the key (handle mock redis without ttl)
    let ttl: number
    if (typeof (redis as any).ttl === "function") {
      ttl = await (redis as any).ttl(key)
    } else {
      // Fallback for MockRedisClient: assume full window
      ttl = config.window
    }

    // Calculate reset time
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : config.window * 1000)

    return {
      isLimited: count >= config.limit,
      current: count,
      limit: config.limit,
      reset,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // Fail open - allow the request if Redis is down
    return {
      isLimited: false,
      current: 0,
      limit: config.limit,
      reset: Date.now() + config.window * 1000,
    }
  }
}

export async function incrementRateLimit(
  userId: string,
  config: { limit: number; window: number; prefix: string },
): Promise<void> {
  try {
    const redis = getRedisClient()
    const key = `${config.prefix}${userId}`

    // Increment the counter
    const count = await redis.incr(key)

    // Set expiration if this is the first increment
    if (count === 1) {
      await redis.expire(key, config.window)
    }
  } catch (error) {
    console.error("Rate limit increment error:", error)
    // Continue even if Redis is down
  }
}
