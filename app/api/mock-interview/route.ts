import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobTitle = "Software Engineer" } = body

    // This is a mock API that always succeeds
    // In a real implementation, you would create a new interview record in your database
    return NextResponse.json({
      success: true,
      mockSession: {
        id: `mock-${Date.now()}`,
        jobTitle,
        startTime: new Date().toISOString(),
        mode: "mock",
      },
      message: "Mock interview session created successfully",
    })
  } catch (error) {
    console.error("Error in mock interview API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create mock interview session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
