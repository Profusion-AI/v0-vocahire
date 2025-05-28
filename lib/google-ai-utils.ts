/**
 * Utility functions for Google Generative AI integration
 * Uses official @google/generative-ai package types and utilities
 */

import type {
  Content,
  Part,
  FunctionCall,
  FunctionResponse,
  GenerativeContentBlob,
} from '@google/generative-ai';

/**
 * Convert ArrayBuffer to base64 string
 * @param buffer - The ArrayBuffer to convert
 * @returns Base64 encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 * @param base64 - The base64 string to convert
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Create a text part for Content
 * @param text - The text content
 * @returns Part object
 */
export function createTextPart(text: string): Part {
  return { text };
}

/**
 * Create an inline data part for Content
 * @param mimeType - MIME type of the data
 * @param data - Base64 encoded data
 * @returns Part object
 */
export function createInlineDataPart(mimeType: string, data: string): Part {
  const inlineData: GenerativeContentBlob = { mimeType, data };
  return { inlineData };
}

/**
 * Create a function call part
 * @param name - Function name
 * @param args - Function arguments
 * @returns Part object
 */
export function createFunctionCallPart(name: string, args: object): Part {
  const functionCall: FunctionCall = { name, args };
  return { functionCall };
}

/**
 * Create a function response part
 * @param name - Function name
 * @param response - Function response
 * @returns Part object
 */
export function createFunctionResponsePart(name: string, response: object): Part {
  const functionResponse: FunctionResponse = { name, response };
  return { functionResponse };
}

/**
 * Create Content object for a role
 * @param role - The role (user, model, etc.)
 * @param parts - Array of parts
 * @returns Content object
 */
export function createContent(role: string, parts: Part[]): Content {
  return { role, parts };
}

/**
 * Helper to create audio content for Live API
 * @param audioData - ArrayBuffer of audio data
 * @param mimeType - MIME type (default: audio/pcm;rate=16000)
 * @returns Content object
 */
export function createAudioContent(
  audioData: ArrayBuffer,
  mimeType: string = 'audio/pcm;rate=16000'
): Content {
  const base64Audio = arrayBufferToBase64(audioData);
  return createContent('user', [
    createInlineDataPart(mimeType, base64Audio)
  ]);
}

/**
 * Validate if a Tool array is properly formatted
 * @param tools - Array of tools to validate
 * @returns boolean indicating if tools are valid
 */
export function validateTools(tools: any[]): boolean {
  if (!Array.isArray(tools)) return false;
  
  return tools.every(tool => {
    // Check for FunctionDeclarationsTool
    if ('functionDeclarations' in tool) {
      return Array.isArray(tool.functionDeclarations) &&
        tool.functionDeclarations.every((fd: any) => 
          typeof fd.name === 'string'
        );
    }
    // Check for GoogleSearchRetrievalTool
    if ('googleSearch' in tool) {
      return typeof tool.googleSearch === 'object';
    }
    // Check for CodeExecutionTool
    if ('codeExecution' in tool) {
      return typeof tool.codeExecution === 'object';
    }
    return false;
  });
}