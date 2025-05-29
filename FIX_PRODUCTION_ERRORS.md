# Production Error Fix Guide

## Issues Identified

### 1. "Failed to parse URL from /pipeline" Error

**Root Cause**: The genkit configuration is trying to initialize without proper environment variables, causing URL parsing errors.

**Location**: `/src/genkit/index.ts` and `/src/genkit/config/genkit.config.ts`

### 2. GOOGLE_AI_API_KEY Access Issue

**Root Cause**: Wrong project ID in secret-manager.ts (was using 'vocahire-prod-20810233' instead of 'vocahire-prod')

**Fixed**: Already updated in `/lib/secret-manager.ts`

### 3. Missing OPENAI_API_KEY for Enhanced Feedback

**Root Cause**: Enhanced feedback feature uses OpenAI API but the key is not configured in production

**Location**: `/lib/enhancedFeedback.ts`

## Fixes to Apply

### Fix 1: Make Genkit Initialization Defensive

The genkit config should not initialize at module level without checking environment variables first.

**File**: `/src/genkit/index.ts`
```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

// Only initialize if we have the required environment variables
let ai: any = null;

export function getGenkit() {
  if (!ai) {
    // Check for required environment variables
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn('GOOGLE_AI_API_KEY not found, Genkit AI features will be disabled');
      return null;
    }

    ai = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GOOGLE_AI_API_KEY,
        }),
        // Only add vertexAI if we have the project ID
        ...(process.env.GOOGLE_PROJECT_ID ? [
          vertexAI({
            projectId: process.env.GOOGLE_PROJECT_ID,
            location: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
          })
        ] : []),
      ],
    });
  }
  return ai;
}

// Export other modules that don't require initialization
export * from './flows';
export * from './models';
export * from './prompts';
export * from './tools';
```

### Fix 2: Update Genkit Config Similarly

**File**: `/src/genkit/config/genkit.config.ts`
```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import evaluator from '@genkit-ai/evaluator';
import { logger } from 'genkit/logging';
import { GenkitMetric } from '@genkit-ai/evaluator';

logger.setLogLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'info');

// Only enable telemetry if we're properly configured
if (process.env.GOOGLE_PROJECT_ID) {
  enableFirebaseTelemetry();
}

// Lazy initialization
let genkitAppInstance: any = null;

export function getGenkitApp() {
  if (!genkitAppInstance && process.env.GOOGLE_AI_API_KEY) {
    genkitAppInstance = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GOOGLE_AI_API_KEY,
        }),
        ...(process.env.GOOGLE_PROJECT_ID ? [
          vertexAI({
            projectId: process.env.GOOGLE_PROJECT_ID,
            location: 'us-central1',
          }),
          evaluator({
            metrics: [GenkitMetric.MALICIOUSNESS],
          })
        ] : []),
      ],
    });
  }
  return genkitAppInstance;
}

// For backward compatibility
export const genkitApp = getGenkitApp();
```

### Fix 3: Add OPENAI_API_KEY to Secret Manager

```bash
# Create the secret
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create OPENAI_API_KEY \
  --project=vocahire-prod \
  --replication-policy="automatic" \
  --data-file=-

# Update Cloud Run service to use it
gcloud run services update v0-vocahire \
  --region=us-central1 \
  --update-secrets=OPENAI_API_KEY=OPENAI_API_KEY:latest
```

### Fix 4: Make Enhanced Feedback More Robust

**File**: `/lib/enhancedFeedback.ts`
```typescript
// At the top of generateEnhancedInterviewFeedback function
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not configured, enhanced feedback unavailable");
  throw new Error("Enhanced feedback service temporarily unavailable");
}
```

## Deployment Steps

1. Apply code fixes locally
2. Test locally with proper environment variables
3. Commit and push to trigger Cloud Build
4. Add OPENAI_API_KEY to Secret Manager (if using enhanced feedback)
5. Update Cloud Run service configuration
6. Monitor logs for successful deployment

## Verification

After deployment, verify:
1. No more "Failed to parse URL from /pipeline" errors
2. Interview sessions can connect successfully
3. Enhanced feedback works (if OPENAI_API_KEY is configured)
4. Health checks pass without errors