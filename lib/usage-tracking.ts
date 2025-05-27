import { redis } from "./redis"

export enum UsageType {
  INTERVIEW_SESSION = "interview_session",
  INTERVIEW_COMPLETED = "interview_completed",
  FEEDBACK_GENERATION = "feedback_generation",
  UPLOAD = "upload",
}

interface UsageLimits {
  [UsageType.INTERVIEW_SESSION]: number
  [UsageType.INTERVIEW_COMPLETED]: number
  [UsageType.FEEDBACK_GENERATION]: number
  [UsageType.UPLOAD]: number
}

// Default limits for free tier
const FREE_TIER_LIMITS: UsageLimits = {
  [UsageType.INTERVIEW_SESSION]: 3, // 3 interviews per day
  [UsageType.INTERVIEW_COMPLETED]: 100, // No practical limit on saving completed interviews
  [UsageType.FEEDBACK_GENERATION]: 5, // 5 feedback generations per day
  [UsageType.UPLOAD]: 10, // 10 uploads per day
}

// Get the usage limit for a user based on their tier
async function getUserLimit(userId: string, usageType: UsageType): Promise<number> {
  // TODO: In the future, fetch the user's tier from the database
  // For now, return the free tier limit
  return FREE_TIER_LIMITS[usageType]
}

// Track usage for a specific user and usage type
export async function trackUsage(userId: string, usageType: UsageType, metadata?: any): Promise<void> {
  try {
    

    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // Create a key for this user, usage type, and day
    const key = `usage:${usageType}:${userId}:${today}`

    // Increment the usage counter
    await redis.incr(key)

    // Set expiration to 48 hours (to ensure it covers the full day plus some buffer)
    await redis.expire(key, 48 * 60 * 60)

    // Also track monthly usage
    const month = today.substring(0, 7) // YYYY-MM
    const monthlyKey = `usage:${usageType}:${userId}:${month}`

    await redis.incr(monthlyKey)
    // Set expiration to 35 days
    await redis.expire(monthlyKey, 35 * 24 * 60 * 60)
    
    // Log metadata if provided
    if (metadata) {
      console.log(`Usage tracked: ${usageType} for user ${userId}`, metadata)
    }
  } catch (error) {
    console.error(`Error tracking usage for ${userId} (${usageType}):`, error)
    // Continue even if Redis is down
  }
}

// Check if a user has exceeded their usage limit
export async function checkUsageLimit(
  userId: string,
  usageType: UsageType,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    

    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // Create a key for this user, usage type, and day
    const key = `usage:${usageType}:${userId}:${today}`

    // Get the current usage count
    const count = (await redis.get<number>(key)) || 0

    // Get the user's limit for this usage type
    const limit = await getUserLimit(userId, usageType)

    return {
      allowed: count < limit,
      current: count,
      limit,
    }
  } catch (error) {
    console.error(`Error checking usage limit for ${userId} (${usageType}):`, error)
    // Fail open - allow the request if Redis is down
    return {
      allowed: true,
      current: 0,
      limit: FREE_TIER_LIMITS[usageType],
    }
  }
}

// Get usage statistics for a user
export async function getUserUsageStats(
  userId: string,
): Promise<{ [key in UsageType]: { daily: number; monthly: number; limit: number } }> {
  try {
    
    const today = new Date().toISOString().split("T")[0]
    const month = today.substring(0, 7) // YYYY-MM

    const result: any = {}

    // Get usage for each type
    for (const type of Object.values(UsageType)) {
      const dailyKey = `usage:${type}:${userId}:${today}`
      const monthlyKey = `usage:${type}:${userId}:${month}`

      const [dailyCount, monthlyCount] = await Promise.all([
        redis.get<number>(dailyKey) || 0,
        redis.get<number>(monthlyKey) || 0,
      ])

      const limit = await getUserLimit(userId, type as UsageType)

      result[type] = {
        daily: dailyCount,
        monthly: monthlyCount,
        limit,
      }
    }

    return result
  } catch (error) {
    console.error(`Error getting usage stats for ${userId}:`, error)

    // Return default values if Redis is down
    const result: any = {}

    for (const type of Object.values(UsageType)) {
      result[type] = {
        daily: 0,
        monthly: 0,
        limit: FREE_TIER_LIMITS[type as UsageType],
      }
    }

    return result
  }
}
