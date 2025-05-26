"use client"

import type React from "react"
import { useEffect, useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { ResumeData } from "@/components/resume-input"
import { useRealtimeInterviewSession } from "@/hooks/useRealtimeInterviewSession"
import { AudioLevelIndicator } from "@/components/AudioLevelIndicator"
import { MicToggle } from "@/components/MicToggle"
import { toast } from "sonner"

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
  resumeData?: ResumeData | null
  autoStart?: boolean
  onSessionStatus?: (status: string, error?: string) => void
}

export default function InterviewRoom({
  onComplete,
  jobTitle = "Software Engineer",
  resumeData,
  autoStart = false,
  onSessionStatus,
}: InterviewRoomProps) {
  const router = useRouter()
  
  // Local state for saving progress
  const [isSaving, setIsSaving] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [showManualNavigation, setShowManualNavigation] = useState(false)
  
  // All state comes from the hook - single source of truth
  const {
    status,
    messages,
    error,
    isConnecting,
    isActive,
    isUserSpeaking,
    aiCaptions,
    liveTranscript,
    isMuted,
    start: startSession,
    stop: stopSession,
    toggleMute,
  } = useRealtimeInterviewSession({ jobTitle, resumeData })

  // Track if we've attempted to start to prevent loops
  const hasAttemptedStart = useRef(false)
  
  // Track if tab is in background
  const [isTabHidden, setIsTabHidden] = useState(false)
  
  // Protect against re-renders resetting the start attempt
  const startAttemptTimeRef = useRef<number | null>(null)

  // Duration tracking
  const [duration, setDuration] = useState(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  
  useEffect(() => {
    const savedState = localStorage.getItem('vocahire_active_interview')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        // Check if it's recent (within last 5 minutes)
        if (Date.now() - state.timestamp < 5 * 60 * 1000) {
          // Show notification about interrupted interview
          toast.info(
            "It looks like your previous interview was interrupted. Starting a fresh session.",
            {
              duration: 5000,
              description: "Your interview progress has been saved locally."
            }
          )
          // Clear it after checking
          localStorage.removeItem('vocahire_active_interview')
        }
      } catch (e) {
        console.error('Failed to parse saved interview state:', e)
      }
    }
  }, [])
  
  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden)
      if (!document.hidden && status === "active") {
        // Tab became visible again during active interview
        toast.success("Welcome back! Your interview continues...", {
          duration: 3000,
        })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status])
  
  // Auto-start effect when autoStart prop is true
  useEffect(() => {
    // Prevent multiple start attempts within 5 seconds
    const now = Date.now()
    const timeSinceLastAttempt = startAttemptTimeRef.current ? now - startAttemptTimeRef.current : Infinity
    
    if (autoStart && status === "idle" && !hasAttemptedStart.current && timeSinceLastAttempt > 5000) {
      console.log("Auto-starting interview due to autoStart prop")
      hasAttemptedStart.current = true
      startAttemptTimeRef.current = now
      handleStartInterview()
    }
  }, [autoStart, status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle session creation with parent notification
  const handleStartInterview = useCallback(async () => {
    try {
      console.log("Starting interview session...")
      await startSession()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Interview start failed:", errorMessage)
    }
  }, [startSession])

  // Cleanup interview on actual navigation away
  useEffect(() => {
    // Use router events to detect actual navigation
    const handleRouteChange = () => {
      if (status === "active") {
        console.log("Route changing while interview active - stopping interview")
        stopSession()
      }
    }
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [status, stopSession])

  // Handle interview completion
  const handleInterviewComplete = useCallback(async () => {
    console.log("Interview completion initiated")
    
    try {
      // Show saving status
      setIsSaving(true)
      setCompletionError(null)
      
      // Stop the session which will save automatically
      await stopSession()
      
      // The hook will handle navigation to feedback page
      // Just notify parent if callback exists
      if (onComplete) {
        onComplete(messages)
      }
      
    } catch (error) {
      console.error("Error during interview completion:", error)
      
      // Show error to user
      setCompletionError("Failed to save interview. Your responses have been saved locally.")
      
      // Fallback to localStorage
      localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages))
      localStorage.setItem("vocahire_interview_metadata", JSON.stringify({
        jobTitle,
        timestamp: Date.now()
      }))
      
      // Show error toast
      toast.error("Failed to save interview to server", {
        duration: 5000,
        description: "Your interview has been saved locally and you can continue to feedback."
      })
      
      // Allow manual navigation
      setTimeout(() => {
        setShowManualNavigation(true)
      }, 3000)
      
    } finally {
      setIsSaving(false)
    }
  }, [messages, jobTitle, stopSession, onComplete])

  // Track status changes and notify parent
  useEffect(() => {
    if (onSessionStatus) {
      onSessionStatus(status, error || undefined)
    }
  }, [status, error, onSessionStatus])

  // Start duration tracking when interview becomes active
  useEffect(() => {
    if (status === "active" && !startTimeRef.current) {
      startTimeRef.current = Date.now()
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000))
      }, 1000)
    } else if (status !== "active" && durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
      startTimeRef.current = null
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [status])

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Render saving state
  if (status === "saving_results" || isSaving) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving interview results...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Please wait while we save your interview data...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (status === "error" && error) {
    const isRetryableError = error.toLowerCase().includes('timeout') || 
                           error.toLowerCase().includes('database') ||
                           error.toLowerCase().includes('cold start') ||
                           error.toLowerCase().includes('high load');
    
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {isRetryableError ? 'Temporary Connection Issue' : 'Connection Error'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Unable to start interview</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          {isRetryableError && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>This is usually temporary.</strong> The system may be warming up or experiencing high load. 
                Please wait a few seconds and try again.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleStartInterview}
            className="w-full mt-4"
            variant={isRetryableError ? "default" : "outline"}
          >
            {isRetryableError ? 'Retry Now' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Render active interview interface
  if (status === "active") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Interview Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mock Interview - {jobTitle}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(duration)}</span>
                </div>
                <Button 
                  onClick={handleInterviewComplete}
                  variant="destructive"
                  size="sm"
                  disabled={isSaving}
                >
                  End Interview
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Main Interview Interface */}
        <Card className="min-h-[400px]">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Live Transcript Display */}
              {liveTranscript && (
                <div className={`p-4 rounded-lg ${
                  liveTranscript.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <p className="text-sm font-medium mb-1">
                    {liveTranscript.role === 'user' ? 'You (speaking...)' : 'Interviewer (speaking...)'}
                  </p>
                  <p className="text-gray-700">{liveTranscript.content}</p>
                </div>
              )}

              {/* AI Captions */}
              {aiCaptions && (
                <div className="text-center text-gray-500 italic">
                  {aiCaptions}
                </div>
              )}

              {/* Message History */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                  }`}>
                    <p className="text-sm font-medium mb-1">
                      {msg.role === 'user' ? 'You' : 'Interviewer'}
                    </p>
                    <p className="text-gray-700">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Speaking Indicator */}
              {isUserSpeaking && (
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 text-blue-600">
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </span>
                </div>
              )}

              {/* Audio Controls */}
              <div className="flex justify-center items-center gap-6 pt-4 border-t">
                <AudioLevelIndicator 
                  isActive={isActive}
                  isMuted={isMuted}
                  height={60}
                  barCount={10}
                  showFeedback={true}
                />
                <MicToggle 
                  isMuted={isMuted}
                  onToggle={toggleMute}
                  showReminder={true}
                  size="lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Hidden Warning */}
        {isTabHidden && (
          <Alert variant="warning">
            <AlertTitle>Interview Paused</AlertTitle>
            <AlertDescription>
              Your interview is paused while this tab is in the background. 
              Return to this tab to continue.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Show completion error with manual navigation
  if (completionError && showManualNavigation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Interview Completed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <AlertTitle>Saved Locally</AlertTitle>
            <AlertDescription>{completionError}</AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => router.push('/feedback')}
            className="w-full"
          >
            Continue to Feedback
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Default state - shouldn't normally reach here
  return null
}