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
