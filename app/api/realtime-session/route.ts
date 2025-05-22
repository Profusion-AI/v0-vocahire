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

    // Authenticate the user with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId

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
      // Return default user with zero credits to fail gracefully
      return { credits: 0, isPremium: false } as { credits: number; isPremium: boolean };
    }) as { credits: number; isPremium: boolean } | null;

    // Allow premium users to proceed without credit check
    if (user && user.isPremium) {
      console.log("Premium user detected, bypassing credit check");
    } else if (!user || Number(user.credits) <= 0) {
      return NextResponse.json({ error: "Insufficient VocahireCredits. Please purchase more VocahireCredits." }, { status: 403 })
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

    // Create OpenAI Realtime session
    const openaiResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        modalities: ["audio", "text"],
        instructions: instructions,
        voice: "sage", // Professional voice for interviews
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800 // Slightly longer for thoughtful responses
        },
        temperature: 0.7, // Balanced creativity for interview questions
        max_response_output_tokens: 800 // Reasonable response length
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI Realtime session creation failed:", openaiResponse.status, errorText);
      throw new Error(`Failed to create OpenAI session: ${openaiResponse.status}`);
    }

    const sessionData = await openaiResponse.json();
    console.log("OpenAI session created:", sessionData.id);

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
