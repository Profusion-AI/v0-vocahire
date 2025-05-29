import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking"
import type { EnhancedFeedback, EnhancedFeedbackResponse } from "@/types/feedback"

export const dynamic = 'force-dynamic';

const ENHANCED_FEEDBACK_COST = 0.50

export async function POST(request: NextRequest) {
  const requestId = `enhanced_feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`[${requestId}] Starting enhanced feedback generation`)
  
  try {
    // 1. Authenticate user
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json(
        { success: false, error: "User is not authenticated." },
        { status: 401 }
      )
    }

    const userId = auth.userId

    // 2. Apply rate limiting
    const { isLimited, reset } = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.GENERATE_FEEDBACK)
    if (isLimited) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const { sessionId: _sessionId, transcript } = body

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid transcript data" 
      }, { status: 400 })
    }

    // 4. Verify user credits
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

    // 5. Deduct credits (only for non-premium users)
    if (!user.isPremium) {
      const { prisma } = await import("@/lib/prisma");
      const updateResult = await prisma.user.update({
        where: { id: userId },
        data: { 
          credits: { 
            decrement: ENHANCED_FEEDBACK_COST 
          } 
        }
      })
      
      console.log(`[${requestId}] Credits deducted:`, ENHANCED_FEEDBACK_COST, "New balance:", updateResult.credits)
    }

    // 6. TODO: Generate enhanced feedback
    // This is where the enhanced feedback generation logic will be implemented
    // For now, returning a placeholder response
    
    const enhancedFeedback: EnhancedFeedback = {
      summary: "Enhanced feedback generation is under development",
      strengths: "Your interview showed promise in several areas",
      areasForImprovement: "Continue practicing to unlock your full potential",
      transcriptScore: 3.5,
      
      // Placeholder data - will be replaced with actual analysis
      industryComparison: {
        percentile: 75,
        averageScore: 3.0,
        topPerformerScore: 4.5,
        industry: "Technology"
      },
      
      responseAnalysis: [],
      
      communicationMetrics: {
        averageResponseTime: 2.5,
        wordCount: transcript.reduce((sum, msg) => sum + (msg.content?.split(' ').length || 0), 0),
        vocabularyComplexity: "intermediate",
        sentenceStructure: "varied",
        confidenceLevel: 70,
        enthusiasm: 65
      },
      
      actionPlan: {
        immediate: ["Practice structured responses using the STAR method"],
        shortTerm: ["Research common behavioral questions in your field"],
        longTerm: ["Develop a portfolio of success stories"],
        resources: []
      },
      
      insights: {
        personalityTraits: ["Analytical", "Detail-oriented"],
        culturalFit: "Strong alignment with collaborative environments",
        leadershipPotential: 65,
        technicalDepth: 75,
        problemSolvingStyle: "systematic"
      }
    }

    // 7. Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION, {
      type: "enhanced",
      cost: ENHANCED_FEEDBACK_COST
    })

    // 8. Return response
    const response: EnhancedFeedbackResponse = {
      success: true,
      feedback: enhancedFeedback,
      creditsDeducted: user.isPremium ? 0 : ENHANCED_FEEDBACK_COST
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error(`[${requestId}] Error in enhanced feedback generation:`, error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate enhanced feedback. Please try again." 
    }, { status: 500 })
  }
}