import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.log("[Test OpenAI] Starting API test...")

    // Get API key from environment variable
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error("[Test OpenAI] No API key found in environment variables")
      return NextResponse.json({
        success: false,
        error: "No OpenAI API key found in environment variables",
      })
    }

    console.log("[Test OpenAI] API key found (first 4 chars):", openaiApiKey.substring(0, 4) + "...")

    // Create minimal payload for testing
    const requestPayload = {
      model: "gpt-4o-mini-realtime-preview",
      voice: "alloy",
      instructions: "You are an AI interviewer conducting a mock interview for a Software Engineer position.",
    }

    console.log("[Test OpenAI] Request payload:", JSON.stringify(requestPayload, null, 2))
    console.log("[Test OpenAI] Calling OpenAI Realtime API...")

    // Make the API call
    const openaiResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "realtime",
      },
      body: JSON.stringify(requestPayload),
    })

    console.log("[Test OpenAI] Response status:", openaiResponse.status)

    // Get response body
    const responseText = await openaiResponse.text()

    // Try to parse as JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log("[Test OpenAI] Response parsed as JSON")
    } catch (e) {
      console.log("[Test OpenAI] Response is not valid JSON")
      responseData = null
    }

    if (openaiResponse.ok) {
      console.log("[Test OpenAI] API call successful!")

      // Sanitize the response for display
      let sanitizedResponse
      if (responseData) {
        sanitizedResponse = { ...responseData }
        // Truncate any large fields
        if (sanitizedResponse.sdp) {
          sanitizedResponse.sdp = sanitizedResponse.sdp.substring(0, 50) + "... [truncated]"
        }
      } else {
        sanitizedResponse = {
          text: responseText.substring(0, 100) + (responseText.length > 100 ? "... [truncated]" : ""),
        }
      }

      return NextResponse.json({
        success: true,
        message: "Successfully connected to OpenAI Realtime API",
        status: openaiResponse.status,
        response: sanitizedResponse,
      })
    } else {
      console.error("[Test OpenAI] API call failed:", responseText)

      return NextResponse.json({
        success: false,
        status: openaiResponse.status,
        error: responseData || responseText,
      })
    }
  } catch (error) {
    console.error("[Test OpenAI] Error testing API:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
