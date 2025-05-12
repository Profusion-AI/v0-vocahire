import { NextResponse } from "next/server"
import { runOpenAIRealtimeDiagnostic } from "@/lib/openai-realtime-debug"

export async function GET() {
  try {
    console.log("Running comprehensive OpenAI Realtime diagnostic...")
    const results = await runOpenAIRealtimeDiagnostic()

    // Determine overall success
    const allStagesSuccessful = results.every((result) => result.success)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: allStagesSuccessful,
      message: allStagesSuccessful ? "All diagnostic checks passed successfully" : "Some diagnostic checks failed",
      results,
    })
  } catch (error) {
    console.error("Error running diagnostic:", error)
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        success: false,
        message: "Error running diagnostic",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
