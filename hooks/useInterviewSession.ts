"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

type SessionStatus = "idle" | "connecting" | "active" | "ended"

interface UseInterviewSessionReturn {
  status: SessionStatus
  messages: Message[]
  isConnecting: boolean
  isActive: boolean
  error: string | null
  debug: string | null
  start: (jobTitle?: string) => Promise<void>
  stop: () => void
  peerConnection: RTCPeerConnection | null
  isMockMode: boolean
}

// Declare the webkitSpeechRecognition variable
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
    _vocahirePeerConnection: any
    _vocahireRecognition: any
  }
}

// Default ICE servers to use as fallback
const DEFAULT_ICE_SERVERS = [
  {
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
  },
]

// Enhanced mock interview questions for a more realistic experience
const MOCK_INTERVIEW_QUESTIONS = {
  "Software Engineer": [
    "Could you tell me about your background and experience in software engineering?",
    "What programming languages are you most comfortable with, and why do you prefer them?",
    "Can you describe a challenging technical problem you solved recently? What was your approach?",
    "How do you stay updated with the latest technologies and programming practices?",
    "Tell me about a time when you had to optimize code for better performance. What techniques did you use?",
    "How do you approach testing and debugging in your development process?",
    "Can you explain how you've used version control in your previous projects?",
    "How do you handle disagreements with team members about technical decisions?",
    "What's your experience with agile development methodologies?",
    "Do you have any questions for me about our engineering team or processes?",
  ],
  "Product Manager": [
    "Could you tell me about your background and experience in product management?",
    "How do you prioritize features in your product roadmap?",
    "Tell me about a successful product you launched. What made it successful?",
    "How do you gather and incorporate user feedback into your product decisions?",
    "Describe a situation where you had to make a difficult trade-off between competing product priorities.",
    "How do you work with engineering teams to ensure timely delivery of features?",
    "What metrics do you typically use to measure product success?",
    "How do you handle stakeholder disagreements about product direction?",
    "Tell me about a product failure you experienced and what you learned from it.",
    "Do you have any questions for me about our product team or processes?",
  ],
  "Data Scientist": [
    "Could you tell me about your background and experience in data science?",
    "What statistical methods and machine learning algorithms are you most familiar with?",
    "Can you describe a data science project you worked on recently? What was your approach?",
    "How do you ensure the quality and integrity of the data you work with?",
    "Tell me about a time when you had to explain complex data findings to non-technical stakeholders.",
    "What tools and programming languages do you use for data analysis and why?",
    "How do you approach feature engineering in your machine learning projects?",
    "Describe your experience with deploying machine learning models to production.",
    "How do you validate the performance of your models?",
    "Do you have any questions for me about our data science team or processes?",
  ],
  "UX Designer": [
    "Could you tell me about your background and experience in UX design?",
    "Walk me through your design process from research to implementation.",
    "How do you incorporate user research into your design decisions?",
    "Can you describe a challenging UX problem you solved recently?",
    "How do you handle feedback and criticism of your designs?",
    "Tell me about how you collaborate with developers to implement your designs.",
    "What design tools do you use and why do you prefer them?",
    "How do you approach designing for accessibility?",
    "Describe a situation where you had to make design compromises due to technical constraints.",
    "Do you have any questions for me about our design team or processes?",
  ],
  "Marketing Manager": [
    "Could you tell me about your background and experience in marketing?",
    "What marketing campaigns have you led that you're particularly proud of?",
    "How do you measure the success of your marketing initiatives?",
    "Tell me about your experience with digital marketing channels.",
    "How do you approach market research and competitive analysis?",
    "Describe your experience with budget management for marketing campaigns.",
    "How do you collaborate with sales teams to ensure alignment?",
    "Tell me about a marketing challenge you faced and how you overcame it.",
    "What marketing trends are you currently excited about?",
    "Do you have any questions for me about our marketing team or strategies?",
  ],
}

// Default to Software Engineer questions if job title doesn't match
const getQuestionsForJobTitle = (jobTitle: string) => {
  const normalizedTitle = Object.keys(MOCK_INTERVIEW_QUESTIONS).find(
    (title) => title.toLowerCase() === jobTitle.toLowerCase(),
  )
  return normalizedTitle
    ? MOCK_INTERVIEW_QUESTIONS[normalizedTitle as keyof typeof MOCK_INTERVIEW_QUESTIONS]
    : MOCK_INTERVIEW_QUESTIONS["Software Engineer"]
}

