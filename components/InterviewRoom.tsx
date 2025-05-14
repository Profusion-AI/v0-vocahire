"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, AlertCircle, Loader2, Headphones } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { countFillerWords, getTotalFillerWordCount } from "@/lib/filler-words"
import type { ResumeData } from "@/components/resume-input"
import { useInterviewSession } from "@/hooks/useRealtimeInterviewSession"
// Import the TranscriptDownload component at the top of the file
import { TranscriptDownload } from "@/components/transcript-download"

// For debugging render cycles
let renderCount = 0

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
  resumeData?: ResumeData | null
}

export default function InterviewRoom({ onComplete, jobTitle = "Software Engineer", resumeData }: InterviewRoomProps) {
  // Debug render count
  renderCount++
  console.log(`InterviewRoom render #${renderCount}`)

  const router = useRouter()

  // State for session status - use refs for values that shouldn't trigger re-renders
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "ended" | "error">("idle")
  const statusRef = useRef<string>(status)
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp: number; confidence?: number }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const debugLogRef = useRef<string>("")
  const [debug, setDebug] = useState<string | null>(null)

  // State for interview
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // State for audio indicators
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)

    // State for confirmation dialog
    const [showStopConfirmation, setShowStopConfirmation] = useState(false)
    const [isConfirmButtonEnabled, setIsConfirmButtonEnabled] = useState(false)
  
    // State for connection status
    const [connectionProgress, setConnectionProgress] = useState(0)
  const [connectionSteps, setConnectionSteps] = useState<
    Array<{ id: string; name: string; status: string; message?: string }>
  >([
    { id: "microphone", name: "Microphone Access", status: "pending" },
    { id: "api", name: "API Connection", status: "pending" },
    { id: "session", name: "Session Creation", status: "pending" },
    { id: "webrtc", name: "WebRTC Setup", status: "pending" },
    { id: "audio", name: "Audio Connection", status: "pending" },
  ])

  // State for fallback mode - CRITICAL CHANGE: Disable fallback mode by default
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [fallbackReason, setFallbackReason] = useState<string | null>(null)
  const [showFallbackMessage, setShowFallbackMessage] = useState(false)

  // CRITICAL CHANGE: Add retry mechanism
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // State for filler word tracking
  const [fillerWordCounts, setFillerWordCounts] = useState<{ [key: string]: number }>({})
  const [totalFillerWords, setTotalFillerWords] = useState(0)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const sessionInfoRef = useRef<{ id: string; token: string } | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const confirmationTimerRef = useRef<NodeJS.Timeout | null>(null) // Ref for confirmation timer
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttemptsRef = useRef<number>(5) // CRITICAL CHANGE: Increase max reconnect attempts

  // Text input for fallback mode
  const [userInput, setUserInput] = useState("")

  // Update the status ref when status changes
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Helper function to add debug messages - MOVED TO THE TOP
  const addDebugMessage = useCallback((message: string) => {
    console.log("Debug:", message)
    // Use a ref to store the debug log to avoid state updates in every render
    debugLogRef.current = `${new Date().toISOString()} - ${message}\n${debugLogRef.current}`.substring(0, 5000)
    // Don't update state on every call - this was causing infinite loops
  }, [])

  // Periodically update the debug state from the ref instead of on every debug message
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (debugLogRef.current !== debug) {
        setDebug(debugLogRef.current)
      }
    }, 1000) // Update once per second at most

    return () => clearInterval(intervalId)
  }, [debug])

  // Helper function to update connection steps
  const updateConnectionStep = useCallback(
    (id: string, status: "pending" | "in-progress" | "complete" | "error" | "retrying", message?: string) => {
      setConnectionSteps((prev) => {
        // Create a new array with the updated step
        const updatedSteps = prev.map((step) => (step.id === id ? { ...step, status, message } : step))

        // Calculate progress based on the updated steps
        const completedSteps = updatedSteps.filter((step) => step.status === "complete").length
        const totalSteps = updatedSteps.length
        const newProgress = Math.round((completedSteps / totalSteps) * 100)

        // Update progress in a separate call to avoid nested state updates
        setTimeout(() => setConnectionProgress(newProgress), 0)

        return updatedSteps
      })
    },
    [],
  )

  // Function to add a message to the conversation
  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
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
  }, [])

  // Function to play audio
  const playAudio = useCallback(
    (audioData: ArrayBuffer) => {
      try {
        // Create a blob from the audio data
        const blob = new Blob([audioData], { type: "audio/wav" })
        const url = URL.createObjectURL(blob)

        // Create an audio element if it doesn't exist
        if (!audioRef.current) {
          const audio = new Audio()
          audio.onended = () => {
            setIsAudioPlaying(false)
            URL.revokeObjectURL(audio.src) // Clean up the blob URL
          }
          audioRef.current = audio
        }

        // Set the source and play
        audioRef.current.src = url
        audioRef.current.play().catch((err) => {
          addDebugMessage(`Error playing audio: ${err}`)
          setIsAudioPlaying(false)
        })
      } catch (err) {
        addDebugMessage(`Error processing audio data: ${err instanceof Error ? err.message : String(err)}`)
        setIsAudioPlaying(false)
      }
    },
    [addDebugMessage],
  )

  // Function to set up audio analysis for visualizing audio levels
  const setupAudioAnalysis = useCallback(
    (stream: MediaStream) => {
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
        addDebugMessage(`Error setting up audio analysis: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [addDebugMessage],
  )

  // Function to clean up resources
  const cleanup = useCallback(() => {
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

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Clear confirmation timer
    if (confirmationTimerRef.current) {
      clearTimeout(confirmationTimerRef.current)
      confirmationTimerRef.current = null
    }

    // Clear audio level interval
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }

    // Close peer connection and data channel
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close()
        dataChannelRef.current = null
      } catch (err) {
        addDebugMessage(`Error closing data channel: ${err}`)
      }
    }

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
        audioRef.current.src = ""
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
  }, [addDebugMessage])

  // Function to start fallback interview (text-based)
  const startFallbackInterview = useCallback(() => {
    addDebugMessage("Starting fallback interview (text-based)")

    // Add initial interviewer message
    setTimeout(() => {
      addMessage(
        "assistant",
        `Hello! I'll be conducting your interview for the ${jobTitle} position. Could you start by telling me about your background and experience?`,
      )
    }, 1000)
  }, [addDebugMessage, jobTitle, addMessage])

  // Function to handle user text input in fallback mode
  const handleUserTextInput = useCallback(
    (text: string) => {
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
    },
    [addMessage, jobTitle],
  )

  // Function to handle connection failure and switch to fallback mode
  const handleConnectionFailure = useCallback(
    (reason: string) => {
      // CRITICAL CHANGE: Try to retry the connection first
      if (retryCount < maxRetries) {
        addDebugMessage(
          `Connection failure: ${reason}. Will retry in 3 seconds... (Attempt ${retryCount + 1}/${maxRetries})`,
        )

        // Update UI to show retrying
        setConnectionSteps((prev) =>
          prev.map((step) =>
            step.status === "error" ? { ...step, status: "retrying", message: "Will retry..." } : step,
          ),
        )

        // Schedule retry
        retryTimeoutRef.current = setTimeout(() => {
          // Increment retry count
          setRetryCount((prev) => prev + 1)

          // Reset connection steps for retry
          setConnectionSteps([
            { id: "microphone", name: "Microphone Access", status: "complete" }, // Assume mic is already granted
            { id: "api", name: "API Connection", status: "pending" },
            { id: "session", name: "Session Creation", status: "pending" },
            { id: "webrtc", name: "WebRTC Setup", status: "pending" },
            { id: "audio", name: "Audio Connection", status: "pending" },
          ])

          // Start the connection process again with retry flag
          startInterviewWithRetry(true)
        }, 3000)

        return
      }

      // If we've exhausted retries, then fall back to text mode
      addDebugMessage(`Connection failure after ${retryCount} retries: ${reason}. Switching to fallback mode.`)
      setFallbackReason(reason)
      setIsFallbackMode(true)
      setShowFallbackMessage(true)

      // Clean up WebRTC resources
      if (dataChannelRef.current) {
        try {
          dataChannelRef.current.close()
        } catch (err) {
          addDebugMessage(`Error closing data channel: ${err}`)
        }
        dataChannelRef.current = null
      }

      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close()
        } catch (err) {
          addDebugMessage(`Error closing peer connection: ${err}`)
        }
        peerConnectionRef.current = null
      }

      // Keep the interview active but in fallback mode
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
    },
    [
      addDebugMessage,
      startFallbackInterview,
      setIsActive,
      setStatus,
      setIsConnecting,
      setMessages,
      retryCount,
      maxRetries,
    ],
  )

  // Function to set up WebRTC connection
  const setupWebRTC = useCallback(
    async (sessionId: string, token: string) => {
      try {
        addDebugMessage("Setting up WebRTC connection...")
        updateConnectionStep("webrtc", "in-progress")

        // Create RTCPeerConnection
        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        }

        // Try to get TURN servers
        try {
          const turnResponse = await fetch("/api/ice-servers")
          if (turnResponse.ok) {
            const turnData = await turnResponse.json()
            if (turnData.iceServers && turnData.iceServers.length > 0) {
              configuration.iceServers = turnData.iceServers
            }
          }
        } catch (err) {
          addDebugMessage(`Failed to get TURN servers: ${err}. Using default STUN servers.`)
        }

        const pc = new RTCPeerConnection(configuration)
        peerConnectionRef.current = pc

        // Add local audio track
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current!)
          })
        }

        // Create data channel
        const dataChannel = pc.createDataChannel("oai-events", { ordered: true })
        dataChannelRef.current = dataChannel

        // Set up data channel handlers
        dataChannel.onopen = () => {
          addDebugMessage("Data channel opened")

          // Send initial message
          dataChannel.send(
            JSON.stringify({
              type: "response.create",
            }),
          )

          updateConnectionStep("webrtc", "complete")
          updateConnectionStep("audio", "complete")

          // Set status to active
          setIsActive(true)
          setStatus("active")
          setIsConnecting(false)

          // Clear connection timeout
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
          }
        }

        dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === "response.audio.delta" && data.delta) {
              // Handle audio data
              setIsAudioPlaying(true)
              const audioData = base64ToArrayBuffer(data.delta)
              playAudio(audioData)
            } else if (data.type === "response.text.delta") {
              // Handle text message
              addDebugMessage(`Received message: ${data.delta?.substring(0, 50)}...`)
              addMessage("assistant", data.delta)
            } else if (data.type === "conversation.item.input_audio_transcription.delta") {
              // Handle transcript of user's speech
              addDebugMessage(`Received transcript: ${data.delta?.substring(0, 50)}...`)
              addMessage("user", data.delta)
            } else if (data.type === "error") {
              addDebugMessage(`Error from server: ${JSON.stringify(data.error)}`)
            } else {
              addDebugMessage(`Received unknown message type: ${data.type}`)
            }
          } catch (err) {
            addDebugMessage(`Error parsing data channel message: ${err instanceof Error ? err.message : String(err)}`)
          }
        }

        dataChannel.onerror = (event) => {
          addDebugMessage(`Data channel error: ${JSON.stringify(event)}`)
          updateConnectionStep("webrtc", "error", "Connection error")
          handleConnectionFailure("Data channel connection error")
        }

        dataChannel.onclose = () => {
          addDebugMessage("Data channel closed")
          if (isActive) {
            handleConnectionFailure("Data channel closed")
          }
        }

        // Handle incoming audio
        pc.ontrack = (event) => {
          addDebugMessage("Received remote track")
          if (event.streams && event.streams[0]) {
            const audioElement = new Audio()
            audioElement.srcObject = event.streams[0]
            audioElement.play()
          }
        }

        // Create offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        })

        await pc.setLocalDescription(offer)

        // Wait for ICE gathering to complete
        const completeOffer = await new Promise<RTCSessionDescriptionInit>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve(pc.localDescription!)
          } else {
            const checkState = () => {
              if (pc.iceGatheringState === "complete") {
                resolve(pc.localDescription!)
              } else {
                setTimeout(checkState, 100)
              }
            }
            setTimeout(checkState, 100)
          }
        })

        // Send offer to OpenAI - CRITICAL CHANGE: Use model parameter instead of session_id
        // This follows OpenAI's documentation example
        const model = "gpt-4o-mini-realtime-preview" // Use the model from your session creation
        const sdpUrl = `https://api.openai.com/v1/realtime?model=${model}`

        addDebugMessage(`Sending SDP offer to: ${sdpUrl}`)

        const response = await fetch(sdpUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
            Authorization: `Bearer ${token}`,
          },
          body: completeOffer.sdp,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`SDP exchange failed: ${response.status} - ${errorText}`)
        }

        // Get answer SDP
        const answerSdp = await response.text()

        // Set remote description
        await pc.setRemoteDescription({
          type: "answer",
          sdp: answerSdp,
        })

        addDebugMessage("WebRTC connection established")
        return true
      } catch (error) {
        addDebugMessage(`Error setting up WebRTC: ${error}`)
        updateConnectionStep("webrtc", "error", `Setup error: ${error}`)
        throw error
      }
    },
    [addDebugMessage, updateConnectionStep, handleConnectionFailure, isActive, addMessage, playAudio],
  )

  // Function to start the interview with WebRTC
  const startInterviewWithRetry = useCallback(
    async (isRetry = false) => {
      try {
        setError(null)
        setIsConnecting(true)
        setStatus("connecting")
        setIsFallbackMode(false)
        setFallbackReason(null)
        setShowFallbackMessage(false)

        if (!isRetry) {
          setConnectionProgress(0)
          setRetryCount(0)
        }

        addDebugMessage(`Starting interview for job title: ${jobTitle}${isRetry ? " (retry attempt)" : ""}`)

        // Request microphone access (skip if retrying)
        if (!isRetry || !localStreamRef.current) {
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
        } else {
          addDebugMessage("Microphone already granted, skipping request")
          updateConnectionStep("microphone", "complete")
        }

        // First, try to test the OpenAI API to see if we have a valid API key
        try {
          addDebugMessage("Testing OpenAI API connection...")
          updateConnectionStep("api", "in-progress")

          // CRITICAL CHANGE: Add timeout to API test
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          const testResponse = await fetch("/api/test-openai", {
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId))

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

          // Prepare resume text if available
          let resumeText = ""
          if (resumeData) {
            if (resumeData.skills) resumeText += `Skills: ${resumeData.skills}\n`
            if (resumeData.experience) resumeText += `Experience: ${resumeData.experience}\n`
            if (resumeData.education) resumeText += `Education: ${resumeData.education}\n`
            if (resumeData.achievements) resumeText += `Achievements: ${resumeData.achievements}\n`
          }

          // CRITICAL CHANGE: Add timeout to token request
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

          const tokenResponse = await fetch("/api/realtime-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobTitle,
              resumeText: resumeText?.trim() || "",
            }),
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId))

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            addDebugMessage(`Token API error: ${tokenResponse.status} - ${errorText.substring(0, 200)}`)
            updateConnectionStep("session", "error", `API error: ${tokenResponse.status}`)
            throw new Error(`Failed to initialize interview session. Status: ${tokenResponse.status}`)
          }

          const sessionData = await tokenResponse.json()
          const { token, id: sessionId, usedFallbackModel } = sessionData

          addDebugMessage(`Token received: ${sessionId}${usedFallbackModel ? " (using fallback model)" : ""}`)
          updateConnectionStep("session", "complete")

          // Store session info for later use
          sessionInfoRef.current = { id: sessionId, token }

          // Set a timeout for connection
          connectTimeoutRef.current = setTimeout(() => {
            // Use the ref to check the current status to avoid stale closures
            if (statusRef.current === "connecting") {
              addDebugMessage("Connection timed out.")
              setError("Connection timed out. Retrying...")
              updateConnectionStep("webrtc", "error", "Connection timeout")

              // CRITICAL CHANGE: Retry instead of falling back
              handleConnectionFailure("Connection timeout")
            }
          }, 30000) // CRITICAL CHANGE: Increase timeout to 30 seconds

          // Set up WebRTC connection
          try {
            await setupWebRTC(sessionId, token)
          } catch (err) {
            addDebugMessage(`WebRTC setup error: ${err}`)
            updateConnectionStep("webrtc", "error", `Setup error: ${err}`)
            handleConnectionFailure(`WebRTC setup failed: ${err}`)
          }
        } catch (err) {
          console.error("Failed to start interview:", err)
          addDebugMessage(`Session creation error: ${err}`)

          // CRITICAL CHANGE: Check if this is an abort error (timeout)
          if (err instanceof DOMException && err.name === "AbortError") {
            updateConnectionStep("session", "error", "Request timeout")
            handleConnectionFailure("Session creation timed out")
          } else {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
            updateConnectionStep("session", "error", err instanceof Error ? err.message : "Unknown error")
            handleConnectionFailure(`Session creation failed: ${err}`)
          }
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

        // For other errors, try to retry
        addDebugMessage(`Error during setup: ${err}`)
        handleConnectionFailure(`Initial setup error: ${err}`)
      }
    },
    [
      jobTitle,
      resumeData,
      updateConnectionStep,
      setupAudioAnalysis,
      handleConnectionFailure,
      addDebugMessage,
      setupWebRTC,
      cleanup,
    ],
  )

  // Function to manually retry the connection
  const retryConnection = useCallback(() => {
    if (retryCount >= maxRetries) {
      addDebugMessage(`Maximum retry attempts (${maxRetries}) reached. Giving up.`)
      handleConnectionFailure("Maximum retry attempts reached")
      return
    }

    addDebugMessage(`Manually retrying connection (attempt ${retryCount + 1}/${maxRetries})...`)
    setRetryCount((prev) => prev + 1)

    // Clear any existing timeouts
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    // Reset connection steps
    setConnectionSteps([
      { id: "microphone", name: "Microphone Access", status: "complete" }, // Assume mic is already granted
      { id: "api", name: "API Connection", status: "pending" },
      { id: "session", name: "Session Creation", status: "pending" },
      { id: "webrtc", name: "WebRTC Setup", status: "pending" },
      { id: "audio", name: "Audio Connection", status: "pending" },
    ])

    // Start the connection process again
    startInterviewWithRetry(true)
  }, [retryCount, maxRetries, addDebugMessage, startInterviewWithRetry, handleConnectionFailure])

  // Function to start the interview
  const handleStartInterview = useCallback(() => {
    // Start the real-time interview with WebRTC
    startInterviewWithRetry()
  }, [startInterviewWithRetry])

  // Function to handle interview completion
  const handleInterviewComplete = useCallback(() => {
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
      onComplete(messages)
    }
  }, [addDebugMessage, cleanup, messages, fillerWordCounts, router, onComplete])

  // Function to toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted
      // Toggle mute state for all audio tracks
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState
      })
      setIsMuted(newMuteState)
      addDebugMessage(`Microphone ${newMuteState ? "muted" : "unmuted"}`)
    }
  }, [isMuted, addDebugMessage])

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
  }, [updateConnectionStep])

  // Timer countdown when interview is active
  useEffect(() => {
    if (status === "active" && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            handleInterviewComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [status, handleInterviewComplete]) // Only depend on status changes

  // Effect to handle the confirmation timer
  useEffect(() => {
    if (showStopConfirmation) {
      setIsConfirmButtonEnabled(false) // Disable button initially
      confirmationTimerRef.current = setTimeout(() => {
        setIsConfirmButtonEnabled(true) // Enable button after 3 seconds
      }, 3000)
    } else {
      // Clear timer if confirmation is hidden
      if (confirmationTimerRef.current) {
        clearTimeout(confirmationTimerRef.current)
        confirmationTimerRef.current = null
      }
      setIsConfirmButtonEnabled(false) // Ensure button is disabled when dialog is hidden
    }

    return () => {
      // Cleanup timer on effect cleanup
      if (confirmationTimerRef.current) {
        clearTimeout(confirmationTimerRef.current)
      }
    }
  }, [showStopConfirmation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Helper functions for audio processing
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    return window.btoa(binary)
  }

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    handleUserTextInput(userInput)
    setUserInput("")
  }

  // Render fallback mode message
  const renderFallbackMessage = () => {
    if (!showFallbackMessage) return null

    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Using Text-Based Interview Mode</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            {fallbackReason === "user_choice"
              ? "You've chosen to continue with a text-based interview."
              : `We've switched to text-based interview mode after ${maxRetries} connection attempts.`}
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

  // Use the hook to manage the real-time interview session
  const { liveTranscript, aiCaptions } = useInterviewSession()

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
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Connection Issue</p>
                <p>{error}</p>
                <div className="mt-3 flex gap-2">
                  {/* CRITICAL CHANGE: Add retry button */}
                  <Button variant="default" onClick={retryConnection} disabled={retryCount >= maxRetries}>
                    Retry Connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleConnectionFailure("User chose text mode")}
                    disabled={isFallbackMode}
                  >
                    Continue with Text-Based Interview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Fallback mode message */}
            {isFallbackMode && renderFallbackMessage()}

            {/* Stop Confirmation Dialog */}
            {showStopConfirmation && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle>Confirm Stop Interview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Are you sure you'd like to stop the interview?</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowStopConfirmation(false)}>
                      No, continue interview
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleInterviewComplete}
                      disabled={!isConfirmButtonEnabled}
                    >
                      Yes, stop interview
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

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
                    {retryCount > 0 && ` (Attempt ${retryCount}/${maxRetries})`}
                  </p>

                  {/* Connection steps */}
                  <div className="w-full max-w-md space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Connection Progress</h3>
                      <span className="text-xs text-muted-foreground">{connectionProgress}%</span>
                    </div>
                    <Progress value={connectionProgress} className="h-2" />

                    <div className="space-y-2 mt-3">
                      {connectionSteps.map((step) => (
                        <div key={step.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {step.status === "pending" && (
                              <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                            )}
                            {step.status === "in-progress" && (
                              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            )}
                            {step.status === "retrying" && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
                            {step.status === "complete" && <div className="h-4 w-4 text-green-500">✓</div>}
                            {step.status === "error" && <div className="h-4 w-4 text-red-500">✗</div>}
                            <span
                              className={
                                step.status === "error"
                                  ? "text-red-500"
                                  : step.status === "retrying"
                                    ? "text-amber-500"
                                    : ""
                              }
                            >
                              {step.name}
                            </span>
                          </div>
                          {step.status === "error" && step.message && (
                            <span className="text-xs text-red-500">{step.message}</span>
                          )}
                          {step.status === "retrying" && step.message && (
                            <span className="text-xs text-amber-500">{step.message}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {status === "active" && (
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
                      </div>

                      {status === "active" && (
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

                      {status === "active" && (
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
                  {!isFallbackMode && status === "active" && (
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
                              <AlertCircle className="h-3 w-3" />
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
                    {status === "active" && !isFallbackMode && (
                      <p>Interview in progress. Speak clearly and listen for the interviewer's questions.</p>
                    )}
                    {status === "active" && isFallbackMode && (
                      <p>Text-based interview in progress. Type your responses in the box below.</p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && !liveTranscript && (
                      <div className="text-center text-muted-foreground italic">
                        <p>
                          {isFallbackMode
                            ? "The interviewer will begin shortly..."
                            : "Your responses will appear here as you speak..."}
                        </p>
                      </div>
                    )}

                    {/* Display finalized messages */}
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.role === "assistant" ? "bg-primary/10 ml-4" : "bg-secondary/10 mr-4"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.role === "assistant" ? "Interviewer" : "You"}</p>
                        <p>
                          {msg.content}
                          {/* If confidence score is low, add a subtle indicator */}
                          {msg.role === "user" && msg.confidence !== undefined && msg.confidence < 0.7 && (
                            <span className="ml-2 text-xs text-amber-500">(Some words may have been misheard)</span>
                          )}
                        </p>
                      </div>
                    ))}

                    {/* Display live transcript (streaming updates) */}
                    {liveTranscript && (
                      <div
                        className={`p-3 rounded-lg ${
                          liveTranscript.role === "assistant" ? "bg-primary/10 ml-4" : "bg-secondary/10 mr-4"
                        } border-l-2 ${liveTranscript.role === "assistant" ? "border-primary" : "border-secondary"} animate-pulse`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {liveTranscript.role === "assistant" ? "Interviewer" : "You"}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {liveTranscript.role === "assistant" ? "typing..." : "speaking..."}
                          </span>
                        </p>
                        <p>{liveTranscript.content}</p>
                      </div>
                    )}
                  </div>

                  {/* AI Captions - display when AI is speaking */}
                  {isAudioPlaying && aiCaptions && (
                    <div className="mt-2 p-2 bg-primary/5 rounded text-sm text-center">
                      <p className="font-medium text-xs mb-1">AI Speech Captions:</p>
                      <p>{aiCaptions}</p>
                    </div>
                  )}

                  {/* Text input for fallback mode */}
                  {status === "active" && isFallbackMode && (
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
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-x-auto max-h-40">
            <p className="font-medium mb-1">Debug Info:</p>
            <pre className="whitespace-pre-wrap">{debug}</pre>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {status === "active" && (
          <Button variant="destructive" onClick={() => setShowStopConfirmation(true)}>
            Stop Interview
          </Button>
        )}
        {status !== "idle" && status !== "active" && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Start New Interview
          </Button>
        )}
        {(status === "active" || status === "ended") && messages.length > 0 && (
          <TranscriptDownload messages={messages} jobTitle={jobTitle} />
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
