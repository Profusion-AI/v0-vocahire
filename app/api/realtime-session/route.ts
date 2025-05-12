import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getOpenAIApiKey, validateApiKey } from "@/lib/api-utils"

export async function POST(request: Request) {
  try {
    // Log start of request with timestamp
    console.log(`=== REALTIME SESSION REQUEST (${new Date().toISOString()}) ===`)
    const apiKey = getOpenAIApiKey()
    console.log("🔑 API key available:", !!apiKey, apiKey ? `(starts with ${apiKey.slice(0, 6)}...)` : "(not found)")

    // Get the session
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("Unauthorized: No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate API key
    const keyValidation = validateApiKey(apiKey)
    if (!keyValidation.isValid) {
      console.error(keyValidation.error)
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

    console.log(`Job title: ${jobTitle}, Resume text length: ${resumeText.length}`)

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

        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime",
          },
          body: JSON.stringify({
            model: model,
            voice: "alloy",
            modalities: ["audio", "text"],
            instructions: systemPrompt,
            turn_detection: {
              enabled: true,
              silence_threshold: 1.0,
              speech_threshold: 0.5,
            },
            input_audio_transcription: {
              enabled: true,
            },
          }),
        })

        const raw = await response.text()

        // Log full response for debugging
        console.log(`Model ${model} response status: ${response.status}`)
        console.log(`Model ${model} response (first 200 chars): ${raw.substring(0, 200)}`)

        // Try to parse as JSON
        try {
          const data = JSON.parse(raw)

          if (response.ok) {
            console.log(`Successfully created session with model: ${model}`)
            sessionData = data
            usedModel = model
            break
          } else {
            lastError = data.error?.message || JSON.stringify(data.error) || `Status ${response.status}`
            lastStatus = response.status
            lastRaw = raw
          }
        } catch (e) {
          // Not JSON - likely HTML error
          lastError = `Non-JSON response (HTML): Status ${response.status}`
          lastStatus = response.status
          lastRaw = raw
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
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

    // Return the session data with the model used and token
    return NextResponse.json({
      id: sessionData.id,
      token: token,
      model: usedModel,
      usedFallbackModel: usedModel !== modelsToTry[0],
      expires_at: sessionData.client_secret?.expires_at,
    })
  } catch (error) {
    console.error("Error creating realtime session:", error)
    return NextResponse.json(
      {
        error: "Failed to create realtime session",
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
