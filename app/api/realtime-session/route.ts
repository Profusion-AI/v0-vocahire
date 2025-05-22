import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Assuming UsageType is here
import { prisma } from "@/lib/prisma"
import { getOpenAIApiKey } from "@/lib/api-utils"


export async function POST(request: NextRequest) {
  try {
    // Log start of request with timestamp
    console.log(`=== REALTIME SESSION REQUEST (${new Date().toISOString()}) ===`)
    const apiKey = getOpenAIApiKey()
    console.log("🔑 API key available:", !!apiKey, apiKey ? `(starts with ${apiKey.slice(0, 6)}...)` : "(not found)")
    
    if (!apiKey) {
      console.error("❌ No OpenAI API key available");
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.error("❌ Invalid OpenAI API key format");
      return NextResponse.json({ error: "Invalid OpenAI API key format" }, { status: 500 });
    }

    // Authenticate the user with Clerk
    const auth = getAuth(request)
    console.log("🔐 Auth check:", { userId: auth.userId, sessionId: auth.sessionId });
    
    if (!auth.userId) {
      console.error("❌ No userId in auth object - user not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId
    console.log("✅ User authenticated:", userId);

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again later. Limit: ${rateLimitResult.limit}, Current: ${rateLimitResult.current}, Reset in: ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)}s`,
        },
        { status: 429 },
      )
    }

    // Check if user has enough credits with timeout
    console.log(`Checking credits for user: ${userId}`);
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, isPremium: true },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ]).catch(error => {
      console.error('Database query failed or timed out in /api/realtime-session:', error);
      // Return null to indicate database failure, don't assume zero credits
      return null;
    }) as { credits: number; isPremium: boolean } | null;

    if (!user) {
      console.error("Failed to fetch user data from database");
      return NextResponse.json({ error: "Unable to verify account status. Please try again." }, { status: 500 });
    }

    console.log(`User credits: ${user.credits}, isPremium: ${user.isPremium}`);

    // Define minimum credit requirement for interview sessions
    const MINIMUM_CREDITS_REQUIRED = 0.50;
    const INTERVIEW_COST = 1.00; // Cost per interview session
    
    console.log(`VocahireCredit check - User: ${user.credits}, isPremium: ${user.isPremium}, Required: ${MINIMUM_CREDITS_REQUIRED}`);

    // Allow premium users to proceed without credit check
    if (user.isPremium) {
      console.log("✅ Premium user detected, bypassing VocahireCredit check");
    } else {
      // Check if user has minimum VocahireCredits required
      if (Number(user.credits) < MINIMUM_CREDITS_REQUIRED) {
        console.log(`❌ User has insufficient VocahireCredits: ${user.credits} (minimum required: ${MINIMUM_CREDITS_REQUIRED})`);
        
        // Check if this is a new user who should have gotten initial VocahireCredits
        if (Number(user.credits) === 0) {
          console.log("🎁 New user detected with 0 VocahireCredits, granting initial 3.00 VocahireCredits");
          try {
            const updatedUser = await prisma.user.update({
              where: { id: userId },
              data: { credits: 3.00 },
              select: { credits: true }
            });
            console.log(`✅ Granted initial 3.00 VocahireCredits to new user. Balance: ${updatedUser.credits}`);
            // Continue with the interview since they now have sufficient VocahireCredits
          } catch (updateError) {
            console.error("❌ Failed to grant initial VocahireCredits:", updateError);
            return NextResponse.json({ 
              error: "Unable to initialize your account. Please contact support." 
            }, { status: 500 })
          }
        } else {
          // User has some VocahireCredits but below minimum - direct them to purchase more
          return NextResponse.json({ 
            error: `Insufficient VocahireCredits. You need at least ${MINIMUM_CREDITS_REQUIRED} VocahireCredits to start an interview. Please purchase more VocahireCredits to continue.`,
            currentCredits: Number(user.credits),
            minimumRequired: MINIMUM_CREDITS_REQUIRED
          }, { status: 403 })
        }
      } else if (Number(user.credits) < INTERVIEW_COST) {
        // User has minimum VocahireCredits but not enough for a full interview
        console.log(`⚠️ User has VocahireCredits (${user.credits}) but below interview cost (${INTERVIEW_COST})`);
        return NextResponse.json({ 
          error: `You need at least ${INTERVIEW_COST} VocahireCredits to start a full interview. Please purchase more VocahireCredits.`,
          currentCredits: Number(user.credits),
          requiredCredits: INTERVIEW_COST
        }, { status: 403 })
      } else {
        console.log(`✅ User has sufficient VocahireCredits: ${user.credits}, proceeding with interview`);
      }
    }

    // Process the request - Create OpenAI Realtime Session
    console.log("Creating OpenAI Realtime session for user:", userId);
    
    // Parse request body to get job title and resume text for instructions
    const body = await request.json();
    const { jobTitle = "Software Engineer", resumeText = "" } = body;
    
    // Create interview-specific instructions
    const instructions = `You are an experienced technical interviewer conducting a mock job interview for a ${jobTitle} position. ${resumeText ? `The candidate has provided this background: ${resumeText.substring(0, 500)}` : ''} 

Your role:
- Ask relevant technical and behavioral questions
- Provide a supportive but challenging interview experience
- Give constructive feedback during the conversation
- Keep questions focused on the job role
- Be encouraging and professional
- Allow natural conversation flow

Begin by greeting the candidate and asking them to introduce themselves briefly.`;

    // Create OpenAI Realtime session with timeout
    console.log("Creating OpenAI Realtime session...");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("OpenAI session creation timeout after 15 seconds");
      controller.abort();
    }, 15000); // 15 second timeout
    
    let openaiResponse;
    try {
      openaiResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'realtime', // Required header for Realtime API
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-realtime-preview", // Working model from checkpoint
          voice: "alloy", // Use alloy voice that works
          instructions: instructions,
          turn_detection: { type: "server_vad" }, // Simplified turn detection
          input_audio_transcription: { model: "whisper-1" }, // Keep transcription
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`OpenAI session creation response: ${openaiResponse.status} ${openaiResponse.statusText}`);
      
      // Log response headers for debugging
      const responseHeaders: Record<string, string> = {};
      openaiResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log("OpenAI API Response Headers:", JSON.stringify(responseHeaders, null, 2));
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("OpenAI session creation timed out");
        throw new Error("Session creation timed out. Please try again.");
      }
      console.error("OpenAI session creation error:", error);
      throw error;
    }

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI Realtime session creation failed:", openaiResponse.status, openaiResponse.statusText);
      console.error("Error response body:", errorText);
      
      // Try to parse error as JSON for better understanding
      try {
        const parsedError = JSON.parse(errorText);
        console.error("Parsed error:", JSON.stringify(parsedError, null, 2));
      } catch (e) {
        console.error("Error body is not valid JSON");
      }
      
      throw new Error(`Failed to create OpenAI session: ${openaiResponse.status} - ${errorText}`);
    }

    const sessionData = await openaiResponse.json();
    console.log("OpenAI session created:", sessionData.id);

    // Deduct VocahireCredits for non-premium users
    if (!user.isPremium) {
      console.log(`💳 Deducting ${INTERVIEW_COST} VocahireCredits from user ${userId}`);
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            credits: { 
              decrement: INTERVIEW_COST 
            } 
          },
          select: { credits: true }
        });
        console.log(`✅ VocahireCredits deducted. New balance: ${updatedUser.credits}`);
      } catch (deductError) {
        console.error("❌ Failed to deduct VocahireCredits:", deductError);
        // Continue with the session but log the error for manual review
        console.error("⚠️ MANUAL ACTION REQUIRED: VocahireCredit deduction failed for session:", sessionData.id);
      }
    } else {
      console.log("✅ Premium user - no VocahireCredit deduction required");
    }

    // Track usage with timeout (non-blocking)
    Promise.race([
      trackUsage(userId, UsageType.INTERVIEW_SESSION),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Usage tracking timeout')), 5000)
      )
    ]).catch(error => {
      console.error('Usage tracking failed:', error);
      // Don't fail the request if usage tracking fails
    });

    // Increment rate limit with timeout (non-blocking)
    Promise.race([
      incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Rate limit increment timeout')), 5000)
      )
    ]).catch(error => {
      console.error('Rate limit increment failed:', error);
      // Don't fail the request if rate limit increment fails
    });

    // Return the response with OpenAI session data
    return NextResponse.json({ 
      success: true,
      id: sessionData.id,
      token: sessionData.client_secret?.value,
      expires_at: sessionData.client_secret?.expires_at,
      session: sessionData,
      usedFallbackModel: false // We're using the real OpenAI model
    })
  } catch (error) {
    console.error("Error in realtime-session route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
