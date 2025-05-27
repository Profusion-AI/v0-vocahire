'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAudioStream, MicrophonePermissionError, MicrophoneNotFoundError } from '../hooks/useAudioStream';
import type { UseGenkitRealtimeReturn } from '../hooks/useGenkitRealtime';
import AudioVisualization from './AudioVisualization';
import TranscriptDisplay from './TranscriptDisplay';
import InterviewControls from './InterviewControls';
import SessionStatus from './SessionStatus';
import type { SessionConfig as GenkitSessionConfig, RealtimeInputSchema } from '@/src/genkit/schemas/types';
import { z } from 'zod';

// Extended SessionConfig that includes both Genkit schema fields and interview-specific fields
interface SessionConfig extends GenkitSessionConfig {
  interviewType: string;
  domainOrRole: string;
  sessionId?: string;
}

interface LiveInterviewProps {
  sessionConfig: SessionConfig;
  realtimeHook: UseGenkitRealtimeReturn;
  onEnd: () => void;
  reconnectAttempt?: { current: number; max: number } | null;
}

export function LiveInterview({ sessionConfig, realtimeHook, onEnd, reconnectAttempt }: LiveInterviewProps) {
  const router = useRouter();
  const {
    status,
    isConnected,
    error,
    transcript,
    aiAudioQueue,
    connect,
    disconnect,
    sendData,
  } = realtimeHook;

  // Audio stream management
  const audioStream = useAudioStream({
    sampleRate: 16000,
    channelCount: 1,
  });
  
  // Handle microphone permission on mount
  useEffect(() => {
    if (audioStream.hasPermission === false && audioStream.error) {
      // Don't auto-request, let user trigger it
      console.warn('Microphone permission denied:', audioStream.error);
    } else if (audioStream.hasPermission === true && !audioStream.isActive) {
      // Auto-start if we have permission
      audioStream.startStream();
    }
  }, [audioStream]);

  // Audio playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  // Start connection on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Send audio data periodically
  useEffect(() => {
    if (!isConnected || !audioStream.isActive) return;

    const interval = setInterval(() => {
      const audioBuffer = audioStream.getAudioBuffer();
      if (audioBuffer && audioBuffer.byteLength > 0) {
        // Convert to base64
        const bytes = new Uint8Array(audioBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);
        
        sendData({
          sessionId: sessionConfig.sessionId || `session_${Date.now()}`,
          userId: sessionConfig.userId,
          jobRole: sessionConfig.domainOrRole,
          interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' :
                        sessionConfig.interviewType === 'technical' ? 'Technical' :
                        sessionConfig.interviewType === 'situational' ? 'General' : 'General',
          difficulty: 'mid',
          systemInstruction: `You are an interviewer conducting a ${sessionConfig.interviewType} interview for a ${sessionConfig.domainOrRole} position.`,
          audioChunk: base64Audio,
        } satisfies z.infer<typeof RealtimeInputSchema>);
      }
    }, 100); // Send every 100ms

    return () => clearInterval(interval);
  }, [isConnected, audioStream.isActive, audioStream.getAudioBuffer, sendData, sessionConfig]);

  // Play AI audio responses
  const playNextChunk = useCallback(async () => {
    if (aiAudioQueue.length === 0 || speakerMuted) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const base64Audio = aiAudioQueue[0];
    
    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      // Create and play audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        // Remove played chunk and play next
        aiAudioQueue.shift();
        playNextChunk();
      };
      
      source.start();
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
    }
  }, [aiAudioQueue, speakerMuted]);

  // Trigger audio playback when new chunks arrive
  useEffect(() => {
    if (aiAudioQueue.length > 0 && !isPlaying) {
      playNextChunk();
    }
  }, [aiAudioQueue, isPlaying, playNextChunk]);

  // Handle interview end
  const handleEnd = () => {
    audioStream.stopStream();
    disconnect();
    onEnd();
  };

  // Handle interrupt
  const handleInterrupt = () => {
    sendData({
      sessionId: sessionConfig.sessionId || `session_${Date.now()}`,
      userId: sessionConfig.userId,
      jobRole: sessionConfig.domainOrRole,
      interviewType: sessionConfig.interviewType === 'behavioral' ? 'Behavioral' :
                    sessionConfig.interviewType === 'technical' ? 'Technical' :
                    sessionConfig.interviewType === 'situational' ? 'General' : 'General',
      difficulty: 'mid',
      systemInstruction: `You are an interviewer conducting a ${sessionConfig.interviewType} interview for a ${sessionConfig.domainOrRole} position.`,
      controlMessage: { type: 'interrupt' },
    } satisfies z.infer<typeof RealtimeInputSchema>);
    
    // Stop current audio playback
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioStream.stopStream();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream]);

  // Add router navigation guard
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (isConnected && status === 'streaming') {
        const confirmLeave = window.confirm(
          'Are you sure you want to leave? Your interview session will be terminated.'
        );
        if (!confirmLeave) {
          // Prevent navigation by throwing an error
          throw new Error('Navigation cancelled by user');
        }
      }
    };

    // Next.js 13+ doesn't have router events, so we rely on beforeunload
    // The hook already handles beforeunload, this is just for documentation
    
    return () => {
      // Cleanup handled by the hook
    };
  }, [isConnected, status]);

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {sessionConfig.interviewType.charAt(0).toUpperCase() + sessionConfig.interviewType.slice(1)} Interview
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {sessionConfig.domainOrRole}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Session Status */}
      <SessionStatus status={status} error={error} />
      
      {/* Reconnection Progress */}
      {reconnectAttempt && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Reconnecting...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-3">
              Connection lost. Attempting to reconnect...
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Attempt {reconnectAttempt.current} of {reconnectAttempt.max}</span>
                <span className="text-yellow-600">
                  {Math.round((reconnectAttempt.current / reconnectAttempt.max) * 100)}%
                </span>
              </div>
              <Progress 
                value={(reconnectAttempt.current / reconnectAttempt.max) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Connection Lost Error */}
      {status === 'disconnected' && !reconnectAttempt && error?.code === 'MAX_RECONNECT_ATTEMPTS' && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Connection Lost</AlertTitle>
          <AlertDescription>
            Unable to reconnect to the interview session. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Microphone Permission Error */}
      {audioStream.error && audioStream.error instanceof MicrophonePermissionError && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Microphone Permission Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-4">
              {audioStream.error.message}
            </p>
            <Button 
              onClick={() => audioStream.requestPermission()}
              disabled={audioStream.isCheckingPermission}
            >
              {audioStream.isCheckingPermission ? 'Checking...' : 'Grant Microphone Access'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Microphone Not Found Error */}
      {audioStream.error && audioStream.error instanceof MicrophoneNotFoundError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Microphone Detected</AlertTitle>
          <AlertDescription>
            {audioStream.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Audio Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={audioStream.isMuted ? 'secondary' : 'default'}
              size="icon"
              onClick={() => audioStream.setIsMuted(!audioStream.isMuted)}
              disabled={!audioStream.isActive || !isConnected}
            >
              {audioStream.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <AudioVisualization 
              audioLevel={audioStream.audioLevel}
              isActive={audioStream.isActive}
            />
            
            <Button
              variant={speakerMuted ? 'secondary' : 'default'}
              size="icon"
              onClick={() => setSpeakerMuted(!speakerMuted)}
            >
              {speakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <TranscriptDisplay transcript={transcript} />

      {/* Controls */}
      <InterviewControls
        onEnd={handleEnd}
        onInterrupt={handleInterrupt}
        isConnected={isConnected}
        isReconnecting={!!reconnectAttempt}
      />
    </div>
  );
}