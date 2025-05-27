import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioStreamOptions {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

interface UseAudioStreamReturn {
  // Stream state
  stream: MediaStream | null;
  isActive: boolean;
  isMuted: boolean;
  error: Error | null;
  
  // Audio analysis
  audioLevel: number;
  analyserNode: AnalyserNode | null;
  
  // Control functions
  startStream: () => Promise<void>;
  stopStream: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  
  // Audio processing
  getAudioChunk: () => Int16Array | null;
}

const DEFAULT_OPTIONS: UseAudioStreamOptions = {
  sampleRate: 16000, // 16kHz for Google Speech-to-Text
  channelCount: 1,   // Mono audio
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function useAudioStream(options: UseAudioStreamOptions = {}): UseAudioStreamReturn {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Audio processing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferRef = useRef<Int16Array>(new Int16Array(0));
  const animationFrameRef = useRef<number | null>(null);
  
  // Start audio stream
  const startStream = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: mergedOptions.sampleRate,
          channelCount: mergedOptions.channelCount,
          echoCancellation: mergedOptions.echoCancellation,
          noiseSuppression: mergedOptions.noiseSuppression,
          autoGainControl: mergedOptions.autoGainControl,
        },
      });
      
      // Create audio context
      const audioContext = new AudioContext({
        sampleRate: mergedOptions.sampleRate,
      });
      audioContextRef.current = audioContext;
      
      // Create audio nodes
      const sourceNode = audioContext.createMediaStreamSource(mediaStream);
      sourceNodeRef.current = sourceNode;
      
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      analyserNodeRef.current = analyserNode;
      
      // Create script processor for audio chunks (deprecated but still works)
      const bufferSize = 4096;
      const processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorNodeRef.current = processorNode;
      
      // Process audio chunks
      processorNode.onaudioprocess = (event) => {
        if (isMuted) return;
        
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array (PCM16)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        
        // Store in buffer (you might want to implement a circular buffer here)
        audioBufferRef.current = pcm16;
      };
      
      // Connect nodes
      sourceNode.connect(analyserNode);
      sourceNode.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (!analyserNodeRef.current) return;
        
        const dataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
        analyserNodeRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = average / 255;
        setAudioLevel(normalizedLevel);
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
      
      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to start audio stream:', error);
      setError(error);
      setIsActive(false);
    }
  }, [mergedOptions, isMuted]);
  
  // Stop audio stream
  const stopStream = useCallback(() => {
    // Stop media stream tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Cleanup audio nodes
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (analyserNodeRef.current) {
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsActive(false);
    setAudioLevel(0);
    audioBufferRef.current = new Int16Array(0);
  }, [stream]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Set muted state
  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);
  
  // Get current audio chunk
  const getAudioChunk = useCallback(() => {
    if (!isActive || isMuted || audioBufferRef.current.length === 0) {
      return null;
    }
    
    // Return a copy of the current buffer
    return new Int16Array(audioBufferRef.current);
  }, [isActive, isMuted]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);
  
  // Update mute state on stream
  useEffect(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
      }
    }
  }, [stream, isMuted]);
  
  return {
    stream,
    isActive,
    isMuted,
    error,
    audioLevel,
    analyserNode: analyserNodeRef.current,
    startStream,
    stopStream,
    toggleMute,
    setMuted,
    getAudioChunk,
  };
}