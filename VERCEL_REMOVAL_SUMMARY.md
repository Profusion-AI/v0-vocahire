# Vercel References Removal Summary

**Date**: May 28, 2025
**Purpose**: Remove Vercel-specific code to prevent 404 errors on Cloud Run deployment

## Changes Made

### 1. Package.json Updates
- Commented out `@vercel/blob` dependency
- Commented out `build:vercel` script

### 2. Blob Storage Disabled
- Replaced `/lib/blob-storage.ts` with stub functions that throw errors
- This prevents the `/api/upload` and `/api/recordings` routes from attempting to use Vercel Blob storage
- TODO: Implement Google Cloud Storage as replacement

### 3. Scripts Deprecated
- Renamed `scripts/add-vercel-ips.js` → `scripts/add-vercel-ips.js.deprecated`
- Renamed `scripts/build-vercel-safe.sh` → `scripts/build-vercel-safe.sh.deprecated`

## Next Steps

To fully restore file upload functionality:

1. **Implement Google Cloud Storage**
   - Create a new `/lib/gcs-storage.ts` file
   - Use `@google-cloud/storage` package
   - Maintain same function signatures as blob-storage.ts

2. **Update Environment Variables**
   - Add `GOOGLE_CLOUD_STORAGE_BUCKET` 
   - Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set

3. **Test Routes**
   - `/api/upload` - General file uploads
   - `/api/recordings` - Interview recording uploads

## Temporary Impact

- File upload features are disabled
- Interview recordings cannot be saved
- These routes will return error messages until GCS is implemented