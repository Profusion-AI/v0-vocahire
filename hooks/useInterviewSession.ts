"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface InterviewSessionOptions {
  onTranscriptUpdate?: (transcript: string) => void
  onMessageReceived?: (message: { role: "user" | "assistant"; content: string }) => void
  maxDuration?: number // in seconds
}

interface InterviewSessionState {
  status: "idle" | "connecting" | "recording" | "ended"
  transcript: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  timeLeft: number
}

export function useInterviewSession(options: InterviewSessionOptions = {}) {
  const {
    onTranscriptUpdate,
    onMessageReceived,
    maxDuration = 600, // 10 minutes by default
  } = options

  const [state, setState] = useState<InterviewSessionState>({
    status: "idle",
    transcript: "",
    messages: [],
    timeLeft: maxDuration,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const { toast } = useToast()

  // Clean up function for the session
  const cleanupSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // In a real implementation, we would close WebRTC connections here
    sessionTokenRef.current = null
  }, [])

  // Start the interview session
  const start = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, status: "connecting" }))

      // Fetch session token from our API
      const response = await fetch("/api/realtime-session")

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const { token } = await response.json()
      sessionTokenRef.current = token

      // In a real implementation, this would initialize WebRTC with OpenAI
      // For now, we'll simulate the connection

      // Simulate connection delay
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          status: "recording",
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: "Hello, I'm your interview coach. Tell me about yourself and your experience.",
            },
          ],
        }))

        // Start the timer
        timerRef.current = setInterval(() => {
          setState((prev) => {
            if (prev.timeLeft <= 1) {
              cleanupSession()
              return {
                ...prev,
                status: "ended",
                timeLeft: 0,
              }
            }
            return {
              ...prev,
              timeLeft: prev.timeLeft - 1,
            }
          })
        }, 1000)

        // Simulate receiving messages from the AI
        simulateAIResponses()
      }, 1500)
    } catch (error) {
      console.error("Error starting interview:", error)
      toast({
        title: "Error",
        description: "Could not start interview. Please try again.",
        variant: "destructive",
      })
      setState((prev) => ({ ...prev, status: "idle" }))
    }
  }, [cleanupSession, toast])

  // End the interview session
  const end = useCallback(() => {
    cleanupSession()
    setState((prev) => ({ ...prev, status: "ended" }))
  }, [cleanupSession])

  // Simulate AI responses for demo purposes
  const simulateAIResponses = useCallback(() => {
    // This is just for demonstration - in a real app, these would come from OpenAI
    const demoResponses = [
      {
        delay: 15000,
        message: "That's interesting. Can you tell me about a challenging project you worked on recently?",
      },
      {
        delay: 30000,
        message: "How do you handle tight deadlines and pressure in your work?",
      },
      {
        delay: 45000,
        message: "What are your strengths and weaknesses as a professional?",
      },
      {
        delay: 60000,
        message: "Where do you see yourself in five years?",
      },
    ]

    demoResponses.forEach(({ delay, message }) => {
      setTimeout(() => {
        if (sessionTokenRef.current) {
          // Only add message if session is still active
          const newMessage = { role: "assistant" as const, content: message }
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, newMessage],
          }))

          if (onMessageReceived) {
            onMessageReceived(newMessage)
          }

          // Update transcript
          setState((prev) => {
            const updatedTranscript = prev.transcript + "\nInterviewer: " + message
            if (onTranscriptUpdate) {
              onTranscriptUpdate(updatedTranscript)
            }
            return { ...prev, transcript: updatedTranscript }
          })
        }
      }, delay)
    })
  }, [onMessageReceived, onTranscriptUpdate])

  // Simulate user speaking
  const simulateUserSpeaking = useCallback(
    (message: string) => {
      if (state.status !== "recording") return

      const newMessage = { role: "user" as const, content: message }
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }))

      if (onMessageReceived) {
        onMessageReceived(newMessage)
      }

      // Update transcript
      setState((prev) => {
        const updatedTranscript = prev.transcript + "\nYou: " + message
        if (onTranscriptUpdate) {
          onTranscriptUpdate(updatedTranscript)
        }
        return { ...prev, transcript: updatedTranscript }
      })
    },
    [state.status, onMessageReceived, onTranscriptUpdate],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupSession()
    }
  }, [cleanupSession])

  return {
    status: state.status,
    messages: state.messages,
    transcript: state.transcript,
    timeLeft: state.timeLeft,
    start,
    end,
    simulateUserSpeaking, // For demo purposes
    audioRef,
  }
}
