/**
 * Type definitions for Google AI integration in VocaHire
 * Extends and re-exports types from @google/generative-ai
 */

import type {
  SchemaType,
  Schema,
  FunctionDeclaration,
  Tool,
  FunctionDeclarationsTool,
  GoogleSearchRetrievalTool,
  CodeExecutionTool,
  GenerationConfig,
  Content,
  Part,
  FunctionCall,
  FunctionResponse,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeContentBlob,
} from '@google/generative-ai';

// Re-export all types for convenience
export type {
  SchemaType,
  Schema,
  FunctionDeclaration,
  Tool,
  FunctionDeclarationsTool,
  GoogleSearchRetrievalTool,
  CodeExecutionTool,
  GenerationConfig,
  Content,
  Part,
  FunctionCall,
  FunctionResponse,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeContentBlob,
};

// VocaHire-specific extensions

/**
 * Extended generation config for Live API with audio support
 */
export interface LiveAPIGenerationConfig extends Partial<GenerationConfig> {
  response_modalities?: string[];
  speech_config?: {
    voice_config?: {
      prebuilt_voice_config?: {
        voice_name?: string;
      };
    };
  };
}

/**
 * Live API message types
 */
export type LiveAPIMessageType = 'audio' | 'text' | 'function_call' | 'function_response' | 'control';

/**
 * WebSocket message structure for Live API
 */
export interface LiveAPIWebSocketMessage {
  setup?: {
    model: string;
    generation_config?: LiveAPIGenerationConfig;
    system_instruction?: { parts: { text: string }[] };
    tools?: Tool[];
    output_audio_transcription?: {};
    input_audio_transcription?: {};
  };
  realtimeInput?: {
    mediaChunks: Array<{
      mimeType: string;
      data: string;
    }>;
  };
  clientContent?: {
    turns?: Array<{
      role: string;
      parts: Part[];
    }>;
    turnComplete?: boolean;
  };
}