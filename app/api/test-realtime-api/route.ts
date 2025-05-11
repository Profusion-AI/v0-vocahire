import { NextResponse } from "next/server"

export async function GET() {
  console.log("=== /api/test-realtime-api endpoint called ===")

  // Get the OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY

  if (!apiKey) {
    console.error("OpenAI API key is missing")
    return NextResponse.json(
      {
        status: "error",
        message: "OpenAI API key is missing",
        environment: {
          nodeEnv: process.env.NODE_ENV,
          keySet: false,
          checkedVariables: ["OPENAI_API_KEY", "OPEN_AI_API_KEY", "OPENAI_KEY"],
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

    // Test 2: Check if the realtime API is accessible
    console.log("Test 2: Checking realtime API accessibility...")

    // Try different model names
    const modelOptions = ["gpt-4o-mini-realtime", "gpt-4o-realtime", "gpt-4-turbo-realtime", "gpt-4-realtime"]

    const realtimeResults = []

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
          status: realtimeResponse.status,
          ok: realtimeResponse.ok,
          contentType,
          isJsonResponse,
          isHtmlResponse,
          response: isHtmlResponse ? "HTML response (truncated)" : parsedResponse || realtimeText.substring(0, 500),
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
          status: "error",
          error: String(error),
        })
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
          hasRealtimeModels: modelsData.data?.some((model: any) => model.id.includes("realtime")) || false,
          sampleModels: modelsData.data?.slice(0, 10).map((model: any) => model.id) || [],
        },
        realtimeApi: realtimeResults,
      },
      recommendations: realtimeResults.some((r) => r.ok)
        ? "Your API key has access to the Realtime API."
        : "Your API key may not have access to the Realtime API. Please check your OpenAI account permissions.",
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
