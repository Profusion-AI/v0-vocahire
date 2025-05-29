# Comprehensive Production Fix Analysis

## Root Cause Analysis

### 1. The "/pipeline" Error
- **NOT** from our code directly
- Coming from genkit/vertexAI initialization trying to access Vertex AI endpoint
- vertexAI plugin is trying to construct a URL like `https://[region]-[endpoint]/pipeline`
- But without proper project ID/credentials, it's constructing a relative URL "/pipeline"

### 2. Module-Level Initialization Issues
Multiple files are initializing at module load time:
- `/src/genkit/index.ts` line 35: `export const ai = getGenkit();`
- `/src/genkit/config/genkit.config.ts` line 42: `export const genkitApp = getGenkitApp();`

This causes initialization before environment variables are available.

### 3. Wrong SDK for Live API
- Documentation uses `@google/genai` package
- We're using `@google/generative-ai` package
- Our custom WebSocket implementation might not match Google's API expectations

### 4. Secret Manager Access
- Already fixed: Project ID was wrong
- But API key might not be accessible during module initialization

## Comprehensive Fix Plan

### Fix 1: Remove ALL Module-Level Initializations

**File: /src/genkit/index.ts**
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

    try {
      ai = genkit({
        plugins: [
          googleAI({
            apiKey: process.env.GOOGLE_AI_API_KEY,
          }),
          // REMOVED vertexAI plugin - it's causing the /pipeline error
        ],
      });
    } catch (error) {
      console.error('Failed to initialize genkit:', error);
      return null;
    }
  }
  return ai;
}

// DO NOT export const ai here - it causes module-level initialization

// Export other modules that don't require initialization
export * from './flows';
export * from './models';
export * from './prompts';
export * from './tools';
```

### Fix 2: Update Config Similarly

**File: /src/genkit/config/genkit.config.ts**
```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// REMOVED vertexAI import - we don't need it for MVP
import { logger } from 'genkit/logging';

logger.setLogLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'info');

// Lazy initialization
let genkitAppInstance: any = null;

export function getGenkitApp() {
  if (!genkitAppInstance) {
    // Check for required environment variables
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn('GOOGLE_AI_API_KEY not found, Genkit features disabled');
      return null;
    }

    try {
      genkitAppInstance = genkit({
        plugins: [
          googleAI({
            apiKey: process.env.GOOGLE_AI_API_KEY,
          }),
        ],
      });
    } catch (error) {
      console.error('Failed to initialize genkit app:', error);
      return null;
    }
  }
  return genkitAppInstance;
}

// DO NOT export genkitApp constant
```

### Fix 3: Update Flow Definitions

**File: /src/genkit/flows/generate-feedback.flow.ts**
```typescript
import { z } from 'zod';
import { getGenkit } from '..';
import { gemini15Pro } from '@genkit-ai/googleai';

// Schema definitions...

// Lazy flow definition
let generateFeedbackFlowInstance: any = null;

export function generateFeedbackFlow() {
  if (!generateFeedbackFlowInstance) {
    const ai = getGenkit();
    if (!ai) {
      // Return a dummy flow that throws an error
      return {
        run: async () => {
          throw new Error('Genkit not initialized - GOOGLE_AI_API_KEY missing');
        }
      };
    }

    generateFeedbackFlowInstance = ai.defineFlow({
      name: 'generateFeedback',
      inputSchema: feedbackInputSchema,
      outputSchema: feedbackOutputSchema,
      // ... rest of flow definition
    });
  }
  return generateFeedbackFlowInstance;
}
```

### Fix 4: Install Correct SDK (if needed)

```bash
# Remove current implementation
rm lib/google-live-api.ts
rm lib/google-ai-utils.ts

# Install Google's official SDK
pnpm add @google/genai

# Update imports to use official SDK
```

### Fix 5: Update Session Route

**File: /app/api/interview-v2/session/route.ts**
```typescript
// At the top, ensure we're getting the API key properly
import { getSecret } from '@/lib/secret-manager';

export async function POST(request: NextRequest) {
  try {
    // Get API key first
    let apiKey: string;
    try {
      apiKey = await getSecret('GOOGLE_AI_API_KEY');
      if (!apiKey) {
        throw new Error('API key not found in Secret Manager');
      }
    } catch (error) {
      console.error('[API Route] Failed to get API key:', error);
      // Return proper error response
      return new Response(
        JSON.stringify({
          error: {
            code: 'API_KEY_ERROR',
            message: 'Unable to access Google AI API key'
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Continue with session creation...
  }
}
```

## Deployment Strategy

1. **Test Locally First**
   ```bash
   # Set environment variable
   export GOOGLE_AI_API_KEY="your-key"
   # Run dev server
   pnpm dev
   # Test interview feature
   ```

2. **Commit Fixes Incrementally**
   - First: Fix module-level initializations
   - Second: Remove vertexAI plugin
   - Third: Update flow definitions
   - Fourth: Test and deploy

3. **Monitor Deployment**
   ```bash
   # Watch logs during deployment
   gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=v0-vocahire" --format="value(textPayload)"
   ```

## Verification Checklist

- [ ] No "/pipeline" errors in logs
- [ ] No module initialization errors
- [ ] Interview sessions connect successfully
- [ ] Transcripts are captured
- [ ] Feedback is generated
- [ ] No "API_KEY_ERROR" responses

## Why This Will Work

1. **Removes vertexAI** - The source of "/pipeline" error
2. **Lazy initialization** - No module-level code execution
3. **Proper error handling** - Graceful degradation
4. **API key validation** - Fails fast with clear errors
5. **Simplified architecture** - Uses only Google AI, not Vertex AI