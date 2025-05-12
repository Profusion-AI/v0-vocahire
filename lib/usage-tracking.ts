import { getRedisClient } from "./redis"

// Types of usage to track
export enum UsageType {
  INTERVIEW_SESSION = "interview_session",
  FEEDBACK_GENERATION = "feedback_generation",
  TOKEN_USAGE = "token_usage",
}

// User tiers and their limits
export enum UserTier {
  FREE = "free",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
}

// Limits for each tier
export const TIER_LIMITS = {
  [UserTier.FREE]: {
    [UsageType.INTERVIEW_SESSION]: 2, // 2 interviews per day
    [UsageType.FEEDBACK_GENERATION]: 2, // 2 feedback generations per day
    [UsageType.TOKEN_USAGE]: 10000, // 10k tokens per day
  },
  [UserTier.PREMIUM]: {
    [UsageType.INTERVIEW_SESSION]: 10, // 10 interviews per day
    [UsageType.FEEDBACK_GENERATION]: 10, // 10 feedback generations per day
    [UsageType.TOKEN_USAGE]: 100000, // 100k tokens per day
  },
  [UserTier.ENTERPRISE]: {
    [UsageType.INTERVIEW_SESSION]: 100, // 100 interviews per day
    [UsageType.FEEDBACK_GENERATION]: 100, // 100 feedback generations per day
    [UsageType.TOKEN_USAGE]: 1000000, // 1M tokens per day
  },
}

// Mock function to get user tier - replace with your actual implementation
export async function getUserTier(userId: string): Promise<UserTier> {
  // In a real app, you would fetch this from your database
  // For now, we'll return FREE for all users
  return UserTier.FREE
}

/**
 * Track usage for a user
 * @param userId User ID
 * @param usageType Type of usage to track
 * @param amount Amount to increment (default: 1)
 */
export async function trackUsage(userId: string, usageType: UsageType, amount = 1): Promise<void> {
  const redis = getRedisClient()
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const key = `usage:${usageType}:${userId}:${today}`

  try {
    const pipeline = redis.pipeline()
    pipeline.incrby(key, amount)
    pipeline.expire(key, 60 * 60 * 24 * 7) // Keep for 7 days
    await pipeline.exec()

    // Also update monthly stats
    const month = today.substring(0, 7) // YYYY-MM
    const monthlyKey = `usage:${usageType}:${userId}:${month}`
    const monthlyPipeline = redis.pipeline()
    monthlyPipeline.incrby(monthlyKey, amount)
    monthlyPipeline.expire(monthlyKey, 60 * 60 * 24 * 32) // Keep for ~1 month
    await monthlyPipeline.exec()

    console.log(`Tracked ${amount} ${usageType} for user ${userId}`)
  } catch (error) {
    console.error(`Failed to track usage for user ${userId}:`, error)
  }
}

/**
 * Check if a user has exceeded their usage limit
 * @param userId User ID
 * @param usageType Type of usage to check
 * @returns Whether the user has exceeded their limit
 */
export async function checkUsageLimit(
  userId: string,
  usageType: UsageType,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const redis = getRedisClient()
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const key = `usage:${usageType}:${userId}:${today}`

  try {
    // Get current usage
    const currentUsage = (await redis.get<number>(key)) || 0

    // Get user tier and limit
    const tier = await getUserTier(userId)
    const limit = TIER_LIMITS[tier][usageType]

    return {
      allowed: currentUsage < limit,
      current: currentUsage,
      limit,
    }
  } catch (error) {
    console.error(`Failed to check usage limit for user ${userId}:`, error)
    // Fail open - if Redis fails, allow the request
    return {
      allowed: true,
      current: 0,
      limit: 0,
    }
  }
}

/**
 * Get usage statistics for a user
 * @param userId User ID
 * @returns Usage statistics
 */
export async function getUserUsageStats(userId: string): Promise<Record<string, any>> {
  const redis = getRedisClient()
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const month = today.substring(0, 7) // YYYY-MM

  const stats: Record<string, any> = {
    daily: {},
    monthly: {},
    tier: await getUserTier(userId),
  }

  try {
    // Get daily stats
    for (const usageType of Object.values(UsageType)) {
      const dailyKey = `usage:${usageType}:${userId}:${today}`
      stats.daily[usageType] = (await redis.get<number>(dailyKey)) || 0
    }

    // Get monthly stats
    for (const usageType of Object.values(UsageType)) {
      const monthlyKey = `usage:${usageType}:${userId}:${month}`
      stats.monthly[usageType] = (await redis.get<number>(monthlyKey)) || 0
    }

    return stats
  } catch (error) {
    console.error(`Failed to get usage stats for user ${userId}:`, error)
    return stats
  }
}
