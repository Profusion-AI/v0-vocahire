import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import evaluator from '@genkit-ai/evaluator';
import { logger } from 'genkit/logging';
import { GenkitMetric } from '@genkit-ai/evaluator';

logger.setLogLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'info');
enableFirebaseTelemetry();

export const genkitApp = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    }),
    vertexAI({
      projectId: process.env.GOOGLE_PROJECT_ID!,
      location: 'us-central1',
    }),
    evaluator({
      metrics: [GenkitMetric.MALICIOUSNESS],
    }),
  ],
});
