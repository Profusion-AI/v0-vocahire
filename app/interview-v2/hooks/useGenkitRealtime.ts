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
  interviewType: z.infer<typeof RealtimeInputSchema>['interviewType']; // Added interviewType
  difficulty: z.infer<typeof RealtimeInputSchema>['difficulty'];
  systemInstruction: string;
}

export interface UseGenkitRealtimeOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectBackoffMultiplier?: number;
  onMessage?: (data: z.infer<typeof RealtimeOutputSchema>) => void; // Added onMessage
  onError?: (error: z.infer<typeof ErrorSchema>) => void; // Added onError
  onReconnecting?: (attempt: number, maxAttempts: number) => void;
  onReconnected?: () => void;
}

export interface UseGenkitRealtimeReturn {
  status: 'idle' | 'connecting' | 'connected' | 'streaming' | 'disconnected' | 'error' | 'thinking'; // Added status
  isConnected: boolean;
  isConnecting: boolean;
  error: z.infer<typeof ErrorSchema> | null;
  transcript: z.infer<typeof TranscriptEntrySchema>[];
  aiAudioQueue: string[]; // Base64 encoded audio chunks
  connect: () => Promise<void>;
  disconnect: () => void;
  sendData: (data: z.infer<typeof RealtimeInputSchema>) => void; // Changed from sendAudio/sendText/interrupt
}

