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

// Export for backward compatibility
export const ai = getGenkit();

// Export other modules that don't require initialization
export * from './flows';
export * from './models';
export * from './prompts';
export * from './tools';