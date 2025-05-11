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
    // This helps determine if the API key is valid at all before attempting realtime API
    console.log("Verifying basic OpenAI API access...")
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

        // Check if any realtime models are available
        const realtimeModels = modelsData.data
          .filter((model: any) => model.id.includes("realtime"))
          .map((model: any) => model.id)

        console.log("OpenAI API access verified successfully")
        console.log("Available realtime models:", realtimeModels.length > 0 ? realtimeModels : "None found")

        // If no realtime models are found, log a warning but continue
        // The key might still have access but the models might not be listed
        if (realtimeModels.length === 0) {
          console.warn(
            "WARNING: No realtime models found in the available models list. This may indicate that your API key doesn't have access to the realtime API, or that realtime models aren't listed in the models endpoint.",
          )
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI models response:", parseError)
        throw new Error("Failed to parse OpenAI models response")
      }
    } catch (apiAccessError) {
      console.error("Failed to verify basic OpenAI API access:", apiAccessError)
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

    // Define multiple model options to try in order of preference
    // This is important because model names might change or different keys might have access to different models
    const modelOptions = [
      "gpt-4o-mini-realtime", // First choice - newest model
      "gpt-4o-realtime", // Second choice
      "gpt-4-turbo-realtime", // Third choice
      "gpt-4-realtime", // Fourth choice
      "gpt-3.5-turbo-realtime", // Fifth choice - fallback
    ]

    // Define voice options
    const voiceOptions = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
    const defaultVoice = "alloy"

    // Log the realtime API endpoint we're using
    const realtimeSessionsEndpoint = "https://api.openai.com/v1/audio/realtime/sessions"
    console.log("Using OpenAI realtime sessions endpoint:", realtimeSessionsEndpoint)

    // Function to make the request with a specific model and voice
    const makeRealtimeSessionRequest = async (modelName: string, voice: string) => {
      console.log(`Attempting to create realtime session with model: ${modelName}, voice: ${voice}`)

      const requestBody = {
        model: modelName,
        voice: voice,
      }

      // Log request details (without exposing the full API key)
      console.log("Request URL:", realtimeSessionsEndpoint)
      console.log("Request headers:", {
        Authorization: "Bearer sk-***" + (apiKey ? apiKey.substring(apiKey.length - 4) : ""),
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime",
      })
      console.log("Request body:", requestBody)

      // Make the request to create a realtime session
      const response = await fetch(realtimeSessionsEndpoint, {
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
      console.log(`Response status for ${modelName}:`, response.status)
      console.log(`Response statusText for ${modelName}:`, response.statusText)
      console.log(`Response headers for ${modelName}:`, Object.fromEntries([...response.headers.entries()]))

      // Check content type to see if it's JSON or HTML
      const contentType = response.headers.get("content-type") || ""
      const isJsonResponse = contentType.includes("application/json")
      const isHtmlResponse = contentType.includes("text/html") || text.trim().startsWith("<")

      // Log content type and response format
      console.log(`Response content type for ${modelName}:`, contentType)
      console.log(`Is JSON response for ${modelName}:`, isJsonResponse)
      console.log(`Is HTML response for ${modelName}:`, isHtmlResponse)

      // Log a safe substring of the response body
      const safeResponseText = text.length > 500 ? text.substring(0, 500) + "..." : text
      console.log(`Response body for ${modelName}:`, safeResponseText)

      return { response, text, isJsonResponse, isHtmlResponse, modelName, voice }
    }

    // Try each model in sequence until one works or we run out of options
    let lastResult = null
    let successfulResult = null

    // First try with the default voice
    for (const model of modelOptions) {
      try {
        const result = await makeRealtimeSessionRequest(model, defaultVoice)
        lastResult = result

        // If the response is successful, break out of the loop
        if (result.response.ok && result.isJsonResponse && !result.isHtmlResponse) {
          console.log(`Successfully created realtime session with model: ${model}`)
          successfulResult = result
          break
        }

        console.log(`Failed to create realtime session with model: ${model}. Status: ${result.response.status}`)
      } catch (error) {
        console.error(`Error making request with model ${model}:`, error)
        lastResult = {
          error,
          modelName: model,
          voice: defaultVoice,
        }
      }
    }

    // If no model worked with the default voice, try other voices with the first model
    if (!successfulResult && modelOptions.length > 0) {
      const firstModel = modelOptions[0]
      for (const voice of voiceOptions) {
        if (voice === defaultVoice) continue // Skip the default voice we already tried

        try {
          const result = await makeRealtimeSessionRequest(firstModel, voice)
          lastResult = result

          // If the response is successful, break out of the loop
          if (result.response.ok && result.isJsonResponse && !result.isHtmlResponse) {
            console.log(`Successfully created realtime session with model: ${firstModel} and voice: ${voice}`)
            successfulResult = result
            break
          }

          console.log(
            `Failed to create realtime session with model: ${firstModel} and voice: ${voice}. Status: ${result.response.status}`,
          )
        } catch (error) {
          console.error(`Error making request with model ${firstModel} and voice ${voice}:`, error)
          lastResult = {
            error,
            modelName: firstModel,
            voice,
          }
        }
      }
    }

    // If we didn't get a successful response, handle the error
    if (!successfulResult) {
      console.error("All model and voice combinations failed to create a realtime session")

      // Get the last result for error reporting
      const { response, text, isJsonResponse, isHtmlResponse } = lastResult || {}

      if (isHtmlResponse) {
        console.error(
          "Received HTML response instead of JSON. This could indicate a network issue, incorrect endpoint, or lack of access to the Realtime API.",
        )
        // Extract a meaningful error message from HTML if possible
        const errorMatch = text?.match(/<title>(.*?)<\/title>/) || text?.match(/<h1>(.*?)<\/h1>/)
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
          message: errorMessage || "Failed to create a realtime session with any model or voice combination",
          code: errorCode,
          type: errorType,
          details: details,
          triedModels: modelOptions,
          triedVoices: [defaultVoice, ...voiceOptions.filter((v) => v !== defaultVoice)],
        }),
        {
          status: response?.status || 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // We have a successful result, parse the JSON response
    const { text, modelName, voice } = successfulResult
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
    console.log(`Using model: ${modelName}, voice: ${voice}`)

    return NextResponse.json({
      token: data.client_secret.value,
      sessionId: data.id,
      jobRole, // Return jobRole to the client
      model: modelName,
      voice: voice,
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
