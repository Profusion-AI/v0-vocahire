import { NextResponse } from "next/server"
import { saveInterviewRecording, listUserRecordings, deleteBlob } from "@/lib/blob-storage"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Authenticate with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob
    const sessionId = formData.get("sessionId") as string

    if (!audioBlob || !sessionId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Both audio and sessionId are required",
        },
        { status: 400 },
      )
    }

    // Save the recording
    const url = await saveInterviewRecording(audioBlob, sessionId, auth.userId)

    return NextResponse.json({
      success: true,
      url,
      sessionId,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error saving recording:", error)
    return NextResponse.json(
      {
        error: "Failed to save recording",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // List user recordings
    const recordings = await listUserRecordings(auth.userId)

    return NextResponse.json({
      success: true,
      recordings,
    })
  } catch (error) {
    console.error("Error listing recordings:", error)
    return NextResponse.json(
      {
        error: "Failed to list recordings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate with Clerk
    const auth = getAuth(request)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the URL from the request
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Verify ownership by checking if this recording belongs to the authenticated user
    const session = await prisma.interviewSession.findFirst({
      where: {
        audioUrl: url,
        userId: auth.userId,
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Forbidden - Recording not found or access denied" }, { status: 403 })
    }

    // Delete the blob
    await deleteBlob(url)

    // Update the session to remove the audioUrl
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { audioUrl: null },
    })

    return NextResponse.json({
      success: true,
      deletedUrl: url,
      deletedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error deleting recording:", error)
    return NextResponse.json(
      {
        error: "Failed to delete recording",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
