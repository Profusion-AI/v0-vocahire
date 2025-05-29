import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// REMOVED vertexAI import - it's causing the /pipeline error in production

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
// Users should call getGenkit() when they need it

// Export other modules that don't require initialization
export * from './flows';
export * from './models';
export * from './prompts';
export * from './tools';