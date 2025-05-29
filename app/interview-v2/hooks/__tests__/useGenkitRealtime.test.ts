/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGenkitRealtime } from '../useGenkitRealtime';
import type { SessionConfig } from '../useGenkitRealtime';
import { RealtimeOutputSchema } from '@/src/genkit/schemas/types';
import { z } from 'zod'; // Import z

// Define WebSocketReadyState locally if not globally available
type WebSocketReadyState = 0 | 1 | 2 | 3;

// Mock WebSocket globally
class MockWebSocket implements WebSocket {
  // WebSocket properties
  binaryType: BinaryType = 'arraybuffer';
  bufferedAmount: number = 0;
  extensions: string = '';
  protocol: string = '';
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  readyState: WebSocketReadyState;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;

  readonly CONNECTING: 0 = 0;
  readonly OPEN: 1 = 1;
  readonly CLOSING: 2 = 2;
  readonly CLOSED: 3 = 3;

  constructor(public url: string) {
    this.readyState = this.CONNECTING;
    this.send = vi.fn();
    this.close = vi.fn();
    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = this.OPEN;
      (this.onopen as any)?.(new Event('open')); // Cast to any to bypass 'this' context check
    }, 10);
  }

  // Helper to trigger incoming messages programmatically
  triggerMessage(data: z.infer<typeof RealtimeOutputSchema>) {
    (this.onmessage as any)?.(new MessageEvent('message', { data: JSON.stringify(data) })); // Cast to any
  }

  triggerError(error: Event) {
    (this.onerror as any)?.(error); // Cast to any
  }

  triggerClose(code: number = 1000, reason: string = '', wasClean: boolean = true) {
    (this.onclose as any)?.(new CloseEvent('close', { code, reason, wasClean })); // Cast to any
  }

  // Dummy implementations for add/remove event listeners
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

// Mock the global WebSocket constructor
vi.stubGlobal('WebSocket', MockWebSocket);

