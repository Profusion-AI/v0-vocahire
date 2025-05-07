import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { sessionId, apiKey } = await req.json()

    if (!sessionId) {
      console.error("[Terminate Session] Missing session ID")
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Use custom API key if provided, otherwise use environment variable
    let openaiApiKey = process.env.OPENAI_API_KEY
    let usingCustomKey = false

    if (apiKey && typeof apiKey === "string" && apiKey.trim().startsWith("sk-")) {
      openaiApiKey = apiKey.trim()
      usingCustomKey = true
      console.log("[Terminate Session] Using custom API key")
    }

    if (!openaiApiKey) {
      console.error("[Terminate Session] OpenAI API key not configured")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log(`[Terminate Session] Attempting to terminate session: ${sessionId}`)
    console.log(`[Terminate Session] Using endpoint: https://api.openai.com/v1/realtime/sessions/${sessionId}`)
    console.log(`[Terminate Session] Using custom key: ${usingCustomKey}`)

    // Call OpenAI API to terminate the session with the updated URL
    const response = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "realtime",
      },
    })

    // Log response details
    console.log(`[Terminate Session] Response status: ${response.status}`)
    console.log(`[Terminate Session] Response status text: ${response.statusText}`)

    // Log headers
    const headers = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log(`[Terminate Session] Response headers: ${JSON.stringify(headers, null, 2)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Terminate Session] Error terminating OpenAI session: ${response.status} ${errorText}`)

      // Try to parse error as JSON if possible
      try {
        const errorJson = JSON.parse(errorText)
        console.error(`[Terminate Session] Parsed error: ${JSON.stringify(errorJson, null, 2)}`)
      } catch (e) {
        // Not JSON, just log the text
      }

      return NextResponse.json({
        success: false,
        error: `Failed to terminate session: ${response.status}`,
        details: errorText,
        status: response.status,
        statusText: response.statusText,
      })
    }

    console.log(`[Terminate Session] Successfully terminated session: ${sessionId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Terminate Session] Error terminating session:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
