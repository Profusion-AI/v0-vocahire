import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Storage client with best practices
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  // Auto-retry for transient errors
  retryOptions: {
    autoRetry: true,
    maxRetries: 3,
  },
});

// Bucket initialization with validation
const UPLOADS_BUCKET_NAME = process.env.GCS_UPLOADS_BUCKET || 'vocahire-uploads';
const RECORDINGS_BUCKET_NAME = process.env.GCS_RECORDINGS_BUCKET || 'vocahire-recordings';

const uploadsBucket = storage.bucket(UPLOADS_BUCKET_NAME);
const recordingsBucket = storage.bucket(RECORDINGS_BUCKET_NAME);

// Ensure buckets exist (called during initialization)
async function ensureBucketsExist(): Promise<void> {
  try {
    const [uploadsExists] = await uploadsBucket.exists();
    if (!uploadsExists) {
      await uploadsBucket.create({
        location: 'US',
        storageClass: 'STANDARD',
      });
      console.log(`Created bucket: ${UPLOADS_BUCKET_NAME}`);
      
      // Set CORS for browser uploads
      await uploadsBucket.setCorsConfiguration([{
        origin: ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE'],
        responseHeader: ['Content-Type'],
        maxAgeSeconds: 3600,
      }]);
    }

    const [recordingsExists] = await recordingsBucket.exists();
    if (!recordingsExists) {
      await recordingsBucket.create({
        location: 'US',
        storageClass: 'STANDARD',
        lifecycle: {
          rule: [{
            action: { type: 'Delete' },
            condition: { age: 90 }, // Auto-delete recordings after 90 days
          }],
        },
      });
      console.log(`Created bucket: ${RECORDINGS_BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error ensuring buckets exist:', error);
    // Don't throw - allow app to start even if bucket creation fails
  }
}

// Initialize buckets on module load
ensureBucketsExist().catch(console.error);

export async function uploadToBlob(
  file: File | Blob,
  folder: string,
  userId?: string
): Promise<{ url: string; fileName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file instanceof File ? file.name : 'file';
  const fileName = `${folder}/${userId || 'anonymous'}/${uuidv4()}-${originalName}`;
  
  const blob = uploadsBucket.file(fileName);
  
  // Configure upload with best practices
  const stream = blob.createWriteStream({
    resumable: false, // For files < 10MB, disable resumable uploads for better performance
    metadata: {
      contentType: file.type || 'application/octet-stream',
      cacheControl: 'public, max-age=31536000', // 1 year cache for uploaded files
      metadata: {
        originalName: originalName,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    },
    validation: 'crc32c', // Enable checksum validation
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      console.error('Upload error:', err);
      reject(new Error(`Failed to upload file: ${err.message}`));
    });
    
    stream.on('finish', async () => {
      try {
        // Make the file publicly accessible
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${UPLOADS_BUCKET_NAME}/${fileName}`;
        resolve({ url: publicUrl, fileName });
      } catch (err) {
        reject(new Error(`Failed to make file public: ${err}`));
      }
    });
    
    stream.end(buffer);
  });
}

export async function saveInterviewRecording(
  audioBlob: Blob,
  sessionId: string,
  userId: string
): Promise<string> {
  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  const timestamp = Date.now();
  const fileName = `recordings/${userId}/${sessionId}-${timestamp}.webm`;
  
  const blob = recordingsBucket.file(fileName);
  const stream = blob.createWriteStream({
    resumable: true, // Use resumable for audio files which might be larger
    metadata: {
      contentType: 'audio/webm',
      contentDisposition: `attachment; filename="interview-${sessionId}-${timestamp}.webm"`,
      metadata: {
        sessionId,
        userId,
        recordedAt: new Date().toISOString(),
        size: buffer.length.toString(),
      },
    },
    validation: 'crc32c',
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      console.error('Recording upload error:', err);
      reject(new Error(`Failed to save recording: ${err.message}`));
    });
    
    stream.on('finish', async () => {
      try {
        // Generate a signed URL that expires in 7 days
        const [signedUrl] = await blob.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          // Include response headers for better UX
          responseDisposition: `attachment; filename="interview-${sessionId}.webm"`,
          responseType: 'audio/webm',
        });
        resolve(signedUrl);
      } catch (err) {
        reject(new Error(`Failed to generate signed URL: ${err}`));
      }
    });
    
    stream.end(buffer);
  });
}

export async function listUserRecordings(
  userId: string,
  limit: number = 50,
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
  // Use pagination for better performance
  const query = {
    prefix: `recordings/${userId}/`,
    maxResults: limit,
    pageToken,
  };
  
  const [files, , apiResponse] = await recordingsBucket.getFiles(query);

  const recordings = await Promise.all(
    files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        responseDisposition: `attachment; filename="${file.name.split('/').pop()}"`,
      });

      return {
        fileName: file.name,
        url: signedUrl,
        createdAt: new Date(metadata.timeCreated),
        metadata: metadata.metadata || {},
        size: parseInt(metadata.size || '0', 10),
      };
    })
  );

  // Sort by creation date (newest first)
  recordings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    recordings,
    nextPageToken: apiResponse?.nextPageToken,
  };
}

export async function deleteBlob(url: string): Promise<void> {
  // Extract file name from URL
  let fileName: string;
  let bucketName: string;
  
  try {
    if (url.includes('storage.googleapis.com')) {
      // Public URL format: https://storage.googleapis.com/bucket-name/file-path
      const match = url.match(/storage\.googleapis\.com\/([^\/]+)\/(.+)/);
      if (!match) throw new Error('Invalid public storage URL format');
      bucketName = match[1];
      fileName = match[2];
    } else if (url.includes('storage.cloud.google.com')) {
      // Signed URL format
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) throw new Error('Invalid signed URL format');
      bucketName = pathParts[0];
      fileName = pathParts.slice(1).join('/');
    } else {
      throw new Error('URL is not a recognized Google Cloud Storage URL');
    }

    // Determine which bucket to use
    const bucket = bucketName === RECORDINGS_BUCKET_NAME ? recordingsBucket : 
                   bucketName === UPLOADS_BUCKET_NAME ? uploadsBucket :
                   storage.bucket(bucketName);
    
    // Check if file exists before attempting deletion
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    
    if (!exists) {
      console.warn(`File not found for deletion: ${fileName}`);
      return; // Silent success if file doesn't exist
    }
    
    await file.delete();
    console.log(`Successfully deleted file: ${fileName}`);
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}