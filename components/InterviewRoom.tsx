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
// import styles from "./InterviewRoom.module.css"
// Removed ConnectionProgress import as we'll create a simple inline version

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
  resumeData?: ResumeData | null
  autoStart?: boolean
  onSessionCreationStatus?: (isCreating: boolean, error?: string, status?: string) => void
  hideLoadingUI?: boolean
}

export default function InterviewRoom({
  onComplete,
  jobTitle = "Software Engineer",
  resumeData,
  autoStart = false,
  onSessionCreationStatus,
  hideLoadingUI = false,
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
    isConnecting: _isConnecting,
    isActive: _isActive,
    isUserSpeaking,
    aiCaptions,
    isMuted,
    start: startSession,
    stop: stopSession,
    pause: pauseSession,
    resume: resumeSession,
    toggleMute,
    saveInterviewSession,
  } = useRealtimeInterviewSession({ jobTitle, resumeData })

  // Track if we've attempted to start to prevent loops
  const hasAttemptedStart = useRef(false)
  
  // Track if tab is in background
  const [isTabHidden, setIsTabHidden] = useState(false)
  
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
    if (autoStart && status === "idle" && !hasAttemptedStart.current) {
      console.log("Auto-starting interview due to autoStart prop")
      hasAttemptedStart.current = true
      handleStartInterview()
    }
  }, [autoStart, status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle session creation with parent notification
  const handleStartInterview = useCallback(async () => {
    try {
      console.log("Starting interview session...")
      onSessionCreationStatus?.(true, undefined, status) // Notify parent that session creation started
      
      await startSession(jobTitle)
      
      // Status update will be handled by the status tracking effect
      console.log("Interview session started successfully")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Interview start failed:", errorMessage)
      
      onSessionCreationStatus?.(false, errorMessage, status) // Notify parent of error
    }
  }, [startSession, jobTitle, onSessionCreationStatus, status])

  // Cleanup interview on actual navigation away
  useEffect(() => {
    // Use router events to detect actual navigation
    const handleRouteChange = () => {
      if (status === "active") {
        console.log("Route changing while interview active - pausing interview")
        pauseSession()
      }
    }
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [status, pauseSession])

  // Handle interview completion
  const handleInterviewComplete = useCallback(async () => {
    console.log("Interview completion initiated")
    
    try {
      // Show saving status
      setIsSaving(true)
      setCompletionError(null)
      
      // Save the interview session
      const result = await saveInterviewSession()
      
      if (result) {
        // Success - redirect to feedback page
        console.log("Interview saved successfully, redirecting to feedback")
        toast.success("Interview saved successfully! Generating your feedback...", {
          duration: 3000
        })
        router.push(result.redirectUrl || `/feedback?session=${result.id}`)
      } else {
        // Fallback to localStorage if save failed
        console.warn("Failed to save to database, using localStorage fallback")
        localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages))
        localStorage.setItem("vocahire_interview_metadata", JSON.stringify({
          jobTitle,
          timestamp: Date.now()
        }))
        
        // Notify user about local save
        toast.warning(
          "Interview saved locally. We'll sync it when connection is restored.",
          { 
            duration: 5000,
            description: "Your responses are safe and will be uploaded automatically."
          }
        )
        
        // Still redirect to feedback page
        setTimeout(() => {
          router.push("/feedback")
        }, 2000)
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
      
      // Ensure session is properly stopped
      console.log("Ensuring interview session is fully stopped")
      stopSession()
      
      // Give time for cleanup before notifying completion
      setTimeout(() => {
        if (onComplete) {
          onComplete(messages)
        }
      }, 100)
    }
  }, [messages, jobTitle, saveInterviewSession, stopSession, router, onComplete])

  // Handle errors from the hook
  useEffect(() => {
    if (error && onSessionCreationStatus) {
      onSessionCreationStatus(false, error, status)
    }
  }, [error, onSessionCreationStatus, status])

  // Track status changes and notify parent
  useEffect(() => {
    if (onSessionCreationStatus && (
      status === "requesting_mic" || 
      status === "testing_api" || 
      status === "fetching_token" || 
      status === "creating_offer" || 
      status === "exchanging_sdp" || 
      status === "connecting_webrtc" ||
      status === "data_channel_open" ||
      status === "active"
    )) {
      const isCreating = status !== "active"
      onSessionCreationStatus(isCreating, undefined, status)
    }
  }, [status, onSessionCreationStatus])

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

  // Render connection progress during setup (unless parent is handling loading UI)
  if (!hideLoadingUI && (status === "requesting_mic" || status === "testing_api" || status === "fetching_token" || 
      status === "creating_offer" || status === "exchanging_sdp" || status === "connecting_webrtc")) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {status === "requesting_mic" ? "Checking microphone..." : "Setting up interview..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {status === "requesting_mic" ? "Please allow microphone access when prompted" : 
                 `Current step: ${status.replace(/_/g, ' ')}`}
              </p>
            </div>
            
            {/* Audio Level Indicator - shown during mic check and after */}
            <div className="mt-4">
              <AudioLevelIndicator 
                isActive={true}
                isMuted={isMuted}
                height={40}
                barCount={7}
                showFeedback={status === "requesting_mic"}
                className="mb-4"
              />
            </div>
            
            {/* Mic Toggle - visible after mic access is granted */}
            {status !== "requesting_mic" && (
              <div className="flex justify-center mt-4">
                <MicToggle 
                  isMuted={isMuted}
                  onToggle={toggleMute}
                  showReminder={false}
                  size="sm"
                />
              </div>
            )}
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                style={{
                  width: status === "requesting_mic" ? "20%" :
                         status === "testing_api" ? "30%" :
                         status === "fetching_token" ? "40%" :
                         status === "creating_offer" ? "60%" :
                         status === "exchanging_sdp" ? "80%" :
                         status === "connecting_webrtc" ? "90%" : "100%"
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Don't render anything during loading if parent is handling UI
  if (hideLoadingUI && (status === "requesting_mic" || status === "testing_api" || status === "fetching_token" || 
      status === "creating_offer" || status === "exchanging_sdp" || status === "connecting_webrtc")) {
    return null;
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
  if (status === "active" || status === "data_channel_open") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Interview Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mock Interview - {jobTitle}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Active</span>
                </div>
                <Button 
                  onClick={handleInterviewComplete}
                  variant="destructive"
                  size="sm"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "End Interview"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Completion Error Alert */}
        {completionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Save Error</AlertTitle>
            <AlertDescription>
              {completionError}
              {showManualNavigation && (
                <Button 
                  onClick={() => router.push("/feedback")}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Continue to Feedback
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Quality Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Connected</span>
            {isTabHidden && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 text-xs">Running in background</span>
              </>
            )}
          </div>
        </div>

        {/* Speaking Status with Audio Level Indicator */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-4">
              {/* Audio Level Indicator for active interview */}
              <AudioLevelIndicator 
                isActive={true}
                isMuted={isMuted}
                height={50}
                barCount={9}
                showFeedback={false}
                className="mb-4"
              />
              
              {/* Mic Toggle for active interview */}
              <div className="flex justify-center">
                <MicToggle 
                  isMuted={isMuted}
                  onToggle={toggleMute}
                  showReminder={true}
                  size="default"
                />
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <div className={`flex items-center gap-2 ${isUserSpeaking ? 'text-green-600' : 'text-gray-400'}`}>
                  <Mic className={`h-5 w-5 ${isUserSpeaking ? 'animate-pulse' : ''}`} />
                  <span>{isUserSpeaking ? 'You are speaking' : 'Listening...'}</span>
                </div>
              </div>
              
              {/* AI Captions */}
              {aiCaptions && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{aiCaptions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation History */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Conversation will appear here...
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-100 ml-8"
                        : "bg-gray-100 mr-8"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <strong className="text-sm capitalize">
                        {message.role === "user" ? "You" : "Interviewer"}:
                      </strong>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default/idle state (shouldn't normally be rendered with autoStart=true)
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ready to Start</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleStartInterview}
          className="w-full"
        >
          Start Interview
        </Button>
      </CardContent>
    </Card>
  )
}