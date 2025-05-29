import { EventEmitter } from 'events';
import { SchemaType } from '@google/generative-ai';
import type { 
  Schema,
  FunctionDeclaration,
  Tool,
  GenerationConfig
} from '@google/generative-ai';
import { arrayBufferToBase64, base64ToArrayBuffer } from './google-ai-utils';

// Import WebSocket for Node.js environment
import ws from 'ws';

// Use a type-safe approach for WebSocket
const WebSocketImpl: any = typeof window === 'undefined' ? ws : global.WebSocket;

// Re-export types and enums for backward compatibility
export { SchemaType };
export type { Schema, FunctionDeclaration, Tool };

export interface LiveAPIConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: Partial<GenerationConfig> & {
    response_modalities?: string[];
    speech_config?: {
      voice_config?: {
        prebuilt_voice_config?: {
          voice_name?: string;
        };
      };
    };
  };
  tools?: Tool[];
  responseModality?: 'AUDIO' | 'TEXT';
}

export interface LiveAPIMessage {
  type: 'audio' | 'text' | 'function_call' | 'function_response' | 'control';
  data: any;
}

export class GoogleLiveAPIClient extends EventEmitter {
  private ws: any = null;
  private config: LiveAPIConfig;
  private audioBuffer: ArrayBuffer[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;
  private currentModel: string | null = null;
  private modelFallbackAttempted = false;
  private lastSentTimestamp?: number;
  private lastSentSequenceNumber?: number;

  constructor(config: LiveAPIConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl();
        this.ws = new WebSocketImpl(wsUrl);
        this.ws!.binaryType = 'arraybuffer';

        this.ws!.onopen = () => {
          console.log('Live API WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.sendInitialSetup();
          resolve();
        };

        this.ws!.onmessage = (event: any) => {
          this.handleMessage(event);
        };

        this.ws!.onerror = (error: any) => {
          console.error('Live API WebSocket error:', error);
          
          // Try fallback model if native audio model fails and we haven't tried already
          if (!this.modelFallbackAttempted && !this.currentModel) {
            console.log('Native audio model failed, attempting fallback to gemini-2.0-flash-live-001');
            this.modelFallbackAttempted = true;
            this.currentModel = 'models/gemini-2.0-flash-live-001';
            this.ws = null;
            // Retry connection with fallback model
            this.connect().catch((fallbackError) => {
              console.error('Fallback model also failed:', fallbackError);
              this.emit('error', error);
            });
            return;
          }
          
          this.emit('error', error);
        };

        this.ws!.onclose = () => {
          console.log('Live API WebSocket disconnected');
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildWebSocketUrl(): string {
    // Use current model if set (for fallback), otherwise use config or default
    const _model = this.currentModel || this.config.model || 'models/gemini-2.5-flash-preview-native-audio-dialog';
    const baseUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
    return `${baseUrl}?key=${this.config.apiKey}`;
  }

  private sendInitialSetup(): void {
    if (!this.ws || this.ws.readyState !== 1) return; // 1 = OPEN

    const setupMessage: any = {
      setup: {
        model: this.currentModel || this.config.model || 'models/gemini-2.5-flash-preview-native-audio-dialog',
        generationConfig: {
          responseModalities: [this.config.responseModality || 'AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede'
              }
            }
          },
          ...this.config.generationConfig
        },
        // Enable transcription for audio output
        outputAudioTranscription: {},
        // Enable transcription for audio input
        inputAudioTranscription: {}
      }
    };

    if (this.config.systemInstruction) {
      (setupMessage.setup as any).systemInstruction = this.config.systemInstruction;
    }

    if (this.config.tools) {
      (setupMessage.setup as any).tools = this.config.tools;
    }

    this.send(setupMessage);
  }

  private handleMessage(event: any): void {
    try {
      if (typeof event.data === 'string') {
        const message = JSON.parse(event.data);
        this.processServerMessage(message);
      } else if (event.data instanceof ArrayBuffer) {
        // Handle binary audio data
        this.emit('audioData', event.data);
      }
    } catch (error) {
      console.error('Error handling Live API message:', error);
      this.emit('error', error);
    }
  }

  private processServerMessage(message: any): void {
    if (message.setupComplete) {
      this.emit('ready');
    } else if (message.serverContent) {
      const content = message.serverContent;
      
      if (content.modelTurn) {
        const parts = content.modelTurn.parts;
        parts.forEach((part: any) => {
          if (part.text) {
            // Text response
            this.emit('text', part.text, this.lastSentTimestamp, this.lastSentSequenceNumber);
          } else if (part.inlineData) {
            const audioData = base64ToArrayBuffer(part.inlineData.data);
            this.emit('audio', audioData, this.lastSentTimestamp, this.lastSentSequenceNumber);
          } else if (part.functionCall) {
            this.emit('functionCall', part.functionCall);
          }
        });
      }
      
      // Handle transcriptions
      if (content.outputTranscription) {
        this.emit('transcript', {
          type: 'ai',
          text: content.outputTranscription.text,
        }, this.lastSentTimestamp, this.lastSentSequenceNumber);
      }
      
      if (content.inputTranscription) {
        this.emit('transcript', {
          type: 'user',
          text: content.inputTranscription.text,
        }, this.lastSentTimestamp, this.lastSentSequenceNumber);
      }

      if (content.turnComplete) {
        this.emit('turnComplete');
      }
    }
  }

  sendAudio(audioData: ArrayBuffer, timestamp?: number, sequenceNumber?: number): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send audio: WebSocket not connected');
      return;
    }

    const base64Audio = arrayBufferToBase64(audioData);
    const message: any = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: base64Audio
        }]
      }
    };

    // Store timestamp/sequenceNumber for client-side tracking only
    // These are not part of Google's API
    this.lastSentTimestamp = timestamp;
    this.lastSentSequenceNumber = sequenceNumber;

    this.send(message);
  }

  sendText(text: string, timestamp?: number, sequenceNumber?: number): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send text: WebSocket not connected');
      return;
    }

    const message: any = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }]
      }
    };

    // Store timestamp/sequenceNumber for client-side tracking only
    // These are not part of Google's API
    this.lastSentTimestamp = timestamp;
    this.lastSentSequenceNumber = sequenceNumber;

    this.send(message);
  }

  interrupt(): void {
    if (!this.isConnected || !this.ws) return;

    this.send({
      clientContent: {
        turnComplete: true
      }
    });
  }
  
  sendAudioStreamEnd(): void {
    if (!this.isConnected || !this.ws) return;
    
    this.send({
      realtimeInput: {
        audioStreamEnd: true
      }
    });
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === 1) { // 1 = OPEN
      this.ws.send(JSON.stringify(message));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(console.error);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Utility methods exposed for backward compatibility
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    return arrayBufferToBase64(buffer);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    return base64ToArrayBuffer(base64);
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    if (this.ws.readyState === 0) return 'connecting'; // 0 = CONNECTING
    if (this.ws.readyState === 1) return 'connected'; // 1 = OPEN
    return 'disconnected';
  }
}
