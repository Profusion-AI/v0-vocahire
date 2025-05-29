import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking"
import { generateEnhancedInterviewFeedback } from "@/lib/enhancedFeedback"
import { transactionLogger, TransactionOperations } from "@/lib/transaction-logger"
import { Transcript } from "@/prisma/generated/client"

export const dynamic = 'force-dynamic';

const ENHANCED_FEEDBACK_COST = 0.50

export async function POST(request: NextRequest) {
  const requestId = `enhance_feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`[${requestId}] Starting enhanced feedback generation`)
  
  let userId: string | null = null
  
  try {
    // 1. Authenticate user
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json(
        { success: false, error: "User is not authenticated." },
        { status: 401 }
      )
    }

    userId = auth.userId

    // 2. Apply rate limiting
    const { isLimited, reset } = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.GENERATE_FEEDBACK)
    if (isLimited) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { 
          success: false,
          error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` 
        },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      )
    }

    // 3. Parse and validate request
    const body = await request.json()
    const { interviewId } = body

    if (!interviewId) {
      return NextResponse.json({ 
        success: false, 
        error: "Interview ID is required" 
      }, { status: 400 })
    }

    // 4. Verify interview ownership and get data
    const { prisma } = await import("@/lib/prisma");
    const interview = await prisma.interviewSession.findUnique({
      where: {
        id: interviewId,
        userId
      },
      include: {
        feedbacks: true,
        transcripts: {
          orderBy: { timestamp: 'asc' }
        }
      }
    })

    if (!interview) {
      return NextResponse.json({ 
        success: false,
        error: "Interview not found or not authorized" 
      }, { status: 404 })
    }

    // 5. Check if basic feedback exists
    if (!interview.feedbacks || interview.feedbacks.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: "Basic feedback must be generated first" 
      }, { status: 400 })
    }

    const feedback = interview.feedbacks[0] // Get the first (should be only) feedback

    // 6. Check if enhanced feedback already exists
    if (feedback.enhancedFeedbackGenerated) {
      return NextResponse.json({
        success: true,
        message: "Enhanced feedback already generated",
        enhancedFeedback: {
          enhancedReportData: feedback.enhancedReportData,
          toneAnalysis: feedback.toneAnalysis,
          keywordRelevanceScore: feedback.keywordRelevanceScore,
          sentimentProgression: feedback.sentimentProgression,
          enhancedGeneratedAt: feedback.enhancedGeneratedAt
        }
      })
    }

    // 7. Get user and verify credits
    const { getOrCreatePrismaUser } = await import("@/lib/auth-utils");
    const user = await getOrCreatePrismaUser(userId)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to verify user" 
      }, { status: 500 })
    }

    if (!user.isPremium && Number(user.credits) < ENHANCED_FEEDBACK_COST) {
      return NextResponse.json({ 
        success: false,
        error: `Insufficient VocahireCredits. You need at least ${ENHANCED_FEEDBACK_COST} VocahireCredits for enhanced feedback.`,
        currentCredits: Number(user.credits),
        requiredCredits: ENHANCED_FEEDBACK_COST
      }, { status: 403 })
    }

    // 8. Deduct credits synchronously (CRITICAL per CLAUDE.md)
    if (!user.isPremium) {
      const updateResult = await prisma.$executeRaw`
        UPDATE "User" 
        SET credits = credits - ${ENHANCED_FEEDBACK_COST}
        WHERE id = ${userId} AND credits >= ${ENHANCED_FEEDBACK_COST}
      `
      
      if (updateResult === 0) {
        return NextResponse.json({ 
          success: false,
          error: "Failed to deduct credits. Please try again." 
        }, { status: 500 })
      }
      
      console.log(`[${requestId}] Credits deducted:`, ENHANCED_FEEDBACK_COST)
      
      // Log transaction
      transactionLogger.info(userId, TransactionOperations.CREDITS_DEDUCTED, {
        amount: ENHANCED_FEEDBACK_COST,
        currency: "credits",
        metadata: { 
          interviewId, 
          type: "enhanced_feedback" 
        }
      })
    }

    // 9. Prepare transcript for enhanced analysis
    const transcript = interview.transcripts.map((t: Transcript) => ({
      role: t.role,
      content: t.content,
      timestamp: t.timestamp.getTime()
    }))

    const sessionContext = {
      jobTitle: interview.jobTitle,
      jdContext: interview.jdContext,
      resumeSnapshot: interview.resumeSnapshot,
      duration: interview.durationSeconds,
      completedAt: interview.endedAt
    }

    // 10. Generate enhanced feedback
    try {
      const enhancedData = await generateEnhancedInterviewFeedback(
        transcript,
        sessionContext,
        feedback.structuredData as any // Use existing structured data as base
      )

      // 11. Update feedback record with enhanced data
      const updatedFeedback = await prisma.feedback.update({
        where: { id: feedback.id },
        data: {
          enhancedFeedbackGenerated: true,
          enhancedReportData: enhancedData.enhancedReport,
          toneAnalysis: enhancedData.toneAnalysis,
          keywordRelevanceScore: enhancedData.keywordRelevanceScore,
          sentimentProgression: enhancedData.sentimentProgression,
          starMethodScore: enhancedData.starMethodScore,
          enhancedGeneratedAt: new Date()
        }
      })

      // 12. Track usage
      await trackUsage(userId, UsageType.FEEDBACK_GENERATION, {
        type: "enhanced",
        cost: ENHANCED_FEEDBACK_COST,
        interviewId
      })

      // 13. Return enhanced feedback
      return NextResponse.json({
        success: true,
        creditsDeducted: user.isPremium ? 0 : ENHANCED_FEEDBACK_COST,
        enhancedFeedback: {
          enhancedReportData: updatedFeedback.enhancedReportData,
          toneAnalysis: updatedFeedback.toneAnalysis,
          keywordRelevanceScore: updatedFeedback.keywordRelevanceScore,
          sentimentProgression: updatedFeedback.sentimentProgression,
          starMethodScore: updatedFeedback.starMethodScore,
          enhancedGeneratedAt: updatedFeedback.enhancedGeneratedAt
        }
      })
      
    } catch (aiError) {
      // Enhanced feedback generation failed after credit deduction
      console.error(`[${requestId}] AI generation failed after credit deduction:`, aiError)
      
      // Log critical error
      const errorContext = {
        userId,
        interviewId,
        stage: "enhanced_feedback_ai_generation",
        creditsDeducted: !user.isPremium,
        error: aiError instanceof Error ? aiError.message : "Unknown error"
      }
      console.error("CRITICAL: Enhanced feedback failed after credit deduction:", errorContext)
      
      // For MVP, we don't refund credits but log the failure prominently
      // Future: Implement retry mechanism or credit refund
      
      return NextResponse.json({
        success: false,
        error: "Failed to generate enhanced feedback. Please contact support with reference: " + requestId,
        referenceId: requestId
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error(`[${requestId}] Error in enhance feedback route:`, error)
    
    // Log error
    if (error instanceof Error) {
      const errorContext = {
        requestId,
        userId,
        errorMessage: error.message,
        errorStack: error.stack
      }
      console.error("Enhanced feedback endpoint error:", errorContext)
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to process enhanced feedback request" 
    }, { status: 500 })
  }
}