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
  interviewType: z.infer<typeof RealtimeInputSchema>['interviewType'];
  difficulty: z.infer<typeof RealtimeInputSchema>['difficulty'];
  systemInstruction: string;
}

export interface UseGenkitRealtimeOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectBackoffMultiplier?: number;
  onMessage?: (data: z.infer<typeof RealtimeOutputSchema>) => void;
  onError?: (error: z.infer<typeof ErrorSchema>) => void;
  onReconnecting?: (attempt: number, maxAttempts: number) => void;
  onReconnected?: () => void;
  preconnect?: boolean; // Enable preconnection on mount
}

export interface UseGenkitRealtimeReturn {
  status: 'idle' | 'connecting' | 'connected' | 'streaming' | 'disconnected' | 'error' | 'thinking';
  isConnected: boolean;
  isConnecting: boolean;
  error: z.infer<typeof ErrorSchema> | null;
  transcript: z.infer<typeof TranscriptEntrySchema>[];
  aiAudioQueue: string[];
  connect: () => Promise<void>;
  disconnect: () => void;
  sendData: (data: Partial<z.infer<typeof RealtimeInputSchema>>) => void;
}

/**
 * React hook for managing a real-time interview session over WebSocket.
 *
 * Establishes and maintains a WebSocket connection to stream transcript and audio data, handle session control messages, manage reconnection logic, and track connection status and errors for an interactive interview experience.
 *
 * @param apiUrl - The base API URL used to derive the WebSocket endpoint.
 * @param sessionConfig - Session configuration including identifiers and interview parameters.
 * @param options - Optional settings for reconnection, callbacks, and preconnection behavior.
 * @returns An object containing connection status, error state, transcript and audio queues, and methods to connect, disconnect, and send data.
 *
 * @remark
 * - Automatically attempts reconnection with exponential backoff on connection loss, up to the configured maximum attempts.
 * - Tracks round-trip latency for outgoing messages using sequence numbers and timestamps.
 * - If `preconnect` is enabled, the hook will attempt to connect automatically on mount.
 */
