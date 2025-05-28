import { EventEmitter } from 'events';
import { VertexAI } from '@google-cloud/vertexai';
import type { GenerativeModel, Content } from '@google-cloud/vertexai';

export interface VertexAILiveConfig {
  projectId: string;
  location: string;
  model?: string;
  systemInstruction?: string;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface LiveAPIMessage {
  type: 'audio' | 'text' | 'function_call' | 'function_response' | 'control';
  data: any;
}

/**
 * Vertex AI client for real-time conversation
 * Note: Vertex AI doesn't support WebSocket streaming like Google AI Studio
 * This implementation uses REST API with streaming responses
 */
export class VertexAILiveClient extends EventEmitter {
  private vertexAI: VertexAI;
  private model: GenerativeModel;
  private config: VertexAILiveConfig;
  private isConnected = false;
  private conversationHistory: Content[] = [];

  constructor(config: VertexAILiveConfig) {
    super();
    this.config = config;
    
    // Initialize Vertex AI
    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.location,
    });

    // Get the model - using Gemini 1.5 Pro as it's available in Vertex AI
    this.model = this.vertexAI.getGenerativeModel({
      model: config.model || 'gemini-1.5-pro-002',
      generationConfig: config.generationConfig,
      systemInstruction: config.systemInstruction ? {
        role: 'system',
        parts: [{ text: config.systemInstruction }]
      } : undefined,
    });
  }

  async connect(): Promise<void> {
    // Vertex AI doesn't require a persistent connection
    // It uses REST API calls
    this.isConnected = true;
    this.emit('ready');
  }

  async sendText(text: string): Promise<void> {
    if (!this.isConnected) {
      console.warn('Cannot send text: Client not connected');
      return;
    }

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text }]
      });

      // Start streaming chat
      const chat = this.model.startChat({
        history: this.conversationHistory.slice(0, -1), // Exclude the current message
      });

      const result = await chat.sendMessageStream(text);

      let fullResponse = '';
      
      // Process streaming response
      for await (const chunk of result.stream) {
        const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
        fullResponse += chunkText;
        
        // Emit partial response
        this.emit('transcript', { 
          type: 'ai', 
          text: chunkText,
          isPartial: true 
        });
      }

      // Add AI response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: fullResponse }]
      });

      // Emit complete response
      this.emit('transcript', { 
        type: 'ai', 
        text: fullResponse,
        isPartial: false 
      });

      this.emit('turnComplete');
    } catch (error) {
      console.error('Error sending text to Vertex AI:', error);
      this.emit('error', error);
    }
  }

  async sendAudio(_audioData: ArrayBuffer): Promise<void> {
    // Note: Vertex AI doesn't support real-time audio streaming like Google AI Studio
    // For audio support, you would need to:
    // 1. Convert audio to text using Speech-to-Text API
    // 2. Send the text to Vertex AI
    // 3. Convert response to audio using Text-to-Speech API
    
    console.warn('Audio streaming not directly supported by Vertex AI. Consider using Speech-to-Text API first.');
    this.emit('error', new Error('Audio streaming not supported in Vertex AI mode'));
  }

  interrupt(): void {
    // Vertex AI doesn't support interruption in the same way
    // You would need to cancel any pending requests
    console.log('Interrupt called - cancelling pending requests');
  }

  disconnect(): void {
    this.isConnected = false;
    this.conversationHistory = [];
    this.emit('disconnected');
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  // Utility method to clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }
}