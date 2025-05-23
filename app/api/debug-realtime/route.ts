import { NextResponse } from "next/server"
import { testRealtimeAccess, fetchRealtimeModels } from "@/lib/openai-realtime"

export async function GET(_request: Request) {
  console.log("=== DEBUG REALTIME SESSION API CALL ===")

  try {
    // Get the OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("OpenAI API key is missing")
      return NextResponse.json({ error: "API key is missing" }, { status: 500 })
    }

    console.log("API Key exists (first 5 chars):", apiKey.substring(0, 5) + "...")

    // Test if the API key has access to the Realtime API
    const accessTest = await testRealtimeAccess(apiKey)

    if (!accessTest.hasAccess) {
      console.error("API key does not have access to the Realtime API")
      return NextResponse.json(
        {
          success: false,
          hasRealtimeAccess: false,
          error: accessTest.error || "API key does not have access to the Realtime API",
          rawResponse: accessTest.response,
        },
        { status: 403 },
      )
    }

    // Fetch available models
    const models = await fetchRealtimeModels(apiKey)

    // Return success with all the information
    return NextResponse.json({
      success: true,
      hasRealtimeAccess: true,
      sessionInfo: accessTest.response,
      availableModels: models,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
