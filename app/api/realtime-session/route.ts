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

    // First, verify API access with a simple models list call
    console.log("Verifying OpenAI API access...")
    try {
      const modelsResponse = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      // Get response as text first to safely log it
      const modelsText = await modelsResponse.text()

      console.log("OpenAI models API response status:", modelsResponse.status)
      console.log("OpenAI models API response statusText:", modelsResponse.statusText)

      if (!modelsResponse.ok) {
        console.error(`OpenAI models API error: ${modelsResponse.status} - ${modelsText.substring(0, 500)}`)
        throw new Error(`OpenAI API access verification failed: ${modelsResponse.status}`)
      }

      // Try to parse the response as JSON
      try {
        const modelsData = JSON.parse(modelsText)
        // Check if the response contains models
        if (!modelsData.data || !Array.isArray(modelsData.data)) {
          console.error("OpenAI models API returned unexpected format:", modelsText.substring(0, 500))
          throw new Error("OpenAI API returned unexpected format")
        }

        // Check if the realtime model is available
        const hasRealtimeModel = modelsData.data.some(
          (model: any) => model.id.includes("gpt-4o") && model.id.includes("realtime"),
        )

        console.log("OpenAI API access verified successfully")
        console.log("Has realtime model:", hasRealtimeModel)

        // If the realtime model is not available, log a warning
        if (!hasRealtimeModel) {
          console.warn(
            "WARNING: No realtime models found in the available models list. This may indicate that your API key doesn't have access to the realtime API.",
          )
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI models response:", parseError)
        throw new Error("Failed to parse OpenAI models response")
      }
    } catch (apiAccessError) {
      console.error("Failed to verify OpenAI API access:", apiAccessError)
      return new NextResponse(
        JSON.stringify({
          error: "OpenAI API access error",
          message: "Failed to verify access to the OpenAI API. Please check your API key and network connection.",
          details: apiAccessError instanceof Error ? apiAccessError.message : String(apiAccessError),
          code: "api_access_error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create the request body according to the OpenAI Realtime API documentation
    // Try different model names if the first one fails
    const modelOptions = [
      "gpt-4o-mini-realtime", // First choice
      "gpt-4o-realtime", // Second choice
      "gpt-4-turbo-realtime", // Third choice
      "gpt-4-realtime", // Fourth choice
    ]

    // Start with the first model option
    const currentModelIndex = 0
    const requestBody = {
      model: modelOptions[currentModelIndex],
      voice: "alloy", // Choose a voice: alloy, echo, fable, onyx, nova, or shimmer
    }

    console.log("Initial OpenAI request body:", requestBody)

    // Function to make the request with the current model
    const makeRealtimeSessionRequest = async (modelName: string) => {
      console.log(`Attempting to create realtime session with model: ${modelName}`)

      const requestBody = {
        model: modelName,
        voice: "alloy",
      }

      // Make the request to create a realtime session
      console.log("Making request to OpenAI realtime sessions API...")
      console.log("Request URL:", "https://api.openai.com/v1/audio/realtime/sessions")
      console.log("Request headers:", {
        Authorization: "Bearer sk-***" + (apiKey ? apiKey.substring(apiKey.length - 4) : ""),
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime",
      })
      console.log("Request body:", requestBody)

      const response = await fetch("https://api.openai.com/v1/audio/realtime/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "realtime", // Required for the realtime API
        },
        body: JSON.stringify(requestBody),
      })

      // Get response as text first to safely log it
      const text = await response.text()

      // Log response details
      console.log("OpenAI API response status:", response.status)
      console.log("OpenAI API response statusText:", response.statusText)
      console.log("OpenAI API response headers:", Object.fromEntries([...response.headers.entries()]))

      // Check content type to see if it's JSON or HTML
      const contentType = response.headers.get("content-type") || ""
      const isJsonResponse = contentType.includes("application/json")
      const isHtmlResponse = contentType.includes("text/html") || text.trim().startsWith("<")

      // Log content type and response format
      console.log("Response content type:", contentType)
      console.log("Is JSON response:", isJsonResponse)
      console.log("Is HTML response:", isHtmlResponse)

      // Log a safe substring of the response body
      const safeResponseText = text.length > 500 ? text.substring(0, 500) + "..." : text
      console.log("OpenAI API response body:", safeResponseText)

      return { response, text, isJsonResponse, isHtmlResponse }
    }

    // Try each model in sequence until one works or we run out of options
    let response, text, isJsonResponse, isHtmlResponse
    let lastError = null

    for (let i = 0; i < modelOptions.length; i++) {
      try {
        const result = await makeRealtimeSessionRequest(modelOptions[i])
        response = result.response
        text = result.text
        isJsonResponse = result.isJsonResponse
        isHtmlResponse = result.isHtmlResponse

        // If the response is successful, break out of the loop
        if (response.ok && isJsonResponse && !isHtmlResponse) {
          console.log(`Successfully created realtime session with model: ${modelOptions[i]}`)
          break
        }

        // If we got an HTML response or an error, try the next model
        console.log(`Failed to create realtime session with model: ${modelOptions[i]}. Status: ${response.status}`)
        lastError = {
          status: response.status,
          statusText: response.statusText,
          text: text,
          isHtml: isHtmlResponse,
        }
      } catch (error) {
        console.error(`Error making request with model ${modelOptions[i]}:`, error)
        lastError = error
      }
    }

    // If we didn't get a successful response, handle the error
    if (!response || !response.ok || isHtmlResponse || !isJsonResponse) {
      console.error("All model options failed to create a realtime session")

      if (isHtmlResponse) {
        console.error(
          "Received HTML response instead of JSON. This could indicate a network issue, incorrect endpoint, or lack of access to the Realtime API.",
        )
        // Extract a meaningful error message from HTML if possible
        const errorMatch = text.match(/<title>(.*?)<\/title>/) || text.match(/<h1>(.*?)<\/h1>/)
        const htmlErrorMessage = errorMatch ? errorMatch[1] : "Received HTML response instead of JSON"

        return new NextResponse(
          JSON.stringify({
            error: "Invalid API response format",
            message:
              "The OpenAI API returned HTML instead of JSON. This could indicate a network issue, incorrect endpoint, or lack of access to the Realtime API.",
            htmlError: htmlErrorMessage,
            code: "html_response",
            details:
              "Your API key may not have access to the Realtime API. Please check your OpenAI account permissions.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      // Handle other error types
      let details = { error: text }

      // Only try to parse as JSON if it looks like JSON
      if (isJsonResponse && !isHtmlResponse) {
        try {
          details = JSON.parse(text)
          console.error("OpenAI API error details:", details)
        } catch (e) {
          console.error("Failed to parse OpenAI error response:", e)
        }
      }

      // Return a more specific error message
      const errorCode = details.error?.code || "unknown_error"
      const errorType = details.error?.type || "unknown_type"
      const errorMessage = details.error?.message || text

      console.error("OpenAI API error summary:", {
        status: response?.status,
        code: errorCode,
        type: errorType,
        message: errorMessage,
      })

      return new NextResponse(
        JSON.stringify({
          error: `OpenAI API error: ${response?.status || "Unknown"}`,
          message: errorMessage,
          code: errorCode,
          type: errorType,
          details: details,
        }),
        {
          status: response?.status || 500,
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
      model: requestBody.model,
      voice: requestBody.voice,
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
