import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"
import { getOpenAIApiKey } from "@/lib/api-utils"

// Constants for credits
const MINIMUM_CREDITS_REQUIRED = 0.50
const INTERVIEW_COST = 1.00
const INITIAL_CREDITS_GRANT = 3.00

// Optimized database query with direct Prisma call
async function getUserCredentialsOptimized(userId: string) {
  const startTime = Date.now()
  
  try {
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
    
    // 6. Fetch user credentials with timeout
    perfLog("DB_QUERY_START")
    let user: { credits: number; isPremium: boolean } | null = null
    
    try {
      // Set aggressive timeout for database query
      user = await Promise.race([
        getUserCredentialsOptimized(userId),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000) // 5s timeout
        )
      ])
    } catch (error) {
      perfLog("DB_QUERY_ERROR", { error: String(error) })
      
      // For timeout errors, return 503 with clear message
      if (String(error).includes('timeout')) {
        return NextResponse.json({ 
          error: "Database connection timeout",
          message: "The service is temporarily unavailable. Please try again in a few moments.",
          retryAfter: 5
        }, { status: 503 })
      }
      
      // For other errors, still return 503 but different message
      return NextResponse.json({ 
        error: "Service temporarily unavailable",
        message: "Unable to verify account status. Please try again.",
        retryAfter: 3
      }, { status: 503 })
    }
    
    if (!user) {
      perfLog("USER_NOT_FOUND")
      return NextResponse.json({ 
        error: "Account not found",
        message: "Please ensure you are logged in. If you just created an account, please wait a moment."
      }, { status: 404 })
    }
    
    perfLog("DB_QUERY_COMPLETE", { credits: user.credits, isPremium: user.isPremium })
    
    // 7. Credit validation and granting
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
    
    // 8. Create OpenAI session with aggressive timeout
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
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout
    
    let sessionData: any
    try {
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'realtime',
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview",
          instructions
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      perfLog("OPENAI_SESSION_RESPONSE", { status: response.status })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }
      
      sessionData = await response.json()
      perfLog("OPENAI_SESSION_COMPLETE", { sessionId: sessionData.id })
      
    } catch (error) {
      clearTimeout(timeoutId)
      perfLog("OPENAI_SESSION_ERROR", { error: String(error) })
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ 
          error: "Session creation timeout",
          message: "OpenAI API is taking too long to respond. Please try again."
        }, { status: 504 })
      }
      
      return NextResponse.json({ 
        error: "Failed to create interview session",
        message: "External API error. Please try again."
      }, { status: 502 })
    }
    
    // 9. Deduct credits (non-blocking for better UX)
    if (!user.isPremium) {
      perfLog("CREDIT_DEDUCTION_START")
      // Fire and forget credit deduction
      prisma.$executeRaw`
        UPDATE "User" 
        SET credits = credits - ${INTERVIEW_COST}
        WHERE id = ${userId} AND credits >= ${INTERVIEW_COST}
      `.catch(error => {
        console.error("Failed to deduct credits:", error)
      })
    }
    
    // 10. Track usage (non-blocking)
    setImmediate(() => {
      trackUsage(userId, UsageType.INTERVIEW_SESSION).catch(console.error)
      incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION).catch(console.error)
    })
    
    perfLog("REQUEST_COMPLETE", { totalTime: Date.now() - startTime })
    
    return NextResponse.json({ 
      success: true,
      id: sessionData.id,
      token: sessionData.client_secret?.value,
      expires_at: sessionData.client_secret?.expires_at,
      session: sessionData
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