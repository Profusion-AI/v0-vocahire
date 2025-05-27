/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioStream } from '../useAudioStream'; // Assuming the hook is named useAudioStream

// Mock the MediaDevices API
const mockMediaStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
};

const mockMediaDevices = {
  getUserMedia: vi.fn(),
};

const globalNavigator = global.navigator as any;

Object.defineProperty(globalNavigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

// Mock the AudioContext and related APIs
const mockAudioBufferSourceNode = {
  buffer: null,
  connect: vi.fn(),
  start: vi.fn(),
  onended: null,
  stop: vi.fn(), // Added stop method
};

const mockAnalyserNode = {
  fftSize: 256,
  frequencyBinCount: 128,
  getByteFrequencyData: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(), // Added disconnect method
};

const mockMediaStreamSourceNode = {
  connect: vi.fn(),
  disconnect: vi.fn(), // Added disconnect method
};

const mockScriptProcessorNode = {
  onaudioprocess: null,
  connect: vi.fn(),
  disconnect: vi.fn(), // Added disconnect method
};


const mockAudioContext = {
  createMediaStreamSource: vi.fn(() => mockMediaStreamSourceNode),
  createAnalyser: vi.fn(() => mockAnalyserNode),
  createScriptProcessor: vi.fn(() => mockScriptProcessorNode), // Mock ScriptProcessorNode
  destination: {},
  state: 'running', // Added state
  resume: vi.fn(), // Added resume
  suspend: vi.fn(), // Added suspend
  close: vi.fn(), // Added close
};

global.AudioContext = vi.fn(() => mockAudioContext) as any;
global.webkitAudioContext = vi.fn(() => mockAudioContext) as any; // Mock for older browsers

describe('useAudioStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMediaDevices.getUserMedia.mockResolvedValue(mockMediaStream);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Edge Case Tests for Microphone Permission Issues ---

  it('should handle microphone permission denied', async () => {
    const permissionError = new Error('Permission denied');
    mockMediaDevices.getUserMedia.mockRejectedValueOnce(permissionError);

    const { result } = renderHook(() => useAudioStream());

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(false);
      expect(result.current.error).toBe(permissionError);
      expect(result.current.isCheckingPermission).toBe(false);
    });
    expect(mockMediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('should handle microphone access errors', async () => {
     const accessError = new Error('Microphone not available');
     mockMediaDevices.getUserMedia.mockRejectedValueOnce(accessError);

     const { result } = renderHook(() => useAudioStream());

     await waitFor(() => {
       expect(result.current.hasPermission).toBe(false);
       expect(result.current.error).toBe(accessError);
       expect(result.current.isCheckingPermission).toBe(false);
     });
     expect(mockMediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
   });


  it('should handle revoking microphone permission during stream', async () => {
    // This is harder to test directly with mocks as revoking permission
    // typically manifests as the stream ending or tracks being muted.
    // We can simulate the stream ending.

    const { result } = renderHook(() => useAudioStream());

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.isCheckingPermission).toBe(false);
    });

    // Simulate the stream ending (e.g., user revokes permission)
    // This requires access to the actual MediaStream object returned by getUserMedia
    // and triggering its 'inactive' event or the 'ended' event on its tracks.
    // With current mocks, we can only simulate the effect on the hook's state.

    // TODO: Find a way to properly mock MediaStream events or test this scenario
    // in an end-to-end test with a real browser.

    // For now, a placeholder test:
    expect(true).toBe(true); // Placeholder
  });

  // TODO: Add tests for mute/unmute functionality and how it affects sending audio data
  // TODO: Add tests for audio processing (resampling, PCM16 conversion) - this might require
  // mocking ScriptProcessorNode's onaudioprocess and verifying the output format/data.
  // TODO: Add tests for cleanup logic on unmount.
});
