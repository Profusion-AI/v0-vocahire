# Production Fix Summary - May 28, 2025

## Problem: Interview Feature Not Working in Production

### Root Causes Identified

1. **"Failed to parse URL from /pipeline" Error**
   - Caused by vertexAI plugin trying to connect without proper credentials
   - The plugin was constructing a relative URL "/pipeline" instead of full URL

2. **Module-Level Initialization**
   - Genkit was initializing at module load time before environment variables were available
   - Both `/src/genkit/index.ts` and `/src/genkit/config/genkit.config.ts` had module-level exports

3. **API Key Access Issues**
   - Secret Manager was using wrong project ID (fixed earlier)
   - Module initialization prevented proper API key loading

## Fixes Applied

### 1. Removed vertexAI Plugin (Commit: 1e01e87)
- Removed vertexAI from genkit plugins
- We only need Google AI for the Live API, not Vertex AI
- This eliminates the "/pipeline" URL parsing error

### 2. Fixed Module-Level Initialization
- Changed `export const ai = getGenkit()` to lazy loading
- Changed `export const genkitApp = getGenkitApp()` to lazy loading
- Updated flow exports from constants to functions
- Added try-catch error handling around initialization

### 3. Updated Flow Definitions
- `generateInterviewQuestions`: Changed from IIFE to lazy function
- `generateInterviewFeedback`: Changed from IIFE to lazy function
- Both now return dummy flows if genkit isn't initialized

### 4. Improved Error Handling
- Better detection of API key vs other errors
- More specific error messages for debugging
- Graceful degradation when services unavailable

## Verification Steps

1. **Check API Key Setup**
   ```bash
   ./scripts/verify-google-ai-setup.sh
   ```

2. **Monitor Deployment**
   ```bash
   gcloud builds list --limit=1
   ```

3. **Check Logs After Deployment**
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="v0-vocahire"' --limit=20
   ```

4. **Test Interview Feature**
   - Go to https://vocahire.com
   - Start an interview
   - Should connect without "status: error"

## What Success Looks Like

- No more "/pipeline" errors in logs
- Interview sessions connect successfully
- Microphone permission requested and works
- Real-time transcription appears
- No "API_KEY_ERROR" in console

## If Issues Persist

1. **Update API Key**
   ```bash
   ./scripts/update-google-ai-secret.sh
   ```

2. **Force Service Update**
   ```bash
   gcloud run services update v0-vocahire \
     --region=us-central1 \
     --update-secrets=GOOGLE_AI_API_KEY=GOOGLE_AI_API_KEY:latest
   ```

3. **Check WebSocket Implementation**
   - We're using custom WebSocket client
   - May need to switch to official `@google/genai` SDK

## Next Steps

- Monitor production after deployment
- Consider switching to official Google AI SDK
- Add health check for genkit initialization
- Add monitoring for API key access failures