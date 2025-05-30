'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useGenkitRealtime } from './hooks/useGenkitRealtime';
import { SessionSetup } from './components/SessionSetup';
import { LiveInterview } from './components/LiveInterview';
import { FeedbackView } from './components/FeedbackView';
import { MicCheckModal } from './components/MicCheckModal';
import { Navbar } from '@/components/navbar';
import { TermsModal } from '@/components/terms-modal';
import { useTermsAgreement } from '@/hooks/use-terms-agreement';
import type { Feedback } from '@/src/genkit/schemas/types';

type ViewState = 'setup' | 'mic-check' | 'interview' | 'feedback';

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
  const [connectionRequested, setConnectionRequested] = useState(false);
  const [isConnectionPending, setIsConnectionPending] = useState(false);
  
  // Terms agreement hook
  const {
    showTermsModal,
    setShowTermsModal,
    agreeToTerms,
  } = useTermsAgreement(user?.id);
  
  // Create stable dummy config to prevent re-renders
  const dummyConfig = useMemo(() => ({
    sessionId: 'dummy', // Dummy values to satisfy type requirements
    userId: 'dummy',
    jobRole: 'dummy',
    interviewType: 'General' as const,
    difficulty: 'mid' as const,
    systemInstruction: 'dummy',
    jobPosition: 'dummy',
    jobDescription: 'dummy',
    userEmail: 'noreply@localhost',
    userName: 'dummy'
  }), []);

  // Stable callbacks for the realtime hook
  const onMessage = useCallback((data: any) => {
    // Only process messages if we have a real session config
    if (!sessionConfig) return;
    
    // Handle feedback completion when session ends
    if (data.type === 'session_status' && data.sessionStatus?.status === 'completed' && data.sessionStatus?.feedback) {
      setFeedback(data.sessionStatus.feedback as Feedback);
      setViewState('feedback');
    }
  }, [sessionConfig]);

  const onError = useCallback((error: any) => {
    // Only log errors if we have a real session config
    if (sessionConfig) {
      console.error('Connection error:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        timestamp: error?.timestamp,
        fullError: error
      });
    }
  }, [sessionConfig]);

  const onReconnecting = useCallback((attempt: number, maxAttempts: number) => {
    if (sessionConfig) {
      setReconnectAttempt({ current: attempt, max: maxAttempts });
    }
  }, [sessionConfig]);

  const onReconnected = useCallback(() => {
    if (sessionConfig) {
      setReconnectAttempt(null);
    }
  }, [sessionConfig]);

  // Initialize realtime hook only when we have a valid session config
  // This prevents connection attempts before the user starts the interview
  const realtimeHook = useGenkitRealtime(
    '/api/interview-v2/session',
    sessionConfig || dummyConfig,
    {
      onMessage,
      onError,
      onReconnecting,
      onReconnected,
    }
  );

  // Create stable references to connect and disconnect functions
  const connectRef = useRef(realtimeHook.connect);
  const disconnectRef = useRef(realtimeHook.disconnect);

  // Update refs when functions change
  useEffect(() => {
    connectRef.current = realtimeHook.connect;
    disconnectRef.current = realtimeHook.disconnect;
  }, [realtimeHook.connect, realtimeHook.disconnect]);

  // Check auth on mount
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  // Handle connection lifecycle based on view state and session config
  useEffect(() => {
    // Skip all logic for dummy config
    if (sessionConfig?.sessionId === 'dummy') return;

    // Handle connection request
    if (viewState === 'interview' && sessionConfig && !connectionRequested) {
      console.log("Requesting connection");
      setConnectionRequested(true);
      setIsConnectionPending(true);
      connectRef.current()
        .then(() => {
          console.log("Connection established");
          setIsConnectionPending(false);
        })
        .catch((error) => {
          console.error("Connection failed:", error);
          setIsConnectionPending(false);
          // Reset connection state to allow retries
          setConnectionRequested(false);
        });
    }

    // Handle disconnection when leaving interview view
    if (viewState !== 'interview' && connectionRequested) {
      console.log("Disconnecting due to viewState change");
      disconnectRef.current();
      setConnectionRequested(false);
    }
  }, [viewState, sessionConfig, connectionRequested]);

  // Cleanup effect to cancel pending connections
  useEffect(() => {
    return () => {
      if (connectionRequested) {
        console.log("Cleaning up connection on unmount");
        disconnectRef.current();
      }
    };
  }, [connectionRequested]);

  // Handle session setup completion
  const handleSetupComplete = async (config: ComponentSessionConfig) => {
    if (!user || !user.id) {
      console.error("Attempted to start session without a loaded user ID. Please ensure user is authenticated.");
      // Optional: Display a user-facing error message or disable the start button.
      return; // Crucially, stop execution if user.id is missing.
    }

    // Convert component config to extended config for the hook
    const extendedConfig: ExtendedSessionConfig = {
      sessionId: config.sessionId || `session_${Date.now()}`,
      userId: user.id, // user.id is guaranteed to be valid here
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
    setViewState('mic-check'); // Go to mic check first instead of directly to interview
    
    // Connection will be initiated after mic check is complete
  };

  // Handle mic check completion
  const handleMicCheckComplete = () => {
    setViewState('interview');
    // Connection will be initiated by useEffect after state updates
  };

  // Handle mic check cancellation
  const handleMicCheckCancel = () => {
    setViewState('setup');
    setSessionConfig(null);
    setComponentConfig(null);
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
          isConnectionPending={isConnectionPending}
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
      
      {/* Mic Check Modal */}
      <MicCheckModal
        open={viewState === 'mic-check'}
        onComplete={handleMicCheckComplete}
        onCancel={handleMicCheckCancel}
        sessionConfig={sessionConfig}
      />
      
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAgree={agreeToTerms}
      />
    </>
  );
}
