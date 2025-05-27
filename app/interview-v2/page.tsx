'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useGenkitRealtime } from './hooks/useGenkitRealtime';
import { SessionSetup } from './components/SessionSetup';
import { LiveInterview } from './components/LiveInterview';
import { FeedbackView } from './components/FeedbackView';
import type { Feedback } from '@/src/genkit/schemas/types';

type ViewState = 'setup' | 'interview' | 'feedback';

// Extended SessionConfig for use with the realtime hook
interface ExtendedSessionConfig {
  sessionId: string;
  userId: string;
  jobRole: string;
  interviewType: 'Behavioral' | 'Technical' | 'Leadership' | 'General';
  difficulty: 'entry' | 'mid' | 'senior';
  systemInstruction: string;
}

// Component SessionConfig from SessionSetup
interface ComponentSessionConfig {
  interviewType: string;
  domainOrRole: string;
  sessionId?: string;
  userId?: string;
}

export default function InterviewV2Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [viewState, setViewState] = useState<ViewState>('setup');
  const [sessionConfig, setSessionConfig] = useState<ExtendedSessionConfig | null>(null);
  const [componentConfig, setComponentConfig] = useState<ComponentSessionConfig | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  // Initialize realtime hook with proper config
  const realtimeHook = useGenkitRealtime(
    '/api/interview-v2/session',
    sessionConfig || {
      sessionId: '',
      userId: user?.id || '',
      jobRole: '',
      interviewType: 'General',
      difficulty: 'mid',
      systemInstruction: '',
    },
    {
      onMessage: (data) => {
        // Handle feedback completion
        if (data.type === 'thinking' && data.data?.type === 'feedback') {
          setFeedback(data.data as Feedback);
          setViewState('feedback');
        }
      },
      onError: (error) => {
        console.error('Connection error:', error);
      },
    }
  );

  // Check auth on mount
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  // Handle session setup completion
  const handleSetupComplete = (config: ComponentSessionConfig) => {
    // Convert component config to extended config for the hook
    const extendedConfig: ExtendedSessionConfig = {
      sessionId: config.sessionId || `session_${Date.now()}`,
      userId: user?.id || '',
      jobRole: config.domainOrRole,
      interviewType: config.interviewType === 'behavioral' ? 'Behavioral' :
                     config.interviewType === 'technical' ? 'Technical' :
                     config.interviewType === 'situational' ? 'General' : 'General',
      difficulty: 'mid',
      systemInstruction: `You are an interviewer conducting a ${config.interviewType} interview for a ${config.domainOrRole} position. Ask relevant questions one at a time and provide constructive feedback.`,
    };
    
    setSessionConfig(extendedConfig);
    setComponentConfig(config);
    setViewState('interview');
  };

  // Handle interview end
  const handleInterviewEnd = () => {
    // Disconnect and wait for feedback
    realtimeHook.disconnect();
    
    // If no feedback arrives, go back to setup
    setTimeout(() => {
      if (!feedback) {
        setViewState('setup');
        setSessionConfig(null);
        setComponentConfig(null);
      }
    }, 5000);
  };

  // Handle returning to setup
  const handleReturnToSetup = () => {
    setViewState('setup');
    setSessionConfig(null);
    setComponentConfig(null);
    setFeedback(null);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render based on view state
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {viewState === 'setup' && (
        <SessionSetup 
          onComplete={handleSetupComplete}
          isLoading={false}
        />
      )}
      
      {viewState === 'interview' && componentConfig && (
        <LiveInterview
          sessionConfig={componentConfig}
          realtimeHook={realtimeHook}
          onEnd={handleInterviewEnd}
        />
      )}
      
      {viewState === 'feedback' && feedback && (
        <FeedbackView
          feedback={feedback}
          sessionConfig={componentConfig}
          onClose={handleReturnToSetup}
        />
      )}
    </div>
  );
}