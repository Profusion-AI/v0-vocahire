"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useInterviewSession } from "@/hooks/useInterviewSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, Bug, Loader2, WifiOff, AlertCircle, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConnectionQualityIndicator } from "@/components/connection-quality-indicator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TestInterviewPage() {
  const { status, messages, start, stop, isConnecting, isActive, error, debug } = useInterviewSession()

  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isMuted, setIsMuted] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [selectedRole, setSelectedRole] = useState("Software Engineer")
  const [activeTab, setActiveTab] = useState("interview")
  const [connectionStats, setConnectionStats] = useState<any>(null)
  const [userInput, setUserInput] = useState("")
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  // Reference to the peer connection for stats
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Get access to the peer connection for the connection quality indicator
  useEffect(() => {
    if (typeof window !== "undefined") {
      // This is a hack to access the peer connection from the hook
      const checkForPeerConnection = () => {
        // @ts-ignore - accessing a property for demo purposes
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

  // Check if we're in fallback mode based on error
  useEffect(() => {
    if (error && isActive) {
      setIsFallbackMode(true)
    }
  }, [error, isActive])

  // Timer countdown when interview is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId)
            stop()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isActive, timeRemaining, stop])

  // Connection stats polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const getConnectionStats = async () => {
      if (!peerConnectionRef.current) return

      try {
        const stats = await peerConnectionRef.current.getStats()
        const statsObj: any = {}

        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && report.kind === "audio") {
            statsObj.packetsReceived = report.packetsReceived
            statsObj.packetsLost = report.packetsLost
            statsObj.jitter = report.jitter
            statsObj.audioLevel = report.audioLevel
          }
          if (report.type === "remote-inbound-rtp") {
            statsObj.roundTripTime = report.roundTripTime
          }
          if (report.type === "candidate-pair" && report.state === "succeeded") {
            statsObj.currentRoundTripTime = report.currentRoundTripTime
            statsObj.availableOutgoingBitrate = report.availableOutgoingBitrate
          }
        })

        setConnectionStats(statsObj)
      } catch (err) {
        console.error("Error getting connection stats:", err)
      }
    }

    if (isActive && !isFallbackMode && peerConnectionRef.current) {
      intervalId = setInterval(getConnectionStats, 2000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isActive, isFallbackMode])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    try {
      await start(selectedRole)
    } catch (err) {
      console.error("Failed to start interview:", err)
      setIsFallbackMode(true)
    }
  }

  const toggleMute = () => {
    const audioElements = document.querySelectorAll("audio")
    audioElements.forEach((audio) => {
      audio.muted = !isMuted
    })
    setIsMuted(!isMuted)
  }

  const handleUserTextInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Add user message
    const newMessage = {
      role: "user" as const,
      content: userInput,
      timestamp: Date.now(),
    }

    // Update messages state
    const updatedMessages = [...messages, newMessage]

    // Clear input
    setUserInput("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      // Generate a simple response based on the user's input
      let response = ""

      if (userInput.toLowerCase().includes("experience") || userInput.toLowerCase().includes("background")) {
        response = `Thank you for sharing your experience. Can you tell me about a challenging project you worked on recently?`
      } else if (userInput.toLowerCase().includes("project") || userInput.toLowerCase().includes("challenge")) {
        response = `That sounds interesting. How did you approach problem-solving in that situation?`
      } else if (userInput.toLowerCase().includes("problem") || userInput.toLowerCase().includes("solution")) {
        response = `Great approach. What would you say are your key strengths and areas for improvement?`
      } else if (userInput.toLowerCase().includes("strength") || userInput.toLowerCase().includes("weakness")) {
        response = `Thank you for sharing that. Where do you see yourself in 5 years?`
      } else if (userInput.toLowerCase().includes("year") || userInput.toLowerCase().includes("future")) {
        response = `Interesting goals. How do you stay updated with the latest trends in your field?`
      } else if (userInput.toLowerCase().includes("learn") || userInput.toLowerCase().includes("trend")) {
        response = `That's a good approach to learning. Do you have any questions for me about the position?`
      } else if (userInput.toLowerCase().includes("question")) {
        response = `Thank you for your time today. We'll be in touch with next steps.`
      } else {
        response = `Thank you for sharing that. Can you tell me more about how your skills align with this ${selectedRole} position?`
      }

      // Add assistant message
      const assistantMessage = {
        role: "assistant" as const,
        content: response,
        timestamp: Date.now(),
      }

      // Update messages state again
      updatedMessages.push(assistantMessage)
    }, 1500)
  }

  const renderConnectionStats = () => {
    if (!connectionStats) return <p>No connection stats available</p>

    return (
      <div className="text-xs font-mono space-y-1">
        <div className="grid grid-cols-2 gap-2">
          <div>Packets Received:</div>
          <div>{connectionStats.packetsReceived || "N/A"}</div>

          <div>Packets Lost:</div>
          <div>{connectionStats.packetsLost || "0"}</div>

          <div>Packet Loss Rate:</div>
          <div>
            {connectionStats.packetsReceived && connectionStats.packetsLost
              ? `${((connectionStats.packetsLost / connectionStats.packetsReceived) * 100).toFixed(2)}%`
              : "0%"}
          </div>

          <div>Jitter:</div>
          <div>{connectionStats.jitter ? `${(connectionStats.jitter * 1000).toFixed(2)}ms` : "N/A"}</div>

          <div>Round Trip Time:</div>
          <div>
            {connectionStats.currentRoundTripTime
              ? `${(connectionStats.currentRoundTripTime * 1000).toFixed(0)}ms`
              : "N/A"}
          </div>

          <div>Audio Level:</div>
          <div>
            {connectionStats.audioLevel !== undefined ? `${(connectionStats.audioLevel * 100).toFixed(0)}%` : "N/A"}
          </div>
        </div>
      </div>
    )
  }

  // Helper function to render network error messages with helpful suggestions
  const renderNetworkError = (errorMessage: string) => {
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
            {isNetworkError && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try using a different network (switch from WiFi to mobile data)</li>
                  <li>Disable any VPN or proxy services</li>
                  <li>Try using a different browser</li>
                  <li>Make sure your firewall isn't blocking WebRTC connections</li>
                </ul>
                <div className="mt-3">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/test-interview-mock" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Try Mock Interview Mode Instead
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Test Interview Session</h1>
      <p className="text-center text-muted-foreground mb-8">
        This page allows you to test the real-time voice interview functionality
      </p>

      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isActive || isConnecting}>
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

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-1"
                >
                  <Bug className="h-4 w-4" />
                  {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                </Button>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className={timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isFallbackMode && isActive && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Using Text-Based Interview Mode</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                We're using text-based interview mode because the voice interview service is currently unavailable.
              </p>
              <p className="text-sm text-muted-foreground">
                You can type your responses in the text box below. The AI interviewer will respond with follow-up
                questions.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="diagnostics" disabled={!isActive || isFallbackMode}>
              Connection Diagnostics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interview">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mock Interview: {selectedRole}</CardTitle>
                  {isActive && !isFallbackMode && (
                    <div className="flex items-center gap-2">
                      <ConnectionQualityIndicator
                        peerConnection={peerConnectionRef.current}
                        className="bg-background/80 border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && !isFallbackMode && renderNetworkError(error)}

                {showDebug && debug && (
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-md text-blue-700 dark:text-blue-300 text-sm font-mono overflow-x-auto">
                    <p className="font-medium mb-2">Debug Info:</p>
                    <p>{debug}</p>
                  </div>
                )}

                <div className="min-h-[300px] p-4 rounded-md bg-muted">
                  {status === "idle" && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">Ready to test the interview functionality?</h3>
                      <p className="text-muted-foreground mb-4">
                        This will start a real-time voice conversation with an AI interviewer for a {selectedRole}{" "}
                        position.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Before starting:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside text-left max-w-md mx-auto">
                          <li>Ensure your microphone is working</li>
                          <li>Make sure your speakers or headphones are connected</li>
                          <li>You can end the interview at any time</li>
                        </ul>
                      </div>
                      <Button onClick={handleStartInterview} className="mt-6" size="lg">
                        Start Test Interview
                      </Button>
                    </div>
                  )}

                  {isConnecting && (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                      <h3 className="text-lg font-medium mb-2">Connecting to OpenAI...</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Establishing secure WebRTC connection. This may take a few moments.
                      </p>
                    </div>
                  )}

                  {isActive && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        {!isFallbackMode && (
                          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                            <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div className="text-center mb-4">
                        {isFallbackMode ? (
                          <p>Text-based interview in progress. Type your responses below.</p>
                        ) : (
                          <p>Interview in progress. Speak clearly into your microphone.</p>
                        )}
                      </div>

                      <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {messages.length === 0 && (
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
                            <p className="text-sm font-medium mb-1">
                              {msg.role === "assistant" ? "Interviewer" : "You"}
                            </p>
                            <p>{msg.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Text input for fallback mode */}
                      {isActive && isFallbackMode && (
                        <form onSubmit={handleUserTextInput} className="mt-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              placeholder="Type your response here..."
                              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button type="submit" disabled={!userInput.trim()}>
                              Send
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {status === "ended" && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">Interview Complete</h3>
                      <p className="text-muted-foreground mb-4">
                        The test interview has ended. You can start a new one to continue testing.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                {isActive && (
                  <Button variant="destructive" onClick={stop}>
                    End Interview
                  </Button>
                )}
                {!isActive && status !== "idle" && (
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Start New Test
                  </Button>
                )}
                {status === "ended" && (
                  <Button asChild>
                    <Link href="/feedback">View Feedback</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle>Connection Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-2">WebRTC Connection Stats</h3>
                    {renderConnectionStats()}
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-2">Connection Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>ICE Connection State:</div>
                      <div>{peerConnectionRef.current?.iceConnectionState || "N/A"}</div>

                      <div>ICE Gathering State:</div>
                      <div>{peerConnectionRef.current?.iceGatheringState || "N/A"}</div>

                      <div>Signaling State:</div>
                      <div>{peerConnectionRef.current?.signalingState || "N/A"}</div>

                      <div>Connection State:</div>
                      <div>{peerConnectionRef.current?.connectionState || "N/A"}</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-2">Audio Levels</h3>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{
                          width: `${connectionStats?.audioLevel ? Math.min(connectionStats.audioLevel * 100, 100) : 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1">
                      {connectionStats?.audioLevel
                        ? `${(connectionStats.audioLevel * 100).toFixed(0)}%`
                        : "No audio detected"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
