import { put, list, del, type PutBlobResult } from "@vercel/blob"

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
 * Uploads an interview recording to Vercel Blob storage under a user-specific folder.
 *
 * @param audioData - The audio data to upload.
 * @param sessionId - The interview session ID used in the filename.
 * @param userId - The user ID to organize recordings by user.
 * @returns The URL of the uploaded interview recording.
 *
 * @throws {Error} If the upload to Vercel Blob storage fails.
 */
export async function saveInterviewRecording(
  audioData: Blob | ArrayBuffer,
  sessionId: string,
  userId: string
): Promise<string> {
  try {
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
 * Retrieves all interview recording blobs for a specified user.
 *
 * @param userId - The unique identifier of the user whose recordings are to be listed.
 * @returns An array of blobs containing URLs and metadata for each interview recording.
 *
 * @throws {Error} If the listing operation fails.
 */
export async function listUserRecordings(userId: string) {
  try {
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