// Follow-up questions to make the conversation more dynamic
const FOLLOW_UP_QUESTIONS = [
  "That's interesting. Could you elaborate more on that?",
  "Thank you for sharing that. How did that experience shape your approach to future challenges?",
  "I see. What specific skills did you develop from that experience?",
  "That's helpful context. How would you apply that knowledge in this role?",
  "Interesting perspective. Can you give me a specific example of when you've applied that approach?",
]

export function useInterviewSession(): UseInterviewSessionReturn {
  const [status, setStatus] = useState<SessionStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)

  // WebRTC related refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mockQuestionIndexRef = useRef<number>(0)
  const sessionIdRef = useRef<string | null>(null)
  const currentJobTitleRef = useRef<string>("Software Engineer")
  const lastUserSpeechTimeRef = useRef<number>(0)
  const isWaitingForResponseRef = useRef<boolean>(false)

  // Cleanup function to be called when stopping the session
  const cleanup = useCallback(() => {
    // Clear mock interview interval if active
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current)
      mockIntervalRef.current = null
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
    }

    // Stop all tracks in the local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    // Remove global reference (used for debugging)
    if (typeof window !== "undefined") {
      // @ts-ignore
      window._vocahirePeerConnection = null
    }

    // If we have a real session, terminate it
    if (sessionIdRef.current && !isMockMode) {
      // In a real implementation, we would call the OpenAI API to terminate the session
      console.log("Terminating OpenAI Realtime session:", sessionIdRef.current)
      sessionIdRef.current = null
    }
  }, [isMockMode])

  // Stop the interview session
  const stop = useCallback(() => {
    // Stop speech recognition if active
    if (typeof window !== "undefined" && window._vocahireRecognition) {
      try {
        // @ts-ignore
        window._vocahireRecognition.stop()
      } catch (e) {
        console.error("Error stopping speech recognition:", e)
      }
      // @ts-ignore
      window._vocahireRecognition = null
    }

    // Remove audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.srcObject = null
      if (audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current)
      }
      audioElementRef.current = null
    }

    // Clean up WebRTC resources
    cleanup()

    // Update state
    setStatus("ended")
  }, [cleanup])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Function to get a random follow-up question
  const getRandomFollowUp = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)
    return FOLLOW_UP_QUESTIONS[randomIndex]
  }, [])

  // Function to handle user speech in mock mode
  const handleUserSpeechInMockMode = useCallback(() => {
    // If we're waiting for a response and it's been more than 5 seconds since the user spoke
    const now = Date.now()
    if (isWaitingForResponseRef.current && now - lastUserSpeechTimeRef.current > 5000) {
      isWaitingForResponseRef.current = false

      // 50% chance of asking a follow-up question, 50% chance of moving to the next question
      if (
        Math.random() > 0.5 &&
        mockQuestionIndexRef.current < getQuestionsForJobTitle(currentJobTitleRef.current).length
      ) {
        // Ask a follow-up question
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: getRandomFollowUp(),
            timestamp: now,
          },
        ])
      } else if (mockQuestionIndexRef.current < getQuestionsForJobTitle(currentJobTitleRef.current).length) {
        // Move to the next question
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: getQuestionsForJobTitle(currentJobTitleRef.current)[mockQuestionIndexRef.current],
            timestamp: now,
          },
        ])
        mockQuestionIndexRef.current++
      }
    }
  }, [getRandomFollowUp])

  // Start the interview session
  const start = useCallback(
    async (jobTitle = "Software Engineer") => {
      try {
        setError(null)
        setDebug(null)
        setStatus("connecting")
        setIsMockMode(false)
        currentJobTitleRef.current = jobTitle

        // 1. Get user media (microphone) first to ensure we have permission
        try {
          setDebug((prev) => `${prev || ""}\nRequesting microphone access...`)
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          localStreamRef.current = stream
          setDebug((prev) => `${prev || ""}\nMicrophone access granted`)
        } catch (mediaError) {
          console.error("Error getting user media:", mediaError)
          setDebug(
            (prev) =>
              `${prev || ""}\nMedia error: ${mediaError instanceof Error ? mediaError.message : String(mediaError)}`,
          )
          throw new Error("Could not access microphone. Please check your browser permissions.")
        }

        // 2. Send request to our server-side proxy to create a session
        try {
          setDebug((prev) => `${prev || ""}\nSending request to server proxy...`)

          // Use our server-side proxy
          const signalResponse = await fetch("/api/openai-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobTitle: jobTitle,
            }),
          })

          if (!signalResponse.ok) {
            const errorText = await signalResponse.text()
            setDebug((prev) => `${prev || ""}\nProxy API error: ${signalResponse.status} ${errorText}`)
            throw new Error(`API error: ${signalResponse.status} ${signalResponse.statusText}`)
          }

          const responseData = await signalResponse.json()
          setDebug((prev) => `${prev || ""}\nReceived response from proxy: ${JSON.stringify(responseData)}`)

          // Check if we're in mock mode
          if (responseData.mock) {
            setDebug((prev) => `${prev || ""}\nSwitching to mock interview mode: ${responseData.message}`)
            if (responseData.details) {
              setDebug((prev) => `${prev || ""}\nError details: ${responseData.details}`)
            }
            setIsMockMode(true)

            // Set up mock interview mode
            setStatus("active")

            // Add initial message
            setMessages([
              {
                role: "assistant",
                content: `Hello! I'm your AI interviewer for the ${jobTitle} position. I'll be asking you some questions to learn more about your experience and skills. Could you start by telling me a bit about your background and relevant experience?`,
                timestamp: Date.now(),
              },
            ])

            // Reset question index
            mockQuestionIndexRef.current = 0

            // Set up a more dynamic mock interview experience
            // Instead of a fixed interval, we'll respond based on user speech
            mockIntervalRef.current = setInterval(() => {
              handleUserSpeechInMockMode()
            }, 2000) // Check every 2 seconds
          } else if (responseData.session) {
            // We have a real session from the OpenAI Realtime API
            setDebug(
              (prev) => `${prev || ""}\nReceived OpenAI Realtime session: ${JSON.stringify(responseData.session)}`,
            )
            sessionIdRef.current = responseData.session.id

            // In a real implementation, we would use the session to establish a WebRTC connection
            // For now, we'll simulate a successful connection
            setStatus("active")

            // Add initial message
            setMessages([
              {
                role: "assistant",
                content: `Hello! I'm your AI interviewer for the ${jobTitle} position. I'll be asking you some questions to learn more about your experience and skills. Could you start by telling me a bit about your background and relevant experience?`,
                timestamp: Date.now(),
              },
            ])

            // Set up a simulated response every 30 seconds
            // In a real implementation, this would come from the WebRTC connection
            mockIntervalRef.current = setInterval(() => {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: "That's interesting. Can you tell me more about your experience with [relevant technology]?",
                  timestamp: Date.now(),
                },
              ])
            }, 30000)
          } else {
            throw new Error("Unexpected response from server")
          }
        } catch (apiError) {
          console.error("Error communicating with OpenAI API:", apiError)
          setDebug(
            (prev) => `${prev || ""}\nAPI error: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
          )
          throw apiError
        }

        // Set up speech recognition for user responses
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (SpeechRecognition) {
          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = "en-US"

          recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript
            const isFinal = event.results[event.results.length - 1].isFinal

            if (isFinal && transcript.trim()) {
              // Add user message
              setMessages((prev) => [
                ...prev,
                {
                  role: "user",
                  content: transcript,
                  timestamp: Date.now(),
                },
              ])

              // Update the last speech time
              lastUserSpeechTimeRef.current = Date.now()
              isWaitingForResponseRef.current = true

              // In a real implementation with WebRTC, we would send this to the OpenAI API
              // For now, we just log it
              console.log("User said:", transcript)
            }
          }

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error)
          }

          recognition.start()

          // Store recognition instance for cleanup
          // @ts-ignore
          window._vocahireRecognition = recognition
        } else {
          console.warn("Speech recognition not supported in this browser")
          setDebug((prev) => `${prev || ""}\nSpeech recognition not supported in this browser`)
        }
      } catch (err) {
        console.error("Error starting interview session:", err)
        cleanup()
        setStatus("idle")
        setError(err instanceof Error ? err.message : "Unknown error starting interview")
      }
    },
    [cleanup, handleUserSpeechInMockMode],
  )

  return {
    status,
    messages,
    isConnecting: status === "connecting",
    isActive: status === "active",
    error,
    debug,
    start,
    stop,
    peerConnection: peerConnectionRef.current,
    isMockMode,
  }
}
