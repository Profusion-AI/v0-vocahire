// Storage configuration
// For MVP, we'll gracefully handle missing GCS setup

export const STORAGE_ENABLED = process.env.GOOGLE_PROJECT_ID && 
  (process.env.GCS_UPLOADS_BUCKET || process.env.GCS_RECORDINGS_BUCKET);

export const STORAGE_CONFIG = {
  uploadsEnabled: STORAGE_ENABLED && !!process.env.GCS_UPLOADS_BUCKET,
  recordingsEnabled: STORAGE_ENABLED && !!process.env.GCS_RECORDINGS_BUCKET,
  uploadsBucket: process.env.GCS_UPLOADS_BUCKET || 'vocahire-uploads',
  recordingsBucket: process.env.GCS_RECORDINGS_BUCKET || 'vocahire-recordings',
};

// Helper to check if storage is available
export function isStorageConfigured(): boolean {
  return STORAGE_ENABLED === true;
}