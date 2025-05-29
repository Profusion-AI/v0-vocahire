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

      // Convert HTTP URL to WebSocket URL
      // Assuming apiUrl is something like '/api/interview-v2/session'
      // We need to convert it to 'ws://localhost:3000/api/interview-v2/ws'
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}${apiUrl.replace('/session', '/ws')}`;

      console.log(`[GenkitRealtime] Initiating WebSocket connection to ${wsUrl}.`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[GenkitRealtime] WebSocket opened.');
        // Send initial configuration message
        ws.send(JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'start' },
        } satisfies z.infer<typeof RealtimeInputSchema>));
        // Status will be set to 'connected' when 'ready' control message is received
        resolve();
      };

      ws.onmessage = handleWebSocketMessage;

      ws.onerror = (event) => {
        console.error('[GenkitRealtime] WebSocket error:', event);
        const connectionError: z.infer<typeof ErrorSchema> = { // Changed back to ErrorSchema
          code: 'WEBSOCKET_ERROR',
          message: 'WebSocket connection error.',
          details: event instanceof ErrorEvent ? event.message : 'Unknown error',
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
          console.log(`Retrying WebSocket connection in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect().then(resolve).catch(reject);
          }, backoffDelay);
        } else {
          reject(connectionError);
        }
      };

      ws.onclose = (event) => {
        console.log(`[GenkitRealtime] WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        setIsConnecting(false);
        setStatus('disconnected');
        // Attempt reconnection if not explicitly closed by disconnect()
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
          console.log(`Retrying WebSocket connection in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect().then(resolve).catch(reject);
          }, backoffDelay);
        } else if (event.code !== 1000) { // 1000 is normal closure
          const closeError: z.infer<typeof ErrorSchema> = { // Changed back to ErrorSchema
            code: 'WEBSOCKET_CLOSED',
            message: `WebSocket closed unexpectedly: ${event.reason || 'No reason provided'} (Code: ${event.code})`,
            timestamp: new Date().toISOString(),
          };
          setError(closeError);
          if (onError) {
            onError(closeError);
          }
        }
      };
    });
  }, [apiUrl, sessionConfig, handleWebSocketMessage, maxReconnectAttempts, reconnectDelay, onError, onReconnected]);


  const disconnect = useCallback(() => {
    console.log('[GenkitRealtime] Disconnect called');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Send a stop message before closing the WebSocket
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          ...sessionConfig,
          controlMessage: { type: 'stop' },
        } satisfies z.infer<typeof RealtimeInputSchema>));
      }
      wsRef.current.close(1000, 'Client requested disconnect'); // 1000 is normal closure
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

    if (!currentIsConnected || wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send data: WebSocket not connected or not open.');
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

    // Check if audioChunk is present and send as binary
    if (data.audioChunk) {
      // For binary audio, we need to send metadata separately
      // First send a metadata message
      const metadataPayload = {
        ...sessionConfig,
        timestamp: currentTimestamp,
        sequenceNumber: currentSequenceNumber,
        audioMetadata: true,
      };
      wsRef.current.send(JSON.stringify(metadataPayload));
      
      // Then send the binary audio
      const audioBuffer = Uint8Array.from(atob(data.audioChunk), c => c.charCodeAt(0)).buffer;
      wsRef.current.send(audioBuffer);
      console.log(`[GenkitRealtime] sendData: Binary audio chunk sent via WebSocket (seq: ${currentSequenceNumber}).`);
    } else {
      // Send other data (text, control messages) as JSON
      wsRef.current.send(JSON.stringify(payload));
      console.log(`[GenkitRealtime] sendData: JSON message sent via WebSocket (seq: ${currentSequenceNumber}).`);
    }

  }, [sessionConfig]);


  // Handle browser/tab close and visibility changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnectedRef.current || isConnectingRef.current) {
        // Send disconnect message via WebSocket if possible, otherwise rely on browser closing the connection
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            ...sessionConfig,
            controlMessage: { type: 'stop' },
          } satisfies z.infer<typeof RealtimeInputSchema>));
          wsRef.current.close(1000, 'Client requested disconnect on unload');
        } else {
          // Fallback for best effort disconnect if WebSocket is not open
          // This might not be reliable as browser might kill process before sendBeacon completes
          const disconnectUrl = `${window.location.protocol === 'https:' ? 'https:' : 'http:'}//${window.location.host}${apiUrl}/${sessionConfig.sessionId}/input`;
          const disconnectData = JSON.stringify({
            ...sessionConfig,
            controlMessage: { type: 'stop' },
          } satisfies z.infer<typeof RealtimeInputSchema>);
          if (navigator.sendBeacon) {
            navigator.sendBeacon(disconnectUrl, disconnectData);
          }
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
