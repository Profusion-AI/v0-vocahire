// Stub implementation for MVP - no file storage needed
// The magic is in the real-time conversation, not recordings!

export async function uploadToBlob(
  file: File | Blob,
  folder: string,
  userId?: string
): Promise<{ url: string; fileName: string }> {
  throw new Error("File uploads are not available in the MVP. Focus on the amazing conversation experience!");
}

export async function saveInterviewRecording(
  audioBlob: Blob,
  sessionId: string,
  userId: string
): Promise<string> {
  // MVP: We save transcripts and feedback, not audio
  console.log(`Recording feature not implemented for MVP - session ${sessionId}`);
  return "";
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
  // MVP: Return empty recordings list
  return { recordings: [] };
}

export async function deleteBlob(fileName: string): Promise<void> {
  // No-op for MVP
  return;
}