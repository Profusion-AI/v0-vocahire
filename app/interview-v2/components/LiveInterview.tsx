'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { AudioVisualization } from './AudioVisualization';
import { TranscriptDisplay } from './TranscriptDisplay';
import { InterviewControls } from './InterviewControls';
import { SessionStatus } from './SessionStatus';
import { useAudioStream } from '../hooks/useAudioStream';
import type { UseGenkitRealtimeReturn } from '../hooks/useGenkitRealtime';
import type { SessionConfig } from '@/src/genkit/schemas/types';

interface LiveInterviewProps {
  sessionConfig: SessionConfig;
  realtimeHook: UseGenkitRealtimeReturn;
  onEnd: () => void;
}

export function LiveInterview({ sessionConfig, realtimeHook, onEnd }: LiveInterviewProps) {
  const {
    status,
    isConnected,
    isConnecting,
    error,
    transcript,
    aiAudioQueue,
    connect,
    disconnect,
    sendAudio,
    interrupt,
  } = realtimeHook;

  // Audio stream management
  const audioStream = useAudioStream({
    sampleRate: 16000,
    channelCount: 1,
  });

  // Audio playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  // Send audio chunks periodically
  useEffect(() => {
    if (!isConnected || !audioStream.isActive || audioStream.isMuted) return;

    const interval = setInterval(() => {
      const chunk = audioStream.getAudioChunk();
      if (chunk) {
        sendAudio(chunk.buffer);
      }
    }, 100); // Send audio every 100ms

    return () => clearInterval(interval);
  }, [isConnected, audioStream.isActive, audioStream.isMuted, audioStream.getAudioChunk, sendAudio]);

  // Start audio stream when connected
  useEffect(() => {
    if (isConnected && !audioStream.isActive) {
      audioStream.startStream().catch(console.error);
    }
  }, [isConnected, audioStream.isActive, audioStream.startStream]);

  // Play AI audio responses
  useEffect(() => {
    if (aiAudioQueue.length === 0 || speakerMuted) return;

    const playNextChunk = async () => {
      if (aiAudioQueue.length === 0) {
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
        console.error('Failed to play audio chunk:', err);
        aiAudioQueue.shift();
        playNextChunk();
      }
    };

    if (!isPlaying) {
      playNextChunk();
    }
  }, [aiAudioQueue, speakerMuted, isPlaying]);

  // Handle interview end
  const handleEnd = () => {
    audioStream.stopStream();
    disconnect();
    onEnd();
  };

  // Handle interrupt
  const handleInterrupt = () => {
    interrupt();
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
  }, [audioStream.stopStream]);

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Interview Session</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={sessionConfig.interviewType === 'technical' ? 'default' : 'secondary'}>
                {sessionConfig.interviewType}
              </Badge>
              <Badge variant="outline">{sessionConfig.domainOrRole}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connection Status */}
      <SessionStatus
        status={status}
        sessionStatus={null}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-semibold mb-1">{error.code.replace(/_/g, ' ')}</p>
              <p>{error.message}</p>
              {error.retryable && (
                <p className="text-sm mt-2 text-muted-foreground">
                  We'll automatically retry the connection...
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Microphone Permission Error */}
      {audioStream.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Microphone access error: {audioStream.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Interview Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioVisualization
              analyserNode={audioStream.analyserNode}
              isActive={audioStream.isActive}
              isMuted={audioStream.isMuted}
              audioLevel={audioStream.audioLevel}
            />
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="max-h-[500px] overflow-hidden">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[400px]">
            <TranscriptDisplay entries={transcript} />
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <InterviewControls
        isConnected={isConnected}
        isMicMuted={audioStream.isMuted}
        isSpeakerMuted={speakerMuted}
        isRecording={audioStream.isActive}
        onToggleMic={() => audioStream.toggleMute()}
        onToggleSpeaker={() => setSpeakerMuted(!speakerMuted)}
        onInterrupt={handleInterrupt}
        onEndInterview={handleEnd}
      />

      {/* Loading State */}
      {isConnecting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-lg">Connecting to interview session...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}