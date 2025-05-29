'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAudioStream, MicrophonePermissionError, MicrophoneNotFoundError } from '../hooks/useAudioStream';

interface MicCheckModalProps {
  open: boolean;
  onComplete: () => void;
  onCancel: () => void;
  sessionConfig: any; // We'll pass the session config for connection prep
}

export function MicCheckModal({ open, onComplete, onCancel }: MicCheckModalProps) {
  const [step, setStep] = useState<'permission' | 'testing' | 'ready'>('permission');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [audioDetected, setAudioDetected] = useState(false);
  const [peakLevel, setPeakLevel] = useState(0);
  
  // Initialize audio stream
  const audioStream = useAudioStream({
    sampleRate: 16000,
    channelCount: 1,
  });

  // Request permission when modal opens
  useEffect(() => {
    if (open && audioStream.hasPermission === null && !audioStream.isCheckingPermission) {
      audioStream.requestPermission();
    }
  }, [open, audioStream.hasPermission, audioStream.isCheckingPermission, audioStream]);

  // Move to testing step when permission is granted
  useEffect(() => {
    if (audioStream.hasPermission === true && step === 'permission') {
      setStep('testing');
      // Start the audio stream
      audioStream.startStream();
    }
  }, [audioStream.hasPermission, step, audioStream]);

  // Track audio levels for visual feedback
  useEffect(() => {
    if (audioStream.audioLevel > 0.1) {
      setAudioDetected(true);
      setPeakLevel(Math.max(peakLevel, audioStream.audioLevel));
    }
  }, [audioStream.audioLevel, peakLevel]);

  // Simulate connection preparation (this gives time for API setup)
  useEffect(() => {
    if (step === 'testing' && connectionStatus === 'idle') {
      setConnectionStatus('connecting');
      
      // Simulate connection setup time (2-3 seconds)
      const timer = setTimeout(() => {
        setConnectionStatus('connected');
        
        // Move to ready step after a brief moment
        setTimeout(() => {
          if (audioDetected) {
            setStep('ready');
          }
        }, 500);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [step, connectionStatus, audioDetected]);

  // Auto-advance to ready when conditions are met
  useEffect(() => {
    if (step === 'testing' && audioDetected && connectionStatus === 'connected') {
      const timer = setTimeout(() => {
        setStep('ready');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, audioDetected, connectionStatus]);

  const handleContinue = useCallback(() => {
    // Stop the audio stream as the main interview will handle it
    audioStream.stopStream();
    onComplete();
  }, [audioStream, onComplete]);

  const handleCancel = useCallback(() => {
    audioStream.stopStream();
    onCancel();
  }, [audioStream, onCancel]);

  // Calculate normalized audio level for visualization
  const normalizedLevel = Math.min(audioStream.audioLevel * 100, 100);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'permission' && 'Microphone Permission Required'}
            {step === 'testing' && 'Setting Up Your Interview'}
            {step === 'ready' && 'Ready to Begin!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'permission' && 'We need access to your microphone for the interview.'}
            {step === 'testing' && 'Please ensure you are in a quiet space for the best experience.'}
            {step === 'ready' && 'Everything is set up. You can start your interview now.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Permission Step */}
          {step === 'permission' && (
            <>
              {audioStream.error instanceof MicrophonePermissionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {audioStream.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {audioStream.error instanceof MicrophoneNotFoundError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No microphone detected. Please connect a microphone and try again.
                  </AlertDescription>
                </Alert>
              )}

              {audioStream.isCheckingPermission && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!audioStream.isCheckingPermission && !audioStream.hasPermission && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click your browser's permission dialog to allow microphone access.
                  </p>
                  {/* Fallback button if permission dialog doesn't appear automatically */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => audioStream.requestPermission()}
                    className="mt-2"
                  >
                    Request Microphone Access
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    If you don't see a permission dialog, click the button above or check your browser's address bar for a blocked permission icon.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Testing Step */}
          {step === 'testing' && (
            <div className="space-y-4">
              {/* Microphone Level Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Microphone Check</span>
                  <Badge variant={audioDetected ? "default" : "secondary"} className="gap-1">
                    {audioDetected ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Audio Detected
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3" />
                        Speak to Test
                      </>
                    )}
                  </Badge>
                </div>
                
                {/* Audio Level Bar */}
                <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-100 ease-out"
                    style={{ width: `${normalizedLevel}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground/60">
                      {audioDetected ? 'Great! Your microphone is working' : 'Say something to test your microphone'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Interview Setup</span>
                  <Badge 
                    variant={connectionStatus === 'connected' ? "default" : "secondary"} 
                    className="gap-1"
                  >
                    {connectionStatus === 'connecting' && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Preparing
                      </>
                    )}
                    {connectionStatus === 'connected' && (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Ready
                      </>
                    )}
                  </Badge>
                </div>
                <Progress 
                  value={connectionStatus === 'connecting' ? 50 : connectionStatus === 'connected' ? 100 : 0} 
                  className="h-2"
                />
              </div>

              {/* Tips */}
              <Alert>
                <Volume2 className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Find a quiet space with minimal background noise</li>
                    <li>Speak clearly and at a normal volume</li>
                    <li>Keep your microphone about 6-12 inches from your mouth</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Ready Step */}
          {step === 'ready' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">All systems ready!</p>
                <p className="text-sm text-muted-foreground">
                  Your microphone is working and the interview system is prepared.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={step !== 'ready'}
          >
            {step === 'ready' ? 'Start Interview' : 'Waiting...'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}