import { NextResponse } from "next/server"
import { uploadToBlob } from "@/lib/blob-storage"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

/**
 * Handles authenticated file uploads via POST requests.
 *
 * Authenticates the user using Clerk, processes a file upload from form data, stores the file in blob storage, and returns the file URL and upload timestamp in a JSON response.
 *
 * @param request - The incoming Next.js request containing form data with a file and optional folder name.
 * @returns A JSON response indicating success with the uploaded file's URL and timestamp, or an error message with the appropriate HTTP status code.
 */
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
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await uploadToBlob(file, folder)

    return NextResponse.json({
      success: true,
      url: blob.url,
      uploadedAt: new Date().toISOString(),
    })
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
