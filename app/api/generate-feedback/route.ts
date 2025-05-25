import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Added UsageType import
import { prisma } from "@/lib/prisma"
import { generateInterviewFeedbackV2 } from "@/lib/openai"

// Rate limit configuration is now imported and used directly
// const limiter = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500, // Max 500 users per minute
//   limit: 5, // 5 requests per minute
// })

import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  let auth: any
  let body: any
  
  try {
    // Authenticate the user with Clerk
    auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User is not authenticated." },
        },
        { status: 401 }
      )
    }

    const userId = auth.userId

    // Apply rate limiting
    const { isLimited, reset } = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.GENERATE_FEEDBACK)
    if (isLimited) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      )
    }

    // Process the request
    body = await request.json()
    const { interviewId, transcript, fromLocalStorage, generateAsync } = body

    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 })
    }

    // Handle localStorage data (no database record yet)
    if (fromLocalStorage) {
      console.log("Generating feedback from localStorage data")
      console.log("Transcript length:", transcript?.length || 0)
      
      // Validate transcript data
      if (!Array.isArray(transcript) || transcript.length === 0) {
        return NextResponse.json({ 
          error: "Invalid or empty transcript. Please complete an interview before requesting feedback." 
        }, { status: 400 })
      }
      
      // Check for minimum viable interview
      const userMessages = transcript.filter(m => m.role === "user")
      const assistantMessages = transcript.filter(m => m.role === "assistant")
      
      if (userMessages.length === 0) {
        return NextResponse.json({ 
          error: "No user responses found. Please participate in the interview to receive feedback." 
        }, { status: 400 })
      }
      
      try {
        // Generate feedback without database record using structured approach
        const feedbackResult = await generateInterviewFeedbackV2(transcript)
        console.log("Feedback generated, structured:", !!feedbackResult.structured)
        
        const parsedFeedback = feedbackResult.parsed
        const rawFeedback = feedbackResult.raw
        console.log("Parsed feedback categories:", parsedFeedback.map(f => ({ category: f.category, rating: f.rating })))
        
        // Track usage
        await trackUsage(userId, UsageType.FEEDBACK_GENERATION)
        
        // Calculate strengths and improvements with better handling
        const strengths = parsedFeedback
          .filter(item => item.rating === "Excellent" || item.rating === "Good")
          .map(item => `${item.category}: ${item.feedback}`)
        
        const improvements = parsedFeedback
          .filter(item => item.rating === "Satisfactory" || item.rating === "Needs Improvement" || item.rating === "Consider" || item.rating === "Not Evaluated")
          .map(item => `${item.category}: ${item.feedback}`)
        
        // Ensure we always have some feedback
        if (strengths.length === 0 && improvements.length === 0) {
          improvements.push("Complete a full interview session to receive detailed, personalized feedback on your performance.")
        }
        
        // Include structured data if available
        const structuredData = feedbackResult.structured ? {
          structuredFeedback: {
            overallSummary: feedbackResult.structured.overallSummary,
            interviewQuality: feedbackResult.structured.interviewQuality,
            actionableAdvice: feedbackResult.structured.actionableAdvice,
            categoriesWithKeyPoints: feedbackResult.structured.categories
          }
        } : {}
        
        // Return feedback without saving to database
        return NextResponse.json({ 
          success: true,
          feedback: {
            summary: rawFeedback,
            strengths: strengths.join("\n\n") || "Continue building on your interview skills by completing full interview sessions.",
            areasForImprovement: improvements.join("\n\n") || "No specific areas identified. Keep practicing!",
            transcriptScore: parsedFeedback.reduce((acc, item) => {
              const ratings: Record<string, number> = { 
                "Excellent": 4, 
                "Good": 3, 
                "Satisfactory": 2, 
                "Needs Improvement": 1, 
                "Consider": 2, 
                "Not Evaluated": 0 
              };
              return acc + (ratings[item.rating] || 0);
            }, 0) / Math.max(parsedFeedback.length, 1), // Prevent division by zero
            interviewMetrics: {
              totalMessages: transcript.length,
              userResponses: userMessages.length,
              assistantQuestions: assistantMessages.length,
              completeness: userMessages.length >= 5 ? "complete" : "partial"
            },
            ...structuredData
          }
        })
      } catch (error) {
        console.error("Error generating feedback:", error)
        
        // Return user-friendly error with guidance
        return NextResponse.json({ 
          error: "Unable to generate feedback at this time. Please ensure you completed the interview with substantive responses and try again.",
          details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
      }
    }

    // Regular flow - check database record
    if (!interviewId) {
      return NextResponse.json({ error: "Missing interview ID" }, { status: 400 })
    }

    // Check if the interview belongs to the user
    const interview = await prisma.interviewSession.findUnique({
      where: {
        id: interviewId,
        userId,
      },
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found or not authorized" }, { status: 404 })
    }

    // If async generation is requested, return immediately
    if (generateAsync) {
      // Start async generation
      generateAndSaveFeedback(interviewId, userId, transcript).catch(error => {
        console.error("Async feedback generation failed:", error)
      })
      
      return NextResponse.json({ 
        success: true,
        message: "Feedback generation started",
        interviewId
      })
    }

    // Generate feedback synchronously using structured approach
    const feedbackResult = await generateInterviewFeedbackV2(transcript)
    const rawFeedback = feedbackResult.raw
    const parsedFeedback = feedbackResult.parsed

    // Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION)

    // Calculate individual scores from structured data if available
    let clarityScore, concisenessScore, technicalDepthScore, starMethodScore, overallScore;
    
    if (feedbackResult.structured) {
      // Extract scores from categories
      const scoreMap: Record<string, number> = {
        "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0
      };
      
      feedbackResult.structured.categories.forEach(cat => {
        const score = scoreMap[cat.rating] || 0;
        switch(cat.category) {
          case "Communication Skills":
            clarityScore = score;
            break;
          case "Technical Knowledge":
            technicalDepthScore = score;
            break;
          case "Problem-Solving Approach":
            starMethodScore = score; // Using this as proxy for STAR method
            break;
        }
      });
      
      // Calculate overall score
      const scores = [clarityScore, technicalDepthScore, starMethodScore].filter(s => s !== undefined);
      overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    }
    
    // Create feedback in the database with structured data
    const feedback = await prisma.feedback.create({
      data: {
        id: crypto.randomUUID(),
        sessionId: interviewId,
        userId: userId,
        summary: rawFeedback,
        strengths: parsedFeedback
          .filter(item => item.rating === "Excellent" || item.rating === "Good")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        areasForImprovement: parsedFeedback
          .filter(item => item.rating === "Satisfactory" || item.rating === "Needs Improvement")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        fillerWordCount: 0, // TODO: Implement filler word counting
        transcriptScore: parsedFeedback.reduce((acc, item) => {
          const ratings: Record<string, number> = { "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0 };
          return acc + (ratings[item.rating] || 0);
        }, 0) / parsedFeedback.length,
        // New structured fields
        structuredData: feedbackResult.structured || undefined,
        clarityScore,
        concisenessScore,
        technicalDepthScore,
        starMethodScore,
        overallScore
      }
    })
    
    // Update interview session feedback status
    await prisma.interviewSession.update({
      where: { id: interviewId },
      data: { feedbackStatus: "completed" }
    })

    // Return the feedback
    return NextResponse.json({ 
      success: true,
      feedback: {
        id: feedback.id,
        summary: feedback.summary,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areasForImprovement,
        fillerWordCount: feedback.fillerWordCount,
        transcriptScore: feedback.transcriptScore,
      }
    })
  } catch (error) {
    console.error("Error in generate-feedback route:", error)
    
    // Log to Sentry with context
    if (error instanceof Error) {
      const sentryContext = {
        userId: auth.userId,
        interviewId: body.interviewId,
        transcriptLength: body.transcript?.length || 0,
        errorMessage: error.message,
        errorStack: error.stack
      }
      console.error("Feedback generation failed - Sentry context:", sentryContext)
    }
    
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}

// Async function to generate and save feedback
async function generateAndSaveFeedback(interviewId: string, userId: string, transcript: any[]) {
  try {
    // Update feedback status to generating
    await prisma.$executeRaw`
      UPDATE "InterviewSession" 
      SET "feedbackStatus" = 'generating', "updatedAt" = NOW()
      WHERE id = ${interviewId}
    `
    
    // Generate feedback using structured approach
    const feedbackResult = await generateInterviewFeedbackV2(transcript)
    const rawFeedback = feedbackResult.raw
    const parsedFeedback = feedbackResult.parsed
    
    // Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION)
    
    // Calculate individual scores from structured data
    let clarityScore, concisenessScore, technicalDepthScore, starMethodScore, overallScore;
    
    if (feedbackResult.structured) {
      const scoreMap: Record<string, number> = {
        "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0
      };
      
      feedbackResult.structured.categories.forEach(cat => {
        const score = scoreMap[cat.rating] || 0;
        switch(cat.category) {
          case "Communication Skills":
            clarityScore = score;
            break;
          case "Technical Knowledge":
            technicalDepthScore = score;
            break;
          case "Problem-Solving Approach":
            starMethodScore = score;
            break;
        }
      });
      
      const scores = [clarityScore, technicalDepthScore, starMethodScore].filter(s => s !== undefined);
      overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    }
    
    // Create feedback with all structured data
    await prisma.feedback.create({
      data: {
        id: crypto.randomUUID(),
        sessionId: interviewId,
        userId: userId,
        summary: rawFeedback,
        strengths: parsedFeedback
          .filter(item => item.rating === "Excellent" || item.rating === "Good")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        areasForImprovement: parsedFeedback
          .filter(item => item.rating === "Satisfactory" || item.rating === "Needs Improvement")
          .map(item => `${item.category}: ${item.feedback}`)
          .join("\n\n"),
        fillerWordCount: 0,
        transcriptScore: parsedFeedback.reduce((acc, item) => {
          const ratings: Record<string, number> = { "Excellent": 4, "Good": 3, "Satisfactory": 2, "Needs Improvement": 1, "Not Evaluated": 0 };
          return acc + (ratings[item.rating] || 0);
        }, 0) / parsedFeedback.length,
        structuredData: feedbackResult.structured || undefined,
        clarityScore,
        concisenessScore,
        technicalDepthScore,
        starMethodScore,
        overallScore
      }
    })
    
    // Update feedback status to completed
    await prisma.$executeRaw`
      UPDATE "InterviewSession" 
      SET "feedbackStatus" = 'completed', "updatedAt" = NOW()
      WHERE id = ${interviewId}
    `
    
  } catch (error) {
    console.error("Failed to generate feedback:", error)
    
    // Log to Sentry with detailed context
    if (error instanceof Error) {
      const sentryContext = {
        userId,
        interviewId,
        transcriptLength: transcript?.length || 0,
        errorMessage: error.message,
        errorStack: error.stack,
        stage: "async_feedback_generation"
      }
      console.error("Async feedback generation failed - Sentry context:", sentryContext)
    }
    
    // Update feedback status to failed
    try {
      await prisma.$executeRaw`
        UPDATE "InterviewSession" 
        SET "feedbackStatus" = 'failed', "updatedAt" = NOW()
        WHERE id = ${interviewId}
      `
    } catch (updateError) {
      console.error("Failed to update feedback status:", updateError)
    }
  }
}
