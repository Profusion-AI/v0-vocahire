import { put, list, del, type PutBlobResult } from "@vercel/blob"
import { getAuthSession } from "./auth-utils"

/**
 * Uploads a file to Vercel Blob storage
 * @param file The file to upload
 * @param folder Optional folder path to organize blobs
 * @returns The blob URL and other metadata
 */
export async function uploadToBlob(
  file: File | Blob | ArrayBuffer | Buffer,
  folder = "uploads",
): Promise<PutBlobResult> {
  try {
    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    let filename = ""

    if (file instanceof File) {
      // For File objects, use the original filename
      const extension = file.name.split(".").pop()
      filename = `${folder}/${timestamp}-${file.name}`
    } else {
      // For other types, generate a name
      filename = `${folder}/${timestamp}-blob.data`
    }

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return blob
  } catch (error) {
    console.error("Error uploading to blob storage:", error)
    throw error
  }
}

/**
 * Uploads an interview recording to Vercel Blob
 * @param audioData The audio data to upload
 * @param sessionId The interview session ID
 * @returns The blob URL
 */
export async function saveInterviewRecording(audioData: Blob | ArrayBuffer, sessionId: string): Promise<string> {
  try {
    const session = await getAuthSession()
    if (!session) {
      throw new Error("Unauthorized")
    }

    const userId = session.user.id
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `interviews/${userId}/${sessionId}-${timestamp}.webm`

    const blob = await put(filename, audioData, {
      access: "public", // Changed from "private" as only "public" is supported
    })

    return blob.url
  } catch (error) {
    console.error("Error saving interview recording:", error)
    throw error
  }
}

/**
 * Lists all interview recordings for the current user
 * @returns Array of blob URLs and metadata
 */
export async function listUserRecordings() {
  try {
    const session = await getAuthSession()
    if (!session) {
      throw new Error("Unauthorized")
    }

    const userId = session.user.id
    const { blobs } = await list({
      prefix: `interviews/${userId}/`,
    })

    return blobs
  } catch (error) {
    console.error("Error listing user recordings:", error)
    throw error
  }
}

/**
 * Deletes a blob from storage
 * @param url The URL of the blob to delete
 */
export async function deleteBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error("Error deleting blob:", error)
    throw error
  }
}
