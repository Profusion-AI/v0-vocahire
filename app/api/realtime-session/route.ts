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
    // Get job role from request if provided
    const body = await request.json().catch(() => ({}))
    const jobRole = body.jobRole || "Software Engineer"

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing")
      return new NextResponse(
        JSON.stringify({
          error: "Configuration error: OpenAI API key is missing",
          message: "Please check your environment variables",
        }),
        { status: 500 },
      )
    }

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
    console.log("OpenAI API response status:", response.status)
    console.log("OpenAI API response headers:", Object.fromEntries([...response.headers.entries()]))
    console.log("OpenAI API response body:", text.substring(0, 500)) // Log first 500 chars in case it's large

    if (!response.ok) {
      let details
      try {
        details = JSON.parse(text)
      } catch (e) {
        details = { error: text }
      }

      // Log the full error details for debugging
      console.error("OpenAI API error details:", details)

      // Return a more specific error message
      return new NextResponse(
        JSON.stringify({
          error: `OpenAI API error: ${response.status}`,
          message: details.error?.message || text,
          code: details.error?.code || "unknown_error",
        }),
        { status: response.status },
      )
    }

    const data = JSON.parse(text)
    return NextResponse.json({
      token: data.client_secret.value,
      sessionId: data.id,
      jobRole, // Still return jobRole to the client
    })
  } catch (error) {
    console.error("OpenAI token generation failed:", error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("Error stack:", errorStack)

    return NextResponse.json(
      {
        error: "Failed to generate OpenAI token",
        message: errorMessage,
        details: errorStack ? errorStack.split("\n").slice(0, 3).join("\n") : undefined,
      },
      { status: 500 },
    )
  }
}
