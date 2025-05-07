import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { config } from "@/lib/config"

export async function POST(req: Request) {
  try {
    // Create a Supabase client using cookies
    const cookieStore = cookies()
    const supabaseUrl = config.supabase.url
    const supabaseAnonKey = config.supabase.anonKey

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables in OpenAI proxy route")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        },
      },
    })

    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // For development/testing purposes, allow requests without authentication
    if (!session) {
      console.warn("No authenticated session found in OpenAI proxy route - proceeding anyway for testing")
    }

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({
        mock: true,
        message: "OpenAI API key not configured. Falling back to mock mode.",
        errorType: "configuration",
      })
    }

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.jobTitle) {
      return NextResponse.json({
        mock: true,
        message: "Missing required job title. Falling back to mock mode.",
        errorType: "validation",
      })
    }

    // Check if we should use the Realtime API
    // Default to true unless explicitly disabled
    const useRealtimeApi = process.env.USE_OPENAI_REALTIME_API !== "false"

    if (!useRealtimeApi) {
      return NextResponse.json({
        mock: true,
        message: "OpenAI Realtime API is disabled by configuration. Using mock mode.",
        errorType: "configuration",
      })
    }

    try {
      console.log("Using OpenAI Realtime API")

      // Log the request details for debugging
      console.log("OpenAI API Key (first 4 chars):", openaiApiKey.substring(0, 4) + "...")
      console.log("Job Title:", body.jobTitle)

      // Construct the request payload according to OpenAI's latest specifications
      const requestPayload = {
        // Use the correct model name for realtime API
        model: "gpt-4o-mini-realtime-preview",
        voice: "alloy",
        session_mode: "conversation",
        // Include required audio format parameters
        input_audio_format: {
          type: "audio/webm",
          sampling_rate: 16000,
        },
        output_audio_format: {
          type: "audio/webm",
          sampling_rate: 24000,
        },
        // Enable Whisper transcription for user audio
        input_audio_transcription: {
          model: "whisper-1",
        },
        // Specify modalities
        modalities: ["audio", "text"],
        prompt: `You are an AI interviewer conducting a 10-minute mock interview for a ${body.jobTitle} position. 
        Ask relevant technical and behavioral questions. Be conversational but professional. 
        Start by introducing yourself and asking the candidate to tell you about their background. 
        Listen to their responses and ask follow-up questions. 
        Limit each of your responses to 2-3 sentences to keep the conversation flowing.`,
        session_params: {
          duration_limit_seconds: 600, // 10 minutes
        },
      }

      // Make the API call with the correct headers
      const openaiResponse = await fetch("https://api.openai.com/v1/audio/realtime/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "realtime",
        },
        body: JSON.stringify(requestPayload),
      })

      // Log the response status for debugging
      console.log("OpenAI API Response Status:", openaiResponse.status)

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error(`OpenAI Realtime API error: ${openaiResponse.status} ${errorText}`)

        // Determine error type for better client-side handling
        let errorType = "api"
        if (openaiResponse.status === 401) {
          errorType = "unauthorized"
        } else if (openaiResponse.status === 403) {
          errorType = "forbidden"
        } else if (openaiResponse.status === 404) {
          errorType = "not_found"
        } else if (openaiResponse.status === 429) {
          errorType = "rate_limit"
        } else if (openaiResponse.status >= 500) {
          errorType = "server"
        }

        // Provide more detailed error information
        return NextResponse.json({
          mock: true,
          message: "Failed to create OpenAI Realtime session. Using mock mode instead.",
          details: `API Error (${openaiResponse.status}): ${errorText}`,
          errorType: errorType,
          jobTitle: body.jobTitle,
        })
      }

      const data = await openaiResponse.json()
      console.log("Successfully created OpenAI Realtime session")

      // Return the complete session data for WebRTC setup
      return NextResponse.json({
        mock: false,
        session: data,
      })
    } catch (error) {
      console.error("Error with OpenAI Realtime API, falling back to mock mode:", error)

      // Return detailed error information
      return NextResponse.json({
        mock: true,
        message: "Error connecting to OpenAI Realtime API. Using mock mode instead.",
        details: error instanceof Error ? error.message : String(error),
        errorType: "connection",
        jobTitle: body.jobTitle,
      })
    }
  } catch (error) {
    console.error("Error in OpenAI proxy route:", error)
    return NextResponse.json({
      mock: true,
      message: `Internal server error: ${error instanceof Error ? error.message : String(error)}. Falling back to mock mode.`,
      errorType: "internal",
    })
  }
}
