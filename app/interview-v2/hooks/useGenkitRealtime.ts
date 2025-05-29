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
  const disconnectRef = useRef<() => void>(() => {});
  const isConnectedRef = useRef(isConnected);
  const isConnectingRef = useRef(isConnecting);
  const statusRef = useRef(status);

  // Keep refs updated with latest state values
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
  useEffect(() => { isConnectingRef.current = isConnecting; }, [isConnecting]);
  useEffect(() => { statusRef.current = status; }, [status]);

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
          // In handleSSEMessage, for case 'control': ready
          if (parsed.control?.type === 'ready') {
            console.log(`[GenkitRealtime] SSE Control: 'ready' received. Setting connected state.`);
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
            // In handleSSEMessage, for case 'control': end
            console.log(`[GenkitRealtime] SSE Control: 'end' received. Setting disconnected state.`);
            setIsConnected(false);
            setStatus('disconnected'); // Update status
          } else if (parsed.control?.type === 'busy') {
            // In handleSSEMessage, for case 'control': busy / thinking
            console.log(`[GenkitRealtime] SSE Control: 'thinking' status received. Setting status: 'thinking'.`);
            setStatus('thinking'); // Update status when AI is processing
          }
          break;
        
        case 'thinking':
          if (parsed.thinking?.isThinking) {
            console.log(`[GenkitRealtime] SSE Control: 'thinking' status received. Setting status: 'thinking'.`); // Added logging
            setStatus('thinking');
          } else {
            console.log(`[GenkitRealtime] SSE Control: 'thinking' status received. Setting status: 'connected'.`); // Added logging
            setStatus('connected');
          }
          break;

        case 'session_status':
          // In handleSSEMessage, for case 'session_status': active/completed/error
          console.log(`[GenkitRealtime] SSE Session Status: ${parsed.sessionStatus?.status} received. Setting status.`);
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

  const connect = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // Skip connection for dummy config
      if (sessionConfig.sessionId === 'dummy' || sessionConfig.userId === 'dummy') {
        console.warn('Skipping connection for dummy config');
        resolve();
        return;
      }
      
      // Prevent connection with invalid config
      if (!sessionConfig.sessionId || !sessionConfig.userId) {
        console.warn('Cannot connect with invalid session config');
        reject(new Error('Cannot connect with invalid session config'));
        return;
      }

      // Create a new abort controller for this connection attempt
      const currentAbortController = new AbortController();
      
      // Check current state using refs to avoid stale closure
      const currentIsConnected = isConnectedRef.current;
      const currentIsConnecting = isConnectingRef.current;
      const currentStatus = statusRef.current;
      
      console.log(`[GenkitRealtime] Connect: Called. Status: ${currentStatus}, isConnected: ${currentIsConnected}, isConnecting: ${currentIsConnecting}`);
      console.log(`[GenkitRealtime] Connect: Session Config: ${JSON.stringify(sessionConfig)}`);
      
      if (currentIsConnected || currentIsConnecting) {
        console.log('[GenkitRealtime] Connect: Already connected or connecting, skipping');
        resolve();
        return;
      }

      // Set the abort controller immediately
      abortControllerRef.current = currentAbortController;

      setStatus('connecting');
      setIsConnecting(true);
      setError(null);
      setTranscript([]);
      setAiAudioQueue([]);

      console.log(`[GenkitRealtime] Connect: Safeguards passed, initiating fetch to ${apiUrl}.`);
      
      // Create connection timeout
      const connectionTimeout = setTimeout(() => {
        currentAbortController.abort();
        const timeoutError: z.infer<typeof ErrorSchema> = {
          code: 'CONNECTION_TIMEOUT',
          message: 'Connection timed out. Please check your internet connection and try again.',
          retryable: true,
          timestamp: new Date().toISOString(),
        };
        setError(timeoutError);
        if (onError) {
          onError(timeoutError);
        }
        setStatus('error');
        setIsConnecting(false);
        reject(timeoutError);
      }, 30000); // 30 second timeout
      
      // Send initial connection request
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'start' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
        signal: currentAbortController.signal,
      })
      .then(async response => {
        clearTimeout(connectionTimeout); // Clear timeout on response
        
        if (!response.ok) {
          console.error(`[GenkitRealtime] Connect: Initial fetch FAILED. Status: ${response.status}, Text: ${response.statusText}`);
          throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
        }
        
        console.log(`[GenkitRealtime] Connect: Initial fetch SUCCEEDED. Setting up SSE.`);
        
        if (!response.body) {
          throw new Error('No response body received from server');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Process SSE stream
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
        
        console.log(`[GenkitRealtime] Connect: Stream completed successfully.`);
        resolve();
      })
      .catch(err => {
        clearTimeout(connectionTimeout); // Clear timeout on error
        
        // Handle errors
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Connection attempt aborted');
          setStatus('disconnected');
          setIsConnected(false);
          setIsConnecting(false);
          resolve(); // Don't reject on abort
        } else {
          console.error('Connection error:', err);
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
          setStatus('error');
          setIsConnecting(false);

          // Attempt reconnection with exponential backoff
          if (connectionError.retryable && !currentAbortController.signal.aborted) {
            reconnectAttemptsRef.current++;
            const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
            console.log(`Retrying connection in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect().then(resolve).catch(reject);
            }, backoffDelay);
          } else {
            reject(connectionError);
          }
        }
      });
    });
  }, [apiUrl, sessionConfig, handleSSEMessage, maxReconnectAttempts, reconnectDelay, onError]); // Removed isConnected and isConnecting to ensure stable callback

  const disconnect = useCallback(() => {
    console.log('Disconnect called');
    
    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Mark that we're no longer trying to reconnect
    isReconnectingRef.current = false;
    
    // Abort the current connection if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Send disconnect message to server (best effort)
    if (isConnectedRef.current || isConnectingRef.current) {
      // Use navigator.sendBeacon for reliability during unmount
      const disconnectData = JSON.stringify({
        ...sessionConfig,
        controlMessage: { type: 'stop' },
      } satisfies z.infer<typeof RealtimeInputSchema>);
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(apiUrl, disconnectData);
      } else {
        // Fallback to fetch
        fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: disconnectData,
          keepalive: true,
        }).catch(() => {}); // Ignore errors
      }
    }

    // Update state
    setIsConnected(false);
    setIsConnecting(false);
    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
    setError(null);
  }, [apiUrl, sessionConfig]); // Removed isConnected and isConnecting to ensure stable callback
  
  // Update the ref whenever disconnect changes
  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);


  const sendData = useCallback((data: z.infer<typeof RealtimeInputSchema>) => {
     // In useGenkitRealtime.ts, inside sendData() at the very beginning
     const currentIsConnected = isConnectedRef.current;
     console.log(`[GenkitRealtime] sendData: Called. isConnected: ${currentIsConnected}.`);
     console.log(`[GenkitRealtime] sendData: Payload Preview: ${JSON.stringify(data).substring(0, 200)}...`); // Log only part of payload if large

     // Prevent sending with invalid config
     if (!sessionConfig.sessionId || !sessionConfig.userId || 
         sessionConfig.sessionId === 'dummy' || sessionConfig.userId === 'dummy') {
       console.warn('Cannot send data with invalid session config');
       return;
     }
     
     if (!currentIsConnected) {
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
     }).then(() => {
        // After successful fetch
        console.log(`[GenkitRealtime] sendData: Fetch successful.`);
     }).catch(err => {
        // Inside the catch block
        console.error('[GenkitRealtime] sendData: Fetch FAILED.', err);
     });

  }, [apiUrl, sessionConfig]); // Removed isConnected to ensure stable callback


  // Handle browser/tab close and visibility changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnectedRef.current || isConnectingRef.current) {
        // Send disconnect message immediately (best effort)
        const disconnectData = JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'stop' },
        } satisfies z.infer<typeof RealtimeInputSchema>);
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(apiUrl, disconnectData);
        }
        
        // Show browser warning if interview is active
        const currentStatus = statusRef.current;
        if (currentStatus === 'streaming' || currentStatus === 'connected') {
          e.preventDefault();
          e.returnValue = 'Are you sure you want to leave? Your interview session will be terminated.';
          return e.returnValue;
        }
      }
    };

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden && isConnectedRef.current) {
        console.log('[GenkitRealtime] Tab hidden while connected, maintaining connection');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [apiUrl, sessionConfig]); // Removed state dependencies, using refs instead
  
  // Separate cleanup effect for component unmount
  useEffect(() => {
    // Cleanup function runs when component unmounts
    return () => {
      console.log('[GenkitRealtime] Component unmounting: performing hook cleanup.');
      // Use the ref to check if we should disconnect
      if (abortControllerRef.current) {
        disconnectRef.current();
      }
    };
  }, []); // Empty dependency array - only run on unmount


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
