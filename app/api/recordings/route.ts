import { NextResponse } from "next/server"
import { saveInterviewRecording, listUserRecordings, deleteBlob } from "@/lib/blob-storage"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

/**
 * Handles POST requests to upload and save an interview audio recording for the authenticated user.
 *
 * Expects a multipart form data request containing an audio blob and a session ID. Returns a JSON response with the recording URL, session ID, and timestamp upon success.
 *
 * @returns A JSON response indicating success and details of the saved recording, or an error message with the appropriate HTTP status code.
 */
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

/**
 * Handles GET requests to retrieve all audio recordings for the authenticated user.
 *
 * @returns A JSON response containing a list of the user's recordings on success, or an error message on failure.
 *
 * @remark Returns a 401 status if the user is not authenticated.
 */
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

/**
 * Handles HTTP DELETE requests to remove a user's interview audio recording.
 *
 * Authenticates the user via Clerk and deletes the recording specified by the provided URL. Returns a JSON response indicating success, the deleted URL, and the deletion timestamp.
 *
 * @returns A JSON response with the deletion result or an error message.
 */
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

    // Delete the blob
    await deleteBlob(url)

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
