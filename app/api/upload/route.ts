import { NextResponse } from "next/server"
import { uploadToBlob } from "@/lib/blob-storage"
import { getAuthSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getAuthSession()
    if (!session) {
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
      size: blob.size,
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
