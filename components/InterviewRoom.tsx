"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Mic,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  Headphones,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ConnectionQualityIndicator } from "@/components/connection-quality-indicator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { countFillerWords, getTotalFillerWordCount } from "@/lib/filler-words"
import type { ResumeData } from "@/components/resume-input"

interface InterviewRoomProps {
  onComplete?: (
    messages: Array<{ role: string; content: string; timestamp: number }>,
    fillerWordCounts?: { [key: string]: number },
  ) => void
  jobTitle?: string
  resumeData?: ResumeData
}

export default function InterviewRoom({ onComplete, jobTitle = "Software Engineer", resumeData }: InterviewRoomProps) {
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
  const [audioLevel, setAudioLevel] = useState(0)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [audioPlaybackQuality, setAudioPlaybackQuality] = useState<"good" | "poor" | "unknown">("unknown")

  // State for connection status
  const [connectionStatus, setConnectionStatus] = useState<
    "initializing" | "connecting" | "connected" | "failed" | "disconnected" | "closed"
  >("initializing")
  const [connectionProgress, setConnectionProgress] = useState(0)
  const [connectionSteps, setConnectionSteps] = useState<
    Array<{
      id: string
      name: string
      status: "pending" | "in-progress" | "complete" | "error"
      message?: string
    }>
  >([
    { id: "microphone", name: "Microphone Access", status: "pending" },
    { id: "api", name: "API Connection", status: "pending" },
    { id: "session", name: "Session Creation", status: "pending" },
    { id: "webrtc", name: "WebRTC Setup", status: "pending" },
    { id: "audio", name: "Audio Connection", status: "pending" },
  ])

  // State for fallback mode
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [fallbackReason, setFallbackReason] = useState<string | null>(null)
  const [showFallbackMessage, setShowFallbackMessage] = useState(false)

  // State for filler word tracking
  const [fillerWordCounts, setFillerWordCounts] = useState<{ [key: string]: number }>({})
  const [totalFillerWords, setTotalFillerWords] = useState(0)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const sessionInfoRef = useRef<{ id: string; token: string } | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttemptsRef = useRef<number>(3)

  // Helper function to add debug messages
  const addDebugMessage = (message: string) => {
    console.log("Debug:", message)
    setDebug((prev) => `${new Date().toISOString()} - ${message}\n${prev || ""}`.substring(0, 1000))
  }

  // Helper function to update connection steps
  const updateConnectionStep = (
    id: string,
    status: "pending" | "in-progress" | "complete" | "error",
    message?: string,
  ) => {
    setConnectionSteps((prev) => prev.map((step) => (step.id === id ? { ...step, status, message } : step)))

    // Update connection progress
    const completedSteps = connectionSteps.filter((step) => step.status === "complete").length
    const totalSteps = connectionSteps.length
    const newProgress = Math.round((completedSteps / totalSteps) * 100)
    setConnectionProgress(newProgress)
  }

  // Check for microphone permission
  useEffect(() => {
    async function checkMicPermission() {
      try {
        updateConnectionStep("microphone", "in-progress")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setIsPermissionGranted(true)
        updateConnectionStep("microphone", "complete")
      } catch (err) {
        console.error("Microphone permission denied:", err)
        setIsPermissionGranted(false)
        updateConnectionStep("microphone", "error", "Microphone access denied")
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

  // Periodic connection check
  useEffect(() => {
    if (isActive && peerConnectionRef.current) {
      const checkConnection = () => {
        const pc = peerConnectionRef.current
        if (!pc) return

        const connectionState = pc.connectionState || pc.iceConnectionState

        if (connectionState === "disconnected" || connectionState === "failed" || connectionState === "closed") {
          addDebugMessage(`Connection check failed: ${connectionState}`)
          setConnectionStatus("disconnected")

          // Try to reconnect if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
            reconnectAttemptsRef.current++
            addDebugMessage(
              `Attempting reconnection (${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})`,
            )

            // Show reconnection message
            setError(
              `Connection lost. Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})...`,
            )

            // Try to restart ICE
            try {
              pc.restartIce()
              addDebugMessage("ICE restart initiated")
            } catch (err) {
              addDebugMessage(`Error restarting ICE: ${err}`)
            }
          } else {
            addDebugMessage("Max reconnection attempts reached. Falling back to text mode.")
            handleConnectionFailure("Max reconnection attempts reached")
          }
        } else if (connectionState === "connected" || connectionState === "completed") {
          // Reset reconnect attempts if connection is good
          reconnectAttemptsRef.current = 0
          setConnectionStatus("connected")
          setError(null)
        }
      }

      connectionCheckIntervalRef.current = setInterval(checkConnection, 5000)
      return () => {
        if (connectionCheckIntervalRef.current) clearInterval(connectionCheckIntervalRef.current)
      }
    }
  }, [isActive])

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

  // Function to set up audio analysis for visualizing audio levels
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      audioAnalyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      audioDataRef.current = dataArray

      // Set up interval to analyze audio levels
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
      }

      audioLevelIntervalRef.current = setInterval(() => {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
          const normalizedLevel = average / 255 // Normalize to 0-1 range
          setAudioLevel(normalizedLevel)
          setIsUserSpeaking(normalizedLevel > 0.05) // Threshold for "speaking"
        }
      }, 100)

      addDebugMessage("Audio analysis setup complete")
    } catch (err) {
      addDebugMessage(`Error setting up audio analysis: ${err}`)
    }
  }

  // Function to handle connection failure and switch to fallback mode
  const handleConnectionFailure = (reason: string) => {
    addDebugMessage(`Connection failure: ${reason}. Switching to fallback mode.`)
    setFallbackReason(reason)
    setIsFallbackMode(true)
    setShowFallbackMessage(true)

    // Clean up WebRTC resources
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close()
      } catch (err) {
        addDebugMessage(`Error closing peer connection: ${err}`)
      }
      peerConnectionRef.current = null
    }

    // Keep the interview active but in fallback mode
    setConnectionStatus("failed")
    setIsActive(true)
    setStatus("active")
    setIsConnecting(false)

    // Add a system message about fallback mode
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "The voice connection has been interrupted. We'll continue the interview in text mode. Please type your responses below.",
        timestamp: Date.now(),
      },
    ])

    // Start fallback interview flow
    startFallbackInterview()
  }

  // Function to start fallback interview (text-based)
  const startFallbackInterview = () => {
    addDebugMessage("Starting fallback interview (text-based)")

    // Add initial interviewer message
    setTimeout(() => {
      addMessage(
        "assistant",
        `Hello! I'll be conducting your interview for the ${jobTitle} position. Could you start by telling me about your background and experience?`,
      )
    }, 1000)
  }

  // Function to set up WebRTC connection
  const setupWebRTC = async (sessionId: string, token: string) => {
    try {
      addDebugMessage("Setting up WebRTC connection...")
      updateConnectionStep("webrtc", "in-progress")
      setConnectionStatus("connecting")

      // First, fetch ICE servers configuration
      addDebugMessage("Fetching ICE servers...")
      const iceResponse = await fetch("/api/ice-servers")
      if (!iceResponse.ok) {
        throw new Error(`Failed to fetch ICE servers: ${iceResponse.status}`)
      }
      const { iceServers } = await iceResponse.json()
      addDebugMessage(`Received ${iceServers.length} ICE servers`)

      // Create a new RTCPeerConnection with ICE servers
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
          setConnectionStatus("connected")
          updateConnectionStep("webrtc", "complete")
        } else if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "closed"
        ) {
          addDebugMessage(`WebRTC connection failed: ${pc.iceConnectionState}`)
          updateConnectionStep("webrtc", "error", `Connection failed: ${pc.iceConnectionState}`)

          // Only handle as error if we're not already in fallback mode
          if (!isFallbackMode) {
            if (pc.iceConnectionState === "failed") {
              handleConnectionFailure(`ICE connection failed`)
            } else if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
              handleConnectionFailure(
                `Connection ${pc.iceConnectionState} after ${reconnectAttemptsRef.current} attempts`,
              )
            }
          }
        }
      }

      pc.onconnectionstatechange = () => {
        addDebugMessage(`Connection state changed: ${pc.connectionState}`)

        if (pc.connectionState === "connected") {
          setConnectionStatus("connected")
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          setConnectionStatus(
            pc.connectionState === "failed"
              ? "failed"
              : pc.connectionState === "disconnected"
                ? "disconnected"
                : "closed",
          )

          // Only handle as error if we're not already in fallback mode
          if (!isFallbackMode && reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
            handleConnectionFailure(`Connection ${pc.connectionState}`)
          }
        }
      }

      pc.onsignalingstatechange = () => {
        addDebugMessage(`Signaling state changed: ${pc.signalingState}`)
      }

      pc.onicegatheringstatechange = () => {
        addDebugMessage(`ICE gathering state changed: ${pc.iceGatheringState}`)
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDebugMessage(`New ICE candidate: ${event.candidate.candidate.substring(0, 50)}...`)
        }
      }

      // Handle incoming audio tracks
      pc.ontrack = (event) => {
        addDebugMessage(`Received remote track: ${event.track.kind}`)

        if (event.track.kind === "audio") {
          updateConnectionStep("audio", "in-progress")

          // Create an audio element if it doesn't exist
          if (!audioRef.current) {
            const audio = new Audio()
            audio.autoplay = true
            audioRef.current = audio

            // Set up audio playing detection
            audio.onplaying = () => {
              setIsAudioPlaying(true)
              setAudioPlaybackQuality("good")
              updateConnectionStep("audio", "complete")
              addDebugMessage("Audio started playing")
            }

            audio.onpause = audio.onended = () => {
              setIsAudioPlaying(false)
              addDebugMessage("Audio stopped playing")
            }

            // Set up audio error handling
            audio.onerror = (e) => {
              addDebugMessage(`Audio error: ${audio.error?.code} - ${audio.error?.message}`)
              setAudioPlaybackQuality("poor")
              updateConnectionStep("audio", "error", `Audio error: ${audio.error?.code}`)
            }

            // Set up audio stalled/waiting detection
            audio.onstalled = audio.onwaiting = () => {
              addDebugMessage("Audio playback stalled or waiting")
              setAudioPlaybackQuality("poor")
            }
          }

          // Create a MediaStream with the received track
          const remoteStream = new MediaStream([event.track])

          // Set the remote stream as the source for the audio element
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream
            audioRef.current.play().catch((error) => {
              addDebugMessage(`Error playing audio: ${error}`)
              updateConnectionStep("audio", "error", `Play error: ${error}`)
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
          let systemPromptContent = `You are an AI interviewer conducting a mock interview for a ${jobTitle} position. 
  Ask relevant questions about the candidate's experience, skills, and fit for the role. 
  Keep your responses conversational and engaging. 
  The interview should last about 10 minutes.`

          // Add resume data if available
          if (resumeData) {
            systemPromptContent += `\n\nThe candidate has provided the following resume information:`

            if (resumeData.skills) {
              systemPromptContent += `\nSkills: ${resumeData.skills}`
            }

            if (resumeData.experience) {
              systemPromptContent += `\nExperience: ${resumeData.experience}`
            }

            if (resumeData.education) {
              systemPromptContent += `\nEducation: ${resumeData.education}`
            }

            if (resumeData.achievements) {
              systemPromptContent += `\nAchievements: ${resumeData.achievements}`
            }

            systemPromptContent += `\n\nTailor your questions to explore these areas and assess the candidate's fit for the ${jobTitle} role.`
          }

          const systemPrompt = {
            type: "system",
            content: systemPromptContent,
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
        addDebugMessage(`Received message on data channel: ${event.data.substring(0, 100)}...`)

        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          if (data.type === "transcript") {
            // This is the user's transcribed speech
            addMessage("user", data.transcript)
          } else if (data.type === "message") {
            // This is the assistant's response - we don't display it in the UI
            // Just log it for debugging
            addDebugMessage(`Assistant message (audio only): ${data.content.substring(0, 100)}...`)
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
        addDebugMessage(`WebRTC exchange error: ${response.status} - ${errorText.substring(0, 200)}`)

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
      updateConnectionStep("webrtc", "error", `Setup error: ${error}`)
      throw error
    }
  }

  // Function to add a message to the conversation
  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content, timestamp: Date.now() }])

    // Track filler words in user messages
    if (role === "user") {
      const newCounts = countFillerWords(content)
      const newTotal = getTotalFillerWordCount(newCounts)

      setFillerWordCounts((prev) => {
        const updated = { ...prev }

        // Merge the counts
        Object.entries(newCounts).forEach(([word, count]) => {
          updated[word] = (updated[word] || 0) + count
        })

        return updated
      })

      setTotalFillerWords((prev) => prev + newTotal)
    }
  }

  // Function to handle user text input in fallback mode
  const handleUserTextInput = (text: string) => {
    if (!text.trim()) return

    // Add user message
    addMessage("user", text)

    // Simulate AI response after a short delay
    setTimeout(() => {
      // Generate a simple response based on the user's input
      let response = ""

      if (text.toLowerCase().includes("experience") || text.toLowerCase().includes("background")) {
        response = `Thank you for sharing your experience. Can you tell me about a challenging project you worked on recently?`
      } else if (text.toLowerCase().includes("project") || text.toLowerCase().includes("challenge")) {
        response = `That sounds interesting. How did you approach problem-solving in that situation?`
      } else if (text.toLowerCase().includes("problem") || text.toLowerCase().includes("solution")) {
        response = `Great approach. What would you say are your key strengths and areas for improvement?`
      } else if (text.toLowerCase().includes("strength") || text.toLowerCase().includes("weakness")) {
        response = `Thank you for sharing that. Where do you see yourself in 5 years?`
      } else if (text.toLowerCase().includes("year") || text.toLowerCase().includes("future")) {
        response = `Interesting goals. How do you stay updated with the latest trends in your field?`
      } else if (text.toLowerCase().includes("learn") || text.toLowerCase().includes("trend")) {
        response = `That's a good approach to learning. Do you have any questions for me about the position?`
      } else if (text.toLowerCase().includes("question")) {
        response = `Thank you for your time today. We'll be in touch with next steps.`
      } else {
        response = `Thank you for sharing that. Can you tell me more about how your skills align with this ${jobTitle} position?`
      }

      addMessage("assistant", response)
    }, 1500)
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
      setIsFallbackMode(false)
      setFallbackReason(null)
      setShowFallbackMessage(false)
      setConnectionProgress(0)

      // Reset connection steps
      setConnectionSteps([
        { id: "microphone", name: "Microphone Access", status: "pending" },
        { id: "api", name: "API Connection", status: "pending" },
        { id: "session", name: "Session Creation", status: "pending" },
        { id: "webrtc", name: "WebRTC Setup", status: "pending" },
        { id: "audio", name: "Audio Connection", status: "pending" },
      ])

      addDebugMessage(`Starting interview for job title: ${jobTitle}`)

      // Request microphone access
      try {
        addDebugMessage("Requesting microphone access...")
        updateConnectionStep("microphone", "in-progress")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        addDebugMessage(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)
        updateConnectionStep("microphone", "complete")

        // Set up audio analysis for visualizing audio levels
        setupAudioAnalysis(stream)
      } catch (err) {
        addDebugMessage(`Error getting microphone access: ${err instanceof Error ? err.message : String(err)}`)
        updateConnectionStep("microphone", "error", "Access denied")
        throw new Error("Could not access microphone. Please check your browser permissions.")
      }

      // First, try to test the OpenAI API to see if we have a valid API key
      try {
        addDebugMessage("Testing OpenAI API connection...")
        updateConnectionStep("api", "in-progress")
        const testResponse = await fetch("/api/test-openai")
        const testData = await testResponse.json()

        if (testData.status !== "success") {
          addDebugMessage("OpenAI API test failed.")
          updateConnectionStep("api", "error", "API test failed")
          throw new Error("OpenAI API test failed. The service is currently unavailable.")
        }

        addDebugMessage("OpenAI API test successful. Proceeding with real-time session.")
        updateConnectionStep("api", "complete")
      } catch (testError) {
        addDebugMessage(`OpenAI API test error: ${testError}`)
        updateConnectionStep("api", "error", "Connection error")
        throw new Error("Failed to connect to OpenAI API. The service is currently unavailable.")
      }

      // Try to get a real-time session token
      try {
        addDebugMessage("Fetching OpenAI token...")
        updateConnectionStep("session", "in-progress")
        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobRole: jobTitle }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          addDebugMessage(`Token API error: ${tokenResponse.status} - ${errorText.substring(0, 200)}`)
          updateConnectionStep("session", "error", `API error: ${tokenResponse.status}`)

          // Try to parse the error response
          try {
            const errorData = JSON.parse(errorText)
            setApiErrorCode(errorData.code || null)

            if (errorData.code === "html_response") {
              throw new Error(
                "The OpenAI API returned HTML instead of JSON. Your API key may not have access to the Realtime API.",
              )
            }

            throw new Error(
              errorData.message || `Failed to initialize interview session. Status: ${tokenResponse.status}`,
            )
          } catch (parseError) {
            // If we can't parse the error, just use the original error text
            throw new Error(`Failed to initialize interview session. Status: ${tokenResponse.status}`)
          }
        }

        const { token, sessionId, model, voice } = await tokenResponse.json()
        addDebugMessage(`Token received: ${sessionId} (model: ${model}, voice: ${voice})`)
        updateConnectionStep("session", "complete")

        // Store session info for later use
        sessionInfoRef.current = { id: sessionId, token }

        // Set a timeout for connection
        connectTimeoutRef.current = setTimeout(() => {
          if (status === "connecting") {
            addDebugMessage("Connection timed out.")
            setError("Connection timed out. Switching to text-based interview.")
            setStatus("active")
            setIsConnecting(false)
            handleConnectionFailure("Connection timeout")
          }
        }, 20000) // 20 second timeout

        // Set up WebRTC connection
        try {
          await setupWebRTC(sessionId, token)
        } catch (err) {
          addDebugMessage(`WebRTC setup error: ${err}`)
          handleConnectionFailure(`WebRTC setup failed: ${err}`)
        }
      } catch (err) {
        console.error("Failed to start interview:", err)
        addDebugMessage(`Session creation error: ${err}`)

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
        setApiErrorCode(errorCode || apiErrorCode)
        setApiErrorDetails(errorDetails)
        setError(errorMessage)
        setStatus("error")
        setIsConnecting(false)
        cleanup()
      }
    } catch (err) {
      console.error("Failed to start interview:", err)

      // If this is a microphone permission error, show specific error
      if (err instanceof Error && err.message.includes("microphone")) {
        setError(err.message)
        setStatus("error")
        setIsConnecting(false)
        cleanup()
        return
      }

      // For other errors, try fallback mode
      addDebugMessage(`Starting in fallback mode due to error: ${err}`)
      handleConnectionFailure(`Initial setup error: ${err}`)
    }
  }

  // Function to handle interview completion
  const handleInterviewComplete = () => {
    addDebugMessage("Interview completed")
    cleanup()
    setStatus("ended")
    setIsActive(false)

    // Store interview data in localStorage for the feedback page
    localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages))
    localStorage.setItem("vocahire_filler_words", JSON.stringify(fillerWordCounts))

    // In a real implementation, you would save the interview data to your database
    // and then redirect to the feedback page
    setTimeout(() => {
      router.push("/feedback")
    }, 2000)

    if (onComplete) {
      onComplete(messages, fillerWordCounts)
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

    // Clear audio level interval
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }

    // Clear connection check interval
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current)
      connectionCheckIntervalRef.current = null
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

    // Close audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
        audioContextRef.current = null
        audioAnalyserRef.current = null
        audioDataRef.current = null
      } catch (err) {
        addDebugMessage(`Error closing audio context: ${err}`)
      }
    }

    // Reset session info
    sessionInfoRef.current = null

    // Reset reconnect attempts
    reconnectAttemptsRef.current = 0
  }

  // Function to test OpenAI API connectivity
  const testOpenAiApi = async () => {
    setIsTestingApi(true)
    setApiTestResult(null)

    try {
      const response = await fetch("/api/test-openai", {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })
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
      const response = await fetch("/api/test-realtime-api", {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })
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

              <div className="mt-3">
                <Button variant="outline" onClick={() => handleConnectionFailure("API access restricted")}>
                  Continue with Text-Based Interview
                </Button>
              </div>

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
                        Test Realtime API
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

    // Check for WebRTC specific errors
    if (
      errorMessage.includes("WebRTC") ||
      errorMessage.includes("ICE") ||
      errorMessage.includes("connection failed") ||
      errorMessage.includes("SDP")
    ) {
      return (
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="mb-2">
                Failed to establish a WebRTC connection. This could be due to network restrictions or firewall settings.
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Check if you're behind a corporate firewall or VPN that might block WebRTC</li>
                <li>Try using a different network connection</li>
                <li>Try using a different browser</li>
                <li>Make sure your microphone is working properly</li>
              </ul>

              <div className="mt-3">
                <Button variant="outline" onClick={() => handleConnectionFailure("WebRTC connection failed")}>
                  Continue with Text-Based Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Check for microphone permission errors
    if (errorMessage.includes("microphone") || errorMessage.includes("permission")) {
      return (
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Microphone Access Required</p>
              <p className="mb-2">
                This application needs access to your microphone for the voice interview. Please allow microphone access
                in your browser settings.
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Click the camera/microphone icon in your browser's address bar</li>
                <li>Select "Allow" for microphone access</li>
                <li>Refresh the page after granting permission</li>
              </ul>

              <div className="mt-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
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

            <div className="mt-3">
              <Button variant="outline" onClick={() => handleConnectionFailure("Service unavailable")}>
                Continue with Text-Based Interview
              </Button>
            </div>

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

  // Render connection steps
  const renderConnectionSteps = () => {
    return (
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Connection Progress</h3>
          <span className="text-xs text-muted-foreground">{connectionProgress}%</span>
        </div>
        <Progress value={connectionProgress} className="h-2" />

        <div className="space-y-2 mt-3">
          {connectionSteps.map((step) => (
            <div key={step.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {step.status === "pending" && <div className="h-4 w-4 rounded-full border border-gray-300"></div>}
                {step.status === "in-progress" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                {step.status === "complete" && <CheckCircle className="h-4 w-4 text-green-500" />}
                {step.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                <span className={step.status === "error" ? "text-red-500" : ""}>{step.name}</span>
              </div>
              {step.status === "error" && step.message && <span className="text-xs text-red-500">{step.message}</span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render fallback mode message
  const renderFallbackMessage = () => {
    if (!showFallbackMessage) return null

    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Using Text-Based Interview Mode</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            {fallbackReason === "user_choice"
              ? "You've chosen to continue with a text-based interview."
              : "We've switched to text-based interview mode due to connection issues."}
          </p>
          <p className="text-sm text-muted-foreground">
            You can type your responses in the text box below. The AI interviewer will respond with follow-up questions.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowFallbackMessage(false)}>
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
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

  // Text input for fallback mode
  const [userInput, setUserInput] = useState("")

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    handleUserTextInput(userInput)
    setUserInput("")
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
            <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        ) : error && !isFallbackMode ? (
          renderErrorMessage(error)
        ) : apiError && !isFallbackMode ? (
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

                  <div className="mt-3">
                    <Button variant="outline" onClick={() => handleConnectionFailure("Service unavailable")}>
                      Continue with Text-Based Interview
                    </Button>
                  </div>

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
            {/* Fallback mode message */}
            {isFallbackMode && renderFallbackMessage()}

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
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Establishing secure connection. This may take a few moments.
                  </p>

                  {/* Connection steps */}
                  <div className="w-full max-w-md">{renderConnectionSteps()}</div>
                </div>
              )}

              {isActive && (
                <div className="space-y-4">
                  {!isFallbackMode && (
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                <Mic
                                  className={`h-6 w-6 text-green-600 dark:text-green-400 ${isUserSpeaking ? "animate-pulse" : ""}`}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Your microphone is active</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {peerConnectionRef.current && (
                          <ConnectionQualityIndicator
                            peerConnection={peerConnectionRef.current}
                            className="text-xs px-2 py-1 rounded-full bg-background border"
                          />
                        )}
                      </div>

                      {isActive && (
                        <div className="text-center mb-4 flex items-center justify-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`p-2 rounded-full ${isAudioPlaying ? "bg-blue-100 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                                >
                                  {isAudioPlaying ? (
                                    <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                                  ) : (
                                    <Headphones className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isAudioPlaying ? "Interviewer is speaking" : "Waiting for interviewer"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                  )}

                  {/* Audio level indicator */}
                  {!isFallbackMode && (
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-100"
                        style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Filler word counter */}
                  {!isFallbackMode && isActive && (
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        Filler words:{" "}
                        <span className={totalFillerWords > 10 ? "text-amber-500 font-medium" : ""}>
                          {totalFillerWords}
                        </span>
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                              <Info className="h-3 w-3" />
                              <span className="sr-only">Filler word info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Words like "um", "uh", "like", etc.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    {isActive && !isFallbackMode && (
                      <p>Interview in progress. Speak clearly and listen for the interviewer's questions.</p>
                    )}
                    {isActive && isFallbackMode && (
                      <p>Text-based interview in progress. Type your responses in the box below.</p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground italic">
                        <p>
                          {isFallbackMode
                            ? "The interviewer will begin shortly..."
                            : "Your responses will appear here as you speak..."}
                        </p>
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

                  {/* Text input for fallback mode */}
                  {isActive && isFallbackMode && (
                    <form onSubmit={handleSubmitText} className="mt-4">
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

                  {process.env.NODE_ENV === "development" && !isFallbackMode && (
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
            <pre className="whitespace-pre-wrap">{debug}</pre>
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
