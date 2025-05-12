import { getRedisClient } from "./redis"

// Track usage for a specific action
export async function trackUsage(userId: string, action: string): Promise<void> {
  const redis = getRedisClient()
  const now = new Date()
  const day = now.toISOString().split("T")[0] // YYYY-MM-DD
  const month = day.substring(0, 7) // YYYY-MM

  try {
    // Increment daily counter
    await redis.incr(`usage:${action}:day:${day}:${userId}`)
    await redis.expire(`usage:${action}:day:${day}:${userId}`, 60 * 60 * 24 * 7) // 7 days

    // Increment monthly counter
    await redis.incr(`usage:${action}:month:${month}:${userId}`)
    await redis.expire(`usage:${action}:month:${month}:${userId}`, 60 * 60 * 24 * 32) // 32 days

    // Increment total counter
    await redis.incr(`usage:${action}:total:${userId}`)

    // Increment global counters
    await redis.incr(`usage:${action}:day:${day}:global`)
    await redis.incr(`usage:${action}:month:${month}:global`)
    await redis.incr(`usage:${action}:total:global`)
  } catch (error) {
    // If Redis fails, log the error but don't block the operation
    console.error("Error tracking usage:", error)
  }
}

// Get usage statistics for a user
export async function getUserUsage(userId: string): Promise<any> {
  const redis = getRedisClient()
  const now = new Date()
  const day = now.toISOString().split("T")[0]
  const month = day.substring(0, 7)

  try {
    const [dailyInterviews, monthlyInterviews, totalInterviews, dailyFeedback, monthlyFeedback, totalFeedback] =
      await Promise.all([
        redis.get(`usage:realtime_session:day:${day}:${userId}`),
        redis.get(`usage:realtime_session:month:${month}:${userId}`),
        redis.get(`usage:realtime_session:total:${userId}`),
        redis.get(`usage:generate_feedback:day:${day}:${userId}`),
        redis.get(`usage:generate_feedback:month:${month}:${userId}`),
        redis.get(`usage:generate_feedback:total:${userId}`),
      ])

    return {
      interviews: {
        daily: Number.parseInt(dailyInterviews || "0"),
        monthly: Number.parseInt(monthlyInterviews || "0"),
        total: Number.parseInt(totalInterviews || "0"),
      },
      feedback: {
        daily: Number.parseInt(dailyFeedback || "0"),
        monthly: Number.parseInt(monthlyFeedback || "0"),
        total: Number.parseInt(totalFeedback || "0"),
      },
    }
  } catch (error) {
    console.error("Error getting user usage:", error)
    return {
      interviews: { daily: 0, monthly: 0, total: 0 },
      feedback: { daily: 0, monthly: 0, total: 0 },
    }
  }
}

// Get global usage statistics
export async function getGlobalUsage(): Promise<any> {
  const redis = getRedisClient()
  const now = new Date()
  const day = now.toISOString().split("T")[0]
  const month = day.substring(0, 7)

  try {
    const [dailyInterviews, monthlyInterviews, totalInterviews, dailyFeedback, monthlyFeedback, totalFeedback] =
      await Promise.all([
        redis.get(`usage:realtime_session:day:${day}:global`),
        redis.get(`usage:realtime_session:month:${month}:global`),
        redis.get(`usage:realtime_session:total:global`),
        redis.get(`usage:generate_feedback:day:${day}:global`),
        redis.get(`usage:generate_feedback:month:${month}:global`),
        redis.get(`usage:generate_feedback:total:global`),
      ])

    return {
      interviews: {
        daily: Number.parseInt(dailyInterviews || "0"),
        monthly: Number.parseInt(monthlyInterviews || "0"),
        total: Number.parseInt(totalInterviews || "0"),
      },
      feedback: {
        daily: Number.parseInt(dailyFeedback || "0"),
        monthly: Number.parseInt(monthlyFeedback || "0"),
        total: Number.parseInt(totalFeedback || "0"),
      },
    }
  } catch (error) {
    console.error("Error getting global usage:", error)
    return {
      interviews: { daily: 0, monthly: 0, total: 0 },
      feedback: { daily: 0, monthly: 0, total: 0 },
    }
  }
}
