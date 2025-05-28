// Storage implementation with fallback for MVP
import { isStorageConfigured } from './storage-config';

// If GCS is configured, use it. Otherwise, provide stub functions.
if (isStorageConfigured()) {
  // Use Google Cloud Storage
  module.exports = require('./gcs-storage');
} else {
  // Provide stub functions for MVP
  export async function uploadToBlob(): Promise<{ url: string; fileName: string }> {
    throw new Error("File storage not configured. Set up Google Cloud Storage environment variables.");
  }

  export async function saveInterviewRecording(): Promise<string> {
    throw new Error("Recording storage not configured. Set up Google Cloud Storage environment variables.");
  }

  export async function listUserRecordings(): Promise<any[]> {
    // Return empty array for MVP
    return [];
  }

  export async function deleteBlob(): Promise<void> {
    // No-op for MVP
    return;
  }
}