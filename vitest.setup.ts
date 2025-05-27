import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Make React available globally for tests
global.React = React;

// Mock window.AudioContext for audio processing tests
global.AudioContext = vi.fn().mockImplementation(() => ({
  createBufferSource: vi.fn(),
  createBuffer: vi.fn(),
  decodeAudioData: vi.fn(),
  destination: {},
  sampleRate: 48000,
})) as any;

// Mock MediaRecorder for audio recording tests
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: vi.fn(),
  state: 'inactive',
})) as any;

// Mock navigator.mediaDevices for getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn(),
      }],
    }),
  },
  writable: true,
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock WebSocket for real-time tests
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
})) as any;

// Mock EventSource for SSE tests
global.EventSource = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
})) as any;