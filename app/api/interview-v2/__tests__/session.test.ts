import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../session/route';
import { NextRequest } from 'next/server';
import { LiveAPISessionManager } from '@/lib/live-api-session-manager';

// Mock the session manager
vi.mock('@/lib/live-api-session-manager', () => ({
  LiveAPISessionManager: {
    getInstance: vi.fn(() => ({
      getOrCreateSession: vi.fn(),
      closeSession: vi.fn()
    }))
  }
}));

describe('POST /api/interview-v2/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a streaming response for valid input', async () => {
    const mockSession = {
      connect: vi.fn(),
      send: vi.fn(),
      on: vi.fn(),
      arrayBufferToBase64: vi.fn((buffer: ArrayBuffer) => 'base64data'),
    };

    const sessionManager = LiveAPISessionManager.getInstance();
    (sessionManager.getOrCreateSession as any).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api/interview-v2/session', {
      method: 'POST',
      body: JSON.stringify({
        jobPosition: 'Software Engineer',
        jobDescription: 'Full-stack development',
        userId: 'user123',
        userEmail: 'user@example.com',
        userName: 'Test User'
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });

  it('should return a 400 error for invalid input', async () => {
    const request = new NextRequest('http://localhost:3000/api/interview-v2/session', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        userId: 'user123'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('SESSION_ERROR');
  });

  it('should handle session creation errors', async () => {
    const sessionManager = LiveAPISessionManager.getInstance();
    (sessionManager.getOrCreateSession as any).mockRejectedValue(new Error('Session creation failed'));

    const request = new NextRequest('http://localhost:3000/api/interview-v2/session', {
      method: 'POST',
      body: JSON.stringify({
        jobPosition: 'Software Engineer',
        jobDescription: 'Full-stack development',
        userId: 'user123',
        userEmail: 'user@example.com',
        userName: 'Test User'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('SESSION_ERROR');
    expect(data.error.message).toBe('Session creation failed');
  });
});