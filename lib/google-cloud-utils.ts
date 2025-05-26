// lib/google-cloud-utils.ts

import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { VertexAI } from '@google-cloud/vertexai';

// TODO: [Gemini] - Implement robust authentication handling for Cloud Run.
// In Cloud Run, authentication is typically handled automatically via the
// attached service account. We might not need to explicitly load credentials
// if the service account has the correct IAM roles. For local development,
// GOOGLE_APPLICATION_CREDENTIALS environment variable or gcloud auth might be used.

/**
 * Initializes the Google Cloud Speech-to-Text client.
 * @returns A promise that resolves with the SpeechClient instance.
 */
export const initSpeechClient = async (): Promise<SpeechClient> => {
  // TODO: [Gemini] - Add configuration options as needed (e.g., project ID, key file path for local dev).
  const client = new SpeechClient();
  return client;
};

/**
 * Initializes the Google Cloud Text-to-Speech client.
 * @returns A promise that resolves with the TextToSpeechClient instance.
 */
export const initTextToSpeechClient = async (): Promise<TextToSpeechClient> => {
  // TODO: [Gemini] - Add configuration options as needed.
  const client = new TextToSpeechClient();
  return client;
};

/**
 * Initializes the Google Cloud Vertex AI client.
 * @param projectId Your Google Cloud project ID.
 * @param location The location for your Vertex AI resources (e.g., 'us-central1').
 * @returns The VertexAI instance.
 */
export const initVertexAIClient = (projectId: string, location: string): VertexAI => {
  const vertex_ai = new VertexAI({ project: projectId, location: location });
  // TODO: [Gemini] - Add configuration options for models (e.g., Gemini 1.5 Flash) if needed during initialization.
  return vertex_ai;
};
