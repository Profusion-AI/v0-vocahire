"use client"

import type React from "react"
import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { ResumeData } from "@/components/resume-input"
import { useRealtimeInterviewSession } from "@/hooks/useRealtimeInterviewSession"
// Removed ConnectionProgress import as we'll create a simple inline version

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
  resumeData?: ResumeData | null
  autoStart?: boolean
  onSessionCreationStatus?: (isCreating: boolean, error?: string) => void
}

export default function InterviewRoom({
  onComplete,
  jobTitle = "Software Engineer",
  resumeData,
  autoStart = false,
  onSessionCreationStatus,
}: InterviewRoomProps) {
  const router = useRouter()
  
  // All state comes from the hook - single source of truth
  const {
    status,
    messages,
    error,
    isConnecting,
    isActive,
    isUserSpeaking,
    aiCaptions,
    start: startSession,
    stop: stopSession,
  } = useRealtimeInterviewSession()

  // Auto-start effect when autoStart prop is true
  useEffect(() => {
    if (autoStart && status === "idle") {
      console.log("Auto-starting interview due to autoStart prop")
      handleStartInterview()
    }
  }, [autoStart, status])

  // Handle session creation with parent notification
  const handleStartInterview = useCallback(async () => {
    try {
      console.log("Starting interview session...")
      onSessionCreationStatus?.(true) // Notify parent that session creation started
      
      await startSession(jobTitle)
      
      onSessionCreationStatus?.(false) // Notify parent that session creation completed
      console.log("Interview session started successfully")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Interview start failed:", errorMessage)
      
      onSessionCreationStatus?.(false, errorMessage) // Notify parent of error
    }
  }, [startSession, jobTitle, onSessionCreationStatus])

  // Handle interview completion
  const handleInterviewComplete = useCallback(() => {
    console.log("Interview completed")
    
    // Store interview data in localStorage for the feedback page
    localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages))
    
    stopSession()
    
    setTimeout(() => {
      router.push("/feedback")
    }, 2000)

    if (onComplete) {
      onComplete(messages)
    }
  }, [messages, router, onComplete, stopSession])

  // Handle errors from the hook
  useEffect(() => {
    if (error && onSessionCreationStatus) {
      onSessionCreationStatus(false, error)
    }
  }, [error, onSessionCreationStatus])

  // Render connection progress during setup
  if (status === "requesting_mic" || status === "testing_api" || status === "fetching_token" || 
      status === "creating_offer" || status === "exchanging_sdp" || status === "connecting_webrtc") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Setting up interview...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">Current step: <strong>{status.replace('_', ' ')}</strong></p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: status === "requesting_mic" ? "20%" :
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
                >
                  End Interview
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Connection Quality Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>

        {/* Speaking Status */}
        <Card>
          <CardContent className="py-4">
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