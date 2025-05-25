import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"
import { getOpenAIApiKey } from "@/lib/api-utils"
import { connectionPoolMonitor } from "@/lib/db-connection-monitor"
import { withCircuitBreaker } from "@/lib/circuit-breaker"

// Constants for credits
const MINIMUM_CREDITS_REQUIRED = 0.50
const INTERVIEW_COST = 1.00
const INITIAL_CREDITS_GRANT = 3.00

// Optimized database query with connection warming and caching
async function getUserCredentialsOptimized(userId: string) {
  const startTime = Date.now()
  
  try {
    // Try to get from cache first if available
    try {
      const { getCachedUserCredentials } = await import("@/lib/user-cache")
      const cached = await getCachedUserCredentials(userId)
      if (cached) {
        console.log(`[DB Query] Cache hit for user ${userId} - ${Date.now() - startTime}ms`)
        return {
          id: cached.id,
          credits: cached.credits,
          isPremium: cached.isPremium
        }
      }
    } catch (cacheError) {
      console.warn("[DB Query] Cache unavailable, proceeding with direct query:", cacheError)
    }
    
    // Warm database connection before query
    const { warmDatabaseConnection } = await import("@/lib/prisma")
    await warmDatabaseConnection()
    
    // Direct database query with minimal fields
    const user = await prisma.$queryRaw<Array<{
      id: string
      credits: number
      isPremium: boolean
    }>>`
      SELECT id, credits::float8 as credits, "isPremium" 
      FROM "User" 
      WHERE id = ${userId}
      LIMIT 1
    `
    
    const queryTime = Date.now() - startTime
    console.log(`[DB Query] User fetch completed in ${queryTime}ms`)
    
    return user[0] || null
  } catch (error) {
    const queryTime = Date.now() - startTime
    console.error(`[DB Query] Failed after ${queryTime}ms:`, error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`
  
  // Enhanced logging with more details
  console.log(`\n=== REALTIME SESSION REQUEST START [${requestId}] ===`)
  console.log(`🎯 NEW SESSION REQUEST`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Vercel: ${process.env.VERCEL ? 'Yes' : 'No'}`)
  
  const perfLog = (phase: string, data?: any) => {
    const elapsed = Date.now() - startTime
    console.log(`[${requestId}] ${phase} - ${elapsed}ms`, data || "")
  }
  
  try {
    perfLog("REQUEST_START")
    
    // 1. Validate API key
    const apiKey = getOpenAIApiKey()
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured properly" 
      }, { status: 500 })
    }
    
    // 2. Authenticate user
    perfLog("AUTH_START")
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    perfLog("AUTH_COMPLETE", { userId })
    
    // 3. Check rate limit (non-blocking)
    const rateLimitPromise = checkRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)
    
    // 4. Parse request body early
    const body = await request.json()
    const { jobTitle = "Software Engineer", resumeText = "" } = body
    
    // 5. Wait for rate limit check
    const rateLimitResult = await rateLimitPromise
    if (rateLimitResult.isLimited) {
      return NextResponse.json({
        error: "Rate limit exceeded. Please try again later.",
        resetIn: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      }, { status: 429 })
    }
    
    // 6. Monitor connection pool health before query
    await connectionPoolMonitor.updateMetrics()
    const poolHealth = connectionPoolMonitor.isPoolHealthy()
    const poolUtilization = connectionPoolMonitor.getUtilization()
    
    if (!poolHealth) {
      console.warn(`[${requestId}] Connection pool unhealthy - Utilization: ${poolUtilization}%`)
    }
    
    // 7. Fetch user credentials with timeout
    perfLog("DB_QUERY_START", { poolUtilization })
    let user: { credits: number; isPremium: boolean } | null = null
    
    try {
      // Set reasonable timeout for database query with retry
      const maxDbRetries = 2
      let dbRetryCount = 0
      let lastDbError: Error | null = null
      
      while (dbRetryCount < maxDbRetries && !user) {
        try {
          user = await Promise.race([
            getUserCredentialsOptimized(userId),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 8000) // 8s timeout (increased from 5s)
            )
          ])
          break // Success, exit retry loop
        } catch (error) {
          lastDbError = error as Error
          dbRetryCount++
          perfLog(`DB_QUERY_RETRY_${dbRetryCount}`, { error: String(error) })
          
          if (dbRetryCount < maxDbRetries) {
            // Wait briefly before retry
            await new Promise(resolve => setTimeout(resolve, 500 * dbRetryCount))
          }
        }
      }
      
      if (!user && lastDbError) {
        throw lastDbError
      }
    } catch (error) {
      perfLog("DB_QUERY_ERROR", { error: String(error) })
      
      // For timeout errors, return 503 with clear message
      if (String(error).includes('timeout')) {
        return NextResponse.json({ 
          error: "Database connection timeout",
          message: "The service is temporarily unavailable. Please try again in a few moments.",
          retryAfter: 5,
          requestId
        }, { status: 503 })
      }
      
      // For other errors, still return 503 but different message
      return NextResponse.json({ 
        error: "Service temporarily unavailable",
        message: "Unable to verify account status. Please try again.",
        retryAfter: 3,
        requestId
      }, { status: 503 })
    }
    
    if (!user) {
      perfLog("USER_NOT_FOUND")
      return NextResponse.json({ 
        error: "Account not found",
        message: "Please ensure you are logged in. If you just created an account, please wait a moment.",
        requestId
      }, { status: 404 })
    }
    
    perfLog("DB_QUERY_COMPLETE", { credits: user.credits, isPremium: user.isPremium })
    
    // 7. Check for recent session creation to prevent double charges (non-premium users only)
    if (!user.isPremium) {
      perfLog("CHECKING_RECENT_SESSIONS")
      console.log(`[${requestId}] 🔍 IDEMPOTENCY CHECK: Looking for sessions created in last 30 seconds for user ${userId}`)
      try {
        // Check if a session was created in the last 30 seconds
        const recentSession = await prisma.interviewSession.findFirst({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30000) // 30 seconds ago
            },
            OR: [
              { status: 'pending' },
              { status: 'active' }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            createdAt: true
          }
        })
        
        if (recentSession) {
          const secondsAgo = Math.floor((Date.now() - recentSession.createdAt.getTime()) / 1000)
          perfLog("RECENT_SESSION_FOUND", { 
            sessionId: recentSession.id, 
            secondsAgo
          })
          
          console.log(`[${requestId}] 🛡️ DUPLICATE PREVENTION: Blocking potential double charge - found session ${recentSession.id} created ${secondsAgo}s ago`)
          console.log(`[${requestId}] 💳 NO CREDIT DEDUCTED - Returning duplicate prevention response`)
          
          // Return a special response that the client can handle
          return NextResponse.json({ 
            success: true,
            id: `duplicate-prevention-${recentSession.id}`,
            token: "session-already-active", // The client should handle this gracefully
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            message: "A session was recently created. Please wait before starting a new one.",
            requestId,
            isDuplicatePrevention: true,
            existingSessionId: recentSession.id,
            waitSeconds: Math.max(30 - secondsAgo, 5) // Tell client how long to wait
          }, { status: 200 }) // Return 200 to avoid triggering client retries
        } else {
          perfLog("NO_RECENT_SESSION_FOUND")
          console.log(`[${requestId}] ✅ IDEMPOTENCY CHECK PASSED: No recent sessions found - proceeding with new session creation`)
        }
      } catch (error) {
        console.error(`[${requestId}] Failed to check recent sessions:`, error)
        // Continue with normal flow if check fails
      }
    }
    
    // 8. Credit validation and granting
    if (!user.isPremium) {
      // Grant initial credits for new users
      if (user.credits === 0) {
        perfLog("GRANTING_INITIAL_CREDITS")
        try {
          await prisma.$executeRaw`
            UPDATE "User" 
            SET credits = ${INITIAL_CREDITS_GRANT}
            WHERE id = ${userId} AND credits = 0
          `
          user.credits = INITIAL_CREDITS_GRANT
          perfLog("CREDITS_GRANTED")
        } catch (error) {
          console.error("Failed to grant initial credits:", error)
        }
      }
      
      // Check minimum credits
      if (user.credits < MINIMUM_CREDITS_REQUIRED) {
        return NextResponse.json({ 
          error: "Insufficient VocahireCredits",
          message: `You need at least ${MINIMUM_CREDITS_REQUIRED} VocahireCredits to start an interview.`,
          currentCredits: user.credits,
          minimumRequired: MINIMUM_CREDITS_REQUIRED
        }, { status: 403 })
      }
      
      if (user.credits < INTERVIEW_COST) {
        return NextResponse.json({ 
          error: "Insufficient VocahireCredits",
          message: `You need ${INTERVIEW_COST} VocahireCredits for a full interview.`,
          currentCredits: user.credits,
          requiredCredits: INTERVIEW_COST
        }, { status: 403 })
      }
    }
    
    // 9. Create OpenAI session with circuit breaker protection
    perfLog("OPENAI_SESSION_START")
    
    const instructions = `You are an experienced technical interviewer conducting a mock job interview for a ${jobTitle} position. ${resumeText ? `The candidate has provided this background: ${resumeText.substring(0, 500)}` : ''} 

Your role:
- Ask relevant technical and behavioral questions
- Provide a supportive but challenging interview experience
- Give constructive feedback during the conversation
- Keep questions focused on the job role
- Be encouraging and professional
- Allow natural conversation flow

Begin by greeting the candidate and asking them to introduce themselves briefly.`
    
    let sessionData: any
    try {
      // Use circuit breaker to protect against OpenAI API failures
      sessionData = await withCircuitBreaker(async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout
        
        try {
          // First verify the model is available
          const model = "gpt-4o-mini-realtime-preview" // Use the mini model for cost efficiency
          
          const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'realtime=v1',
            },
            body: JSON.stringify({
              model,
              voice: "alloy",
              instructions,
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 200
              }
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
          }
          
          return await response.json()
        } finally {
          clearTimeout(timeoutId)
        }
      }, `openai-realtime-${userId}`) // User-specific circuit breaker
      
      perfLog("OPENAI_SESSION_COMPLETE", { 
        sessionId: sessionData.id,
        hasClientSecret: !!sessionData.client_secret,
        clientSecretValue: sessionData.client_secret?.value ? "present" : "missing"
      })
      
      // Log the structure of the response for debugging
      console.log(`[${requestId}] OpenAI session response structure:`, {
        id: sessionData.id,
        object: sessionData.object,
        model: sessionData.model,
        expires_at: sessionData.expires_at,
        client_secret: sessionData.client_secret ? {
          value: "REDACTED",
          expires_at: sessionData.client_secret.expires_at
        } : null
      })
      
    } catch (error) {
      perfLog("OPENAI_SESSION_ERROR", { error: String(error) })
      
      // Handle circuit breaker errors specifically
      if (String(error).includes("Circuit breaker is OPEN")) {
        return NextResponse.json({ 
          error: "Service temporarily unavailable",
          message: "Too many failed attempts. Please wait a few minutes before trying again.",
          requestId
        }, { status: 429 })
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ 
          error: "Session creation timeout",
          message: "OpenAI API is taking too long to respond. Please try again.",
          requestId
        }, { status: 504 })
      }
      
      // Log more details about the error
      console.error(`[${requestId}] OpenAI API Error Details:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      
      return NextResponse.json({ 
        error: "Failed to create interview session",
        message: "External API error. Please try again.",
        requestId
      }, { status: 502 })
    }
    
    // 10. Create interview session record BEFORE deducting credits (for idempotency)
    let interviewSessionId: string | null = null
    try {
      perfLog("CREATING_INTERVIEW_SESSION_RECORD")
      const newSession = await prisma.interviewSession.create({
        data: {
          userId,
          jobTitle,
          status: 'active',
          feedbackStatus: 'pending'
        },
        select: {
          id: true
        }
      })
      interviewSessionId = newSession.id
      perfLog("INTERVIEW_SESSION_CREATED", { sessionId: interviewSessionId })
    } catch (error) {
      console.error(`[${requestId}] Failed to create interview session record:`, error)
      // Continue without session record, but log the issue
    }
    
    // 11. Deduct credits synchronously to ensure it happens
    if (!user.isPremium) {
      perfLog("CREDIT_DEDUCTION_START")
      try {
        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
          // First, deduct the credits
          const updateResult = await tx.$executeRaw`
            UPDATE "User" 
            SET credits = credits - ${INTERVIEW_COST}
            WHERE id = ${userId} AND credits >= ${INTERVIEW_COST}
          `
          
          if (updateResult === 0) {
            throw new Error("Insufficient credits or user not found")
          }
          
          // Then, mark the session as having deducted credits (if we created one)
          if (interviewSessionId) {
            await tx.$executeRaw`
              UPDATE "InterviewSession"
              SET "updatedAt" = NOW()
              WHERE id = ${interviewSessionId}
            `
          }
          
          return updateResult
        })
        
        perfLog("CREDIT_DEDUCTION_SUCCESS", { rowsUpdated: result })
        console.log(`[${requestId}] 💳 CREDIT DEDUCTED: ${INTERVIEW_COST} VocahireCredits deducted from user ${userId}`)
        
        // Invalidate cache after successful credit deduction
        try {
          const { invalidateUserCache } = await import("@/lib/user-cache")
          await invalidateUserCache(userId)
        } catch (cacheError) {
          console.warn("Failed to invalidate user cache:", cacheError)
        }
      } catch (error) {
        console.error(`[${requestId}] Failed to deduct credits:`, error)
        // If credit deduction fails, delete the session record
        if (interviewSessionId) {
          try {
            await prisma.interviewSession.delete({
              where: { id: interviewSessionId }
            })
          } catch (deleteError) {
            console.error(`[${requestId}] Failed to delete session after credit deduction failure:`, deleteError)
          }
        }
        // Don't fail the request, but log the issue
      }
    }
    
    // 12. Track usage (non-blocking)
    setImmediate(() => {
      trackUsage(userId, UsageType.INTERVIEW_SESSION).catch(console.error)
      incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION).catch(console.error)
    })
    
    const totalTime = Date.now() - startTime
    perfLog("REQUEST_COMPLETE", { totalTime })
    console.log(`=== REALTIME SESSION REQUEST END [${requestId}] - Total: ${totalTime}ms ===\n`)
    
    return NextResponse.json({ 
      success: true,
      id: sessionData.id,
      token: sessionData.client_secret?.value,
      expires_at: sessionData.client_secret?.expires_at,
      session: sessionData,
      requestId,
      processingTime: totalTime
    })
    
  } catch (error) {
    perfLog("UNEXPECTED_ERROR", { error: String(error) })
    console.error("Unexpected error in realtime-session:", error)
    
    return NextResponse.json({ 
      error: "An unexpected error occurred",
      message: "Please try again or contact support if the issue persists."
    }, { status: 500 })
  }
}