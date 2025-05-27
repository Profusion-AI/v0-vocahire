import { EventEmitter } from 'events';

export interface LiveAPIConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
  tools?: any[];
}

export interface LiveAPIMessage {
  type: 'audio' | 'text' | 'function_call' | 'function_response' | 'control';
  data: any;
}

export class GoogleLiveAPIClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: LiveAPIConfig;
  private audioBuffer: ArrayBuffer[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;
  private currentModel: string | null = null;
  private modelFallbackAttempted = false;

  constructor(config: LiveAPIConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl();
        this.ws = new WebSocket(wsUrl);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('Live API WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.sendInitialSetup();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
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

        this.ws.onclose = () => {
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
    const model = this.currentModel || this.config.model || 'models/gemini-2.5-flash-preview-native-audio-dialog';
    const baseUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
    return `${baseUrl}?key=${this.config.apiKey}`;
  }

  private sendInitialSetup(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupMessage: any = {
      setup: {
        model: this.currentModel || this.config.model || 'models/gemini-2.5-flash-preview-native-audio-dialog',
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: 'Aoede'
              }
            }
          },
          ...this.config.generationConfig
        },
        // Enable transcription for audio output
        output_audio_transcription: {},
        // Enable transcription for audio input
        input_audio_transcription: {}
      }
    };

    if (this.config.systemInstruction) {
      (setupMessage.setup as any).system_instruction = {
        parts: [{ text: this.config.systemInstruction }]
      };
    }

    if (this.config.tools) {
      (setupMessage.setup as any).tools = this.config.tools;
    }

    this.send(setupMessage);
  }

  private handleMessage(event: MessageEvent): void {
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
            // This shouldn't happen with AUDIO modality
            console.warn('Received text in AUDIO mode:', part.text);
          } else if (part.inlineData) {
            const audioData = this.base64ToArrayBuffer(part.inlineData.data);
            this.emit('audioData', audioData);
          } else if (part.functionCall) {
            this.emit('functionCall', part.functionCall);
          }
        });
      }
      
      // Handle transcriptions
      if (content.outputTranscription) {
        this.emit('transcript', { type: 'ai', text: content.outputTranscription.text });
      }
      
      if (content.inputTranscription) {
        this.emit('transcript', { type: 'user', text: content.inputTranscription.text });
      }

      if (content.turnComplete) {
        this.emit('turnComplete');
      }
    } else if (message.toolCall) {
      this.emit('toolCall', message.toolCall);
    }
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send audio: WebSocket not connected');
      return;
    }

    const base64Audio = this.arrayBufferToBase64(audioData);
    const message = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: base64Audio
        }]
      }
    };

    this.send(message);
  }

  sendText(text: string): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send text: WebSocket not connected');
      return;
    }

    const message = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }]
      }
    };

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

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
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

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    if (this.ws.readyState === WebSocket.CONNECTING) return 'connecting';
    if (this.ws.readyState === WebSocket.OPEN) return 'connected';
    return 'disconnected';
  }
}