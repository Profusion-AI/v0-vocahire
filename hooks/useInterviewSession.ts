"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface InterviewSessionState {
  status: "idle" | "connecting" | "active" | "ended" | "error"
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: number
  }>
  error?: string
  debug?: string
}

interface UseInterviewSessionReturn extends InterviewSessionState {
  start: (jobRole?: string) => Promise<void>
  stop: (reason?: string) => void
  isConnecting: boolean
  isActive: boolean
}

// Mock interview data for fallback mode
const mockInterviewQuestions = [
  "Hello! I'll be conducting your interview today. Could you start by telling me a bit about your background and experience?",
  "That's interesting. Can you tell me about a challenging project you worked on recently?",
  "How do you approach problem-solving in your work?",
  "What are your strengths and weaknesses as a professional?",
  "Where do you see yourself in 5 years?",
  "How do you handle tight deadlines and pressure?",
  "Tell me about a time when you had to learn a new technology quickly.",
  "How do you stay updated with the latest trends in your field?",
  "What questions do you have for me about the position?",
  "Thank you for your time today. We'll be in touch with next steps.",
]

export function useInterviewSession(): UseInterviewSessionReturn {
  const [state, setState] = useState<InterviewSessionState>({
    status: "idle",
    messages: [],
  })

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const sessionId = useRef<string | null>(null)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mock mode refs
  const isMockMode = useRef<boolean>(false)
  const mockQuestionIndex = useRef<number>(0)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastJobRole = useRef<string>("")

  useEffect(() => {
    if (typeof window !== "undefined" && !audioElement.current) {
      const audio = new Audio()
      audio.autoplay = true
      audioElement.current = audio
      return () => {
        audio.srcObject = null
      }
    }
  }, [])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role, content, timestamp: Date.now() }],
    }))
  }, [])

  const addDebugMessage = useCallback((message: string) => {
    console.log("Debug:", message)
    setState((prev) => ({
      ...prev,
      debug: `${new Date().toISOString()} - ${message}\n${prev.debug || ""}`.substring(0, 1000),
    }))
  }, [])

  const setError = useCallback((errorMessage: string) => {
    setState((prev) => ({ ...prev, status: "error", error: errorMessage }))
  }, [])

  const stopSession = useCallback(
    (reason = "user_initiated") => {
      addDebugMessage(`Stopping interview session. Reason: ${reason}`)

      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
      if (mockIntervalRef.current) clearTimeout(mockIntervalRef.current)

      connectTimeoutRef.current = null
      mockIntervalRef.current = null

      if (peerConnection.current) {
        try {
          if (peerConnection.current.signalingState !== "closed") peerConnection.current.close()
          addDebugMessage("Peer connection closed")
        } catch (err) {
          addDebugMessage(`Error closing PC: ${err}`)
        }
        peerConnection.current = null
      }

      if (localStream.current) {
        try {
          localStream.current.getTracks().forEach((track) => track.stop())
          addDebugMessage("Local audio tracks stopped")
        } catch (err) {
          addDebugMessage(`Error stopping audio tracks: ${err}`)
        }
        localStream.current = null
      }

      if (audioElement.current) {
        audioElement.current.srcObject = null
        addDebugMessage("Audio element cleared")
      }

      // Reset mock mode
      isMockMode.current = false
      mockQuestionIndex.current = 0

      setState((prev) => ({
        ...prev,
        status: prev.status === "error" && reason !== "user_initiated" ? "error" : "ended",
        debug: `Interview session ended. Reason: ${reason}`,
      }))
    },
    [addDebugMessage],
  )

  // New function to start a mock interview session
  const startMockSession = useCallback(
    (jobRole: string) => {
      addDebugMessage("Starting mock interview session")
      isMockMode.current = true
      mockQuestionIndex.current = 0
      lastJobRole.current = jobRole

      setState((prev) => ({ ...prev, status: "active", error: undefined, messages: [] }))

      // Add the first question after a short delay
      setTimeout(() => {
        addMessage(
          "assistant",
          `Hello! I'm your AI interviewer for a ${jobRole} position. ${mockInterviewQuestions[0]}`,
        )
        mockQuestionIndex.current = 1
      }, 1500)

      // Set up a timer to simulate user responses and add new questions
      mockIntervalRef.current = setInterval(() => {
        if (mockQuestionIndex.current >= mockInterviewQuestions.length) {
          if (mockIntervalRef.current) clearInterval(mockIntervalRef.current)
          return
        }

        // Simulate a delay between questions
        if (Math.random() > 0.7 && mockQuestionIndex.current < mockInterviewQuestions.length) {
          // Add a simulated user message first (as if the user spoke)
          addMessage("user", "(Your response would be transcribed here)")

          // Then add the interviewer's next question after a short delay
          setTimeout(() => {
            addMessage("assistant", mockInterviewQuestions[mockQuestionIndex.current])
            mockQuestionIndex.current++
          }, 1500)
        }
      }, 20000) // Ask a new question roughly every 20 seconds

      return true
    },
    [addDebugMessage, addMessage],
  )

  const startSession = useCallback(
    async (jobRole = "Software Engineer") => {
      addDebugMessage(`Attempting to start session for ${jobRole}`)
      try {
        setState((prev) => ({ ...prev, status: "connecting", error: undefined, debug: "Starting...", messages: [] }))
        lastJobRole.current = jobRole

        // Reset all relevant states for a new session attempt
        mockQuestionIndex.current = 0
        isMockMode.current = false

        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
        if (mockIntervalRef.current) clearTimeout(mockIntervalRef.current)

        addDebugMessage("Requesting microphone...")
        try {
          localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
          addDebugMessage("Microphone granted.")
        } catch (micError) {
          addDebugMessage(`Microphone error: ${micError}`)
          throw new Error("Could not access microphone. Please check your browser permissions.")
        }

        // First, try to test the OpenAI API to see if we have a valid API key
        try {
          addDebugMessage("Testing OpenAI API connection...")
          const testResponse = await fetch("/api/test-openai")
          const testData = await testResponse.json()

          if (testData.status !== "success" || !testData.openaiResponse?.hasRealtimeModels) {
            addDebugMessage("OpenAI API test failed or no realtime models available. Falling back to mock mode.")
            return startMockSession(jobRole)
          }

          addDebugMessage("OpenAI API test successful. Proceeding with real-time session.")
        } catch (testError) {
          addDebugMessage(`OpenAI API test error: ${testError}. Falling back to mock mode.`)
          return startMockSession(jobRole)
        }

        addDebugMessage("Fetching OpenAI token...")
        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobRole }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          addDebugMessage(`Token API error: ${tokenResponse.status} - ${errorText}`)

          // If we get a 500 error, it's likely due to missing API key or other server issues
          // Fall back to mock mode
          if (tokenResponse.status === 500) {
            addDebugMessage("Token API error 500. Falling back to mock mode.")
            return startMockSession(jobRole)
          }

          throw new Error(`Token API error: ${tokenResponse.status}`)
        }

        const { token, sessionId: sid } = await tokenResponse.json()
        sessionId.current = sid
        addDebugMessage(`Token received: ${sid}`)

        // Set a timeout for connection
        connectTimeoutRef.current = setTimeout(() => {
          addDebugMessage("Connection timed out. Falling back to mock mode.")
          startMockSession(jobRole)
        }, 15000) // 15 second timeout

        // For now, we'll just simulate a connection failure and fall back to mock mode
        // In a real implementation, you would set up the WebRTC connection here
        setTimeout(() => {
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
          }

          // For testing purposes, always fall back to mock mode
          addDebugMessage("Simulating connection failure. Falling back to mock mode.")
          startMockSession(jobRole)
        }, 3000) // 3 second delay for simulation
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addDebugMessage(`Error starting interview: ${errorMessage}`)

        // If we encounter an error with the real-time session, fall back to mock mode
        if (!isMockMode.current) {
          addDebugMessage("Error with real-time session. Falling back to mock mode.")
          stopSession("real_time_error")
          return startMockSession(jobRole)
        }

        setError(errorMessage)
        stopSession("start_session_error")
      }
    },
    [addDebugMessage, setError, stopSession, startMockSession],
  )

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      addDebugMessage("Component unmounting")
      stopSession("unmount")
    }
  }, [stopSession, addDebugMessage])

  return {
    ...state,
    start: startSession,
    stop: stopSession,
    isConnecting: state.status === "connecting",
    isActive: state.status === "active",
  }
}
