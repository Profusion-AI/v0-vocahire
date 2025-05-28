'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useGenkitRealtime } from './hooks/useGenkitRealtime';
import { SessionSetup } from './components/SessionSetup';
import { LiveInterview } from './components/LiveInterview';
import { FeedbackView } from './components/FeedbackView';
import { Navbar } from '@/components/navbar';
import { TermsModal } from '@/components/terms-modal';
import { useTermsAgreement } from '@/hooks/use-terms-agreement';
import type { Feedback } from '@/src/genkit/schemas/types';

type ViewState = 'setup' | 'interview' | 'feedback';

// Extended SessionConfig for use with the realtime hook
export interface ExtendedSessionConfig {
  sessionId: string;
  userId: string;
  jobRole: string;
  interviewType: 'Behavioral' | 'Technical' | 'Leadership' | 'General';
  difficulty: 'entry' | 'mid' | 'senior';
  systemInstruction: string;
  jobPosition: string;
  jobDescription: string;
  userEmail: string;
  userName: string;
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
  const [reconnectAttempt, setReconnectAttempt] = useState<{ current: number; max: number } | null>(null);
  
  // Terms agreement hook
  const {
    showTermsModal,
    setShowTermsModal,
    agreeToTerms,
  } = useTermsAgreement(user?.id);
  
  // Initialize realtime hook only when we have a valid session config
  // This prevents connection attempts before the user starts the interview
  const realtimeHook = useGenkitRealtime(
    '/api/interview-v2/session',
    sessionConfig || {
      sessionId: 'dummy', // Dummy values to satisfy type requirements
      userId: 'dummy',
      jobRole: 'dummy',
      interviewType: 'General',
      difficulty: 'mid',
      systemInstruction: 'dummy',
      jobPosition: 'dummy',
      jobDescription: 'dummy',
      userEmail: 'dummy@example.com',
      userName: 'dummy'
    },
    {
      onMessage: (data) => {
        // Only process messages if we have a real session config
        if (!sessionConfig) return;
        
        // Handle feedback completion when session ends
        if (data.type === 'session_status' && data.sessionStatus?.status === 'completed' && data.sessionStatus?.feedback) {
          setFeedback(data.sessionStatus.feedback as Feedback);
          setViewState('feedback');
        }
      },
      onError: (error) => {
        // Only log errors if we have a real session config
        if (sessionConfig) {
          console.error('Connection error:', error);
        }
      },
      onReconnecting: (attempt, maxAttempts) => {
        if (sessionConfig) {
          setReconnectAttempt({ current: attempt, max: maxAttempts });
        }
      },
      onReconnected: () => {
        if (sessionConfig) {
          setReconnectAttempt(null);
        }
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

  // Handle connection lifecycle based on view state and session config
  useEffect(() => {
    if (viewState === 'interview' && sessionConfig && !realtimeHook.isConnected && !realtimeHook.isConnecting) {
      console.log("Triggering connect from page.tsx useEffect with latest config:", sessionConfig);
      realtimeHook.connect();
    } else if (viewState !== 'interview' && realtimeHook.isConnected) {
      // If we navigate away from 'interview' state, disconnect
      console.log("Disconnecting due to viewState change");
      realtimeHook.disconnect();
    }
  }, [viewState, sessionConfig, realtimeHook]);

  // Handle session setup completion
  const handleSetupComplete = async (config: ComponentSessionConfig) => {
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
      jobPosition: config.domainOrRole, // Using domainOrRole for jobPosition
      jobDescription: `Interview for a ${config.domainOrRole} position.`, // Placeholder
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown@example.com',
      userName: user?.fullName || 'Unknown User',
    };
    
    setSessionConfig(extendedConfig);
    setComponentConfig(config);
    setViewState('interview');
    
    // Connection will be initiated by useEffect after state updates
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
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      {viewState === 'setup' && (
        <SessionSetup 
          onComplete={handleSetupComplete}
          isLoading={false}
        />
      )}
      
      {viewState === 'interview' && sessionConfig && ( // Use sessionConfig state
        <LiveInterview
          sessionConfig={sessionConfig}
          realtimeHook={realtimeHook}
          onEnd={handleInterviewEnd}
          reconnectAttempt={reconnectAttempt}
        />
      )}
      
      {viewState === 'feedback' && feedback && (
        <FeedbackView
          feedback={feedback}
          sessionConfig={componentConfig || undefined}
          onClose={handleReturnToSetup}
        />
      )}
      </div>
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAgree={agreeToTerms}
      />
    </>
  );
}
