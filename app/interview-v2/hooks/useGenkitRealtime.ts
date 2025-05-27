import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { 
  RealtimeInputSchema, 
  RealtimeOutputSchema,
  TranscriptEntrySchema,
  ErrorSchema 
} from '@/src/genkit/schemas/types';

export interface SessionConfig {
  sessionId: string;
  userId: string;
  jobRole: string;
  difficulty: z.infer<typeof RealtimeInputSchema>['difficulty'];
  systemInstruction: string;
}

export interface UseGenkitRealtimeOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseGenkitRealtimeReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: z.infer<typeof ErrorSchema> | null;
  transcript: z.infer<typeof TranscriptEntrySchema>[];
  aiAudioQueue: string[]; // Base64 encoded audio chunks
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  sendText: (text: string) => void;
  interrupt: () => void;
}

export function useGenkitRealtime(
  apiUrl: string,
  sessionConfig: SessionConfig,
  options: UseGenkitRealtimeOptions = {}
): UseGenkitRealtimeReturn {
  const { maxReconnectAttempts = 3, reconnectDelay = 1000 } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<z.infer<typeof ErrorSchema> | null>(null);
  const [transcript, setTranscript] = useState<z.infer<typeof TranscriptEntrySchema>[]>([]);
  const [aiAudioQueue, setAiAudioQueue] = useState<string[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const parsed = RealtimeOutputSchema.parse(data);
      
      switch (parsed.type) {
        case 'transcript':
          if (parsed.data && typeof parsed.data === 'object' && 'speaker' in parsed.data) {
            const entry = TranscriptEntrySchema.parse({
              ...parsed.data,
              timestamp: parsed.timestamp || new Date().toISOString(),
            });
            setTranscript(prev => [...prev, entry]);
          }
          break;
          
        case 'audio':
          if (typeof parsed.data === 'string') {
            setAiAudioQueue(prev => [...prev, parsed.data]);
          }
          break;
          
        case 'error':
          const errorData = ErrorSchema.parse({
            ...parsed.data,
            timestamp: parsed.timestamp || new Date().toISOString(),
          });
          setError(errorData);
          break;
          
        case 'control':
          if (parsed.data?.status === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
            reconnectAttemptsRef.current = 0;
          } else if (parsed.data?.status === 'disconnected') {
            setIsConnected(false);
          }
          break;
      }
    } catch (err) {
      console.error('Error parsing SSE message:', err);
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Send initial connection request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'start' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      // Set up SSE
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Process SSE stream
        const processStream = async () => {
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                handleSSEMessage(new MessageEvent('message', { data: line.substring(5) }));
              }
            }
          }
        };

        abortControllerRef.current = new AbortController();
        processStream().catch(console.error);
      }
    } catch (err) {
      const error: z.infer<typeof ErrorSchema> = {
        code: 'CONNECTION_ERROR',
        message: err instanceof Error ? err.message : 'Failed to connect',
        retryable: reconnectAttemptsRef.current < maxReconnectAttempts,
        timestamp: new Date().toISOString(),
      };
      setError(error);
      setIsConnecting(false);
      
      // Attempt reconnection
      if (error.retryable) {
        reconnectAttemptsRef.current++;
        setTimeout(connect, reconnectDelay * reconnectAttemptsRef.current);
      }
    }
  }, [apiUrl, sessionConfig, isConnected, isConnecting, handleSSEMessage, maxReconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Send disconnect message
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionConfig,
        controlMessage: { type: 'stop' },
      } satisfies z.infer<typeof RealtimeInputSchema>),
    }).catch(console.error);
    
    setIsConnected(false);
    setIsConnecting(false);
  }, [apiUrl, sessionConfig]);

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (!isConnected) return;
    
    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(audioData);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionConfig,
        audioChunk: base64,
      } satisfies z.infer<typeof RealtimeInputSchema>),
    }).catch(console.error);
  }, [apiUrl, sessionConfig, isConnected]);

  const sendText = useCallback((text: string) => {
    if (!isConnected) return;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionConfig,
        textInput: text,
      } satisfies z.infer<typeof RealtimeInputSchema>),
    }).catch(console.error);
  }, [apiUrl, sessionConfig, isConnected]);

  const interrupt = useCallback(() => {
    if (!isConnected) return;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionConfig,
        controlMessage: { type: 'interrupt' },
      } satisfies z.infer<typeof RealtimeInputSchema>),
    }).catch(console.error);
    
    // Clear audio queue
    setAiAudioQueue([]);
  }, [apiUrl, sessionConfig, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    transcript,
    aiAudioQueue,
    connect,
    disconnect,
    sendAudio,
    sendText,
    interrupt,
  };
}