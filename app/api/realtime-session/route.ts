import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  // For development testing, we'll allow unauthenticated access with a special header
  const headers = new Headers(request.headers)
  const isTestMode = headers.get("x-vocahire-test-mode") === "true"

  // In production, we would always require authentication
  if (!isTestMode) {
    // Check authentication using our simplified auth check
    const session = await getAuthSession()

    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  try {
    // Get job role from request if provided (but don't include it in requestBody)
    const body = await request.json().catch(() => ({}))
    const jobRole = body.jobRole || "Software Engineer"

    // ✅ Only include the supported parameter
    const requestBody = {
      model: "gpt-4o-mini-realtime",
    }

    console.log("OpenAI request body:", requestBody)

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    console.log("OpenAI API response:", text)

    if (!response.ok) {
      let details
      try {
        details = JSON.parse(text)
      } catch (e) {
        details = { error: text }
      }
      throw new Error(`OpenAI error: ${details.error?.message || text}`)
    }

    const data = JSON.parse(text)
    return NextResponse.json({
      token: data.client_secret.value,
      sessionId: data.id,
      jobRole, // Still return jobRole to the client
    })
  } catch (error) {
    console.error("OpenAI token generation failed:", error)
    return NextResponse.json(
      {
        error: "Failed to generate OpenAI token",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
