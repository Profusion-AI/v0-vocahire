import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { 
  RealtimeInputSchema, 
  RealtimeOutputSchema,
  TranscriptEntrySchema,
  ErrorSchema 
} from '@/src/genkit/schemas/types';

// Use the SessionConfig from types.ts instead of defining our own
import type { SessionConfig as BaseSessionConfig } from '@/src/genkit/schemas/types';

// Extend if needed or just use the imported type
export type SessionConfig = BaseSessionConfig;

export interface UseGenkitRealtimeOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseGenkitRealtimeReturn {
  status: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: z.infer<typeof ErrorSchema> | null;
  transcript: z.infer<typeof TranscriptEntrySchema>[];
  aiAudioQueue: string[]; // Base64 encoded audio chunks
  connect: () => Promise<void>;
  disconnect: () => void;
  sendData: (data: any) => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  sendText: (text: string) => void;
  interrupt: () => void;
}

export function useGenkitRealtime(
  apiUrl: string,
  sessionConfig: SessionConfig,
  options: UseGenkitRealtimeOptions = {}
): UseGenkitRealtimeReturn {
  const { maxReconnectAttempts = 3, reconnectDelay = 1000, onMessage, onError } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState<z.infer<typeof ErrorSchema> | null>(null);
  const [transcript, setTranscript] = useState<z.infer<typeof TranscriptEntrySchema>[]>([]);
  const [aiAudioQueue, setAiAudioQueue] = useState<string[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Call the onMessage callback if provided
      if (onMessage) {
        onMessage(data);
      }
      
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
          if (onError) {
            onError(new Error(errorData.message));
          }
          break;
          
        case 'control':
          if (parsed.data?.status === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
            setStatus('connected');
            reconnectAttemptsRef.current = 0;
          } else if (parsed.data?.status === 'disconnected') {
            setIsConnected(false);
            setStatus('disconnected');
          } else if (parsed.data?.status === 'streaming') {
            setStatus('streaming');
          }
          break;
      }
    } catch (err) {
      console.error('Error parsing SSE message:', err);
    }
  }, [onMessage, onError]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Send initial connection request
      const payload: z.infer<typeof RealtimeInputSchema> = {
        sessionId: sessionConfig.sessionId || `session_${Date.now()}`,
        userId: sessionConfig.userId,
        jobRole: sessionConfig.domainOrRole,
        interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' : 
                       sessionConfig.interviewType === 'technical' ? 'Technical' : 
                       sessionConfig.interviewType === 'situational' ? 'General' : 'General',
        difficulty: 'mid',
        systemInstruction: `You are an interviewer conducting a ${sessionConfig.interviewType} interview for a ${sessionConfig.domainOrRole} position. Ask relevant questions one at a time and provide constructive feedback.`,
        controlMessage: { type: 'start' },
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    const payload: z.infer<typeof RealtimeInputSchema> = {
      sessionId: sessionConfig.sessionId || '',
      userId: sessionConfig.userId,
      jobRole: sessionConfig.domainOrRole,
      interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' : 
                     sessionConfig.interviewType === 'technical' ? 'Technical' : 
                     sessionConfig.interviewType === 'situational' ? 'General' : 'General',
      difficulty: 'mid',
      systemInstruction: `Conduct a ${sessionConfig.interviewType} interview for ${sessionConfig.domainOrRole}`,
      controlMessage: { type: 'stop' },
    };
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error);
    
    setIsConnected(false);
    setIsConnecting(false);
    setStatus('disconnected');
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
    
    // Ensure we conform to RealtimeInputSchema
    const payload: z.infer<typeof RealtimeInputSchema> = {
      sessionId: sessionConfig.sessionId || '',
      userId: sessionConfig.userId,
      jobRole: sessionConfig.domainOrRole,
      interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' : 
                     sessionConfig.interviewType === 'technical' ? 'Technical' : 
                     sessionConfig.interviewType === 'situational' ? 'General' : 'General',
      difficulty: 'mid', // Default to mid, could be made configurable
      systemInstruction: `Conduct a ${sessionConfig.interviewType} interview for ${sessionConfig.domainOrRole}`,
      audioChunk: base64,
    };
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error);
  }, [apiUrl, sessionConfig, isConnected]);

  const sendText = useCallback((text: string) => {
    if (!isConnected) return;
    
    // Ensure we conform to RealtimeInputSchema
    const payload: z.infer<typeof RealtimeInputSchema> = {
      sessionId: sessionConfig.sessionId || '',
      userId: sessionConfig.userId,
      jobRole: sessionConfig.domainOrRole,
      interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' : 
                     sessionConfig.interviewType === 'technical' ? 'Technical' : 
                     sessionConfig.interviewType === 'situational' ? 'General' : 'General',
      difficulty: 'mid',
      systemInstruction: `Conduct a ${sessionConfig.interviewType} interview for ${sessionConfig.domainOrRole}`,
      textInput: text,
    };
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error);
  }, [apiUrl, sessionConfig, isConnected]);

  const interrupt = useCallback(() => {
    if (!isConnected) return;
    
    const payload: z.infer<typeof RealtimeInputSchema> = {
      sessionId: sessionConfig.sessionId || '',
      userId: sessionConfig.userId,
      jobRole: sessionConfig.domainOrRole,
      interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' : 
                     sessionConfig.interviewType === 'technical' ? 'Technical' : 
                     sessionConfig.interviewType === 'situational' ? 'General' : 'General',
      difficulty: 'mid',
      systemInstruction: `Conduct a ${sessionConfig.interviewType} interview for ${sessionConfig.domainOrRole}`,
      controlMessage: { type: 'interrupt' },
    };
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

  const sendData = useCallback((data: any) => {
    if (data.type === 'control') {
      if (data.action === 'start') {
        connect();
      } else if (data.action === 'stop') {
        disconnect();
      } else if (data.action === 'mute' && data.data) {
        // Handle mute logic if needed
      }
    } else if (data.type === 'audio' && data.data) {
      sendAudio(data.data);
    } else if (data.type === 'text' && data.text) {
      sendText(data.text);
    }
  }, [connect, disconnect, sendAudio, sendText]);

  return {
    status,
    isConnected,
    isConnecting,
    error,
    transcript,
    aiAudioQueue,
    connect,
    disconnect,
    sendData,
    sendAudio,
    sendText,
    interrupt,
  };
}
