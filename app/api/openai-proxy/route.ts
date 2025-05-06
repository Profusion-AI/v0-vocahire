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
      })
    }

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.jobTitle) {
      return NextResponse.json({
        mock: true,
        message: "Missing required job title. Falling back to mock mode.",
      })
    }

    // Check if we should use the experimental Realtime API
    const useRealtimeApi = process.env.USE_OPENAI_REALTIME_API === "true"

    if (useRealtimeApi) {
      // Try to use the experimental Realtime API
      try {
        console.log("Attempting to use OpenAI Realtime API")

        // Log the request details for debugging
        console.log("OpenAI API Key (first 4 chars):", openaiApiKey.substring(0, 4) + "...")
        console.log("Job Title:", body.jobTitle)

        const openaiResponse = await fetch("https://api.openai.com/v1/audio/realtime/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
            "OpenAI-Beta": "realtime",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            voice: "alloy",
            session_mode: "conversation",
            prompt: `You are an AI interviewer conducting a 10-minute mock interview for a ${body.jobTitle} position. 
            Ask relevant technical and behavioral questions. Be conversational but professional. 
            Start by introducing yourself and asking the candidate to tell you about their background. 
            Listen to their responses and ask follow-up questions. 
            Limit each of your responses to 2-3 sentences to keep the conversation flowing.`,
            session_params: {
              duration_limit_seconds: 600, // 10 minutes
            },
          }),
        })

        // Log the response status for debugging
        console.log("OpenAI API Response Status:", openaiResponse.status)

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text()
          console.error(`OpenAI Realtime API error: ${openaiResponse.status} ${errorText}`)

          // Fall back to alternative approach
          throw new Error(`OpenAI Realtime API error: ${openaiResponse.status}`)
        }

        const data = await openaiResponse.json()
        console.log("Successfully created OpenAI Realtime session")

        // Return the session data
        return NextResponse.json({
          mock: false,
          session: data,
        })
      } catch (error) {
        console.error("Error with OpenAI Realtime API, falling back to alternative approach:", error)
        // Continue to alternative approach
      }
    }

    // Alternative approach: Use standard OpenAI APIs
    // For now, we'll return a structured response that indicates we should use the mock mode
    // In a production implementation, we would set up a different approach using the available APIs

    return NextResponse.json({
      mock: true,
      message: "OpenAI Realtime API is not available. Using alternative approach.",
      details:
        "The Realtime API appears to be in private beta or not publicly available yet. " +
        "We're falling back to a simulated interview experience.",
      jobTitle: body.jobTitle,
    })
  } catch (error) {
    console.error("Error in OpenAI proxy route:", error)
    return NextResponse.json({
      mock: true,
      message: `Internal server error: ${error instanceof Error ? error.message : String(error)}. Falling back to mock mode.`,
    })
  }
}
