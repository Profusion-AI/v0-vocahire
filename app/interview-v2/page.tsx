'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useGenkitRealtime } from './hooks/useGenkitRealtime';
import InterviewControls from './components/InterviewControls';
import TranscriptDisplay from './components/TranscriptDisplay';
import FeedbackDisplay from './components/FeedbackDisplay';
import AudioVisualization from './components/AudioVisualization';
import SessionStatus from './components/SessionStatus';
import type { TranscriptEntry, SessionStatus as SessionStatusType } from '@/src/genkit/schemas/types';

export default function InterviewV2Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [sessionStatus, setSessionStatus] = useState<SessionStatusType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    status,
    isConnected,
    connect,
    disconnect,
    sendData,
    error: connectionError
  } = useGenkitRealtime('/api/interview-v2/session', {
    jobPosition: 'Software Engineer',
    jobDescription: 'Full-stack development role',
    userId: user?.id || '',
    userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
    userName: user?.fullName || user?.firstName || 'User'
  }, {
    onMessage: (data) => {
      switch (data.type) {
        case 'transcript':
          if (data.transcript) {
            setTranscript(prev => [...prev, data.transcript!]);
          }
          break;
        case 'session_status':
          if (data.sessionStatus) {
            setSessionStatus(data.sessionStatus);
          }
          break;
        case 'error':
          setError(data.error?.message || 'An error occurred');
          break;
      }
    },
    onError: (error) => {
      console.error('Connection error:', error);
      setError(error.message);
    },
    reconnectAttempts: 3,
    reconnectDelay: 1000
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Auto-connect when component mounts
    connect();

    return () => {
      disconnect();
    };
  }, [isLoaded, user, router, connect, disconnect]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Interview Session</h1>
        <p className="text-gray-600">Practice your interview skills with our AI interviewer</p>
      </div>

      {(error || connectionError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || connectionError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Interview Controls</h2>
              <SessionStatus status={status} sessionStatus={sessionStatus} />
            </div>
            <InterviewControls
              isConnected={isConnected}
              status={status}
              onStart={() => sendData({ type: 'control', action: 'start' })}
              onStop={() => sendData({ type: 'control', action: 'stop' })}
              onToggleMute={(muted) => sendData({ type: 'control', action: 'mute', data: { muted } })}
            />
            <div className="mt-6">
              <AudioVisualization isActive={status === 'streaming'} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Transcript</h2>
            <TranscriptDisplay entries={transcript} />
          </Card>
        </div>

        <div className="space-y-6">
          {sessionStatus?.feedback && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Feedback</h2>
              <FeedbackDisplay feedback={sessionStatus.feedback} />
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Session Info</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Session ID</dt>
                <dd className="font-mono">{sessionStatus?.sessionId || 'Not started'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Duration</dt>
                <dd>{sessionStatus?.duration ? `${Math.round(sessionStatus.duration / 60)}m ${sessionStatus.duration % 60}s` : '0m 0s'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Status</dt>
                <dd className="capitalize">{status || 'Not connected'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}