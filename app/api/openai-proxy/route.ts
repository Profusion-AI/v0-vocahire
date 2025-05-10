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

    // Parse request body
    const body = await req.json()

    // Check for custom API key in the request (for debug purposes)
    let openaiApiKey = process.env.OPENAI_API_KEY
    let usingCustomKey = false

    if (body.apiKey && typeof body.apiKey === "string" && body.apiKey.trim().startsWith("sk-")) {
      openaiApiKey = body.apiKey.trim()
      usingCustomKey = true
      console.log("[OpenAI Proxy] Using custom API key from request")
      // Remove the API key from the body to avoid sending it to OpenAI
      delete body.apiKey
    }

    if (!openaiApiKey) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({
        mock: true,
        message: "OpenAI API key not configured. Falling back to mock mode.",
        errorType: "configuration",
      })
    }

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
      console.log("[OpenAI Proxy] Realtime API disabled by configuration")
      return NextResponse.json({
        mock: true,
        message: "OpenAI Realtime API is disabled by configuration. Using mock mode.",
        errorType: "configuration",
      })
    }

    try {
      console.log("[OpenAI Proxy] Using OpenAI Realtime API")
      console.log(
        `[OpenAI Proxy] Environment variable USE_OPENAI_REALTIME_API: ${process.env.USE_OPENAI_REALTIME_API || "not set (defaults to true)"}`,
      )

      // Log the request details for debugging
      console.log("[OpenAI Proxy] OpenAI API Key (first 4 chars):", openaiApiKey.substring(0, 4) + "...")
      console.log("[OpenAI Proxy] Using custom key:", usingCustomKey)
      console.log("[OpenAI Proxy] Job Title:", body.jobTitle)

      // Construct the request payload with only the parameters confirmed to work
      const requestPayload = {
        // Use the correct model name for realtime API
        model: "gpt-4o-mini-realtime-preview",
        voice: "alloy",
        instructions: `You are an AI interviewer conducting a 10-minute mock interview for a ${body.jobTitle} position. 
        Ask relevant technical and behavioral questions. Be conversational but professional. 
        Start by introducing yourself and asking the candidate to tell you about their background. 
        Listen to their responses and ask follow-up questions. 
        Limit each of your responses to 2-3 sentences to keep the conversation flowing.`,
        // Keep turn_detection as it was accepted in the test
        turn_detection: { type: "server_vad" },
        // Keep input_audio_transcription as it's useful for the interview
        input_audio_transcription: { model: "whisper-1" },
      }

      console.log("[OpenAI Proxy] Request payload:", JSON.stringify(requestPayload, null, 2))
      console.log("[OpenAI Proxy] Calling OpenAI Realtime API at: https://api.openai.com/v1/realtime/sessions")

      // Make the API call with the correct headers and URL
      const openaiResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "realtime",
        },
        body: JSON.stringify(requestPayload),
      })

      // Log the response status and headers for debugging
      console.log("[OpenAI Proxy] API Response Status:", openaiResponse.status)
      console.log("[OpenAI Proxy] API Response Status Text:", openaiResponse.statusText)

      // Log response headers
      const headers = {}
      openaiResponse.headers.forEach((value, key) => {
        headers[key] = value
      })
      console.log("[OpenAI Proxy] API Response Headers:", JSON.stringify(headers, null, 2))

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error(`[OpenAI Proxy] Realtime API error: ${openaiResponse.status} ${errorText}`)

        // Try to parse the error as JSON if possible
        let parsedError = errorText
        try {
          parsedError = JSON.parse(errorText)
          console.error("[OpenAI Proxy] Parsed error:", JSON.stringify(parsedError, null, 2))
        } catch (e) {
          console.error("[OpenAI Proxy] Error is not valid JSON:", errorText)
        }

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
          responseStatus: openaiResponse.status,
          responseStatusText: openaiResponse.statusText,
          responseHeaders: headers,
          usingCustomKey: usingCustomKey,
        })
      }

      const data = await openaiResponse.json()
      console.log("[OpenAI Proxy] Successfully created OpenAI Realtime session")
      console.log("[OpenAI Proxy] Session ID:", data.id)

      // Log a sanitized version of the response (without the full SDP)
      const sanitizedData = { ...data }
      if (sanitizedData.sdp) {
        sanitizedData.sdp = sanitizedData.sdp.substring(0, 100) + "... [truncated]"
      }
      console.log("[OpenAI Proxy] Session data (sanitized):", JSON.stringify(sanitizedData, null, 2))

      // Return the complete session data for WebRTC setup
      return NextResponse.json({
        mock: false,
        session: data,
        usingCustomKey: usingCustomKey,
      })
    } catch (error) {
      console.error("[OpenAI Proxy] Error with OpenAI Realtime API, falling back to mock mode:", error)

      // Return detailed error information
      return NextResponse.json({
        mock: true,
        message: "Error connecting to OpenAI Realtime API. Using mock mode instead.",
        details: error instanceof Error ? error.message : String(error),
        errorType: "connection",
        jobTitle: body.jobTitle,
        stack: error instanceof Error ? error.stack : undefined,
        usingCustomKey: usingCustomKey,
      })
    }
  } catch (error) {
    console.error("[OpenAI Proxy] Error in OpenAI proxy route:", error)
    return NextResponse.json({
      mock: true,
      message: `Internal server error: ${error instanceof Error ? error.message : String(error)}. Falling back to mock mode.`,
      errorType: "internal",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
