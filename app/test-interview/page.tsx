"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mic, MicOff, Volume2, VolumeX, Info, AlertCircle, Clock } from "lucide-react"

export default function TestInterviewPage() {
  // State for session creation
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [creatingSession, setCreatingSession] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // State for WebRTC connection
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [connectionState, setConnectionState] = useState<string>("disconnected")
  const [iceConnectionState, setIceConnectionState] = useState<string>("new")
  const [signalingState, setSignalingState] = useState<string>("stable")

  // State for audio
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  // State for interview
  const [interviewActive, setInterviewActive] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: number }>>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTerminating, setIsTerminating] = useState(false)

  // State for logs
  const [logs, setLogs] = useState<string[]>([])

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioLevelIntervalRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Helper function to add logs
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  // Function to create a session
  const createSession = async () => {
    try {
      setCreatingSession(true)
      setSessionData(null)
      setSessionError(null)
      addLog(`Creating session for job title: ${jobTitle}`)

      // Request microphone access first
      try {
        addLog("Requesting microphone access...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        setLocalStream(stream)
        addLog(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)
      } catch (err) {
        addLog(`Error getting microphone access: ${err instanceof Error ? err.message : String(err)}`)
        throw new Error("Could not access microphone. Please check your browser permissions.")
      }

      // Call our OpenAI proxy endpoint
      const response = await fetch("/api/openai-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: jobTitle,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`API error: ${response.status} ${errorText}`)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      addLog("Received response from proxy")

      if (data.mock) {
        addLog(`Mock mode activated: ${data.message}`)
        setSessionError(`Mock mode: ${data.message}`)
      } else if (data.session) {
        addLog(`Received session ID: ${data.session.id}`)
        setSessionData(data.session)

        // Set up WebRTC connection
        setupWebRTC(data.session)
      } else {
        addLog("Unexpected response from server - no session or mock flag")
        throw new Error("Unexpected response from server")
      }
    } catch (err) {
      addLog(`Error creating session: ${err instanceof Error ? err.message : String(err)}`)
      setSessionError(err instanceof Error ? err.message : "Unknown error creating session")
    } finally {
      setCreatingSession(false)
    }
  }

  // Function to set up WebRTC connection
  const setupWebRTC = async (session: any) => {
    try {
      addLog("Setting up WebRTC connection...")

      // Create a new RTCPeerConnection
      const iceServers = session.rtc_server?.ice_servers || [
        { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
      ]

      addLog(`Using ICE servers: ${JSON.stringify(iceServers)}`)

      const pc = new RTCPeerConnection({ iceServers })
      peerConnectionRef.current = pc
      setPeerConnection(pc)

      // Set up event handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addLog(`New ICE candidate: ${JSON.stringify(event.candidate)}`)
        }
      }

      pc.oniceconnectionstatechange = () => {
        addLog(`ICE connection state changed: ${pc.iceConnectionState}`)
        setIceConnectionState(pc.iceConnectionState)

        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          addLog("WebRTC connection established successfully")
          setInterviewActive(true)
          startTimer()
        } else if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "closed"
        ) {
          addLog(`WebRTC connection failed: ${pc.iceConnectionState}`)
          setInterviewActive(false)
        }
      }

      pc.onconnectionstatechange = () => {
        addLog(`Connection state changed: ${pc.connectionState}`)
        setConnectionState(pc.connectionState)
      }

      pc.onsignalingstatechange = () => {
        addLog(`Signaling state changed: ${pc.signalingState}`)
        setSignalingState(pc.signalingState)
      }

      pc.ontrack = (event) => {
        addLog(`Received remote track: ${event.track.kind}`)

        if (event.track.kind === "audio") {
          // Create an audio element if it doesn't exist
          if (!audioRef.current) {
            addLog("Creating audio element for AI voice playback")
            const audioElement = new Audio()
            audioElement.autoplay = true
            audioElement.playsInline = true
            audioElement.controls = false
            audioElement.muted = false
            document.body.appendChild(audioElement)
            audioRef.current = audioElement
          }

          // Create a new MediaStream with the received track
          const remoteStream = new MediaStream([event.track])

          // Set the remote stream as the source for the audio element
          if (audioRef.current) {
            addLog("Connecting remote audio stream to audio element")
            audioRef.current.srcObject = remoteStream
            audioRef.current.play().catch((error) => {
              addLog(`Error playing audio: ${error.message}`)
            })
          }
        }
      }

      // Set up data channel
      addLog("Creating data channel...")
      const dataChannel = pc.createDataChannel("control")
      dataChannelRef.current = dataChannel

      dataChannel.onopen = () => {
        addLog("Data channel opened")
      }

      dataChannel.onclose = () => {
        addLog("Data channel closed")
      }

      dataChannel.onerror = (error) => {
        addLog(`Data channel error: ${error.toString()}`)
      }

      dataChannel.onmessage = (event) => {
        addLog(`Received message on data channel: ${event.data}`)

        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          if (data.type === "transcript") {
            // Add assistant message
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: data.text,
                timestamp: Date.now(),
              },
            ])
          } else if (data.type === "user_transcript") {
            // Add user message from OpenAI's transcription
            setMessages((prev) => [
              ...prev,
              {
                role: "user",
                content: data.text,
                timestamp: Date.now(),
              },
            ])
          } else if (data.type === "end") {
            // End the session
            endInterview()
          }
        } catch (error) {
          addLog(`Error parsing data channel message: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      pc.ondatachannel = (event) => {
        addLog(`Received data channel: ${event.channel.label}`)

        const receivedChannel = event.channel
        receivedChannel.onmessage = (messageEvent) => {
          addLog(`Received message on ${receivedChannel.label}: ${messageEvent.data}`)

          try {
            const data = JSON.parse(messageEvent.data)

            // Handle different message types
            if (data.type === "transcript") {
              // Add assistant message
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: data.text,
                  timestamp: Date.now(),
                },
              ])
            } else if (data.type === "user_transcript") {
              // Add user message from OpenAI's transcription
              setMessages((prev) => [
                ...prev,
                {
                  role: "user",
                  content: data.text,
                  timestamp: Date.now(),
                },
              ])
            } else if (data.type === "end") {
              // End the session
              endInterview()
            }
          } catch (error) {
            addLog(`Error parsing data channel message: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }

      // Add local audio track to the peer connection
      if (localStreamRef.current) {
        addLog("Adding local audio tracks to peer connection")
        localStreamRef.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
          addLog(`Added local audio track: ${track.id}`)
        })
      }

      // Set up audio level monitoring
      setupAudioLevelMonitoring()

      // Set remote description from session data
      if (session.sdp) {
        addLog("Setting remote description from OpenAI...")

        const offer = {
          type: "offer",
          sdp: session.sdp,
        } as RTCSessionDescriptionInit

        try {
          await pc.setRemoteDescription(offer)
          addLog("Remote description set successfully")
        } catch (error) {
          addLog(`Error setting remote description: ${error instanceof Error ? error.message : String(error)}`)
          throw error
        }

        // Create and set local description
        addLog("Creating answer...")
        try {
          const answer = await pc.createAnswer()
          addLog("Answer created successfully")

          await pc.setLocalDescription(answer)
          addLog("Local description set successfully")

          // In a real implementation, we would send this to the OpenAI server
          addLog(`Answer SDP created (first 100 chars): ${answer.sdp?.substring(0, 100)}...`)
        } catch (error) {
          addLog(`Error creating/setting answer: ${error instanceof Error ? error.message : String(error)}`)
          throw error
        }
      } else {
        addLog("Error: No SDP offer in session data")
        throw new Error("No SDP offer in session data")
      }
    } catch (error) {
      addLog(`Error setting up WebRTC: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // Function to set up audio level monitoring
  const setupAudioLevelMonitoring = () => {
    if (!localStreamRef.current) return

    try {
      // Create AudioContext and Analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create an analyser
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Create a source from the stream
      const source = audioContext.createMediaStreamSource(localStreamRef.current)
      source.connect(analyser)

      // Set up interval to check audio levels
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      audioLevelIntervalRef.current = window.setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)

          // Calculate average level
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i]
          }
          const average = sum / bufferLength

          // Normalize to 0-100 range
          const normalizedLevel = Math.min(100, Math.max(0, average * 2))
          setAudioLevel(normalizedLevel)
        }
      }, 100)
    } catch (error) {
      addLog(`Error setting up audio level monitoring: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Function to start the timer
  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    setElapsedTime(0)
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
  }

  // Function to toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
      addLog(`Audio ${audioRef.current.muted ? "muted" : "unmuted"}`)
    }
  }

  // Function to end the interview
  const endInterview = async () => {
    if (isTerminating) return
    setIsTerminating(true)
    addLog("Ending interview...")

    try {
      // Stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }

      // Terminate the session if we have a session ID
      if (sessionData?.id) {
        addLog(`Terminating session: ${sessionData.id}`)

        const response = await fetch("/api/terminate-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionData.id,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          addLog(`Session termination response: ${JSON.stringify(data)}`)
        } else {
          const errorText = await response.text()
          addLog(`Error terminating session: ${response.status} ${errorText}`)
        }
      }

      // Clean up resources
      cleanup()

      // Update state
      setInterviewActive(false)
      addLog("Interview ended")
    } catch (error) {
      addLog(`Error ending interview: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsTerminating(false)
    }
  }

  // Function to clean up resources
  const cleanup = () => {
    // Clear audio level monitoring
    if (audioLevelIntervalRef.current) {
      window.clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
      analyserRef.current = null
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
      setPeerConnection(null)
    }

    // Stop all tracks in the local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      setLocalStream(null)
    }

    // Remove audio element
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.srcObject = null
      if (audioRef.current.parentNode) {
        audioRef.current.parentNode.removeChild(audioRef.current)
      }
      audioRef.current = null
    }

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Interview Experience Test</CardTitle>
            {interviewActive && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!sessionData && !interviewActive ? (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Test the complete interview experience</AlertTitle>
                <AlertDescription>
                  This page will test the entire interview flow from session creation to termination. Make sure you have
                  a microphone connected and allow microphone access when prompted.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Job Position:</label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
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

              <Button onClick={createSession} disabled={creatingSession} className="w-full">
                {creatingSession ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  "Start Interview Test"
                )}
              </Button>

              {sessionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{sessionError}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Tabs defaultValue="interview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="interview">Interview</TabsTrigger>
                <TabsTrigger value="status">Connection Status</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="interview" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-full ${interviewActive ? "bg-green-100 dark:bg-green-900/20" : "bg-amber-100 dark:bg-amber-900/20"}`}
                    >
                      {interviewActive ? (
                        <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                      ) : (
                        <MicOff className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>

                    {interviewActive && (
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium">Audio Level:</div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-24 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-100 ${
                              audioLevel > 50 ? "bg-green-500" : audioLevel > 20 ? "bg-blue-500" : "bg-gray-400"
                            }`}
                            style={{ width: `${audioLevel}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {interviewActive && (
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

                <div className="min-h-[300px] p-4 rounded-md bg-muted">
                  {!interviewActive && sessionData && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="mb-4">Connecting to AI interviewer...</p>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {interviewActive && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
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
                          <p className="text-sm font-medium mb-1">{msg.role === "assistant" ? "Interviewer" : "You"}</p>
                          <p>{msg.content}</p>
                        </div>
                      ))}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Session Information</h3>
                    {sessionData ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Session ID:</span>
                          <span className="text-sm font-mono">{sessionData.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Model:</span>
                          <span className="text-sm">{sessionData.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Voice:</span>
                          <span className="text-sm">{sessionData.voice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={interviewActive ? "default" : "outline"}>
                            {interviewActive ? "Active" : "Connecting"}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No session data available</p>
                    )}
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">WebRTC Connection</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Connection State:</span>
                        <Badge variant={connectionState === "connected" ? "default" : "outline"}>
                          {connectionState}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ICE Connection:</span>
                        <Badge
                          variant={
                            iceConnectionState === "connected" || iceConnectionState === "completed"
                              ? "default"
                              : "outline"
                          }
                        >
                          {iceConnectionState}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Signaling State:</span>
                        <Badge variant="outline">{signalingState}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Local Audio:</span>
                        <Badge variant={localStream ? "default" : "outline"}>
                          {localStream ? `${localStream.getAudioTracks().length} tracks` : "None"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Interview Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active:</span>
                      <Badge variant={interviewActive ? "default" : "outline"}>{interviewActive ? "Yes" : "No"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Messages:</span>
                      <span className="text-sm">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Elapsed Time:</span>
                      <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Audio Muted:</span>
                      <Badge variant={isMuted ? "outline" : "default"}>{isMuted ? "Yes" : "No"}</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="bg-black text-green-400 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-white">Debug Logs</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(logs.join("\n"))
                          .then(() => alert("Logs copied to clipboard"))
                          .catch((err) => console.error("Failed to copy logs:", err))
                      }}
                    >
                      Copy Logs
                    </Button>
                  </div>
                  <div className="h-[400px] overflow-y-auto font-mono text-xs">
                    {logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {interviewActive && (
            <Button variant="destructive" onClick={endInterview} disabled={isTerminating}>
              {isTerminating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ending Interview...
                </>
              ) : (
                "End Interview"
              )}
            </Button>
          )}
          {!interviewActive && sessionData && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Start New Test
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
