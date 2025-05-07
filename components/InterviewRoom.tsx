"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useInterviewSession } from "../hooks/useInterviewSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Mic,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  WifiOff,
  ExternalLink,
  Key,
  Info,
  AlertTriangle,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
}

export function InterviewRoom({ onComplete, jobTitle = "Software Engineer" }: InterviewRoomProps) {
  const router = useRouter()
  const { toast } = useToast()
  const {
    status,
    messages,
    start,
    stop,
    isConnecting,
    isActive,
    error,
    debug,
    peerConnection,
    isMockMode,
    audioLevel,
    errorDetails,
    errorType,
  } = useInterviewSession()

  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [selectedJobTitle, setSelectedJobTitle] = useState(jobTitle)
  const [sessionEnding, setSessionEnding] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check for microphone permission
  useEffect(() => {
    async function checkMicPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setIsPermissionGranted(true)
      } catch (err) {
        console.error("Microphone permission denied:", err)
        setIsPermissionGranted(false)
      } finally {
        setIsInitializing(false)
      }
    }

    checkMicPermission()
  }, [])

  // Timer countdown when interview is active
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (isActive && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current)
              timerIntervalRef.current = null
            }
            handleInterviewComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isActive, timeRemaining])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    try {
      setApiError(null)
      setSessionEnding(false)
      setTimeRemaining(600) // Reset timer to 10 minutes

      // Create and play a silent audio to unlock audio playback
      // This helps with browsers that require user interaction before audio can play
      const unlockAudio = new Audio()
      unlockAudio.play().catch((e) => console.log("Silent audio play failed, may need user interaction"))

      // Show a toast to indicate we're starting
      toast({
        title: "Starting interview...",
        description: "Connecting to the AI interviewer",
      })

      await start(selectedJobTitle)
    } catch (err) {
      console.error("Failed to start interview:", err)
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError("An unknown error occurred while starting the interview")
      }

      // Show error toast
      toast({
        title: "Error starting interview",
        description: err instanceof Error ? err.message : "Please try again later",
        variant: "destructive",
      })

      // Add more detailed logging for debugging
      if (typeof err === "object" && err !== null) {
        console.error("Error details:", JSON.stringify(err, null, 2))
      }
    }
  }

  const handleInterviewComplete = () => {
    if (sessionEnding) return // Prevent multiple calls

    setSessionEnding(true)

    // Show completion toast
    toast({
      title: "Interview completed",
      description: "Generating your feedback...",
    })

    // Stop the session
    stop()

    // In a real implementation, you would save the interview data to your database
    // and then redirect to the feedback page
    setTimeout(() => {
      router.push("/feedback")
    }, 2000)

    if (onComplete) {
      onComplete(messages)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Helper function to render error messages with helpful suggestions
  const renderNetworkError = (errorMessage: string) => {
    const isNetworkError =
      errorType === "connection" ||
      errorMessage.includes("network") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("ICE") ||
      errorMessage.includes("STUN") ||
      errorMessage.includes("TURN") ||
      errorMessage.includes("WebRTC") ||
      errorMessage.includes("WebSocket") ||
      errorMessage.includes("audio") ||
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("Failed to connect")

    const isApiError =
      errorType === "unauthorized" ||
      errorType === "forbidden" ||
      errorType === "configuration" ||
      errorMessage.includes("API key") ||
      errorMessage.includes("OpenAI") ||
      errorMessage.includes("token") ||
      errorMessage.includes("initialize interview session")

    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
        <div className="flex items-start gap-2">
          {isNetworkError ? (
            <WifiOff className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : isApiError ? (
            <Key className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">{isNetworkError ? "Connection Error:" : isApiError ? "API Error:" : "Error:"}</p>
            <p>{errorMessage}</p>

            {isNetworkError && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">Possible causes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your internet connection may be unstable</li>
                  <li>The server might be temporarily unavailable</li>
                  <li>There might be a firewall blocking the connection</li>
                  <li>Your browser might be blocking the connection</li>
                </ul>
                <p className="mt-2">
                  Please check your internet connection and try again. If the problem persists, try using a different
                  network or browser.
                </p>
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="text-xs mr-2" onClick={() => setShowDebug(!showDebug)}>
                    {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/dashboard" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Return to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {isApiError && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">Possible causes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The OpenAI API key may be invalid or missing</li>
                  <li>The API key may have expired</li>
                  <li>There may be an issue with the OpenAI service</li>
                  <li>The API may be experiencing high traffic</li>
                </ul>
                <p className="mt-2">
                  Please check that your OpenAI API key is correctly configured in the environment variables.
                </p>
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="text-xs mr-2" onClick={() => setShowDebug(!showDebug)}>
                    {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/dashboard" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Return to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Audio level visualization
  const renderAudioLevel = () => {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs font-medium">Audio Level:</div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-24 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-100",
              audioLevel > 50 ? "bg-green-500" : audioLevel > 20 ? "bg-blue-500" : "bg-gray-400",
            )}
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mock Interview: {selectedJobTitle}</CardTitle>
          <div className="flex items-center gap-4">
            {isActive && !isMockMode && (
              <div className="bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-md text-xs text-green-700 dark:text-green-400">
                <span>Live Connection</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              <span className={timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isMockMode && isActive && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Simulated Interview Mode</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                <strong>Note:</strong> You are currently in a simulated interview experience. The AI voice interview
                service is not available.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {errorType === "unauthorized" && "The API key appears to be invalid."}
                {errorType === "forbidden" && "The request was rejected by the API."}
                {errorType === "configuration" && "The voice interview service is not configured."}
                {errorType === "connection" && "Could not connect to the voice interview service."}
                {errorType === "server" && "The voice interview service is experiencing issues."}
                {errorType === "rate_limit" && "The voice interview service has reached its usage limit."}
                {!errorType && "The voice interview service is unavailable."}
              </p>
              <p className="text-sm text-muted-foreground">
                Speak into your microphone to respond to the interviewer's questions. The system will listen and respond
                with pre-defined questions.
              </p>
              <Button variant="link" className="p-0 h-auto text-xs underline" onClick={() => setShowDebug(!showDebug)}>
                {showDebug ? "Hide technical details" : "Show technical details"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isMockMode && isActive && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Live Interview Mode</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Connected to OpenAI Realtime API. You are now having a live conversation with an AI interviewer.
              </p>
              <p className="text-sm text-muted-foreground">
                Speak clearly into your microphone. Your voice is being streamed to the AI in real-time.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {isInitializing ? (
          <div className="space-y-3">
            <Skeleton className="h-[20px] w-[250px]" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : isPermissionGranted === false ? (
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <p>
              Microphone access is required for the interview. Please allow microphone access in your browser settings
              and refresh the page.
            </p>
          </div>
        ) : error ? (
          renderNetworkError(error)
        ) : apiError ? (
          renderNetworkError(apiError)
        ) : (
          <>
            <div className="min-h-[300px] p-4 rounded-md bg-muted">
              {status === "idle" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Ready to start your mock interview?</h3>
                  <p className="text-muted-foreground mb-4">
                    You'll have a 10-minute conversation with an AI interviewer who will ask you questions about your
                    experience and skills.
                  </p>

                  <div className="max-w-xs mx-auto mb-6">
                    <label className="block text-sm font-medium mb-1 text-left">Select Job Position</label>
                    <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                        <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                        <SelectItem value="UX Designer">UX Designer</SelectItem>
                        <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tips:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside text-left max-w-md mx-auto">
                      <li>Speak clearly and at a normal pace</li>
                      <li>Answer questions thoroughly but concisely</li>
                      <li>Use specific examples from your experience</li>
                      <li>The interview will automatically end after 10 minutes</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleStartInterview} size="lg">
                      Start Interview
                    </Button>
                  </div>
                </div>
              )}

              {(isConnecting || isActive) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          isActive ? "bg-green-100 dark:bg-green-900/20" : "bg-amber-100 dark:bg-amber-900/20"
                        }`}
                      >
                        {isActive ? (
                          <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                        ) : (
                          <Mic className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      {isActive && renderAudioLevel()}
                    </div>
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    {isConnecting && (
                      <div className="flex flex-col items-center">
                        <p>Connecting to interviewer...</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-sm text-muted-foreground">Establishing secure connection</span>
                        </div>
                      </div>
                    )}
                    {isActive && (
                      <p>
                        {isMockMode
                          ? "Interview in progress. Speak into your microphone to respond."
                          : "Live interview in progress. Speak clearly into your microphone."}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && isActive && (
                      <div className="text-center text-muted-foreground italic">
                        <p>The interviewer will begin shortly...</p>
                      </div>
                    )}
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.role === "assistant" ? "bg-primary/10 ml-4" : "bg-secondary/10 mr-4"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.role === "assistant" ? "Interviewer" : "You"}</p>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}

              {status === "ended" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Interview Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    Your interview has ended. You'll be redirected to your feedback shortly.
                  </p>
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
            </div>

            {/* Audio element for AI voice */}
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">AI Voice Output:</p>
              <audio
                ref={audioRef}
                autoPlay
                playsInline
                controls={showDebug}
                className={showDebug ? "w-full" : "hidden"}
              />
            </div>
          </>
        )}

        {(showDebug || debug) && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-x-auto">
            <p className="font-medium mb-1">Debug Info:</p>
            <p className="whitespace-pre-wrap">{debug}</p>
            {errorDetails && (
              <>
                <p className="font-medium mt-2 mb-1">Error Details:</p>
                <p className="whitespace-pre-wrap text-red-500">{errorDetails}</p>
              </>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {isActive && (
          <Button variant="destructive" onClick={handleInterviewComplete} disabled={sessionEnding}>
            {sessionEnding ? "Ending Interview..." : "End Interview Early"}
          </Button>
        )}
        {!isActive && status !== "idle" && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Start New Interview
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
