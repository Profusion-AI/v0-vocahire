'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewControlsProps {
  isConnected: boolean;
  status: string;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: (muted: boolean) => void;
}

export default function InterviewControls({
  isConnected,
  status,
  onStart,
  onStop,
  onToggleMute
}: InterviewControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Check microphone permission on mount
    checkMicrophonePermission();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    setIsCheckingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    onToggleMute(newMutedState);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    // In a real implementation, you would control audio output here
  };

  const isInterviewActive = status === 'streaming' || status === 'connected';

  return (
    <div className="space-y-4">
      {!hasPermission && !isCheckingPermission && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            Microphone permission required. Please allow access when prompted.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={checkMicrophonePermission}
          >
            Request Permission
          </Button>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Button
          size="lg"
          variant={isInterviewActive ? 'destructive' : 'default'}
          onClick={isInterviewActive ? onStop : onStart}
          disabled={!isConnected || !hasPermission || isCheckingPermission}
          className="min-w-[140px]"
        >
          {isInterviewActive ? (
            <>
              <Square className="w-5 h-5 mr-2" />
              End Interview
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Interview
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={isMuted ? 'destructive' : 'secondary'}
            onClick={handleToggleMute}
            disabled={!isInterviewActive}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant={isSpeakerMuted ? 'destructive' : 'secondary'}
            onClick={handleToggleSpeaker}
            disabled={!isInterviewActive}
            title={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className={cn(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        {isInterviewActive && (
          <>
            <span className="mx-2">•</span>
            <span className="flex items-center gap-1">
              {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              {isMuted ? 'Muted' : 'Listening'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}