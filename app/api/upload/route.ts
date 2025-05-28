import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Authenticate with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get form data with file
    const formData = await request.formData()
    const file = formData.get("file") as File
    // const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // TEMPORARY: File upload is disabled for MVP
    return NextResponse.json(
      {
        error: "File upload not implemented",
        message: "File upload functionality is disabled in the MVP. We'll set up Google Cloud Storage next.",
      },
      { status: 501 }, // 501 Not Implemented
    )
  } catch (error) {
    console.error("Error in upload route:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
