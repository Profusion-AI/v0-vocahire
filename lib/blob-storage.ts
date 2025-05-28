// TEMPORARY: Blob storage disabled for Cloud Run deployment
// This file was using @vercel/blob which is not available on Cloud Run
// TODO: Implement alternative storage solution (Google Cloud Storage or similar)

/**
 * Temporary stub for blob storage functionality
 * All functions throw errors to prevent usage until proper implementation
 */

export async function uploadToBlob(): Promise<never> {
  throw new Error("Blob storage not implemented for Cloud Run. Please use Google Cloud Storage or another solution.")
}

export async function saveInterviewRecording(): Promise<never> {
  throw new Error("Interview recording storage not implemented for Cloud Run. Please use Google Cloud Storage or another solution.")
}

export async function listUserRecordings(): Promise<never> {
  throw new Error("Recording listing not implemented for Cloud Run. Please use Google Cloud Storage or another solution.")
}

export async function deleteBlob(): Promise<never> {
  throw new Error("Blob deletion not implemented for Cloud Run. Please use Google Cloud Storage or another solution.")
}