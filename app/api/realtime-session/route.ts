import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, UsageType } from "@/lib/usage-tracking" // Assuming UsageType is here
import { prisma } from "@/lib/prisma"
import { getOpenAIApiKey } from "@/lib/api-utils"


export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Enhanced performance tracking
  const perfLog = (phase: string, additionalData?: any) => {
    const elapsed = Date.now() - startTime;
    console.log(`[${requestId}] ${phase} - ${elapsed}ms elapsed${additionalData ? ` | ${JSON.stringify(additionalData)}` : ''}`);
  };
  
  try {
    perfLog("REQUEST_START", { timestamp: new Date().toISOString() });
    console.log(`=== REALTIME SESSION REQUEST (${new Date().toISOString()}) - ID: ${requestId} ===`)
    
    perfLog("API_KEY_CHECK_START");
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

    perfLog("API_KEY_CHECK_COMPLETE");
    
    // Authenticate the user with Clerk
    perfLog("CLERK_AUTH_START");
    const auth = getAuth(request)
    perfLog("CLERK_AUTH_COMPLETE", { userId: !!auth.userId, sessionId: !!auth.sessionId });
    console.log("🔐 Auth check:", { userId: auth.userId, sessionId: auth.sessionId });
    
    if (!auth.userId) {
      console.error("❌ No userId in auth object - user not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId
    console.log("✅ User authenticated:", userId);

    // Apply rate limiting
    perfLog("RATE_LIMIT_START");
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)
    perfLog("RATE_LIMIT_COMPLETE", { isLimited: rateLimitResult.isLimited });
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again later. Limit: ${rateLimitResult.limit}, Current: ${rateLimitResult.current}, Reset in: ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)}s`,
        },
        { status: 429 },
      )
    }

    // Check if user has enough credits with timeout
    perfLog("DATABASE_QUERY_START");
    console.log(`Checking credits for user: ${userId}`);
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, isPremium: true },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 25000) // Increased from 10s to 25s for Vercel cold starts
      )
    ]).catch(error => {
      perfLog("DATABASE_QUERY_ERROR", { error: error.message });
      console.error('Database query failed or timed out in /api/realtime-session:', error);
      // Return null to indicate database failure, don't assume zero credits
      return null;
    }) as { credits: number; isPremium: boolean } | null;
    
    perfLog("DATABASE_QUERY_COMPLETE", { userFound: !!user, credits: user?.credits, isPremium: user?.isPremium });

    if (!user) {
      perfLog("DATABASE_USER_FETCH_FAILED");
      console.error("Failed to fetch user data from database - may be cold start or connection issue");
      
      // For now, let's fail gracefully but consider implementing a retry mechanism
      return NextResponse.json({ 
        error: "Unable to verify account status due to database connectivity. Please try again in a moment.",
        details: "This may be due to a serverless cold start. Please retry."
      }, { status: 503 }); // 503 Service Unavailable instead of 500 to indicate temporary issue
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
    perfLog("OPENAI_SESSION_START");
    console.log("Creating OpenAI Realtime session...");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      perfLog("OPENAI_SESSION_TIMEOUT");
      console.log("OpenAI session creation timeout after 45 seconds");
      controller.abort();
    }, 45000); // 45 second timeout to handle Vercel cold starts and potential API delays
    
    let openaiResponse;
    try {
      console.log("📡 Sending request to OpenAI Realtime API...");
    console.log("🔧 Request payload:", JSON.stringify({
      model: "gpt-4o-realtime-preview",
      instructions: instructions.substring(0, 100) + "..."
    }, null, 2));
    const requestStartTime = Date.now();
      
      openaiResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'realtime', // Required header for Realtime API
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview",
          instructions: instructions
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const requestTime = Date.now() - requestStartTime;
      perfLog("OPENAI_SESSION_RESPONSE", { status: openaiResponse.status, requestTime });
      console.log(`✅ OpenAI session creation response: ${openaiResponse.status} ${openaiResponse.statusText} (${requestTime}ms)`);
      
      // Log response headers for debugging
      const responseHeaders: Record<string, string> = {};
      openaiResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log("📋 OpenAI API Response Headers:", JSON.stringify(responseHeaders, null, 2));
      
    } catch (error) {
      clearTimeout(timeoutId);
      perfLog("OPENAI_SESSION_ERROR", { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("OpenAI session creation timed out after 45 seconds");
        return NextResponse.json({ 
          error: "Session creation timed out. This may be due to high API load. Please try again.",
          details: "OpenAI API timeout"
        }, { status: 504 }); // Gateway timeout
      }
      console.error("OpenAI session creation error:", error);
      return NextResponse.json({ 
        error: "Failed to create interview session due to external API error. Please try again.",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 502 }); // Bad gateway for external API errors
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
    perfLog("OPENAI_SESSION_PARSE_COMPLETE", { sessionId: sessionData.id });
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

    // Track usage with timeout (non-blocking) - fire and forget
    perfLog("USAGE_TRACKING_START");
    setImmediate(() => {
      Promise.race([
        trackUsage(userId, UsageType.INTERVIEW_SESSION),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Usage tracking timeout')), 3000) // Reduced timeout
        )
      ]).catch(error => {
        console.error('Usage tracking failed (non-blocking):', error);
      });
    });

    // Increment rate limit with timeout (non-blocking) - fire and forget
    perfLog("RATE_LIMIT_INCREMENT_START");
    setImmediate(() => {
      Promise.race([
        incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Rate limit increment timeout')), 3000) // Reduced timeout
        )
      ]).catch(error => {
        console.error('Rate limit increment failed (non-blocking):', error);
      });
    });

    // Return the response with OpenAI session data
    perfLog("REQUEST_COMPLETE", { totalTime: Date.now() - startTime });
    return NextResponse.json({ 
      success: true,
      id: sessionData.id,
      token: sessionData.client_secret?.value,
      expires_at: sessionData.client_secret?.expires_at,
      session: sessionData,
      usedFallbackModel: false // We're using the real OpenAI model
    })
  } catch (error) {
    const requestTime = Date.now();
    console.error(`[${requestTime}] ERROR in realtime-session route:`, error);
    
    // Log specific error details for debugging
    if (error instanceof Error) {
      console.error(`[${requestTime}] Error name: ${error.name}`);
      console.error(`[${requestTime}] Error message: ${error.message}`);
      console.error(`[${requestTime}] Error stack: ${error.stack}`);
    }
    
    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error(`[${requestTime}] Prisma error code: ${(error as any).code}`);
      console.error(`[${requestTime}] Prisma error meta: ${JSON.stringify((error as any).meta)}`);
    }
    
    // Check for fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`[${requestTime}] Network/Fetch error detected`);
    }
    
    return NextResponse.json({ 
      error: "Something went wrong. Please try again.",
      debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 })
  }
}
