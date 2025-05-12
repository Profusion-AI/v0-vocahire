import { type NextRequest, NextResponse } from "next/server"
import { createApiClient } from "@/lib/supabase/server"
import { getOpenAIApiKey, validateApiKey, parseOpenAIResponse } from "@/lib/api-utils"
import { getRedisClient } from "@/lib/redis"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, checkUsageLimit, UsageType } from "@/lib/usage-tracking"

export async function POST(request: NextRequest) {
  try {
    // Log start of request with timestamp
    console.log(`=== REALTIME SESSION REQUEST (${new Date().toISOString()}) ===`)
    const apiKey = getOpenAIApiKey()
    console.log("🔑 API key available:", !!apiKey, apiKey ? `(starts with ${apiKey.slice(0, 6)}...)` : "(not found)")

    // Get the session using Supabase
    const supabase = createApiClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || !session.user?.id) {
      console.log("Unauthorized: No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`Authenticated user: ${userId}`)

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)
    if (rateLimitResult.isLimited) {
      console.log(`Rate limit exceeded for user ${userId}`)
      const resetDate = new Date(rateLimitResult.reset).toISOString()
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again later.`,
          reset: resetDate,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // Check usage limit
    const usageLimitResult = await checkUsageLimit(userId, UsageType.INTERVIEW_SESSION)
    if (!usageLimitResult.allowed) {
      console.log(`Usage limit exceeded for user ${userId}`)
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          message: `You have reached your daily limit of ${usageLimitResult.limit} interviews. Please upgrade your plan for more.`,
          current: usageLimitResult.current,
          limit: usageLimitResult.limit,
        },
        { status: 403 },
      )
    }

    // Check for cached session
    const redis = getRedisClient()
    const cachedSessionKey = `openai_ephemeral_session:${userId}`
    const cachedData = await redis.get<{ id: string; token: string; model: string; expires_at: number }>(
      cachedSessionKey,
    )

    if (cachedData && cachedData.expires_at > Date.now() / 1000 + 5) {
      console.log(`Returning cached ephemeral session for user ${userId}`)

      // Track usage even when using cached session
      await trackUsage(userId, UsageType.INTERVIEW_SESSION)

      // Increment rate limit
      await incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)

      return NextResponse.json({
        id: cachedData.id,
        token: cachedData.token,
        model: cachedData.model,
        usedCachedSession: true,
        expires_at: cachedData.expires_at,
      })
    }

    // Validate API key
    const keyValidation = validateApiKey(apiKey)
    if (!keyValidation.isValid) {
      console.error(`API key validation failed: ${keyValidation.error}`)
      return NextResponse.json({ error: keyValidation.error }, { status: 500 })
    }

    // Get the request body
    let body
    try {
      body = await request.json()
      console.log("Request body:", JSON.stringify(body))
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Accept both jobTitle and jobRole for flexibility
    const jobTitle = body?.jobTitle || body?.jobRole || "Software Engineer"
    const resumeText = body?.resumeText || ""
    const turnDetection = body?.turnDetection || {
      enabled: true,
      silence_threshold: 1.0,
      speech_threshold: 0.5,
      silence_duration_ms: 800, // Increased from default for better interview experience
      type: "semantic_vad", // Use semantic VAD for more natural turn-taking
    }

    console.log(`Job title: ${jobTitle}, Resume text length: ${resumeText.length}`)
    console.log(`Turn detection settings: ${JSON.stringify(turnDetection)}`)

    // Prepare the system prompt
    const systemPrompt = `You are an AI interviewer conducting a 10-minute job interview for the position of ${jobTitle}. ${
      resumeText
        ? `The candidate has provided the following resume: ${resumeText}. Tailor your questions to their experience.`
        : "Ask general questions about their experience, skills, and fit for the role."
    }
    
    Follow these guidelines:
    1. Introduce yourself briefly and explain the interview process.
    2. Ask one question at a time and wait for the candidate's response.
    3. Ask follow-up questions when appropriate.
    4. Cover technical skills, experience, behavioral questions, and situational scenarios.
    5. Be professional, encouraging, and provide a realistic interview experience.
    6. Keep your responses concise (1-3 sentences).
    7. After 8-10 minutes, thank the candidate and conclude the interview.
    
    Begin the interview with a brief introduction and your first question.`

    // Use our enhanced session creation function with complete configuration
    const modelsToTry = [
      "gpt-4o-mini-realtime-preview",
      "gpt-4o-mini-realtime",
      "gpt-4o-realtime-preview",
      "gpt-4o-realtime",
      "gpt-4o-mini-realtime-preview-2024-12-17",
      "gpt-4o-realtime-preview-2024-12-17",
      "gpt-4o-realtime-preview-2024-10-01",
    ]

    console.log("Attempting to create realtime session with fallback models:", modelsToTry.join(", "))

    // Create session with complete configuration upfront
    let lastError = ""
    let lastStatus = 0
    let lastRaw = ""
    let sessionData = null
    let usedModel = null

    for (const model of modelsToTry) {
      try {
        console.log(`Attempting to create session with model: ${model}`)

        // CRITICAL CHANGE: Complete session configuration in a single call
        const sessionPayload = {
          model: model,
          voice: "alloy",
          modalities: ["audio", "text"],
          instructions: systemPrompt,
          turn_detection: turnDetection,
          input_audio_transcription: {
            enabled: true,
          },
        }

        console.log("Session creation payload:", JSON.stringify(sessionPayload))

        // Create a timeout for the fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        try {
          const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "realtime",
            },
            body: JSON.stringify(sessionPayload),
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId))

          // Log full response for debugging
          console.log(`Model ${model} response status: ${response.status}`)
          console.log(`Model ${model} response headers:`, Object.fromEntries([...response.headers.entries()]))

          // Parse the response carefully
          const { isJson, data } = await parseOpenAIResponse(response)

          // Log the parsed response
          if (isJson) {
            console.log(`Model ${model} response (JSON): ${JSON.stringify(data).substring(0, 500)}...`)
          } else {
            console.log(`Model ${model} response (non-JSON, first 500 chars): ${String(data).substring(0, 500)}...`)
          }

          if (response.ok && isJson) {
            console.log(`Successfully created session with model: ${model}`)
            sessionData = data
            usedModel = model
            break
          } else {
            // Handle error response
            if (isJson && data.error) {
              lastError = data.error.message || JSON.stringify(data.error) || `Status ${response.status}`
            } else {
              lastError = `Non-JSON response: Status ${response.status}`
            }
            lastStatus = response.status
            lastRaw = isJson ? JSON.stringify(data) : String(data)
            console.error(`Failed with model ${model}: ${lastError}`)
          }
        } catch (fetchError) {
          if (fetchError.name === "AbortError") {
            lastError = `Request timeout after 15 seconds`
          } else {
            lastError = fetchError instanceof Error ? fetchError.message : String(fetchError)
          }
          console.error(`Fetch exception with model ${model}: ${lastError}`)
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        console.error(`Exception with model ${model}: ${lastError}`)
      }
    }

    // Check if we successfully created a session
    if (!sessionData) {
      console.error("All model attempts failed:", lastError)

      // Return a more detailed error
      return NextResponse.json(
        {
          error: "Failed to create realtime session with any available model",
          details: {
            message: lastError,
            status: lastStatus,
          },
          rawResponse: lastRaw?.substring(0, 1000),
        },
        { status: lastStatus || 500 },
      )
    }

    console.log(`Session created successfully with model ${usedModel} and ID: ${sessionData.id}`)

    // Extract the client_secret (ephemeral token) from the response
    const token = sessionData.client_secret?.value
    const expiresAt = sessionData.client_secret?.expires_at

    if (!token) {
      console.error("No client_secret.value found in session response")
      return NextResponse.json(
        {
          error: "Missing client_secret.value in OpenAI response",
          rawResponse: JSON.stringify(sessionData).substring(0, 1000),
        },
        { status: 500 },
      )
    }

    // Cache the session data
    const ttlSeconds = 55 // Cache for 55 seconds (just under the 60s expiry)
    await redis.set(
      cachedSessionKey,
      {
        id: sessionData.id,
        token,
        model: usedModel,
        expires_at: expiresAt,
      },
      { ex: ttlSeconds },
    )
    console.log(`Cached new ephemeral session for user ${userId} for ${ttlSeconds}s`)

    // Track usage
    await trackUsage(userId, UsageType.INTERVIEW_SESSION)

    // Increment rate limit
    await incrementRateLimit(userId, RATE_LIMIT_CONFIGS.REALTIME_SESSION)

    // Return the session data with the model used and token
    return NextResponse.json({
      id: sessionData.id,
      token: token,
      model: usedModel,
      usedFallbackModel: usedModel !== modelsToTry[0],
      expires_at: expiresAt,
    })
  } catch (error) {
    console.error("Error creating realtime session:", error)
    return NextResponse.json(
      {
        error: "Failed to create realtime session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
