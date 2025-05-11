"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface InterviewSessionState {
  status: "idle" | "connecting" | "active" | "ended" | "error"
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>
  isConnecting: boolean
  isActive: boolean
  error: string | null
  debug: string | null
}

export function useInterviewSession() {
  const [state, setState] = useState<InterviewSessionState>({
    status: "idle",
    messages: [],
    isConnecting: false,
    isActive: false,
    error: null,
    debug: null,
  })

  // Refs to store WebRTC-related objects
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const sessionInfoRef = useRef<{ id: string; token: string } | null>(null)

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

  // Add a debug message
  const addDebugMessage = useCallback((message: string) => {
    console.log("Debug:", message)
    setState((prev) => ({
      ...prev,
      debug: `${new Date().toISOString()} - ${message}\n${prev.debug || ""}`.substring(0, 1000),
    }))
  }, [])

  // Add a message to the conversation
  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role, content, timestamp: Date.now() }],
    }))
  }, [])

  // Refs
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttemptsRef = useRef<number>(3)

  // Mock mode refs
  const isMockMode = useRef<boolean>(false)
  const mockQuestionIndex = useRef<number>(0)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastJobRole = useRef<string>("")
  const fallbackReasonRef = useRef<string | null>(null)
  const sessionId = useRef<string | null>(null)

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

      if (peerConnectionRef.current) {
        try {
          if (peerConnectionRef.current.signalingState !== "closed") peerConnectionRef.current.close()
          addDebugMessage("Peer connection closed")
        } catch (err) {
          addDebugMessage(`Error closing PC: ${err}`)
        }
        peerConnectionRef.current = null
      }

      if (localStreamRef.current) {
        try {
          localStreamRef.current.getTracks().forEach((track) => track.stop())
          addDebugMessage("Local audio tracks stopped")
        } catch (err) {
          addDebugMessage(`Error stopping audio tracks: ${err}`)
        }
        localStreamRef.current = null
      }

      if (audioElement.current) {
        audioElement.current.srcObject = null
        addDebugMessage("Audio element cleared")
      }

      // Close audio context if it exists
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
          audioContextRef.current = null
          audioAnalyserRef.current = null
        } catch (err) {
          addDebugMessage(`Error closing audio context: ${err}`)
        }
      }

      // Reset mock mode
      isMockMode.current = false
      mockQuestionIndex.current = 0
      reconnectAttemptsRef.current = 0

      setState((prev) => ({
        ...prev,
        status: prev.status === "error" && reason !== "user_initiated" ? "error" : "ended",
        debug: `Interview session ended. Reason: ${reason}`,
        isConnecting: false,
        isActive: false,
      }))
    },
    [addDebugMessage],
  )

  // Function to handle connection failure and switch to fallback mode
  const handleConnectionFailure = useCallback(
    (reason: string) => {
      addDebugMessage(`Connection failure: ${reason}. Switching to fallback mode.`)
      fallbackReasonRef.current = reason

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
      setState((prev) => ({
        ...prev,
        status: "active",
        error: undefined,
        isConnecting: false,
        isActive: true,
      }))

      // Add a system message about fallback mode
      addMessage(
        "assistant",
        "The voice connection has been interrupted. We'll continue the interview in text mode. Please type your responses below.",
      )

      // Start fallback interview flow
      startFallbackInterview()
    },
    [addDebugMessage, addMessage],
  )

  // Function to start fallback interview (text-based)
  const startFallbackInterview = useCallback(() => {
    addDebugMessage("Starting fallback interview (text-based)")
    isMockMode.current = true

    // Add initial interviewer message
    setTimeout(() => {
      addMessage(
        "assistant",
        `Hello! I'll be conducting your interview for the ${lastJobRole.current || "Software Engineer"} position. Could you start by telling me about your background and experience?`,
      )
      mockQuestionIndex.current = 1
    }, 1000)
  }, [addDebugMessage, addMessage])

  // New function to start a mock interview session
  const startMockSession = useCallback(
    (jobRole: string) => {
      addDebugMessage("Starting mock interview session")
      isMockMode.current = true
      mockQuestionIndex.current = 0
      lastJobRole.current = jobRole

      setState((prev) => ({
        ...prev,
        status: "active",
        error: undefined,
        messages: [],
        isConnecting: false,
        isActive: true,
      }))

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

        // Only add new questions if there's been a user response since the last question
        const lastMessage = state.messages[state.messages.length - 1]
        if (lastMessage && lastMessage.role === "user") {
          // Add the interviewer's next question
          addMessage("assistant", mockInterviewQuestions[mockQuestionIndex.current])
          mockQuestionIndex.current++
        }
      }, 20000) // Ask a new question roughly every 20 seconds

      return true
    },
    [addDebugMessage, addMessage, state.messages],
  )

  // Function to handle user text input in fallback mode
  const sendTextMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return

      // Add user message
      addMessage("user", text)

      // If we're in mock mode, the next question will be added by the interval
      // If not, we need to generate a response
      if (!isMockMode.current) {
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
            response = `Thank you for sharing that. Can you tell me more about how your skills align with this ${lastJobRole.current || "Software Engineer"} position?`
          }

          addMessage("assistant", response)
        }, 1500)
      }
    },
    [addMessage],
  )

  // Start the interview
  const start = useCallback(
    async (jobRole = "Software Engineer") => {
      try {
        setState((prev) => ({
          ...prev,
          status: "connecting",
          isConnecting: true,
          error: null,
        }))

        addDebugMessage(`Starting interview for job role: ${jobRole}`)

        // First, try to get a token from our API
        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobRole }),
        })

        const data = await tokenResponse.json()

        // Check if we should use fallback mode
        if (data.fallbackMode) {
          addDebugMessage(`API indicated fallback mode is needed: ${data.fallbackReason || "unknown reason"}`)

          // Set up fallback mode
          setState((prev) => ({
            ...prev,
            status: "active",
            isConnecting: false,
            isActive: true,
            error: data.message || "Realtime API unavailable. Using text-based interview mode.",
          }))

          // Start fallback interview with a delay
          setTimeout(() => {
            addMessage(
              "assistant",
              `Hello! I'll be conducting your interview for the ${jobRole} position. Could you start by telling me about your background and experience?`,
            )
          }, 1000)

          return
        }

        // If we got a successful response, continue with WebRTC setup
        if (tokenResponse.ok && data.token && data.sessionId) {
          addDebugMessage(`Received token for session: ${data.sessionId}`)
          sessionInfoRef.current = {
            id: data.sessionId,
            token: data.token,
          }

          // Set up WebRTC connection (simplified for this example)
          // In a real implementation, this would be more complex
          setState((prev) => ({
            ...prev,
            status: "active",
            isConnecting: false,
            isActive: true,
          }))

          // Simulate an interview start with a welcome message
          setTimeout(() => {
            addMessage(
              "assistant",
              `Hello! I'll be conducting your interview for the ${jobRole} position. Could you start by telling me about your background and experience?`,
            )
          }, 1000)
        } else {
          // Handle error
          throw new Error(data.message || "Failed to initialize interview session")
        }
      } catch (error) {
        console.error("Failed to start interview:", error)

        // Set error state
        setState((prev) => ({
          ...prev,
          status: "error",
          isConnecting: false,
          error: error instanceof Error ? error.message : String(error),
        }))

        // Start fallback interview mode
        addDebugMessage("Starting fallback interview mode due to error")

        // Set up fallback mode
        setState((prev) => ({
          ...prev,
          status: "active",
          isConnecting: false,
          isActive: true,
          error: "Using text-based interview mode due to connection issues.",
        }))

        // Start fallback interview with a delay
        setTimeout(() => {
          addMessage(
            "assistant",
            `Hello! I'll be conducting your interview for the ${jobRole} position. Could you start by telling me about your background and experience?`,
          )
        }, 1000)
      }
    },
    [addDebugMessage, addMessage],
  )

  // Stop the interview
  const stop = useCallback(() => {
    addDebugMessage("Stopping interview")

    // Clean up WebRTC resources
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    setState((prev) => ({
      ...prev,
      status: "ended",
      isActive: false,
      isConnecting: false,
    }))
  }, [addDebugMessage])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      addDebugMessage("Component unmounting")
      stopSession("unmount")
      if (dataChannelRef.current) {
        dataChannelRef.current.close()
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stopSession, addDebugMessage])

  return {
    status: state.status,
    messages: state.messages,
    isConnecting: state.isConnecting,
    isActive: state.isActive,
    error: state.error,
    debug: state.debug,
    start,
    stop,
    sendTextMessage: state.status === "active" ? sendTextMessage : undefined,
  }
}
