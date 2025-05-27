import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';
import { firebase } from '@genkit-ai/firebase';
import { nextAdapter } from '@genkit-ai/next';
import { evaluator } from '@genkit-ai/evaluator';

export const initGenKit = () => {
  return configureGenkit({
    plugins: [
      googleAI({
        apiKey: process.env.GOOGLE_AI_API_KEY!,
      }),
      vertexAI({
        projectId: process.env.GOOGLE_PROJECT_ID!,
        location: 'us-central1',
      }),
      firebase(),
      nextAdapter(),
      evaluator(),
    ],
    flowStateStore: firebase({
      collectionName: 'genkit-flow-states',
    }),
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    telemetry: {
      provider: 'google-cloud',
      projectId: process.env.GOOGLE_PROJECT_ID!,
    },
  });
};