// Storage implementation with fallback for MVP
import { isStorageConfigured } from './storage-config';

// Define functions that will either use GCS or provide stub implementations
export async function uploadToBlob(
  file: File | Blob,
  folder: string,
  userId?: string
): Promise<{ url: string; fileName: string }> {
  if (isStorageConfigured()) {
    const { uploadToBlob: gcsUploadToBlob } = await import('./gcs-storage');
    return gcsUploadToBlob(file, folder, userId);
  } else {
    throw new Error("File storage not configured. Set up Google Cloud Storage environment variables.");
  }
}

export async function saveInterviewRecording(
  audioBlob: Blob,
  sessionId: string,
  userId: string
): Promise<string> {
  if (isStorageConfigured()) {
    const { saveInterviewRecording: gcsSaveInterviewRecording } = await import('./gcs-storage');
    return gcsSaveInterviewRecording(audioBlob, sessionId, userId);
  } else {
    throw new Error("Recording storage not configured. Set up Google Cloud Storage environment variables.");
  }
}

export async function listUserRecordings(
  userId: string,
  limit?: number,
  pageToken?: string
): Promise<{
  recordings: Array<{
    fileName: string;
    url: string;
    createdAt: Date;
    metadata: any;
    size: number;
  }>;
  nextPageToken?: string;
}> {
  if (isStorageConfigured()) {
    const { listUserRecordings: gcsListUserRecordings } = await import('./gcs-storage');
    return gcsListUserRecordings(userId, limit, pageToken);
  } else {
    // Return empty result for MVP when not configured
    return { recordings: [] };
  }
}

export async function deleteBlob(fileName: string): Promise<void> {
  if (isStorageConfigured()) {
    const { deleteBlob: gcsDeleteBlob } = await import('./gcs-storage');
    return gcsDeleteBlob(fileName);
  } else {
    // No-op for MVP when not configured
    return;
  }
}
