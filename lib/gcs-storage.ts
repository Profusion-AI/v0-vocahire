import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
});

const uploadsBucket = storage.bucket(process.env.GCS_UPLOADS_BUCKET || 'vocahire-uploads');
const recordingsBucket = storage.bucket(process.env.GCS_RECORDINGS_BUCKET || 'vocahire-recordings');

export async function uploadToBlob(
  file: File | Blob,
  folder: string,
  userId?: string
): Promise<{ url: string; fileName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file instanceof File ? file.name : 'file';
  const fileName = `${folder}/${userId || 'anonymous'}/${uuidv4()}-${originalName}`;
  
  const blob = uploadsBucket.file(fileName);
  const stream = blob.createWriteStream({
    metadata: {
      contentType: file.type,
      metadata: {
        originalName: originalName,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', async () => {
      // Make the file publicly accessible
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${uploadsBucket.name}/${fileName}`;
      resolve({ url: publicUrl, fileName });
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
  const fileName = `recordings/${userId}/${sessionId}-${Date.now()}.webm`;
  
  const blob = recordingsBucket.file(fileName);
  const stream = blob.createWriteStream({
    metadata: {
      contentType: 'audio/webm',
      metadata: {
        sessionId,
        userId,
        recordedAt: new Date().toISOString(),
      },
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', async () => {
      // Generate a signed URL that expires in 7 days
      const [signedUrl] = await blob.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      resolve(signedUrl);
    });
    stream.end(buffer);
  });
}

export async function listUserRecordings(userId: string): Promise<Array<{
  fileName: string;
  url: string;
  createdAt: Date;
  metadata: any;
}>> {
  const [files] = await recordingsBucket.getFiles({
    prefix: `recordings/${userId}/`,
  });

  const recordings = await Promise.all(
    files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      return {
        fileName: file.name,
        url: signedUrl,
        createdAt: new Date(metadata.timeCreated),
        metadata: metadata.metadata,
      };
    })
  );

  return recordings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteBlob(url: string): Promise<void> {
  // Extract file name from URL
  let fileName: string;
  
  if (url.includes('storage.googleapis.com')) {
    // Public URL format
    const match = url.match(/storage\.googleapis\.com\/[^\/]+\/(.+)/);
    fileName = match?.[1] || '';
  } else if (url.includes('storage.cloud.google.com')) {
    // Signed URL format
    const urlObj = new URL(url);
    fileName = urlObj.pathname.split('/').slice(2).join('/');
  } else {
    throw new Error('Invalid storage URL');
  }

  // Determine which bucket based on the path
  const bucket = fileName.startsWith('recordings/') ? recordingsBucket : uploadsBucket;
  
  await bucket.file(fileName).delete();
}