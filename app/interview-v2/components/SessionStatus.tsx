'use client';

import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Circle } from 'lucide-react';
import type { SessionStatus as SessionStatusType } from '@/src/genkit/schemas/types';

interface SessionStatusProps {
  status: string;
  sessionStatus?: SessionStatusType | null; // Make sessionStatus optional
  error: { code: string; message: string; timestamp: string; retryable?: boolean | undefined; details?: any; } | null;
}

export default function SessionStatus({ status, sessionStatus }: SessionStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting...',
          variant: 'secondary' as const
        };
      case 'connected':
        return {
          icon: <Circle className="w-4 h-4" />,
          text: 'Ready',
          variant: 'secondary' as const
        };
      case 'streaming':
        return {
          icon: <Circle className="w-4 h-4 animate-pulse text-red-500" />,
          text: 'Live',
          variant: 'default' as const
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Error',
          variant: 'destructive' as const
        };
      case 'disconnected':
      default:
        return {
          icon: <Circle className="w-4 h-4 text-gray-400" />,
          text: 'Offline',
          variant: 'outline' as const
        };
    }
  };

  const getSessionStatusDisplay = () => {
    if (!sessionStatus) return null;

    switch (sessionStatus.status) {
      case 'active':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
          text: 'Active Session',
          color: 'text-green-600'
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
          text: 'Completed',
          color: 'text-blue-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          text: 'Session Error',
          color: 'text-red-600'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();
  const sessionDisplay = getSessionStatusDisplay();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusDisplay.variant} className="gap-1">
        {statusDisplay.icon}
        {statusDisplay.text}
      </Badge>
      
      {sessionDisplay && (
        <div className={`flex items-center gap-1 text-sm ${sessionDisplay.color}`}>
          {sessionDisplay.icon}
          <span>{sessionDisplay.text}</span>
        </div>
      )}
    </div>
  );
}