export function useGenkitRealtime(
  apiUrl: string,
  sessionConfig: SessionConfig,
  options: UseGenkitRealtimeOptions = {}
): UseGenkitRealtimeReturn {
  const { 
    maxReconnectAttempts = 3, 
    reconnectDelay = 2000,
    onMessage, 
    onError,
    onReconnected
  } = options;

  const [status, setStatus] = useState<UseGenkitRealtimeReturn['status']>('idle'); // Initial state includes 'thinking'
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<z.infer<typeof ErrorSchema> | null>(null);
  const [transcript, setTranscript] = useState<z.infer<typeof TranscriptEntrySchema>[]>([]);
  const [aiAudioQueue, setAiAudioQueue] = useState<string[]>([]);

  const reconnectAttemptsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isReconnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectionTimeRef = useRef<number>(Date.now());

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const parsed = RealtimeOutputSchema.parse(data);

      if (onMessage) {
        onMessage(parsed); // Call the provided onMessage callback
      }

      // Update internal state based on message type (optional, can rely solely on onMessage)
      switch (parsed.type) {
        case 'transcript':
          if (parsed.transcript) {
            const entry = TranscriptEntrySchema.parse({
              speaker: parsed.transcript.role === 'user' ? 'user' : 'ai',
              text: parsed.transcript.text,
              timestamp: parsed.transcript.timestamp || new Date().toISOString(),
            });
            setTranscript(prev => {
              // Append or update the last entry based on speaker
              if (prev.length > 0 && prev[prev.length - 1].speaker === entry.speaker) {
                const lastEntry = prev[prev.length - 1];
                // Simple append logic, may need refinement for streaming
                lastEntry.text += entry.text;
                return [...prev.slice(0, -1), lastEntry];
              } else {
                return [...prev, entry];
              }
            });
          }
          break;

        case 'audio':
          if (parsed.audio?.data) {
            setAiAudioQueue(prev => [...prev, parsed.audio!.data]);
          }
          break;

        case 'error':
          if (parsed.error) {
            const errorData = ErrorSchema.parse({
              code: parsed.error.code,
              message: parsed.error.message,
              timestamp: new Date().toISOString(),
            });
            setError(errorData);
            if (onError) {
              onError(errorData); // Call the provided onError callback
            }
            setStatus('error'); // Update status on error
          }
          break;

        case 'control':
          if (parsed.control?.type === 'ready') {
            const wasReconnecting = reconnectAttemptsRef.current > 0;
            setIsConnected(true);
            setIsConnecting(false);
            reconnectAttemptsRef.current = 0;
            setStatus('connected'); // Update status
            lastConnectionTimeRef.current = Date.now();
            
            if (wasReconnecting && onReconnected) {
              onReconnected();
            }
          } else if (parsed.control?.type === 'end') {
            setIsConnected(false);
            setStatus('disconnected'); // Update status
          } else if (parsed.control?.type === 'busy') {
            setStatus('thinking'); // Update status when AI is processing
          }
          break;
        
        case 'thinking':
          if (parsed.thinking?.isThinking) {
            setStatus('thinking');
          } else {
            setStatus('connected');
          }
          break;

        case 'session_status':
          if (parsed.sessionStatus?.status === 'active') {
            setStatus('streaming');
          } else if (parsed.sessionStatus?.status === 'completed' || parsed.sessionStatus?.status === 'error') {
            setIsConnected(false);
            setStatus('disconnected');
          }
          break;
      }
    } catch (err) {
      console.error('Error parsing SSE message:', err);
      const parseError: z.infer<typeof ErrorSchema> = {
        code: 'PARSE_ERROR',
        message: 'Failed to parse server message',
        details: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      };
      setError(parseError);
      if (onError) {
        onError(parseError);
      }
      setStatus('error'); // Update status on parse error
    }
  }, [onMessage, onError, onReconnected]); // Added onMessage, onError, onReconnected to dependencies

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setStatus('connecting'); // Update status
    setIsConnecting(true);
    setError(null);
    setTranscript([]); // Clear previous transcript on new connection
    setAiAudioQueue([]); // Clear previous audio queue

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
        signal: abortControllerRef.current?.signal, // Use abort signal
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
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
        processStream().catch(err => {
           // Handle stream processing errors
           if (err instanceof Error && err.name === 'AbortError') {
              console.log('Stream aborted');
           } else {
              console.error('Stream processing error:', err);
              const streamError: z.infer<typeof ErrorSchema> = {
                code: 'STREAM_ERROR',
                message: 'Real-time stream error',
                details: err instanceof Error ? err.message : String(err),
                timestamp: new Date().toISOString(),
              };
              setError(streamError);
              if (onError) {
                onError(streamError);
              }
              setStatus('error'); // Update status on stream error
              setIsConnected(false);
              setIsConnecting(false);
              // Attempt reconnection if not explicitly disconnected
              if (abortControllerRef.current?.signal.aborted === false) {
                 // Attempt reconnection inline
                 if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                   reconnectAttemptsRef.current++;
                   const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
                   setTimeout(connect, backoffDelay);
                 }
              }
           }
        });
      } else {
         // Handle no response body
         const noBodyError: z.infer<typeof ErrorSchema> = {
            code: 'NO_RESPONSE_BODY',
            message: 'No response body received from server',
            timestamp: new Date().toISOString(),
         };
         setError(noBodyError);
         if (onError) {
            onError(noBodyError);
         }
         setStatus('error');
         setIsConnected(false);
         setIsConnecting(false);
         // Attempt reconnection inline with exponential backoff
         if (reconnectAttemptsRef.current < maxReconnectAttempts) {
           reconnectAttemptsRef.current++;
           const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
           setTimeout(connect, backoffDelay);
         }
      }

    } catch (err) {
      // Handle initial fetch/connection errors
      if (err instanceof Error && err.name === 'AbortError') {
         console.log('Connection attempt aborted');
         setStatus('disconnected'); // Explicitly set status on abort
         setIsConnected(false);
         setIsConnecting(false);
      } else {
         console.error('Initial connection error:', err);
         const connectionError: z.infer<typeof ErrorSchema> = {
           code: 'CONNECTION_ERROR',
           message: err instanceof Error ? err.message : 'Failed to connect',
           retryable: reconnectAttemptsRef.current < maxReconnectAttempts,
           timestamp: new Date().toISOString(),
         };
         setError(connectionError);
         if (onError) {
           onError(connectionError);
         }
         setStatus('error'); // Update status on connection error
         setIsConnecting(false);

         // Attempt reconnection with exponential backoff
         if (connectionError.retryable) {
           reconnectAttemptsRef.current++;
           const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
           console.log(`Retrying connection in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
           setTimeout(connect, backoffDelay);
         }
      }
    }
  }, [apiUrl, sessionConfig, isConnected, isConnecting, handleSSEMessage, maxReconnectAttempts, reconnectDelay, onError]); // Added onError to dependencies

  const disconnect = useCallback(() => {
    console.log('Disconnect called');
    
    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Mark that we're no longer trying to reconnect
    isReconnectingRef.current = false;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort the fetch/stream
      abortControllerRef.current = null;
    }

    // Send disconnect message to server (best effort)
    if (isConnected || isConnecting) { // Only send if we were connected or trying to connect
       fetch(apiUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           ...sessionConfig,
           controlMessage: { type: 'stop' },
         } satisfies z.infer<typeof RealtimeInputSchema>),
       }).catch(console.error); // Log error but don't block
    }


    setIsConnected(false);
    setIsConnecting(false);
    setStatus('disconnected'); // Update status immediately on disconnect
    reconnectAttemptsRef.current = 0; // Reset reconnect attempts on explicit disconnect
    setError(null); // Clear any existing errors

  }, [apiUrl, sessionConfig, isConnected, isConnecting]); // Added isConnected, isConnecting to dependencies


  const sendData = useCallback((data: z.infer<typeof RealtimeInputSchema>) => {
     if (!isConnected) {
       console.warn('Cannot send data: Not connected');
       return;
     }

     // Ensure the data includes sessionConfig fields
     const payload = {
       ...sessionConfig,
       ...data,
     } satisfies z.infer<typeof RealtimeInputSchema>;


     fetch(apiUrl, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload),
     }).catch(console.error); // Log error but don't block

  }, [apiUrl, sessionConfig, isConnected]); // Added sessionConfig, isConnected to dependencies


  // Cleanup on unmount and page unload
  useEffect(() => {
    // Handle browser/tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnected || isConnecting) {
        // Send disconnect message immediately (best effort)
        navigator.sendBeacon(apiUrl, JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'stop' },
        } satisfies z.infer<typeof RealtimeInputSchema>));
        
        // Show browser warning if interview is active
        if (status === 'streaming' || status === 'connected') {
          e.preventDefault();
          e.returnValue = 'Are you sure you want to leave? Your interview session will be terminated.';
          return e.returnValue;
        }
      }
    };

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden && isConnected) {
        console.log('Tab hidden while connected, maintaining connection');
        // Could implement pause/resume logic here if needed
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('Hook unmounting, disconnecting...');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnect(); // Ensure disconnect is called on unmount
    };
  }, [disconnect, isConnected, isConnecting, status, apiUrl, sessionConfig]); // Added all dependencies


  return {
    status, // Return status
    isConnected,
    isConnecting,
    error,
    transcript,
    aiAudioQueue,
    connect,
    disconnect,
    sendData, // Return sendData
  };
}
