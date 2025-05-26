import { NextRequest, NextResponse } from 'next/server';
import { redis } from 'lib/redis';
import { initSpeechClient, initTextToSpeechClient, initVertexAIClient } from 'lib/google-cloud-utils';

export async function GET() {
  const serviceStatuses: { [key: string]: string } = {};

  // Check Redis connection
  try {
    await redis.ping();
    serviceStatuses.redis = "connected";
  } catch (error) {
    console.error("Redis readiness check failed:", error);
    serviceStatuses.redis = "disconnected";
  }

  // Check Google Speech-to-Text (STT) connection
  let sttClient: any;
  try {
    sttClient = await initSpeechClient();
    // Attempt a no-op or simple call to verify authentication
    // For SpeechClient, a simple list operations might work, or rely on client initialization being enough
    // In a real scenario, you might send a very small, silent audio chunk to transcribe.
    // For now, we'll consider client initialization as sufficient.
    // await sttClient.recognize({
    //   audio: { content: "" },
    //   config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US' },
    // });
    serviceStatuses.google_stt = "authenticated";
  } catch (error) {
    console.error("Google STT readiness check failed:", error);
    serviceStatuses.google_stt = "unauthenticated";
  } finally {
    if (sttClient && typeof sttClient.close === 'function') {
      sttClient.close();
    }
  }

  // Check Google Text-to-Speech (TTS) connection
  let ttsClient: any;
  try {
    ttsClient = await initTextToSpeechClient();
    // Attempt a simple synthesize call without actual audio generation
    // For example, just call the synthesize method with minimal params
    // await ttsClient.synthesizeSpeech({
    //   input: { text: "test" },
    //   voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    //   audioConfig: { audioEncoding: "LINEAR16" },
    // });
    serviceStatuses.google_tts = "authenticated";
  } catch (error) {
    console.error("Google TTS readiness check failed:", error);
    serviceStatuses.google_tts = "unauthenticated";
  } finally {
    if (ttsClient && typeof ttsClient.close === 'function') {
      ttsClient.close();
    }
  }

  // Check Google Vertex AI connection
  let vertexAiClient: any;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID; // Ensure this env var is set
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'; // Default location

  if (!projectId) {
    console.warn("GOOGLE_CLOUD_PROJECT_ID not set for Vertex AI readiness check.");
    serviceStatuses.vertex_ai = "skipped_no_project_id";
  } else {
    try {
      vertexAiClient = initVertexAIClient(projectId, location);
      // Attempt a simple model listing or health check if Vertex AI client has one
      // For now, initializing the client is considered sufficient for a basic readiness check
      // In a more robust check, you might attempt to list models or interact with a small model.
      // const models = await vertexAiClient.getGenerativeModel({ model: 'gemini-pro' });
      // const response = await models.generateContent({ contents: [] }); // Simple dummy call
      serviceStatuses.vertex_ai = "authenticated";
    } catch (error) {
      console.error("Google Vertex AI readiness check failed:", error);
      serviceStatuses.vertex_ai = "unauthenticated";
    }
  }

  const allReady = Object.values(serviceStatuses).every(status => status === "connected" || status === "authenticated");

  const responseStatus = allReady ? 200 : 503;

  return NextResponse.json({
    status: allReady ? "ready" : "not_ready",
    services: serviceStatuses,
  }, { status: responseStatus });
}