describe('useGenkitRealtime (WebSocket)', () => {
  const mockApiUrl = '/api/interview-v2/session'; // Base URL for WebSocket conversion
  const mockWsUrl = 'ws://localhost/api/interview-v2/ws'; // Expected WebSocket URL
  const mockSessionConfig: SessionConfig = {
    sessionId: 'test-session-123',
    userId: 'test-user-456',
    jobRole: 'Tester',
    interviewType: 'General',
    difficulty: 'entry',
    systemInstruction: 'Be a test interviewer.',
  };

  let mockWsInstance: MockWebSocket; // Declare mockWsInstance here

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Use fake timers for controlling WebSocket connection timing
    
    // Mock window.location.host to ensure consistent WebSocket URL in tests
    vi.stubGlobal('window', {
      location: {
        protocol: 'http:',
        host: 'localhost:3000', // Use a common development port
      },
    });

    // Initialize mockWsInstance here, or in nested beforeEach blocks if needed per test suite
    mockWsInstance = new MockWebSocket('ws://localhost:3000/api/interview-v2/ws'); // Update mockWsUrl to match
    vi.stubGlobal('WebSocket', vi.fn(() => mockWsInstance));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.transcript).toEqual([]);
      expect(result.current.aiAudioQueue).toEqual([]);
    });

    it('should connect successfully when connect is called', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      act(() => {
        result.current.connect();
      });

      expect(vi.mocked(WebSocket)).toHaveBeenCalledWith(mockWsUrl);
      expect(result.current.isConnecting).toBe(true);

      // Advance timers to trigger onopen and initial message send
      await act(async () => {
        vi.advanceTimersByTime(10); // For WebSocket onopen
      });

      // Expect initial 'start' message to be sent
      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        ...mockSessionConfig,
        controlMessage: { type: 'start' },
      }));

      // Simulate 'ready' message from server
      act(() => {
        mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } });
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.isConnecting).toBe(false);
        expect(result.current.status).toBe('connected');
      });
    });

    it('should handle connection errors', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      act(() => {
        result.current.connect();
      });

      // Advance timers to trigger onopen
      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Simulate WebSocket error
      act(() => {
        mockWsInstance.triggerError(new Event('error'));
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isConnecting).toBe(false);
        expect(result.current.error).toEqual({
          code: 'WEBSOCKET_ERROR',
          message: 'WebSocket connection error.',
          details: 'Unknown error', // For generic Event
          retryable: true,
          timestamp: expect.any(String),
        });
        expect(result.current.status).toBe('error');
      });
    });

    it('should disconnect properly', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10); // Open WebSocket
      });

      // Simulate 'ready' message to set connected state
      act(() => {
        mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } });
      });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => {
        result.current.disconnect();
      });

      // Expect 'stop' message to be sent before closing
      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        ...mockSessionConfig,
        controlMessage: { type: 'stop' },
      }));
      expect(mockWsInstance.close).toHaveBeenCalledWith(1000, 'Client requested disconnect');

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isConnecting).toBe(false);
        expect(result.current.status).toBe('disconnected');
      });
    });

    it('should attempt reconnection on unexpected close', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig, {
          maxReconnectAttempts: 3,
          reconnectDelay: 1000
        })
      );

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10); // Open WebSocket
      });

      // Simulate 'ready' message to set connected state
      act(() => {
        mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } });
      });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      // Simulate unexpected close (not clean, or non-1000 code)
      act(() => {
        mockWsInstance.triggerClose(1006, 'Abnormal closure', false);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isConnecting).toBe(false);
        expect(result.current.status).toBe('disconnected');
      });

      // First reconnect attempt
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(vi.mocked(WebSocket)).toHaveBeenCalledTimes(2); // New WebSocket instance

      // Simulate new WebSocket instance for reconnection
      const newMockWsInstance = new MockWebSocket(mockWsUrl);
      vi.mocked(WebSocket).mockReturnValueOnce(newMockWsInstance);

      // Second reconnect attempt
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(vi.mocked(WebSocket)).toHaveBeenCalledTimes(3); // Another new WebSocket instance
    });
  });

  describe('Message Handling', () => {
    // Moved beforeEach into each test to ensure fresh hook instance and result scope
    it('should handle transcript messages', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );
      act(() => { result.current.connect(); });
      await act(async () => { vi.advanceTimersByTime(10); }); // Open WebSocket
      act(() => { mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } }); });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => {
        mockWsInstance.triggerMessage({
          type: 'transcript',
          transcript: { id: 'test-transcript-id', role: 'assistant', text: 'Hello!', timestamp: new Date().toISOString() }
        });
      });

      await waitFor(() => {
        expect(result.current.transcript).toHaveLength(1);
        expect(result.current.transcript[0]).toMatchObject({
          id: 'test-transcript-id',
          role: 'assistant',
          text: 'Hello!',
          timestamp: expect.any(String),
        });
      });
    });

    it('should handle audio messages', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );
      act(() => { result.current.connect(); });
      await act(async () => { vi.advanceTimersByTime(10); }); // Open WebSocket
      act(() => { mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } }); });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => {
        mockWsInstance.triggerMessage({
          type: 'audio',
          audio: { data: 'base64audiodata', format: 'pcm16', sampleRate: 24000 }
        });
      });

      await waitFor(() => {
        expect(result.current.aiAudioQueue).toHaveLength(1);
        expect(result.current.aiAudioQueue[0]).toBe('base64audiodata');
      });
    });

    it('should handle error messages', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );
      act(() => { result.current.connect(); });
      await act(async () => { vi.advanceTimersByTime(10); }); // Open WebSocket
      act(() => { mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } }); });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => {
        mockWsInstance.triggerMessage({
          type: 'error',
          error: { code: 'TEST_ERROR', message: 'Test error' }
        });
      });

      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          code: 'TEST_ERROR',
          message: 'Test error',
          timestamp: expect.any(String),
        });
        expect(result.current.status).toBe('error');
      });
    });

    it('should handle session_status messages', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );
      act(() => { result.current.connect(); });
      await act(async () => { vi.advanceTimersByTime(10); }); // Open WebSocket
      act(() => { mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } }); });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => {
        mockWsInstance.triggerMessage({
          type: 'session_status',
          sessionStatus: { sessionId: mockSessionConfig.sessionId, status: 'completed', startTime: new Date().toISOString(), duration: 100 }
        });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('disconnected');
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should handle thinking messages', async () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );
      act(() => { result.current.connect(); });
      await act(async () => { vi.advanceTimersByTime(10); }); // Open WebSocket
      act(() => { mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } }); });
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => {
        mockWsInstance.triggerMessage({
          type: 'thinking',
          thinking: { isThinking: true }
        });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('thinking');
      });

      act(() => {
        mockWsInstance.triggerMessage({
          type: 'thinking',
          thinking: { isThinking: false }
        });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });
    });
  });

  describe('Sending Data (sendData method)', () => {
    let connectedHook: ReturnType<typeof renderHook<any, any>>['result']['current'];

    beforeEach(async () => {
      vi.clearAllMocks();
      vi.stubGlobal('WebSocket', vi.fn(() => mockWsInstance)); // Ensure WebSocket mock is reset
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );
      act(() => { result.current.connect(); });
      await act(async () => { vi.advanceTimersByTime(10); }); // Open WebSocket
      act(() => { mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } }); });
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
      connectedHook = result.current;
      mockWsInstance.send.mockClear(); // Clear send calls from connection
    });

    it('should send audio data when connected', async () => {
      const audioData = new ArrayBuffer(8);
      const base64Audio = Buffer.from(audioData).toString('base64');

      act(() => {
        connectedHook.sendData({
          audioChunk: base64Audio,
        });
      });

      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        ...mockSessionConfig,
        audioChunk: base64Audio,
      }));
    });

    it('should send text data when connected', async () => {
      act(() => {
        connectedHook.sendData({
          text: 'Hello, AI!',
        });
      });

      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        ...mockSessionConfig,
        text: 'Hello, AI!',
      }));
    });

    it('should send interrupt control message when connected', async () => {
      act(() => {
        connectedHook.sendData({
          controlMessage: { type: 'interrupt' },
        });
      });

      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        ...mockSessionConfig,
        controlMessage: { type: 'interrupt' },
      }));
    });

    it('should not send data when disconnected', () => {
      const { result } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      act(() => {
        result.current.disconnect(); // Disconnect first
      });
      // Clear send calls from disconnect
      mockWsInstance.send.mockClear();

      act(() => {
        result.current.sendData({ text: 'Should not send' });
      });

      expect(mockWsInstance.send).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Cannot send data: WebSocket not connected or not open.');
    });
  });

  describe('Cleanup', () => {
    it('should disconnect on unmount', async () => {
      const { unmount } = renderHook(() =>
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      act(() => {
        // Simulate connection first so wsRef.current is not null
        const { result } = renderHook(() => useGenkitRealtime(mockApiUrl, mockSessionConfig));
        result.current.connect();
        vi.advanceTimersByTime(10); // Open WebSocket
        mockWsInstance.triggerMessage({ type: 'control', control: { type: 'ready' } });
      });

      unmount();

      // Expect 'stop' message to be sent and WebSocket to be closed
      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        ...mockSessionConfig,
        controlMessage: { type: 'stop' },
      }));
      expect(mockWsInstance.close).toHaveBeenCalledWith(1000, 'Client requested disconnect');
    });
  });
});
