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

// DO NOT export genkitApp constant - it causes module-level initialization
