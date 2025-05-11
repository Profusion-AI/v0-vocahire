"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, AlertCircle, RefreshCw, Loader2, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
}

export default function InterviewRoom({ onComplete, jobTitle = "Software Engineer" }: InterviewRoomProps) {
  const router = useRouter()

  // State for session status
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "ended" | "error">("idle")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: number }>>(
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)

  // State for interview
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // State for API testing
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiErrorCode, setApiErrorCode] = useState<string | null>(null)
  const [apiErrorDetails, setApiErrorDetails] = useState<any>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<any>(null)
  const [isTestingRealtimeApi, setIsTestingRealtimeApi] = useState(false)
  const [realtimeApiTestResult, setRealtimeApiTestResult] = useState<any>(null)

  // State for audio indicators
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const sessionInfoRef = useRef<{ id: string; token: string } | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to add debug messages
  const addDebugMessage = (message: string) => {
    console.log("Debug:", message)
    setDebug((prev) => `${new Date().toISOString()} - ${message}\n${prev || ""}`.substring(0, 1000))
  }

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Function to set up WebRTC connection
  const setupWebRTC = async (sessionId: string, token: string) => {
    try {
      addDebugMessage("Setting up WebRTC connection...")

      // Create a new RTCPeerConnection with ICE servers
      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ]

      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
      })

      peerConnectionRef.current = pc
      // @ts-ignore - For debugging purposes
      if (typeof window !== "undefined") window._vocahirePeerConnection = pc

      // Set up event handlers
      pc.oniceconnectionstatechange = () => {
        addDebugMessage(`ICE connection state changed: ${pc.iceConnectionState}`)

        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          addDebugMessage("WebRTC connection established successfully")
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
          }
          setIsConnecting(false)
          setIsActive(true)
          setStatus("active")
        } else if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "closed"
        ) {
          addDebugMessage(`WebRTC connection failed: ${pc.iceConnectionState}`)
          setError(`WebRTC connection failed: ${pc.iceConnectionState}`)
          setStatus("error")
          setIsConnecting(false)
          setIsActive(false)
        }
      }

      pc.onconnectionstatechange = () => {
        addDebugMessage(`Connection state changed: ${pc.connectionState}`)
      }

      pc.onsignalingstatechange = () => {
        addDebugMessage(`Signaling state changed: ${pc.signalingState}`)
      }

      // Handle incoming audio tracks
      pc.ontrack = (event) => {
        addDebugMessage(`Received remote track: ${event.track.kind}`)

        if (event.track.kind === "audio") {
          // Create an audio element if it doesn't exist
          if (!audioRef.current) {
            const audio = new Audio()
            audio.autoplay = true
            audioRef.current = audio

            // Set up audio playing detection
            audio.onplaying = () => {
              setIsAudioPlaying(true)
              addDebugMessage("Audio started playing")
            }

            audio.onpause = audio.onended = () => {
              setIsAudioPlaying(false)
              addDebugMessage("Audio stopped playing")
            }
          }

          // Create a MediaStream with the received track
          const remoteStream = new MediaStream([event.track])

          // Set the remote stream as the source for the audio element
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream
            audioRef.current.play().catch((error) => {
              addDebugMessage(`Error playing audio: ${error}`)
            })
          }
        }
      }

      // Create a data channel for text communication
      const dataChannel = pc.createDataChannel("oai-events")
      dataChannelRef.current = dataChannel

      dataChannel.onopen = () => {
        addDebugMessage("Data channel opened")

        // Send system prompt to set up the interview context
        try {
          const systemPrompt = {
            type: "system",
            content: `You are an AI interviewer conducting a mock interview for a ${jobTitle} position. 
            Ask relevant questions about the candidate's experience, skills, and fit for the role. 
            Keep your responses conversational and engaging. 
            The interview should last about 10 minutes.`,
          }

          dataChannel.send(JSON.stringify(systemPrompt))
          addDebugMessage("Sent system prompt")
        } catch (err) {
          addDebugMessage(`Error sending system prompt: ${err}`)
        }
      }

      dataChannel.onclose = () => {
        addDebugMessage("Data channel closed")
      }

      dataChannel.onerror = (error) => {
        addDebugMessage(`Data channel error: ${error}`)
      }

      dataChannel.onmessage = (event) => {
        addDebugMessage(`Received message on data channel: ${event.data}`)

        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          if (data.type === "transcript") {
            // This is the user's transcribed speech
            addMessage("user", data.transcript)
          } else if (data.type === "message") {
            // This is the assistant's response - we don't display it in the UI
            // Just log it for debugging
            addDebugMessage(`Assistant message (audio only): ${data.content}`)
          } else if (data.type === "error") {
            addDebugMessage(`Error from OpenAI: ${JSON.stringify(data.error)}`)
          }
        } catch (err) {
          addDebugMessage(`Error parsing data channel message: ${err}`)
        }
      }

      // Add local audio track to the peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
          addDebugMessage(`Added local audio track: ${track.id}`)
        })
      } else {
        throw new Error("No local audio stream available")
      }

      // Create an offer
      addDebugMessage("Creating offer...")
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      })

      // Set local description
      await pc.setLocalDescription(offer)
      addDebugMessage("Local description set")

      // Wait for ICE gathering to complete or timeout after 5 seconds
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (pc.iceGatheringState === "complete") {
            resolve()
          }
        }

        const gatheringTimeout = setTimeout(() => {
          addDebugMessage("ICE gathering timed out, proceeding with available candidates")
          resolve()
        }, 5000)

        pc.onicegatheringstatechange = () => {
          addDebugMessage(`ICE gathering state changed: ${pc.iceGatheringState}`)
          checkState()
        }

        checkState() // Check immediately in case it's already complete

        // Clean up the timeout when resolved
        return () => clearTimeout(gatheringTimeout)
      })

      // Get the current SDP offer
      if (!pc.localDescription || !pc.localDescription.sdp) {
        throw new Error("No local description available")
      }

      const sdpOffer = pc.localDescription.sdp
      addDebugMessage(`SDP offer created (${sdpOffer.length} chars)`)

      // Send the SDP offer to the server to exchange with OpenAI
      addDebugMessage("Sending SDP offer to server...")
      const response = await fetch("/api/webrtc-exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          token,
          sdp: sdpOffer,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        addDebugMessage(`WebRTC exchange error: ${response.status} - ${errorText}`)

        // Try to parse the error response
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.code === "html_response") {
            throw new Error(
              "The OpenAI API returned HTML instead of an SDP answer. Your API key may not have access to the Realtime API.",
            )
          }
        } catch (parseError) {
          // If we can't parse the error, just use the original error text
        }

        throw new Error(`WebRTC exchange error: ${response.status}`)
      }

      // Get the SDP answer from the server
      const { sdp: sdpAnswer } = await response.json()
      addDebugMessage(`Received SDP answer (${sdpAnswer.length} chars)`)

      // Set the remote description
      await pc.setRemoteDescription({
        type: "answer",
        sdp: sdpAnswer,
      })
      addDebugMessage("Remote description set")

      // Connection should now be establishing
      addDebugMessage("WebRTC connection setup complete, waiting for connection...")

      return true
    } catch (error) {
      addDebugMessage(`Error setting up WebRTC: ${error}`)
      throw error
    }
  }

  // Function to add a message to the conversation
  const addMessage = (role: "user" | "assistant", content: string) => {
    // For assistant messages, we don't display them in the UI
    if (role === "assistant") {
      // In a real implementation, this would trigger audio playback
      // but we don't add it to the visible messages
      console.log("Assistant message for audio only:", content)
      return
    }

    // Only add user messages to the UI
    setMessages((prev) => [...prev, { role, content, timestamp: Date.now() }])
  }

  // Function to start the interview
  const handleStartInterview = async () => {
    try {
      setApiError(null)
      setApiErrorCode(null)
      setApiErrorDetails(null)
      setError(null)
      setIsConnecting(true)
      setStatus("connecting")
      addDebugMessage(`Starting interview for job title: ${jobTitle}`)

      // Request microphone access
      try {
        addDebugMessage("Requesting microphone access...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        addDebugMessage(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)
      } catch (err) {
        addDebugMessage(`Error getting microphone access: ${err instanceof Error ? err.message : String(err)}`)
        throw new Error("Could not access microphone. Please check your browser permissions.")
      }

      // First, try to test the OpenAI API to see if we have a valid API key
      try {
        addDebugMessage("Testing OpenAI API connection...")
        const testResponse = await fetch("/api/test-openai")
        const testData = await testResponse.json()

        if (testData.status !== "success") {
          addDebugMessage("OpenAI API test failed.")
          throw new Error("OpenAI API test failed. The service is currently unavailable.")
        }

        addDebugMessage("OpenAI API test successful. Proceeding with real-time session.")
      } catch (testError) {
        addDebugMessage(`OpenAI API test error: ${testError}`)
        throw new Error("Failed to connect to OpenAI API. The service is currently unavailable.")
      }

      // Try to get a real-time session token
      addDebugMessage("Fetching OpenAI token...")
      const tokenResponse = await fetch("/api/realtime-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobRole: jobTitle }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        addDebugMessage(`Token API error: ${tokenResponse.status} - ${errorText}`)

        // Try to parse the error response
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.code === "html_response") {
            throw new Error(
              "The OpenAI API returned HTML instead of JSON. Your API key may not have access to the Realtime API.",
            )
          }
        } catch (parseError) {
          // If we can't parse the error, just use the original error text
        }

        throw new Error(`Failed to initialize interview session. Status: ${tokenResponse.status}`)
      }

      const { token, sessionId, model, voice } = await tokenResponse.json()
      addDebugMessage(`Token received: ${sessionId} (model: ${model}, voice: ${voice})`)

      // Store session info for later use
      sessionInfoRef.current = { id: sessionId, token }

      // Set a timeout for connection
      connectTimeoutRef.current = setTimeout(() => {
        if (status === "connecting") {
          addDebugMessage("Connection timed out.")
          setError("Connection timed out. The service is currently unavailable.")
          setStatus("error")
          setIsConnecting(false)
          cleanup()
        }
      }, 20000) // 20 second timeout

      // Set up WebRTC connection
      try {
        await setupWebRTC(sessionId, token)
      } catch (err) {
        addDebugMessage(`WebRTC setup error: ${err}`)
        throw new Error("Failed to establish voice connection. The service is currently unavailable.")
      }
    } catch (err) {
      console.error("Failed to start interview:", err)

      // Extract more detailed error information
      let errorMessage = "An unknown error occurred. The service is currently unavailable."
      let errorCode = "unknown_error"
      let errorDetails = null

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "object" && err !== null) {
        errorMessage = JSON.stringify(err)
      }

      // Try to parse the error response if it's a JSON string
      try {
        if (errorMessage.includes("{") && errorMessage.includes("}")) {
          const jsonStartIndex = errorMessage.indexOf("{")
          const jsonString = errorMessage.substring(jsonStartIndex)
          const errorJson = JSON.parse(jsonString)

          if (errorJson.message) errorMessage = errorJson.message
          if (errorJson.code) errorCode = errorJson.code
          errorDetails = errorJson

          // Handle HTML response error specifically
          if (errorCode === "html_response") {
            errorMessage =
              "The service is currently unavailable due to a network issue or API access restrictions. Please try again later."
            addDebugMessage(
              "Received HTML response instead of JSON/SDP. This could be due to a network proxy, incorrect API endpoint, or lack of access to the Realtime API.",
            )
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }

      setApiError(errorMessage)
      setApiErrorCode(errorCode)
      setApiErrorDetails(errorDetails)
      setError(errorMessage)
      setStatus("error")
      setIsConnecting(false)
      cleanup()
    }
  }

  // Function to handle interview completion
  const handleInterviewComplete = () => {
    addDebugMessage("Interview completed")
    cleanup()
    setStatus("ended")
    setIsActive(false)

    // In a real implementation, you would save the interview data to your database
    // and then redirect to the feedback page
    setTimeout(() => {
      router.push("/feedback")
    }, 2000)

    if (onComplete) {
      onComplete(messages)
    }
  }

  // Function to toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted
      // Toggle mute state for all audio tracks
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState
      })
      setIsMuted(newMuteState)
      addDebugMessage(`Microphone ${newMuteState ? "muted" : "unmuted"}`)
    } else if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Function to clean up resources
  const cleanup = () => {
    addDebugMessage("Cleaning up resources")

    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    // Clear connection timeout
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    // Close data channel
    if (dataChannelRef.current) {
      try {
        if (dataChannelRef.current.readyState === "open") {
          dataChannelRef.current.close()
        }
        dataChannelRef.current = null
      } catch (err) {
        addDebugMessage(`Error closing data channel: ${err}`)
      }
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      } catch (err) {
        addDebugMessage(`Error closing peer connection: ${err}`)
      }
    }

    // Stop all tracks in the local stream
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
        localStreamRef.current = null
      } catch (err) {
        addDebugMessage(`Error stopping audio tracks: ${err}`)
      }
    }

    // Clean up audio element
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.srcObject = null
      } catch (err) {
        addDebugMessage(`Error cleaning up audio element: ${err}`)
      }
    }

    // Reset session info
    sessionInfoRef.current = null
  }

  // Function to test OpenAI API connectivity
  const testOpenAiApi = async () => {
    setIsTestingApi(true)
    setApiTestResult(null)

    try {
      const response = await fetch("/api/test-openai")
      const data = await response.json()
      setApiTestResult(data)

      // If the test is successful but we had an error before, try starting the interview again
      if (data.status === "success" && apiError) {
        setApiError("API connection successful. You can try starting the interview again.")
        setApiErrorCode(null)
      }
    } catch (error) {
      setApiTestResult({
        status: "error",
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsTestingApi(false)
    }
  }

  // Function to test OpenAI Realtime API connectivity
  const testRealtimeApi = async () => {
    setIsTestingRealtimeApi(true)
    setRealtimeApiTestResult(null)

    try {
      const response = await fetch("/api/test-realtime-api")
      const data = await response.json()
      setRealtimeApiTestResult(data)

      // If the test is successful but we had an error before, try starting the interview again
      if (data.status === "success" && apiError) {
        setApiError("Realtime API connection successful. You can try starting the interview again.")
        setApiErrorCode(null)
      }
    } catch (error) {
      setRealtimeApiTestResult({
        status: "error",
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsTestingRealtimeApi(false)
    }
  }

  // Render missing API key error
  const renderMissingApiKeyError = () => {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Service Unavailable</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            The interview service is currently unavailable. Please try again later or contact support.
          </p>

          {process.env.NODE_ENV === "development" && apiErrorDetails && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
              <p className="font-medium mb-1">Error Details:</p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiErrorDetails, null, 2)}</pre>
            </div>
          )}

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={testOpenAiApi} disabled={isTestingApi} className="text-xs">
                {isTestingApi ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Testing API...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Test OpenAI Connection
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={testRealtimeApi}
                disabled={isTestingRealtimeApi}
                className="text-xs"
              >
                {isTestingRealtimeApi ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Testing Realtime API...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Test Realtime API
                  </>
                )}
              </Button>
            </div>
          )}

          {process.env.NODE_ENV === "development" && apiTestResult && (
            <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
              <p className="font-medium mb-1">API Test Result:</p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiTestResult, null, 2)}</pre>
            </div>
          )}

          {process.env.NODE_ENV === "development" && realtimeApiTestResult && (
            <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
              <p className="font-medium mb-1">Realtime API Test Result:</p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(realtimeApiTestResult, null, 2)}</pre>
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Helper function to render error messages
  const renderErrorMessage = (errorMessage: string) => {
    // Don't show any error for User-Initiated Abort - this is expected behavior
    if (errorMessage.includes("User-Initiated Abort") || errorMessage.includes("Server initiated disconnect")) {
      return null
    }

    // Check if this is a missing API key error
    if (apiErrorCode === "missing_api_key" || errorMessage.includes("API key is missing")) {
      return renderMissingApiKeyError()
    }

    // Check if this is an HTML response error (likely due to API access restrictions)
    if (
      apiErrorCode === "html_response" ||
      errorMessage.includes("HTML response") ||
      errorMessage.includes("API access restrictions")
    ) {
      return (
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">API Access Restricted</p>
              <p className="mb-2">
                The OpenAI Realtime API appears to be unavailable with your current API key. This could be because:
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Your API key doesn't have access to the Realtime API</li>
                <li>The Realtime API is in beta and requires special access</li>
                <li>There may be a network issue preventing access to the API</li>
              </ul>

              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testRealtimeApi}
                    disabled={isTestingRealtimeApi}
                    className="text-xs"
                  >
                    {isTestingRealtimeApi ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Testing Realtime API...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test Realtime API Access
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link
                      href="https://platform.openai.com/docs/api-reference/audio/realtime"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      OpenAI Realtime API Docs
                    </Link>
                  </Button>
                </div>
              )}

              {process.env.NODE_ENV === "development" && realtimeApiTestResult && (
                <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
                  <p className="font-medium mb-1">Realtime API Test Result:</p>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(realtimeApiTestResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Service Unavailable</p>
            <p>The interview service is currently unavailable. Please try again later or contact support.</p>

            {process.env.NODE_ENV === "development" && (
              <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Debug: {errorMessage}</p>
            )}

            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={testOpenAiApi} disabled={isTestingApi} className="text-xs">
                  {isTestingApi ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Testing API...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Test OpenAI Connection
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testRealtimeApi}
                  disabled={isTestingRealtimeApi}
                  className="text-xs"
                >
                  {isTestingRealtimeApi ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Testing Realtime API...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Test Realtime API
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Simulate user speaking (for testing)
  const simulateUserSpeaking = () => {
    if (isActive) {
      const userResponses = [
        "Hi, my name is Alex and I have 5 years of experience in software development.",
        "I recently worked on a project where we had to migrate a legacy system to a modern architecture.",
        "I believe my strongest skills are problem-solving and communication.",
        "I'm looking for a role where I can grow my technical skills while also developing leadership abilities.",
      ]

      const randomResponse = userResponses[Math.floor(Math.random() * userResponses.length)]
      addMessage("user", randomResponse)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mock Interview: {jobTitle}</CardTitle>
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="h-5 w-5" />
            <span className={timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}>{formatTime(timeRemaining)}</span>
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
          renderErrorMessage(error)
        ) : apiError ? (
          apiErrorCode === "missing_api_key" ? (
            renderMissingApiKeyError()
          ) : apiErrorCode === "html_response" ? (
            renderErrorMessage(apiError)
          ) : (
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Service Unavailable</p>
                  <p>The interview service is currently unavailable. Please try again later or contact support.</p>

                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Debug: {apiError}</p>
                  )}

                  {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testOpenAiApi}
                        disabled={isTestingApi}
                        className="text-xs"
                      >
                        {isTestingApi ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Testing API...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Test OpenAI Connection
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testRealtimeApi}
                        disabled={isTestingRealtimeApi}
                        className="text-xs"
                      >
                        {isTestingRealtimeApi ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Testing Realtime API...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Test Realtime API
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
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
                  <div className="mt-6">
                    <Button onClick={handleStartInterview} size="lg">
                      Start Interview
                    </Button>
                  </div>
                </div>
              )}

              {isConnecting && (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <h3 className="text-lg font-medium mb-2">Connecting to OpenAI...</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Establishing secure connection. This may take a few moments.
                  </p>
                </div>
              )}

              {isActive && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                      <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                    </div>
                    {isActive && (
                      <div className="text-center mb-4 flex items-center justify-center gap-2">
                        <div
                          className={`p-2 rounded-full ${isAudioPlaying ? "bg-blue-100 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                        >
                          <Volume2
                            className={`h-5 w-5 ${isAudioPlaying ? "text-blue-600 dark:text-blue-400 animate-pulse" : "text-gray-400"}`}
                          />
                        </div>
                        <p className="text-sm">
                          {isAudioPlaying ? "Interviewer is speaking..." : "Listening to your response..."}
                        </p>
                      </div>
                    )}
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
                    {isActive && (
                      <p>Interview in progress. Speak clearly and listen for the interviewer's questions.</p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground italic">
                        <p>Your responses will appear here as you speak...</p>
                      </div>
                    )}
                    {messages.map((msg, index) => (
                      <div key={index} className="p-3 rounded-lg bg-secondary/10 mr-4">
                        <p className="text-sm font-medium mb-1">You</p>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                  </div>

                  {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" size="sm" onClick={simulateUserSpeaking}>
                        Simulate User Speaking (Dev Only)
                      </Button>
                    </div>
                  )}
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

        {process.env.NODE_ENV === "development" && debug && (
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
        {status === "ended" && (
          <Button asChild>
            <Link href="/feedback">View Feedback</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
