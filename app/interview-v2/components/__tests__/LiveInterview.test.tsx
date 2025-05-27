import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InterviewV2Page from '../../page';

// Mock the useGenkitRealtime hook
vi.mock('../../hooks/useGenkitRealtime', () => ({
  useGenkitRealtime: vi.fn(() => ({
    status: 'connected',
    isConnected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendData: vi.fn(),
    error: null
  }))
}));

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      fullName: 'Test User'
    },
    isLoaded: true
  })
}));

describe('LiveInterview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the live interview interface when connected', () => {
    render(<InterviewV2Page />);
    
    expect(screen.getByText('AI Interview Session')).toBeInTheDocument();
    expect(screen.getByText('Practice your interview skills with our AI interviewer')).toBeInTheDocument();
    expect(screen.getByText('Interview Controls')).toBeInTheDocument();
  });

  it('should display transcript updates from the hook', () => {
    const { useGenkitRealtime } = require('../../hooks/useGenkitRealtime');
    useGenkitRealtime.mockReturnValue({
      status: 'streaming',
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      sendData: vi.fn(),
      error: null,
      transcript: [
        { id: '1', role: 'assistant', text: 'Hello! Tell me about yourself.', timestamp: new Date().toISOString() },
        { id: '2', role: 'user', text: 'I am a software engineer...', timestamp: new Date().toISOString() }
      ]
    });

    render(<InterviewV2Page />);
    
    // Check that transcript is displayed
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  it('should display connection status', () => {
    render(<InterviewV2Page />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should display error messages from the hook', () => {
    const { useGenkitRealtime } = require('../../hooks/useGenkitRealtime');
    useGenkitRealtime.mockReturnValue({
      status: 'error',
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      sendData: vi.fn(),
      error: 'Connection failed'
    });

    render(<InterviewV2Page />);
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should call sendAudio when user speaks (mocked)', async () => {
    const mockSendData = vi.fn();
    const { useGenkitRealtime } = require('../../hooks/useGenkitRealtime');
    useGenkitRealtime.mockReturnValue({
      status: 'streaming',
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      sendData: mockSendData,
      error: null
    });

    render(<InterviewV2Page />);
    
    const startButton = screen.getByText('Start Interview');
    await userEvent.click(startButton);
    
    expect(mockSendData).toHaveBeenCalledWith({ type: 'control', action: 'start' });
  });

  it('should call interrupt when an interrupt action occurs (mocked)', async () => {
    const mockSendData = vi.fn();
    const { useGenkitRealtime } = require('../../hooks/useGenkitRealtime');
    useGenkitRealtime.mockReturnValue({
      status: 'streaming',
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      sendData: mockSendData,
      error: null
    });

    render(<InterviewV2Page />);
    
    const stopButton = screen.getByText('End Interview');
    await userEvent.click(stopButton);
    
    expect(mockSendData).toHaveBeenCalledWith({ type: 'control', action: 'stop' });
  });

  it('should call disconnect when the component unmounts or session ends', () => {
    const mockDisconnect = vi.fn();
    const { useGenkitRealtime } = require('../../hooks/useGenkitRealtime');
    useGenkitRealtime.mockReturnValue({
      status: 'connected',
      isConnected: true,
      connect: vi.fn(),
      disconnect: mockDisconnect,
      sendData: vi.fn(),
      error: null
    });

    const { unmount } = render(<InterviewV2Page />);
    
    unmount();
    
    expect(mockDisconnect).toHaveBeenCalled();
  });
});