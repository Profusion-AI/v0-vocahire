import { NextResponse } from "next/server"

// This is a diagnostic endpoint to test OpenAI API connectivity
export async function GET() {
  console.log("=== /api/test-openai endpoint called ===")

  // Log all environment variables (safely, without exposing values)
  const envVars = Object.keys(process.env).sort()
  console.log("Available environment variables:", envVars)

  // Check specifically for OpenAI-related environment variables
  const openaiEnvVars = envVars.filter((key) => key.includes("OPENAI") || key.includes("OPEN_AI"))
  console.log("OpenAI-related environment variables:", openaiEnvVars)

  // Log environment information (without exposing sensitive values)
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY
  console.log("Environment check:", {
    nodeEnv: process.env.NODE_ENV,
    openAiKeySet: !!apiKey,
    openAiKeyLength: apiKey ? apiKey.length : 0,
    openAiKeyPrefix: apiKey ? apiKey.substring(0, 3) + "..." : "not-set",
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

  try {
    // Check if OpenAI API key is available
    if (!apiKey) {
      console.error("OpenAI API key is missing - checked multiple environment variable names")
      return NextResponse.json(
        {
          status: "error",
          message: "OpenAI API key is missing",
          environment: {
            nodeEnv: process.env.NODE_ENV,
            keySet: false,
            checkedVariables: ["OPENAI_API_KEY", "OPEN_AI_API_KEY", "OPENAI_KEY"],
            availableOpenAIVars: openaiEnvVars,
          },
        },
        { status: 500 },
      )
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      console.error("OpenAI API key appears to be invalid (wrong format)")
      return NextResponse.json(
        {
          status: "error",
          message: "OpenAI API key appears to be invalid (wrong format)",
          environment: {
            nodeEnv: process.env.NODE_ENV,
            keySet: true,
            keyFormat: "invalid",
            keyPrefix: apiKey.substring(0, 3),
            keyLength: apiKey.length,
          },
        },
        { status: 500 },
      )
    }

    // Test the OpenAI API with a simple models list call
    console.log("Testing OpenAI API with models endpoint...")
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    // Get response as text first to safely log it
    const text = await response.text()

    // Log response details
    console.log("OpenAI API response status:", response.status)
    console.log("OpenAI API response statusText:", response.statusText)

    if (!response.ok) {
      let details
      try {
        details = JSON.parse(text)
        console.error("OpenAI API error details:", details)
      } catch (e) {
        console.error("Failed to parse OpenAI error response:", e)
        details = { error: text }
      }

      return NextResponse.json(
        {
          status: "error",
          message: `OpenAI API returned an error: ${response.status} ${response.statusText}`,
          openaiResponse: {
            status: response.status,
            statusText: response.statusText,
            error: details.error || text,
          },
        },
        { status: 500 },
      )
    }

    // Parse the successful response
    let data
    try {
      data = JSON.parse(text)
      console.log("Successfully parsed OpenAI response")
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to parse OpenAI response",
          error: String(parseError),
        },
        { status: 500 },
      )
    }

    // Success! Return basic information about the models
    const modelCount = data.data?.length || 0
    const modelNames = data.data?.slice(0, 10).map((model: any) => model.id) || []

    // Check for realtime models specifically
    const realtimeModels = modelNames.filter((name: string) => name.includes("realtime"))

    // Check for specific models we might want to use
    const hasGpt4oMiniRealtime = modelNames.some(
      (name: string) => name.includes("gpt-4o-mini-realtime") || (name.includes("gpt-4o") && name.includes("realtime")),
    )

    return NextResponse.json({
      status: "success",
      message: "Successfully connected to OpenAI API",
      openaiResponse: {
        modelCount,
        sampleModels: modelNames,
        realtimeModels,
        hasGpt4o: modelNames.some((name: string) => name.includes("gpt-4o")),
        hasRealtimeModels: modelNames.some((name: string) => name.includes("realtime")),
        hasGpt4oMiniRealtime,
      },
      environment: {
        checkedVariables: ["OPENAI_API_KEY", "OPEN_AI_API_KEY", "OPENAI_KEY"],
        foundVariable: process.env.OPENAI_API_KEY
          ? "OPENAI_API_KEY"
          : process.env.OPEN_AI_API_KEY
            ? "OPEN_AI_API_KEY"
            : process.env.OPENAI_KEY
              ? "OPENAI_KEY"
              : "none",
      },
    })
  } catch (error) {
    console.error("Error testing OpenAI API:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to OpenAI API",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
