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

    // Extract realtime models if any
    const realtimeModels =
      modelsData.data?.filter((model: any) => model.id.includes("realtime")).map((model: any) => model.id) || []

    // Test 2: Check if the realtime API is accessible
    console.log("Test 2: Checking realtime API accessibility...")

    // Try different model names
    const modelOptions = [
      "gpt-4o-mini-realtime",
      "gpt-4o-realtime",
      "gpt-4-turbo-realtime",
      "gpt-4-realtime",
      "gpt-3.5-turbo-realtime",
    ]
    const voiceOptions = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

    const realtimeResults = []

    // Test each model with the default voice
    for (const model of modelOptions) {
      console.log(`Testing realtime API with model: ${model}`)

      try {
        const realtimeResponse = await fetch("https://api.openai.com/v1/audio/realtime/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime",
          },
          body: JSON.stringify({
            model: model,
            voice: "alloy",
          }),
        })

        const realtimeText = await realtimeResponse.text()
        const contentType = realtimeResponse.headers.get("content-type") || ""
        const isJsonResponse = contentType.includes("application/json")
        const isHtmlResponse = contentType.includes("text/html") || realtimeText.trim().startsWith("<")

        console.log(`Realtime API response for ${model} - status:`, realtimeResponse.status)
        console.log(`Realtime API response for ${model} - content type:`, contentType)
        console.log(`Realtime API response for ${model} - is JSON:`, isJsonResponse)
        console.log(`Realtime API response for ${model} - is HTML:`, isHtmlResponse)

        let parsedResponse = null
        if (isJsonResponse && !isHtmlResponse) {
          try {
            parsedResponse = JSON.parse(realtimeText)
          } catch (e) {
            console.error(`Failed to parse JSON response for ${model}:`, e)
          }
        }

        realtimeResults.push({
          model,
          voice: "alloy",
          status: realtimeResponse.status,
          ok: realtimeResponse.ok,
          contentType,
          isJsonResponse,
          isHtmlResponse,
          response: isHtmlResponse
            ? "HTML response (truncated)"
            : parsedResponse
              ? {
                  id: parsedResponse.id,
                  hasClientSecret: !!parsedResponse.client_secret,
                  hasClientSecretValue: !!parsedResponse.client_secret?.value,
                  // Don't include the actual token value
                }
              : realtimeText.substring(0, 500),
        })

        // If we got a successful response, we can stop testing
        if (realtimeResponse.ok && isJsonResponse && !isHtmlResponse) {
          console.log(`Successfully accessed realtime API with model: ${model}`)
          break
        }
      } catch (error) {
        console.error(`Error testing realtime API with model ${model}:`, error)
        realtimeResults.push({
          model,
          voice: "alloy",
          status: "error",
          error: String(error),
        })
      }
    }

    // If no model worked with the default voice, try the first model with different voices
    if (!realtimeResults.some((r) => r.ok) && modelOptions.length > 0) {
      const firstModel = modelOptions[0]

      for (const voice of voiceOptions) {
        if (voice === "alloy") continue // Skip the default voice we already tried

        console.log(`Testing realtime API with model: ${firstModel} and voice: ${voice}`)

        try {
          const realtimeResponse = await fetch("https://api.openai.com/v1/audio/realtime/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "realtime",
            },
            body: JSON.stringify({
              model: firstModel,
              voice: voice,
            }),
          })

          const realtimeText = await realtimeResponse.text()
          const contentType = realtimeResponse.headers.get("content-type") || ""
          const isJsonResponse = contentType.includes("application/json")
          const isHtmlResponse = contentType.includes("text/html") || realtimeText.trim().startsWith("<")

          let parsedResponse = null
          if (isJsonResponse && !isHtmlResponse) {
            try {
              parsedResponse = JSON.parse(realtimeText)
            } catch (e) {
              console.error(`Failed to parse JSON response for ${firstModel} with voice ${voice}:`, e)
            }
          }

          realtimeResults.push({
            model: firstModel,
            voice,
            status: realtimeResponse.status,
            ok: realtimeResponse.ok,
            contentType,
            isJsonResponse,
            isHtmlResponse,
            response: isHtmlResponse
              ? "HTML response (truncated)"
              : parsedResponse
                ? {
                    id: parsedResponse.id,
                    hasClientSecret: !!parsedResponse.client_secret,
                    hasClientSecretValue: !!parsedResponse.client_secret?.value,
                  }
                : realtimeText.substring(0, 500),
          })

          // If we got a successful response, we can stop testing
          if (realtimeResponse.ok && isJsonResponse && !isHtmlResponse) {
            console.log(`Successfully accessed realtime API with model: ${firstModel} and voice: ${voice}`)
            break
          }
        } catch (error) {
          console.error(`Error testing realtime API with model ${firstModel} and voice ${voice}:`, error)
          realtimeResults.push({
            model: firstModel,
            voice,
            status: "error",
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
