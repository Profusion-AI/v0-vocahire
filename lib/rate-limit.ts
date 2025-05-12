import { getRedisClient } from "./redis"

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Maximum number of requests allowed in the time window
  uniqueTokenPerInterval?: number // Maximum number of unique tokens per interval
}

export interface RateLimiter {
  check: (token: string) => Promise<void>
}

export function rateLimit(config: RateLimitConfig): RateLimiter {
  const { interval, limit, uniqueTokenPerInterval = 500 } = config
  const redis = getRedisClient()

  return {
    check: async (token: string): Promise<void> => {
      const tokenKey = `rate-limit:${token}`
      const uniqueTokensKey = `rate-limit:unique-tokens:${Math.floor(Date.now() / interval)}`

      let requests: number

      try {
        // Increment the token count
        requests = await redis.incr(tokenKey)

        // Set expiration for the token key if it's new
        if (requests === 1) {
          await redis.expire(tokenKey, Math.floor(interval / 1000))
        }

        // Add the token to the set of unique tokens for this interval
        await redis.set(uniqueTokensKey, token, { ex: Math.floor(interval / 1000) })

        // Check if the token has exceeded the limit
        if (requests > limit) {
          throw new Error(`Rate limit exceeded for ${token}`)
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
          throw error
        }
        // If there's an error with Redis, we'll log it but allow the request
        console.error("Error in rate limiting:", error)
      }
    },
  }
}
