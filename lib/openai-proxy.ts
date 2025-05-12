import { getOpenAIApiKey, validateApiKey } from "./api-utils"

// Types for rate limiting
type UsageRecord = {
  count: number
  lastReset: Date
}

// Simple in-memory rate limiter
// In production, use Redis or another persistent store
const userUsage = new Map<string, UsageRecord>()

// Rate limit configuration
const RATE_LIMIT = {
  requestsPerHour: 20, // Adjust based on your needs and billing
  requestsPerDay: 100,
}

/**
 * Check if a user has exceeded their rate limits
 * @param userId The authenticated user's ID
 * @returns {boolean} Whether the user has exceeded their rate limit
 */
export function checkRateLimit(userId: string): { allowed: boolean; reason?: string } {
  if (!userId) {
    return { allowed: false, reason: "User ID is required for rate limiting" }
  }

  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Get or initialize user record
  let record = userUsage.get(userId)
  if (!record) {
    record = { count: 0, lastReset: now }
    userUsage.set(userId, record)
  }

  // Reset counter if needed
  if (record.lastReset < dayAgo) {
    record.count = 0
    record.lastReset = now
  }

  // Check rate limit
  if (record.count >= RATE_LIMIT.requestsPerHour && record.lastReset > hourAgo) {
    return { allowed: false, reason: "Hourly rate limit exceeded" }
  }

  if (record.count >= RATE_LIMIT.requestsPerDay) {
    return { allowed: false, reason: "Daily rate limit exceeded" }
  }

  // Increment usage counter
  record.count++
  userUsage.set(userId, record)

  return { allowed: true }
}

/**
 * Generate OpenAI API request headers with validation and logging
 * @param userId The authenticated user's ID for attribution and rate limiting
 * @returns Headers object with Authorization and other required headers
 */
export function generateOpenAIHeaders(
  userId: string,
  additionalHeaders: Record<string, string> = {},
): Record<string, string> {
  const apiKey = getOpenAIApiKey()
  const validation = validateApiKey(apiKey)

  if (!validation.isValid) {
    throw new Error(`Invalid API key: ${validation.error}`)
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-User-Id": userId, // For your own logging purposes
    ...additionalHeaders,
  }
}

/**
 * Log API usage for monitoring and billing
 * @param userId User making the request
 * @param endpoint OpenAI endpoint being called
 * @param success Whether the call succeeded
 * @param details Any additional details to log
 */
export function logAPIUsage(userId: string, endpoint: string, success: boolean, details?: any) {
  // In production, you'd likely write to a database or analytics service
  console.log(`API Usage: ${userId} called ${endpoint} - ${success ? "SUCCESS" : "FAILED"}`, details)

  // Here you would typically:
  // 1. Log to a database for usage tracking
  // 2. Update any billing information
  // 3. Record usage for analytics
}
