import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // 1. Verify environment variable
    console.log("🔑 OPENAI_API_KEY (first 6 chars):", process.env.OPENAI_API_KEY?.slice(0, 6))
    console.log("=== REALTIME SESSION REQUEST RECEIVED ===")

    // Get the session
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("Unauthorized: No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("OpenAI API key is missing")
      return NextResponse.json({ error: "API key is missing" }, { status: 500 })
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

    // 2. Dump the exact fetch arguments and raw response
    const url = "https://api.openai.com/v1/realtime/sessions"
    const opts = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview",
        voice: "alloy",
      }),
    }

    console.log("👉 OPENAI SESSION CREATE CALL:", url, {
      ...opts,
      headers: {
        ...opts.headers,
        Authorization: `Bearer ${apiKey.slice(0, 6)}...`,
      },
    })

    const response = await fetch(url, opts)
    console.log("👈 OPENAI RESPONSE status:", response.status)
    console.log("👈 OPENAI RESPONSE headers:", Object.fromEntries([...response.headers.entries()]))

    const raw = await response.text()
    console.log("👈 OPENAI RESPONSE body:", raw.substring(0, 500))

    if (!response.ok) {
      console.error(`Session creation failed with status ${response.status}`)
      return NextResponse.json(
        {
          error: "Failed to create realtime session",
          status: response.status,
          body: raw.substring(0, 1000),
        },
        { status: 500 },
      )
    }

    // Parse the response as JSON
    let sessionData
    try {
      sessionData = JSON.parse(raw)
      console.log("Session created successfully with ID:", sessionData.id)
    } catch (e) {
      console.error("Error parsing response JSON:", e)
      return NextResponse.json(
        {
          error: "Invalid JSON response from OpenAI",
          body: raw.substring(0, 1000),
        },
        { status: 500 },
      )
    }

    // Now that we have a session, update it with the instructions
    console.log("Updating session with instructions...")

    try {
      const updateUrl = `https://api.openai.com/v1/realtime/sessions/${sessionData.id}`
      const updateOpts = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "realtime",
        },
        body: JSON.stringify({
          instructions: systemPrompt,
          modalities: ["audio", "text"],
          turn_detection: {
            enabled: true,
            silence_threshold: 1.0,
            speech_threshold: 0.5,
          },
          input_audio_transcription: {
            enabled: true,
          },
        }),
      }

      console.log("👉 OPENAI SESSION UPDATE CALL:", updateUrl, {
        ...updateOpts,
        headers: {
          ...updateOpts.headers,
          Authorization: `Bearer ${apiKey.slice(0, 6)}...`,
        },
        body: "{ instructions: [truncated], modalities: [...] }",
      })

      const updateResponse = await fetch(updateUrl, updateOpts)
      console.log("👈 OPENAI UPDATE RESPONSE status:", updateResponse.status)

      const updateRaw = await updateResponse.text()
      console.log("👈 OPENAI UPDATE RESPONSE body:", updateRaw.substring(0, 500))

      if (!updateResponse.ok) {
        console.error(`Session update failed with status ${updateResponse.status}`)
        // Continue anyway, as we at least have a valid session
      } else {
        console.log("Session updated successfully with instructions")
      }
    } catch (e) {
      console.error("Error updating session with instructions:", e)
      // Continue anyway, as we at least have a valid session
    }

    // Return the session data
    return NextResponse.json(sessionData)
  } catch (error) {
    console.error("Error creating realtime session:", error)
    return NextResponse.json(
      { error: "Failed to create realtime session", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
