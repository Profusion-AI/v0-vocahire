import { NextResponse } from "next/server"
import { runOpenAIRealtimeDiagnostic } from "@/lib/openai-realtime-debug"
import { getOpenAIApiKey } from "@/lib/openai-realtime"

export async function GET() {
  try {
    console.log("=== Testing OpenAI Realtime API Access ===")

    // Get the API key
    const apiKey = getOpenAIApiKey()

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "No OpenAI API key found in environment variables",
        },
        { status: 500 },
      )
    }

    console.log(`API key available: ${apiKey.substring(0, 3)}...`)

    // Test basic models endpoint first
    console.log("Testing basic OpenAI API access...")
    const modelsResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text()
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to access OpenAI API",
          details: {
            status: modelsResponse.status,
            statusText: modelsResponse.statusText,
            error: errorText,
          },
        },
        { status: 500 },
      )
    }

    const modelsData = await modelsResponse.json()
    const modelCount = modelsData.data?.length || 0

    // Now test the Realtime API specifically
    console.log("Testing OpenAI Realtime API access...")

    // Use a minimal payload for testing
    const payload = {
      model: "gpt-4o-mini-realtime-preview",
      voice: "alloy",
    }

    const realtimeResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime",
      },
      body: JSON.stringify(payload),
    })

    // Get response as text first to safely handle it
    const realtimeResponseText = await realtimeResponse.text()
    let realtimeData
    let isJson = false

    try {
      realtimeData = JSON.parse(realtimeResponseText)
      isJson = true
    } catch (_e) {
      realtimeData = realtimeResponseText
    }

    // const realtimeApiResult = {
    //   status: realtimeResponse.status,
    //   statusText: realtimeResponse.statusText,
    //   isJson,
    //   response: isJson ? realtimeData : realtimeResponseText.substring(0, 500),
    // }

    console.log("Running comprehensive OpenAI Realtime diagnostic...")
    const diagnosticResults = await runOpenAIRealtimeDiagnostic()

    // Determine overall success
    const allStagesSuccessful = diagnosticResults.every((result) => result.success)

    const overallSuccess = realtimeResponse.ok && allStagesSuccessful

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: overallSuccess,
      message: overallSuccess ? "All diagnostic checks passed successfully" : "Some diagnostic checks failed",
      results: diagnosticResults,
      basicApiAccess: {
        status: "success",
        modelCount,
      },
      realtimeApiAccess: {
        status: realtimeResponse.status,
        statusText: realtimeResponse.statusText,
        isJson,
        response: isJson ? realtimeData : realtimeResponseText.substring(0, 500),
      },
    })
  } catch (error) {
    console.error("Error testing Realtime API:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Error testing OpenAI Realtime API",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
