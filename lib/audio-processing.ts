export class AudioProcessor {
  private audioContext: AudioContext;
  private sampleRate = 16000; // Required by Live API
  private outputSampleRate = 24000; // Output from Live API

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * Converts ArrayBuffer to base64 string
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts base64 string to ArrayBuffer
   */
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Converts audio blob to PCM16 ArrayBuffer at 16kHz
   */
  async processAudioForLiveAPI(audioBlob: Blob): Promise<ArrayBuffer> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    // Resample to 16kHz if needed
    const resampled = this.resampleAudioBuffer(audioBuffer, this.sampleRate);
    
    // Convert to PCM16
    return this.convertToPCM16(resampled);
  }

  /**
   * Converts PCM audio from Live API (24kHz) to playable format
   */
  async processAudioFromLiveAPI(pcmData: ArrayBuffer): Promise<AudioBuffer> {
    // Convert PCM16 to Float32
    const float32Data = this.pcm16ToFloat32(pcmData);
    
    // Create AudioBuffer at 24kHz
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      float32Data.length,
      this.outputSampleRate
    );
    
    audioBuffer.copyToChannel(float32Data, 0);
    return audioBuffer;
  }

  /**
   * Resamples audio buffer to target sample rate
   */
  private resampleAudioBuffer(audioBuffer: AudioBuffer, targetSampleRate: number): Float32Array {
    const sourceRate = audioBuffer.sampleRate;
    const ratio = sourceRate / targetSampleRate;
    const newLength = Math.round(audioBuffer.length / ratio);
    const result = new Float32Array(newLength);
    
    const channelData = audioBuffer.getChannelData(0); // Get first channel (mono)
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexInt = Math.floor(srcIndex);
      const srcIndexFrac = srcIndex - srcIndexInt;
      
      if (srcIndexInt + 1 < channelData.length) {
        // Linear interpolation
        result[i] = channelData[srcIndexInt] * (1 - srcIndexFrac) + 
                   channelData[srcIndexInt + 1] * srcIndexFrac;
      } else {
        result[i] = channelData[srcIndexInt];
      }
    }
    
    return result;
  }

  /**
   * Converts Float32Array to PCM16 (Int16Array)
   */
  private convertToPCM16(float32Array: Float32Array): ArrayBuffer {
    const int16Array = new Int16Array(float32Array.length);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1]
      const clamped = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit PCM
      int16Array[i] = clamped * 0x7FFF;
    }
    
    return int16Array.buffer;
  }

  /**
   * Converts PCM16 to Float32Array
   */
  private pcm16ToFloat32(pcmData: ArrayBuffer): Float32Array {
    const int16Array = new Int16Array(pcmData);
    const float32Array = new Float32Array(int16Array.length);
    
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 0x7FFF;
    }
    
    return float32Array;
  }

  /**
   * Creates a playback source from AudioBuffer
   */
  playAudioBuffer(audioBuffer: AudioBuffer): void {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Gets user media stream with proper constraints
   */
  async getUserMedia(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: this.sampleRate,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
  }
}

/**
 * Audio recorder for capturing microphone input
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private chunkCallback?: (chunk: Blob) => void;

  async start(onChunk?: (chunk: Blob) => void): Promise<void> {
    try {
      const audioProcessor = new AudioProcessor();
      this.stream = await audioProcessor.getUserMedia();
      
      this.chunkCallback = onChunk;
      
      // Use webm-opus for better quality and smaller size
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          if (this.chunkCallback) {
            this.chunkCallback(event.data);
          }
        }
      };
      
      // Request data every 100ms for real-time streaming
      this.mediaRecorder.start(100);
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  stop(): Blob {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
      
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      return audioBlob;
    }
    
    return new Blob();
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

/**
 * Audio playback queue for smooth audio streaming
 */
export class AudioPlaybackQueue {
  private audioContext: AudioContext;
  private queue: AudioBuffer[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  enqueue(audioBuffer: AudioBuffer): void {
    this.queue.push(audioBuffer);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioBuffer = this.queue.shift()!;
    
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = audioBuffer;
    this.currentSource.connect(this.audioContext.destination);
    
    this.currentSource.onended = () => {
      this.playNext();
    };
    
    this.currentSource.start();
  }

  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.queue = [];
    this.isPlaying = false;
  }

  clear(): void {
    this.queue = [];
  }
}