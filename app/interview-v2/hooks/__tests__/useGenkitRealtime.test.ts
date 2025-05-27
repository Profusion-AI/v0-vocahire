/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGenkitRealtime } from '../useGenkitRealtime';
import type { SessionConfig } from '../useGenkitRealtime';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useGenkitRealtime', () => {
  const mockApiUrl = '/api/genkit-realtime';
  const mockSessionConfig: SessionConfig = {
    sessionId: 'test-session-123',
    userId: 'test-user-456',
    jobRole: 'Software Engineer',
    difficulty: 'mid',
    systemInstruction: 'Be a friendly interviewer.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
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
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"control","data":{"status":"connected"}}\n\n'));
          }
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      expect(mockFetch).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mockSessionConfig,
          controlMessage: { type: 'start' },
        }),
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.isConnecting).toBe(false);
      });
    });

    it('should handle connection errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.error).toEqual({
        code: 'CONNECTION_ERROR',
        message: 'Network error',
        retryable: true,
        timestamp: expect.any(String),
      });
    });

    it('should disconnect properly', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      act(() => {
        result.current.disconnect();
      });

      expect(mockFetch).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mockSessionConfig,
          controlMessage: { type: 'stop' },
        }),
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
    });

    it('should attempt reconnection on failure', async () => {
      vi.useFakeTimers();
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));
      mockFetch.mockResolvedValueOnce({ 
        ok: true,
        body: new ReadableStream(),
      });

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig, { 
          maxReconnectAttempts: 3,
          reconnectDelay: 1000 
        })
      );

      await act(async () => {
        await result.current.connect();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // First reconnect attempt
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Second reconnect attempt
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Message Handling', () => {
    it('should handle transcript messages', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"control","data":{"status":"connected"}}\n\n'));
            controller.enqueue(new TextEncoder().encode('data: {"type":"transcript","data":{"speaker":"ai","text":"Hello!"}}\n\n'));
          }
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.transcript).toHaveLength(1);
        expect(result.current.transcript[0]).toMatchObject({
          speaker: 'ai',
          text: 'Hello!',
          timestamp: expect.any(String),
        });
      });
    });

    it('should handle audio messages', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"audio","data":"base64audiodata"}\n\n'));
          }
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.aiAudioQueue).toHaveLength(1);
        expect(result.current.aiAudioQueue[0]).toBe('base64audiodata');
      });
    });

    it('should handle error messages', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"error","data":{"code":"TEST_ERROR","message":"Test error"}}\n\n'));
          }
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          code: 'TEST_ERROR',
          message: 'Test error',
          timestamp: expect.any(String),
        });
      });
    });
  });

  describe('Sending Data', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"control","data":{"status":"connected"}}\n\n'));
          }
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);
    });

    it('should send audio data when connected', async () => {
      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({ ok: true });

      const audioData = new ArrayBuffer(8);
      act(() => {
        result.current.sendAudio(audioData);
      });

      expect(mockFetch).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"audioChunk"'),
      });
    });

    it('should not send audio when disconnected', () => {
      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      const audioData = new ArrayBuffer(8);
      act(() => {
        result.current.sendAudio(audioData);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should send text data when connected', async () => {
      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({ ok: true });

      act(() => {
        result.current.sendText('Hello, AI!');
      });

      expect(mockFetch).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"textInput":"Hello, AI!"'),
      });
    });

    it('should send interrupt command and clear audio queue', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type":"control","data":{"status":"connected"}}\n\n'));
            controller.enqueue(new TextEncoder().encode('data: {"type":"audio","data":"audio1"}\n\n'));
            controller.enqueue(new TextEncoder().encode('data: {"type":"audio","data":"audio2"}\n\n'));
          }
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.aiAudioQueue).toHaveLength(2);
      });

      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({ ok: true });

      act(() => {
        result.current.interrupt();
      });

      expect(mockFetch).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"controlMessage":{"type":"interrupt"}'),
      });

      expect(result.current.aiAudioQueue).toHaveLength(0);
    });
  });

  describe('Cleanup', () => {
    it('should disconnect on unmount', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const { unmount } = renderHook(() => 
        useGenkitRealtime(mockApiUrl, mockSessionConfig)
      );

      unmount();

      expect(mockFetch).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"controlMessage":{"type":"stop"}'),
      });
    });
  });
});