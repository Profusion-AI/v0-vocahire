"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useInterviewSession } from "@/hooks/useInterviewSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, AlertCircle, WifiOff, ExternalLink, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectionQualityIndicator } from "@/components/connection-quality-indicator"
import Link from "next/link"

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
}

export default function InterviewRoom({ onComplete, jobTitle = "Software Engineer" }: InterviewRoomProps) {
  const router = useRouter()
  const { status, messages, start, stop, isConnecting, isActive, error, debug } = useInterviewSession()

  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showNetworkInfo, setShowNetworkInfo] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Get access to the peer connection for the connection quality indicator
  useEffect(() => {
    if (typeof window !== "undefined") {
      // This is a hack to access the peer connection from the hook
      // In a real app, you would refactor the hook to expose the peer connection
      const checkForPeerConnection = () => {
        // @ts-ignore - accessing a private property for demo purposes
        if (window._vocahirePeerConnection) {
          peerConnectionRef.current = window._vocahirePeerConnection
        }
      }

      // Check every second for the peer connection
      const intervalId = setInterval(checkForPeerConnection, 1000)
      checkForPeerConnection() // Check immediately

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [])

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
    let intervalId: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId)
            handleInterviewComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isActive, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    try {
      setApiError(null)
      await start(jobTitle)
    } catch (err) {
      console.error("Failed to start interview:", err)
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError("An unknown error occurred while starting the interview")
      }

      // Add more detailed logging for debugging
      if (typeof err === "object" && err !== null) {
        console.error("Error details:", JSON.stringify(err, null, 2))
      }
    }
  }

  const handleInterviewComplete = () => {
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

  // Helper function to render network error messages with helpful suggestions
  const renderNetworkError = (errorMessage: string) => {
    const isStunBindingTimeout =
      errorMessage.includes("STUN binding request timed out") ||
      errorMessage.includes("network appears to be blocking WebRTC")
    const isNetworkError =
      errorMessage.includes("network") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("ICE") ||
      errorMessage.includes("STUN") ||
      errorMessage.includes("TURN") ||
      errorMessage.includes("WebRTC") ||
      errorMessage.includes("audio")

    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
        <div className="flex items-start gap-2">
          {isNetworkError ? (
            <WifiOff className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">Connection Error:</p>
            <p>{errorMessage}</p>

            {isStunBindingTimeout && (
              <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">What is a STUN binding timeout?</p>
                    <p className="text-sm">
                      This error occurs when your network is blocking WebRTC connections, which are required for
                      real-time voice interviews. This is common on corporate networks, VPNs, or networks with strict
                      firewalls.
                    </p>
                    <Button
                      variant="link"
                      className="text-xs p-0 h-auto text-amber-800 dark:text-amber-300"
                      onClick={() => setShowNetworkInfo(!showNetworkInfo)}
                    >
                      {showNetworkInfo ? "Hide technical details" : "Show technical details"}
                    </Button>

                    {showNetworkInfo && (
                      <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950 p-2 rounded">
                        <p>WebRTC requires UDP ports 3478-3479 and TCP ports 443/80/5349 to be open.</p>
                        <p>STUN servers help establish peer-to-peer connections through NAT.</p>
                        <p>When these connections fail, it usually means UDP traffic is being blocked.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isNetworkError && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Try using a different network (switch from WiFi to mobile data/hotspot)</li>
                  <li>Disable any VPN or proxy services</li>
                  <li>Try using a different browser (Chrome works best for WebRTC)</li>
                  <li>If on a corporate network, try from a home network instead</li>
                  <li>Check if your firewall is blocking WebRTC connections</li>
                </ul>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/test-interview-mock" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Try Mock Interview Mode (No WebRTC)
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs">
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mock Interview: {jobTitle}</CardTitle>
          <div className="flex items-center gap-4">
            {isActive && (
              <ConnectionQualityIndicator
                peerConnection={peerConnectionRef.current}
                className="bg-background/80 border"
              />
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
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">API Error:</p>
                <p>{apiError}</p>
                <p className="text-sm mt-2">
                  There was an issue connecting to the OpenAI API. Please try again later or contact support.
                </p>
                <div className="mt-3">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/test-interview-mock" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Try Mock Interview Mode Instead
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-[300px] p-4 rounded-md bg-muted">
              {status === "idle" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Ready to start your mock interview?</h3>
                  <p className="text-muted-foreground mb-4">
                    You'll have a 10-minute conversation with an AI interviewer who will ask you questions about your
                    experience and skills for a {jobTitle} position.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tips:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside text-left max-w-md mx-auto">
                      <li>Speak clearly and at a normal pace</li>
                      <li>Answer questions thoroughly but concisely</li>
                      <li>Use specific examples from your experience</li>
                      <li>The interview will automatically end after 10 minutes</li>
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleStartInterview} size="lg">
                      Start Interview
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/test-interview-mock" className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Try Mock Mode (No WebRTC)
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {(isConnecting || isActive) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
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
                    {isActive && <p>Interview in progress. Speak clearly into your microphone.</p>}
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

            {/* Hidden audio element for AI voice */}
            <audio ref={audioRef} autoPlay playsInline className="hidden" />
          </>
        )}

        {debug && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-x-auto">
            <p className="font-medium mb-1">Debug Info:</p>
            <p>{debug}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {isActive && (
          <Button variant="destructive" onClick={handleInterviewComplete}>
            End Interview Early
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
