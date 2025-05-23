import { NextResponse } from "next/server"

export async function GET() {
  console.log("=== /api/test-realtime-api endpoint called ===")

  // Get the OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error("OpenAI API key is missing")
    return NextResponse.json(
      {
        status: "error",
        message: "OpenAI API key is missing",
        environment: {
          nodeEnv: process.env.NODE_ENV,
          keySet: false,
          checkedVariable: "OPENAI_API_KEY",
        },
      },
      { status: 500 },
    )
  }

  try {
    // Test 1: Check if the API key is valid by listing models
    console.log("Test 1: Checking API key validity by listing models...")

    const modelsResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    const modelsText = await modelsResponse.text()

    console.log("Models API response status:", modelsResponse.status)
    console.log("Models API response headers:", Object.fromEntries([...modelsResponse.headers.entries()]))

    if (!modelsResponse.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: "API key validation failed",
          details: {
            status: modelsResponse.status,
            statusText: modelsResponse.statusText,
            response: modelsText.substring(0, 500),
          },
        },
        { status: 500 },
      )
    }

    let modelsData
    try {
      modelsData = JSON.parse(modelsText)
    } catch (e) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to parse models response",
          details: {
            error: String(e),
            response: modelsText.substring(0, 500),
          },
        },
        { status: 500 },
      )
    }

    // Extract realtime models if any - specifically looking for realtime-preview models
    const realtimeModels =
      modelsData.data?.filter((model: any) => model.id.includes("realtime-preview")).map((model: any) => model.id) || []

    // Test 2: Check if the realtime API is accessible
    console.log("Test 2: Checking realtime API accessibility...")

    // Use only the specified models
    const modelOptions = ["gpt-4o-mini-realtime-preview", "gpt-4o-mini-realtime-preview-2024-12-17"]
    const voiceOptions = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

    const realtimeResults = []

    // Test each model with each voice
    for (const model of modelOptions) {
      for (const voice of voiceOptions) {
        console.log(`Testing realtime API with model: ${model} and voice: ${voice}`)

        try {
          // UPDATED ENDPOINT: Using /v1/realtime/sessions instead of /v1/audio/realtime/sessions
          const realtimeResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "realtime",
            },
            body: JSON.stringify({
              model: model,
              voice: voice,
            }),
          })

          const realtimeText = await realtimeResponse.text()
          const contentType = realtimeResponse.headers.get("content-type") || ""
          const isJsonResponse = contentType.includes("application/json")
          const isHtmlResponse = contentType.includes("text/html") || realtimeText.trim().startsWith("<")

          console.log(`Realtime API response for ${model} with voice ${voice} - status:`, realtimeResponse.status)
          console.log(`Realtime API response for ${model} with voice ${voice} - content type:`, contentType)

          let parsedResponse = null
          let errorMessage = ""

          if (isJsonResponse && !isHtmlResponse) {
            try {
              parsedResponse = JSON.parse(realtimeText)
            } catch (e) {
              console.error(`Failed to parse JSON response for ${model} with voice ${voice}:`, e)
              errorMessage = `Parse error: ${String(e).substring(0, 100)}`
            }
          } else if (isHtmlResponse) {
            errorMessage = "HTML response (endpoint not found)"
          } else {
            errorMessage = realtimeText.substring(0, 100)
          }

          realtimeResults.push({
            model,
            voice,
            status: realtimeResponse.status,
            ok: realtimeResponse.ok,
            contentType,
            isJsonResponse,
            isHtmlResponse,
            errorMessage,
            response: isHtmlResponse
              ? "HTML response (truncated)"
              : parsedResponse
                ? {
                    id: parsedResponse.id,
                    hasClientSecret: !!parsedResponse.client_secret,
                    hasClientSecretValue: !!parsedResponse.client_secret?.value,
                    // Don't include the actual token value
                  }
                : realtimeText.substring(0, 100),
          })

          // If we got a successful response, we can stop testing this model with other voices
          if (realtimeResponse.ok && isJsonResponse && !isHtmlResponse) {
            console.log(`Successfully accessed realtime API with model: ${model} and voice: ${voice}`)
            break
          }
        } catch (error) {
          console.error(`Error testing realtime API with model ${model} and voice ${voice}:`, error)
          realtimeResults.push({
            model,
            voice,
            status: "error",
            ok: false,
            errorMessage: String(error).substring(0, 100),
            error: String(error),
          })
        }
      }
    }

    // Return the test results
    return NextResponse.json({
      status: "success",
      message: "API tests completed",
      tests: {
        modelsApi: {
          status: modelsResponse.status,
          ok: modelsResponse.ok,
          modelCount: modelsData.data?.length || 0,
          hasRealtimeModels: realtimeModels.length > 0,
          realtimeModels,
          sampleModels: modelsData.data?.slice(0, 10).map((model: any) => model.id) || [],
        },
        realtimeApi: realtimeResults,
      },
      recommendations: realtimeResults.some((r) => r.ok)
        ? "Your API key has access to the Realtime API."
        : "Your API key may not have access to the Realtime API. Please check your OpenAI account permissions.",
      possibleIssues: realtimeResults.some((r) => r.isHtmlResponse)
        ? [
            "Received HTML response instead of JSON. This could indicate:",
            "1. Your API key doesn't have access to the Realtime API",
            "2. The Realtime API endpoint has changed",
            "3. There's a network issue or proxy interfering with the request",
            "4. OpenAI may be experiencing service issues",
          ]
        : [],
      nextSteps: realtimeResults.some((r) => r.ok)
        ? ["Proceed with implementing the client-side WebRTC connection"]
        : [
            "Check your OpenAI account for Realtime API access",
            "Verify the API endpoint in the OpenAI documentation",
            "Try a different API key with confirmed Realtime API access",
            "Check OpenAI status page for any service issues",
          ],
    })
  } catch (error) {
    console.error("Error testing OpenAI API:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to test OpenAI API",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
