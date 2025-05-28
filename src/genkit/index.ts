import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    }),
    vertexAI({
      projectId: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
    }),
  ],
});

export * from './flows';
export * from './models';
export * from './prompts';
export * from './tools';