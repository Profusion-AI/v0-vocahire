import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Call OpenAI API to terminate the session
    const response = await fetch(`https://api.openai.com/v1/audio/realtime/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "realtime",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error terminating OpenAI session: ${response.status} ${errorText}`)
      return NextResponse.json({
        success: false,
        error: `Failed to terminate session: ${response.status}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error terminating session:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