export function useGenkitRealtime(
  apiUrl: string, // This will now be the base URL for the WebSocket, e.g., '/api/interview-v2/session'
  sessionConfig: SessionConfig,
  options: UseGenkitRealtimeOptions = {}
): UseGenkitRealtimeReturn {
  const {
    maxReconnectAttempts = 3,
    reconnectDelay = 2000,
    onMessage,
    onError,
    onReconnected,
    preconnect = false
  } = options;

  const [status, setStatus] = useState<UseGenkitRealtimeReturn['status']>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<z.infer<typeof ErrorSchema> | null>(null);
  const [transcript, setTranscript] = useState<z.infer<typeof TranscriptEntrySchema>[]>([]);
  const [aiAudioQueue, setAiAudioQueue] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectRef = useRef<() => void>(() => {}); // For cleanup effect
  
  // Latency monitoring
  const sentTimestampsRef = useRef<Map<number, number>>(new Map());
  const sequenceNumberRef = useRef(0);
  
  // Connection promise handlers
  const connectionResolverRef = useRef<(() => void) | null>(null);
  const connectionRejecterRef = useRef<((error: Error) => void) | null>(null);

  // Keep refs updated with latest state values
  const isConnectedRef = useRef(isConnected);
  const isConnectingRef = useRef(isConnecting);
  const statusRef = useRef(status);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
  useEffect(() => { isConnectingRef.current = isConnecting; }, [isConnecting]);
  useEffect(() => { statusRef.current = status; }, [status]);


  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const parsed = RealtimeOutputSchema.parse(data);

      if (onMessage) {
        onMessage(parsed);
      }

      switch (parsed.type) {
        case 'transcript':
          if (parsed.transcript) {
            const entry = TranscriptEntrySchema.parse({
              speaker: parsed.transcript.role === 'user' ? 'user' : 'ai',
              text: parsed.transcript.text,
              timestamp: parsed.transcript.timestamp || new Date().toISOString(),
            });
            setTranscript(prev => {
              if (prev.length > 0 && prev[prev.length - 1].speaker === entry.speaker) {
                const lastEntry = prev[prev.length - 1];
                lastEntry.text += entry.text;
                return [...prev.slice(0, -1), lastEntry];
              } else {
                return [...prev, entry];
              }
            });
            
            // Calculate RTT for transcription latency
            if (parsed.echoedSequenceNumber !== undefined) {
              const sentTime = sentTimestampsRef.current.get(parsed.echoedSequenceNumber);
              if (sentTime) {
                const rtt = Date.now() - sentTime;
                console.log(`[GenkitRealtime] Transcript RTT: ${rtt}ms (seq: ${parsed.echoedSequenceNumber})`);
                // Keep the timestamp for audio RTT calculation
              }
            }
          }
          break;

        case 'audio':
          if (parsed.audio?.data) {
            setAiAudioQueue(prev => [...prev, parsed.audio!.data]);
            
            // Calculate RTT if we have echoed sequence number
            if (parsed.echoedSequenceNumber !== undefined) {
              const sentTime = sentTimestampsRef.current.get(parsed.echoedSequenceNumber);
              if (sentTime) {
                const rtt = Date.now() - sentTime;
                console.log(`[GenkitRealtime] Audio RTT: ${rtt}ms (seq: ${parsed.echoedSequenceNumber})`);
                sentTimestampsRef.current.delete(parsed.echoedSequenceNumber);
                
                // Warn if latency exceeds target
                if (rtt > 2000) {
                  console.warn(`[GenkitRealtime] Latency exceeding target: ${rtt}ms`);
                }
              }
            }
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
              onError(errorData);
            }
            setStatus('error');
          }
          break;

        case 'control':
          if (parsed.control?.type === 'ready') {
            console.log(`[GenkitRealtime] WS Control: 'ready' received. Setting connected state.`);
            const wasReconnecting = reconnectAttemptsRef.current > 0;
            setIsConnected(true);
            setIsConnecting(false);
            reconnectAttemptsRef.current = 0;
            setStatus('connected');

            // Resolve the connection promise if it exists
            if (connectionResolverRef.current) {
              connectionResolverRef.current();
              connectionResolverRef.current = null;
              connectionRejecterRef.current = null;
            }

            if (wasReconnecting && onReconnected) {
              onReconnected();
            }
          } else if (parsed.control?.type === 'end') {
            console.log(`[GenkitRealtime] WS Control: 'end' received. Setting disconnected state.`);
            setIsConnected(false);
            setStatus('disconnected');
          } else if (parsed.control?.type === 'busy') {
            console.log(`[GenkitRealtime] WS Control: 'thinking' status received. Setting status: 'thinking'.`);
            setStatus('thinking');
          }
          break;

        case 'thinking':
          if (parsed.thinking?.isThinking) {
            console.log(`[GenkitRealtime] WS Control: 'thinking' status received. Setting status: 'thinking'.`);
            setStatus('thinking');
          } else {
            console.log(`[GenkitRealtime] WS Control: 'thinking' status received. Setting status: 'connected'.`);
            setStatus('connected');
          }
          break;

        case 'session_status':
          console.log(`[GenkitRealtime] WS Session Status: ${parsed.sessionStatus?.status} received. Setting status.`);
          if (parsed.sessionStatus?.status === 'active') {
            setStatus('streaming');
          } else if (parsed.sessionStatus?.status === 'completed' || parsed.sessionStatus?.status === 'error') {
            setIsConnected(false);
            setStatus('disconnected');
          }
          break;
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
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
      setStatus('error');
    }
  }, [onMessage, onError, onReconnected]);


  const connect = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (sessionConfig.sessionId === 'dummy' || sessionConfig.userId === 'dummy') {
        console.warn('Skipping connection for dummy config');
        resolve();
        return;
      }

      if (!sessionConfig.sessionId || !sessionConfig.userId) {
        console.warn('Cannot connect with invalid session config');
        reject(new Error('Cannot connect with invalid session config'));
        return;
      }

      const currentIsConnected = isConnectedRef.current;
      const currentIsConnecting = isConnectingRef.current;

      if (currentIsConnected || currentIsConnecting) {
        console.log('[GenkitRealtime] Connect: Already connected or connecting, skipping');
        resolve();
        return;
      }

      setStatus('connecting');
      setIsConnecting(true);
      setError(null);
      setTranscript([]);
      setAiAudioQueue([]);

      // First, create session via POST
      const sessionUrl = new URL(apiUrl, window.location.origin).toString();
      console.log(`[GenkitRealtime] Creating session at ${sessionUrl}`);
      
      // Store the resolve/reject functions to be called when ready
      connectionResolverRef.current = resolve;
      connectionRejecterRef.current = reject;

      fetch(sessionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'start' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data.success || !data.sseUrl) {
          throw new Error('Invalid session response');
        }
        
        // Now connect to SSE stream
        const sseUrl = new URL(data.sseUrl, window.location.origin).toString();
        console.log(`[GenkitRealtime] Connecting to SSE stream at ${sseUrl}`);
        
        const eventSource = new EventSource(sseUrl);
        // Store EventSource in wsRef for compatibility
        wsRef.current = eventSource as any;
        
        eventSource.onmessage = (event: MessageEvent) => {
        handleWebSocketMessage(event);
      };

      eventSource.onerror = (event: Event) => {
          console.error('[GenkitRealtime] SSE error:', event);
          const connectionError: z.infer<typeof ErrorSchema> = {
            code: 'SSE_ERROR',
            message: 'SSE connection error.',
            details: event instanceof Event ? 'Connection failed' : 'Unknown error',
            retryable: reconnectAttemptsRef.current < maxReconnectAttempts,
            timestamp: new Date().toISOString(),
          };
          setError(connectionError);
          if (onError) {
            onError(connectionError);
          }
          setStatus('error');
          setIsConnecting(false);

          if (connectionError.retryable) {
            reconnectAttemptsRef.current++;
            const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
            console.log(`Retrying SSE connection in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, backoffDelay);
          } else {
            // Reject the connection promise if it exists
            if (connectionRejecterRef.current) {
              connectionRejecterRef.current(new Error(connectionError.message));
              connectionResolverRef.current = null;
              connectionRejecterRef.current = null;
            }
          }
        };
      })
      .catch(error => {
        console.error('[GenkitRealtime] Failed to create session:', error);
        const connectionError: z.infer<typeof ErrorSchema> = {
          code: 'SESSION_CREATE_ERROR',
          message: 'Failed to create session',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
        setError(connectionError);
        if (onError) {
          onError(connectionError);
        }
        setStatus('error');
        setIsConnecting(false);
        
        // Reject the connection promise
        if (connectionRejecterRef.current) {
          connectionRejecterRef.current(new Error(connectionError.message));
          connectionResolverRef.current = null;
          connectionRejecterRef.current = null;
        }
      });
    });
  }, [apiUrl, sessionConfig, handleWebSocketMessage, maxReconnectAttempts, reconnectDelay, onError]);


  const disconnect = useCallback(() => {
    console.log('[GenkitRealtime] Disconnect called');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Send stop message via PUT request
      const sseUrl = new URL(apiUrl, window.location.origin).toString();
      fetch(`${sseUrl}/${sessionConfig.sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'stop' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
      }).catch(console.error);
      
      // Close EventSource
      if (wsRef.current.close) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
    setError(null);
  }, [sessionConfig]);

  // Update the ref whenever disconnect changes
  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);


  const sendData = useCallback((data: Partial<z.infer<typeof RealtimeInputSchema>>) => {
    const currentIsConnected = isConnectedRef.current;
    console.log(`[GenkitRealtime] sendData: Called. isConnected: ${currentIsConnected}.`);
    console.log(`[GenkitRealtime] sendData: Payload Preview: ${JSON.stringify(data).substring(0, 200)}...`);

    if (!sessionConfig.sessionId || !sessionConfig.userId ||
        sessionConfig.sessionId === 'dummy' || sessionConfig.userId === 'dummy') {
      console.warn('Cannot send data with invalid session config');
      return;
    }

    if (!currentIsConnected || !wsRef.current) {
      console.warn('Cannot send data: SSE not connected.');
      return;
    }

    // Generate sequence number and timestamp for latency tracking
    const currentSequenceNumber = sequenceNumberRef.current++;
    const currentTimestamp = Date.now();
    
    // Store timestamp for RTT calculation
    sentTimestampsRef.current.set(currentSequenceNumber, currentTimestamp);
    
    // Clean up old timestamps (older than 30 seconds)
    const cutoffTime = currentTimestamp - 30000;
    for (const [seq, time] of sentTimestampsRef.current.entries()) {
      if (time < cutoffTime) {
        sentTimestampsRef.current.delete(seq);
      }
    }
    
    const payload = {
      ...sessionConfig,
      ...data,
      timestamp: currentTimestamp,
      sequenceNumber: currentSequenceNumber,
    } satisfies z.infer<typeof RealtimeInputSchema>;

    // Send data via PUT request to session endpoint
    const sseUrl = new URL(apiUrl, window.location.origin).toString();
    fetch(`${sseUrl}/${sessionConfig.sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`[GenkitRealtime] sendData: Message sent via HTTP (seq: ${currentSequenceNumber}).`);
    }).catch(error => {
      console.error('[GenkitRealtime] Failed to send data:', error);
      const sendError: z.infer<typeof ErrorSchema> = {
        code: 'SEND_ERROR',
        message: 'Failed to send data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
      setError(sendError);
      if (onError) {
        onError(sendError);
      }
    });

  }, [sessionConfig]);


  // Handle browser/tab close and visibility changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnectedRef.current || isConnectingRef.current) {
        // Send disconnect message via beacon API for reliability
        const sseUrl = new URL(apiUrl, window.location.origin).toString();
        const disconnectUrl = `${sseUrl}/${sessionConfig.sessionId}`;
        const disconnectData = JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'stop' },
        } satisfies z.infer<typeof RealtimeInputSchema>);
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(disconnectUrl, disconnectData);
        }
        
        // Also close EventSource if it exists
        if (wsRef.current && wsRef.current.close) {
          wsRef.current.close();
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
  }, [apiUrl, sessionConfig]);

  // Separate cleanup effect for component unmount
  useEffect(() => {
    return () => {
      console.log('[GenkitRealtime] Component unmounting: performing hook cleanup.');
      if (wsRef.current) { // Check if WebSocket exists
        disconnectRef.current();
      }
    };
  }, []);
  
  // Preconnect WebSocket if enabled
  useEffect(() => {
    if (preconnect && !isConnectedRef.current && !isConnectingRef.current) {
      console.log('[GenkitRealtime] Preconnecting WebSocket...');
      connect().catch(err => {
        console.error('[GenkitRealtime] Preconnection failed:', err);
      });
    }
  }, [preconnect, connect]);


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
  };
}
