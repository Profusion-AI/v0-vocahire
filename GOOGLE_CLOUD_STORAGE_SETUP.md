# Google Cloud Storage Setup for VocaHire

This guide will help you set up Google Cloud Storage to replace Vercel Blob storage for file uploads and interview recordings.

## Prerequisites

- Google Cloud Project (already have: vocahire-prod)
- `gcloud` CLI installed and authenticated
- Service account with Storage permissions

## Step 1: Create a Storage Bucket

```bash
# Create a bucket for VocaHire files
gcloud storage buckets create gs://vocahire-uploads \
  --project=vocahire-prod \
  --location=us-central1 \
  --uniform-bucket-level-access

# Create a bucket for interview recordings (optional separate bucket)
gcloud storage buckets create gs://vocahire-recordings \
  --project=vocahire-prod \
  --location=us-central1 \
  --uniform-bucket-level-access
```

## Step 2: Set Bucket Permissions

```bash
# Make uploaded files publicly readable (if needed for resumes)
gcloud storage buckets add-iam-policy-binding gs://vocahire-uploads \
  --member=allUsers \
  --role=roles/storage.objectViewer

# Keep recordings private (only accessible via signed URLs)
# No public access needed for vocahire-recordings bucket
```

## Step 3: Install Google Cloud Storage SDK

```bash
cd /Users/kylegreenwell/Desktop/vocahire-prod/v0-vocahire
pnpm add @google-cloud/storage
```

## Step 4: Create Google Cloud Storage Implementation

Create a new file `lib/gcs-storage.ts`:

```typescript
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
});

const uploadsBucket = storage.bucket(process.env.GCS_UPLOADS_BUCKET || 'vocahire-uploads');
const recordingsBucket = storage.bucket(process.env.GCS_RECORDINGS_BUCKET || 'vocahire-recordings');

export async function uploadToGCS(
  file: File | Blob,
  folder: string,
  userId: string
): Promise<{ url: string; fileName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${folder}/${userId}/${uuidv4()}-${file.name || 'file'}`;
  
  const blob = uploadsBucket.file(fileName);
  const stream = blob.createWriteStream({
    metadata: {
      contentType: file.type,
      metadata: {
        originalName: file.name || 'unknown',
        uploadedBy: userId,
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
```

## Step 5: Update Environment Variables

Add to `.env.local`:

```env
# Google Cloud Storage
GOOGLE_PROJECT_ID=vocahire-prod
GCS_UPLOADS_BUCKET=vocahire-uploads
GCS_RECORDINGS_BUCKET=vocahire-recordings
```

## Step 6: Update blob-storage.ts

Replace the stub implementation with the GCS implementation:

```typescript
// lib/blob-storage.ts
export * from './gcs-storage';
```

## Step 7: Service Account Permissions

The Cloud Run service account needs Storage permissions:

```bash
# Grant Storage Admin to the Cloud Run service account
gcloud projects add-iam-policy-binding vocahire-prod \
  --member="serviceAccount:727828254616-compute@developer.gserviceaccount.com" \
  --role="roles/storage.admin"
```

## Step 8: CORS Configuration (Optional)

If you need direct browser uploads, configure CORS:

```json
// cors-config.json
[
  {
    "origin": ["https://vocahire.com", "https://www.vocahire.com"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS:
```bash
gcloud storage buckets update gs://vocahire-uploads --cors-file=cors-config.json
gcloud storage buckets update gs://vocahire-recordings --cors-file=cors-config.json
```

## Step 9: Update the Routes

After implementing GCS, update the routes to remove the "not implemented" responses and use the actual storage functions.

## Benefits of Google Cloud Storage

1. **Integrated with Cloud Run** - No additional authentication needed
2. **Scalable** - Handles any file size and volume
3. **Cost-effective** - Pay only for what you use
4. **Signed URLs** - Secure temporary access to private files
5. **Global CDN** - Fast access worldwide
6. **Lifecycle policies** - Auto-delete old files to save costs

## Cost Optimization

Set lifecycle rules to delete old recordings:

```bash
# Delete recordings older than 30 days
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 30,
          "matchesPrefix": ["recordings/"]
        }
      }
    ]
  }
}
EOF

gcloud storage buckets update gs://vocahire-recordings --lifecycle-file=lifecycle.json
```

## Testing

Test the implementation locally:

```bash
# Set up Application Default Credentials
gcloud auth application-default login

# Test in development
pnpm dev
```

The implementation will automatically use your local credentials in development and the service account in production.