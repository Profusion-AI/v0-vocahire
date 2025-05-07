import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    // Get session ID from query parameters
    const url = new URL(req.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: "Session ID is required as a query parameter",
      })
    }

    console.log("[Test Terminate] Testing session termination for session ID:", sessionId)

    // Get API key from environment variable
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error("[Test Terminate] No API key found in environment variables")
      return NextResponse.json({
        success: false,
        error: "No OpenAI API key found in environment variables",
      })
    }

    console.log("[Test Terminate] API key found (first 4 chars):", openaiApiKey.substring(0, 4) + "...")
    console.log(`[Test Terminate] Calling OpenAI Realtime API to terminate session: ${sessionId}`)

    // Make the API call to terminate the session
    const openaiResponse = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "realtime",
      },
    })

    console.log("[Test Terminate] Response status:", openaiResponse.status)

    // Get response body
    const responseText = await openaiResponse.text()
    console.log("[Test Terminate] Response text:", responseText || "(empty response)")

    // Try to parse as JSON if not empty
    let responseData = null
    if (responseText) {
      try {
        responseData = JSON.parse(responseText)
        console.log("[Test Terminate] Response parsed as JSON")
      } catch (e) {
        console.log("[Test Terminate] Response is not valid JSON")
      }
    }

    if (openaiResponse.ok) {
      console.log("[Test Terminate] Session terminated successfully!")

      return NextResponse.json({
        success: true,
        message: "Successfully terminated OpenAI Realtime session",
        status: openaiResponse.status,
        sessionId: sessionId,
        response: responseData || responseText || "(empty response)",
      })
    } else {
      console.error("[Test Terminate] Failed to terminate session:", responseText)

      return NextResponse.json({
        success: false,
        status: openaiResponse.status,
        sessionId: sessionId,
        error: responseData || responseText || `HTTP Error: ${openaiResponse.status}`,
      })
    }
  } catch (error) {
    console.error("[Test Terminate] Error testing session termination:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
