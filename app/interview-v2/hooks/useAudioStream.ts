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
  
  // Permission state
  hasPermission: boolean | null;
  isCheckingPermission: boolean;
  
  // Audio analysis
  audioLevel: number;
  analyserNode: AnalyserNode | null;
  
  // Control functions
  startStream: () => Promise<void>;
  stopStream: () => void;
  toggleMute: () => void;
  setIsMuted: (muted: boolean) => void;
  requestPermission: () => Promise<void>;
  
  // Audio processing
  getAudioBuffer: () => ArrayBuffer | null;
}

const DEFAULT_OPTIONS: UseAudioStreamOptions = {
  sampleRate: 16000, // 16kHz for Google Speech-to-Text
  channelCount: 1,   // Mono audio
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Error types for better handling
export class MicrophonePermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MicrophonePermissionError';
  }
}

export class MicrophoneNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MicrophoneNotFoundError';
  }
}

export function useAudioStream(options: UseAudioStreamOptions = {}): UseAudioStreamReturn {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  
  // Audio processing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferRef = useRef<Int16Array>(new Int16Array(0));
  const animationFrameRef = useRef<number | null>(null);
  
  // Check microphone permission status
  const checkPermission = useCallback(async () => {
    try {
      setIsCheckingPermission(true);
      setError(null);
      
      // Check if permissions API is available
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ 
            name: 'microphone' as PermissionName 
          });
          
          setHasPermission(permissionStatus.state === 'granted');
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            setHasPermission(permissionStatus.state === 'granted');
            if (permissionStatus.state === 'denied') {
              stopStream();
              setError(new MicrophonePermissionError('Microphone permission was revoked'));
            }
          };
        } catch (err) {
          // Permissions API might not support microphone query in some browsers
          console.warn('Permissions API not fully supported:', err);
        }
      }
    } finally {
      setIsCheckingPermission(false);
    }
  }, []);

  // Request microphone permission explicitly
  const requestPermission = useCallback(async () => {
    try {
      setIsCheckingPermission(true);
      setError(null);
      
      // Try to get a temporary stream just to trigger permission
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      tempStream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      await checkPermission();
    } catch (err) {
      const error = err as Error;
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError(new MicrophonePermissionError(
          'Microphone permission denied. Please allow microphone access to use the interview feature.'
        ));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError(new MicrophoneNotFoundError(
          'No microphone found. Please connect a microphone to use the interview feature.'
        ));
      } else {
        setError(error);
      }
    } finally {
      setIsCheckingPermission(false);
    }
  }, [checkPermission]);

  // Start audio stream
  const startStream = useCallback(async () => {
    try {
      setError(null);
      
      // Check permission first
      if (hasPermission === false) {
        await requestPermission();
        if (hasPermission === false) {
          return;
        }
      }
      
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
      
      // Monitor track state for permission revocation
      mediaStream.getTracks().forEach(track => {
        track.onended = () => {
          console.warn('Audio track ended unexpectedly');
          stopStream();
          setError(new MicrophonePermissionError(
            'Microphone access was lost. This might be due to permission changes or device disconnection.'
          ));
        };
      });
      
      setStream(mediaStream);
      setIsActive(true);
      setHasPermission(true);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to start audio stream:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setHasPermission(false);
        setError(new MicrophonePermissionError(
          'Microphone permission denied. Please allow microphone access to use the interview feature.'
        ));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError(new MicrophoneNotFoundError(
          'No microphone found. Please connect a microphone to use the interview feature.'
        ));
      } else {
        setError(error);
      }
      
      setIsActive(false);
    }
  }, [mergedOptions, isMuted, hasPermission, requestPermission]);
  
  // Stop audio stream
  const stopStream = useCallback(() => {
    // Stop media stream tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Stop audio level monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Disconnect and close audio nodes
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    
    if (analyserNodeRef.current) {
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsActive(false);
    setAudioLevel(0);
    audioBufferRef.current = new Int16Array(0);
  }, [stream]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);
  
  // Get audio buffer
  const getAudioBuffer = useCallback((): ArrayBuffer | null => {
    if (!audioBufferRef.current || audioBufferRef.current.length === 0) {
      return null;
    }
    
    // Return a copy of the buffer
    const buffer = audioBufferRef.current.buffer;
    // Ensure we return an ArrayBuffer (not SharedArrayBuffer)
    if (buffer instanceof ArrayBuffer) {
      return buffer.slice(0);
    } else {
      // If it's a SharedArrayBuffer, copy to a new ArrayBuffer
      const arrayBuffer = new ArrayBuffer(buffer.byteLength);
      new Uint8Array(arrayBuffer).set(new Uint8Array(buffer));
      return arrayBuffer;
    }
  }, []);
  
  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);
  
  return {
    // Stream state
    stream,
    isActive,
    isMuted,
    error,
    
    // Permission state
    hasPermission,
    isCheckingPermission,
    
    // Audio analysis
    audioLevel,
    analyserNode: analyserNodeRef.current,
    
    // Control functions
    startStream,
    stopStream,
    toggleMute,
    setIsMuted,
    requestPermission,
    
    // Audio processing
    getAudioBuffer,
  };
}