'use client';

import { Button } from '@/components/ui/button';
import { StopCircle, SkipForward } from 'lucide-react';

interface InterviewControlsProps {
  onEnd: () => void;
  onInterrupt: () => void;
  isConnected: boolean;
  isReconnecting?: boolean;
}

export default function InterviewControls({
  onEnd,
  onInterrupt,
  isConnected,
  isReconnecting = false
}: InterviewControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="lg"
        onClick={onInterrupt}
        disabled={!isConnected || isReconnecting}
      >
        <SkipForward className="h-4 w-4 mr-2" />
        Skip Response
      </Button>
      
      <Button
        variant="destructive"
        size="lg"
        onClick={onEnd}
        disabled={isReconnecting}
      >
        <StopCircle className="h-4 w-4 mr-2" />
        End Interview
      </Button>
    </div>
  );
}