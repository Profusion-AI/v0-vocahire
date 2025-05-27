'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAudioStream } from '../hooks/useAudioStream';
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
}

export function LiveInterview({ sessionConfig, realtimeHook, onEnd }: LiveInterviewProps) {
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

      {/* Audio Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={audioStream.isMuted ? 'secondary' : 'default'}
              size="icon"
              onClick={() => audioStream.setIsMuted(!audioStream.isMuted)}
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
      />
    </div>
  );
}