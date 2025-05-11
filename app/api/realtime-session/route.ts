import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  console.log("=== /api/realtime-session endpoint called ===")

  // Log all environment variables (safely, without exposing values)
  const envVars = Object.keys(process.env).sort()
  console.log("Available environment variables:", envVars)

  // Check specifically for OpenAI-related environment variables
  const openaiEnvVars = envVars.filter((key) => key.includes("OPENAI") || key.includes("OPEN_AI"))
  console.log("OpenAI-related environment variables:", openaiEnvVars)

  // Try to get the API key from multiple possible environment variable names
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY

  // Log environment information (without exposing sensitive values)
  console.log("Environment check:", {
    nodeEnv: process.env.NODE_ENV,
    openAiKeySet: !!apiKey,
    openAiKeyLength: apiKey ? apiKey.length : 0,
    openAiKeyPrefix: apiKey ? apiKey.substring(0, 3) + "..." : "not-set",
    // Check which environment variable was used
    foundInVariable: apiKey
      ? process.env.OPENAI_API_KEY
        ? "OPENAI_API_KEY"
        : process.env.OPEN_AI_API_KEY
          ? "OPEN_AI_API_KEY"
          : process.env.OPENAI_KEY
            ? "OPENAI_KEY"
            : "unknown"
      : "none",
  })

  // For development testing, we'll allow unauthenticated access with a special header
  const headers = new Headers(request.headers)
  const isTestMode = headers.get("x-vocahire-test-mode") === "true"

  // In production, we would always require authentication
  if (!isTestMode) {
    // Check authentication using our simplified auth check
    const session = await getAuthSession()

    if (!session) {
      console.log("Authentication failed: No session found")
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  try {
    // Get job role from request if provided
    let body = {}
    try {
      body = await request.json()
      console.log("Request body parsed successfully:", body)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      body = {}
    }

    const jobRole = body.jobRole || "Software Engineer"
    console.log("Using job role:", jobRole)

    // Check if OpenAI API key is available
    if (!apiKey) {
      console.error("OpenAI API key is missing - checked multiple environment variable names")
      return new NextResponse(
        JSON.stringify({
          error: "Configuration error: OpenAI API key is missing",
          message: "The API key is not available in the environment variables",
          checkedVariables: ["OPENAI_API_KEY", "OPEN_AI_API_KEY", "OPENAI_KEY"],
          availableOpenAIVars: openaiEnvVars,
          code: "missing_api_key",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      console.error("OpenAI API key appears to be invalid (wrong format)")
      return new NextResponse(
        JSON.stringify({
          error: "Configuration error: OpenAI API key appears to be invalid",
          message: "The API key doesn't match the expected format",
          keyPrefix: apiKey.substring(0, 3),
          keyLength: apiKey.length,
          code: "invalid_api_key_format",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create the request body according to the OpenAI Realtime API documentation
    const requestBody = {
      model: "gpt-4o-realtime-preview-2024-12-17", // Updated to match the available model from API test
    }

    console.log("OpenAI request body:", requestBody)

    // Make the request to create a realtime session
    console.log("Making request to OpenAI realtime sessions API...")
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime", // Add this header as it might be required for the realtime API
      },
      body: JSON.stringify(requestBody),
    })

    // Get response as text first to safely log it
    const text = await response.text()

    // Log response details
    console.log("OpenAI API response status:", response.status)
    console.log("OpenAI API response statusText:", response.statusText)
    console.log("OpenAI API response headers:", Object.fromEntries([...response.headers.entries()]))

    // Log a safe substring of the response body
    const safeResponseText = text.length > 500 ? text.substring(0, 500) + "..." : text
    console.log("OpenAI API response body:", safeResponseText)

    if (!response.ok) {
      let details
      try {
        details = JSON.parse(text)
        console.error("OpenAI API error details:", details)
      } catch (e) {
        console.error("Failed to parse OpenAI error response:", e)
        details = { error: text }
      }

      // Return a more specific error message
      const errorCode = details.error?.code || "unknown_error"
      const errorType = details.error?.type || "unknown_type"
      const errorMessage = details.error?.message || text

      console.error("OpenAI API error summary:", {
        status: response.status,
        code: errorCode,
        type: errorType,
        message: errorMessage,
      })

      return new NextResponse(
        JSON.stringify({
          error: `OpenAI API error: ${response.status}`,
          message: errorMessage,
          code: errorCode,
          type: errorType,
          details: details,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Parse the successful response
    let data
    try {
      data = JSON.parse(text)
      console.log("Successfully parsed OpenAI response")
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      return new NextResponse(
        JSON.stringify({
          error: "Failed to parse OpenAI response",
          message: "The response from OpenAI was not valid JSON",
          code: "invalid_json_response",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Validate the response structure according to the documentation
    if (!data.client_secret?.value || !data.id) {
      console.error("OpenAI response missing required fields:", {
        hasClientSecret: !!data.client_secret,
        hasClientSecretValue: !!data.client_secret?.value,
        hasId: !!data.id,
      })

      return new NextResponse(
        JSON.stringify({
          error: "Invalid OpenAI response structure",
          message: "The response from OpenAI did not contain the expected fields",
          code: "invalid_response_structure",
          responseData: data,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Success! Return the token and session ID
    console.log("Successfully obtained OpenAI token and session ID")
    return NextResponse.json({
      token: data.client_secret.value,
      sessionId: data.id,
      jobRole, // Still return jobRole to the client
    })
  } catch (error) {
    // Get detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : "Unknown"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("OpenAI token generation failed:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
    })

    // Check for specific error patterns
    if (errorMessage.includes("fetch failed") || errorMessage.includes("network")) {
      return NextResponse.json(
        {
          error: "Network error connecting to OpenAI",
          message: "Failed to connect to OpenAI API. Please check your internet connection and try again.",
          details: errorMessage,
          code: "network_error",
        },
        { status: 503 }, // Service Unavailable
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to generate OpenAI token",
        message: errorMessage,
        details: errorStack ? errorStack.split("\n").slice(0, 3).join("\n") : undefined,
        code: "unknown_error",
      },
      { status: 500 },
    )
  }
}
