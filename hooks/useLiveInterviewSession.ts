"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { GoogleLiveAPIClient } from "@/lib/google-live-api"
import { AudioProcessor, AudioRecorder, AudioPlaybackQueue } from "@/lib/audio-processing"
import { toast } from "sonner"

export interface InterviewMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export interface ResumeData {
  jobTitle: string
  skills: string
  experience: string
  education: string
  achievements: string
  resumeUrl?: string
}

type InterviewStatus =
  | "idle"
  | "requesting_mic"
  | "creating_session"
  | "connecting_live_api"
  | "active"
  | "ended"
  | "error"
  | "saving_results"

interface SessionData {
  sessionId: string
  liveApiEndpoint: string
  wsToken: string
  interviewStructure: {
    warmupQuestions: string[]
    technicalQuestions: string[]
    behavioralQuestions: string[]
    closingQuestions: string[]
  }
}

interface UseLiveInterviewSessionProps {
  jobTitle?: string
  resumeData?: ResumeData | null
  difficulty?: "entry" | "mid" | "senior"
}

export function useLiveInterviewSession(props: UseLiveInterviewSessionProps = {}) {
  const { jobTitle = "Software Engineer", resumeData = null, difficulty = "mid" } = props
  
  // Authentication and routing
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()
  const router = useRouter()

  // Session state
  const [status, setStatus] = useState<InterviewStatus>("idle")
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [transcript, setTranscript] = useState<Array<{ speaker: "user" | "ai", text: string, timestamp: number }>>([])
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [audioMetrics, setAudioMetrics] = useState({
    speakingPace: 0,
    silenceDuration: 0,
    fillerWordCount: 0,
  })

  // Refs
  const liveApiClient = useRef<GoogleLiveAPIClient | null>(null)
  const audioProcessor = useRef<AudioProcessor | null>(null)
  const audioRecorder = useRef<AudioRecorder | null>(null)
  const playbackQueue = useRef<AudioPlaybackQueue | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(0)
  const sessionCreationInProgress = useRef(false)

  // Helper functions
  const addDebugMessage = (message: string) => {
    console.log(`🔧 Debug: ${message}`)
    setDebugMessages(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const addMessage = (role: "user" | "assistant", content: string, confidence?: number) => {
    const newMessage: InterviewMessage = {
      role,
      content,
      timestamp: Date.now(),
      confidence,
    }
    setMessages(prev => [...prev, newMessage])
    
    // Add to transcript
    setTranscript(prev => [...prev, {
      speaker: role === "user" ? "user" : "ai",
      text: content,
      timestamp: Date.now(),
    }])
  }

  // Initialize audio components
  useEffect(() => {
    audioProcessor.current = new AudioProcessor()
    playbackQueue.current = new AudioPlaybackQueue()
    audioRecorder.current = new AudioRecorder()

    return () => {
      // Cleanup
      if (audioRecorder.current?.getIsRecording()) {
        audioRecorder.current.stop()
      }
      playbackQueue.current?.stop()
    }
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && startTimeRef.current) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive])

  // Create session
  const createSession = useCallback(async () => {
    if (sessionCreationInProgress.current) {
      addDebugMessage("Session creation already in progress")
      return
    }

    try {
      sessionCreationInProgress.current = true
      setStatus("creating_session")
      setIsConnecting(true)
      addDebugMessage("Creating interview session")

      // Create session via API
      const token = await getToken()
      const response = await fetch("/api/v1/sessions/genkit-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          jobRole: jobTitle,
          difficulty,
          jobDescription: resumeData?.jobTitle || jobTitle,
          resume: resumeData ? JSON.stringify(resumeData) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create session")
      }

      const { data } = await response.json()
      sessionIdRef.current = data.sessionId
      setSessionData(data)
      addDebugMessage(`Session created: ${data.sessionId}`)

      // Initialize Live API session
      const initResponse = await fetch(`/api/live-session/${data.sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "initialize",
          data: { resume: resumeData },
        }),
      })

      if (!initResponse.ok) {
        throw new Error("Failed to initialize Live API session")
      }

      const initData = await initResponse.json()
      setSessionData(prev => ({ ...prev!, ...initData.data }))
      
      // Connect to Live API
      await connectToLiveAPI(initData.data)
    } catch (error) {
      console.error("Session creation error:", error)
      addDebugMessage(`Error: ${error}`)
      setStatus("error")
      toast.error("Failed to create interview session")
    } finally {
      sessionCreationInProgress.current = false
      setIsConnecting(false)
    }
  }, [getToken, userId, jobTitle, difficulty, resumeData])

  // Connect to Live API
  const connectToLiveAPI = async (sessionData: SessionData) => {
    try {
      setStatus("connecting_live_api")
      addDebugMessage("Connecting to Google Live API")

      // Get API key from environment or session
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || sessionData.wsToken

      // Create Live API client
      liveApiClient.current = new GoogleLiveAPIClient({
        apiKey,
        model: "models/gemini-2.0-flash-exp",
        systemInstruction: `You are an AI interviewer conducting a ${difficulty} level interview for a ${jobTitle} position.
        
Interview Structure:
- Warmup: ${sessionData.interviewStructure.warmupQuestions.join(", ")}
- Technical: ${sessionData.interviewStructure.technicalQuestions.join(", ")}
- Behavioral: ${sessionData.interviewStructure.behavioralQuestions.join(", ")}
- Closing: ${sessionData.interviewStructure.closingQuestions.join(", ")}

Guidelines:
1. Be professional, friendly, and encouraging
2. Ask follow-up questions when answers are unclear
3. Provide gentle guidance if the candidate struggles
4. Keep the conversation natural and flowing
5. End with asking if they have any questions

Start with a warm greeting and introduction.`,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })

      // Set up event listeners
      liveApiClient.current.on("ready", () => {
        addDebugMessage("Live API ready")
        setStatus("active")
        setIsActive(true)
        setIsConnecting(false)
        startTimeRef.current = Date.now()
        
        // Start recording
        startRecording()
      })

      liveApiClient.current.on("transcript", ({ type, text }: { type: string, text: string }) => {
        if (type === "ai") {
          addMessage("assistant", text)
        }
      })

      liveApiClient.current.on("audioData", async (audioData: ArrayBuffer) => {
        // Process and play audio
        if (audioProcessor.current && playbackQueue.current) {
          const audioBuffer = await audioProcessor.current.processAudioFromLiveAPI(audioData)
          playbackQueue.current.enqueue(audioBuffer)
        }
      })

      liveApiClient.current.on("error", (error: any) => {
        console.error("Live API error:", error)
        addDebugMessage(`Live API error: ${error}`)
        toast.error("Connection error occurred")
      })

      liveApiClient.current.on("disconnected", () => {
        addDebugMessage("Live API disconnected")
        if (status === "active") {
          toast.warning("Connection lost. Attempting to reconnect...")
        }
      })

      // Connect to Live API
      await liveApiClient.current.connect()
    } catch (error) {
      console.error("Live API connection error:", error)
      addDebugMessage(`Connection error: ${error}`)
      setStatus("error")
      toast.error("Failed to connect to interview service")
    }
  }

  // Start recording
  const startRecording = async () => {
    try {
      await audioRecorder.current?.start(async (chunk) => {
        // Process and send audio chunks to Live API
        if (audioProcessor.current && liveApiClient.current && !isMuted) {
          const pcmData = await audioProcessor.current.processAudioForLiveAPI(chunk)
          liveApiClient.current.sendAudio(pcmData)
        }
      })
      addDebugMessage("Audio recording started")
    } catch (error) {
      console.error("Recording error:", error)
      toast.error("Microphone access denied")
    }
  }

  // Start interview
  const startInterview = useCallback(async () => {
    try {
      setStatus("requesting_mic")
      addDebugMessage("Requesting microphone access")

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create session
      await createSession()
    } catch (error) {
      console.error("Start interview error:", error)
      setStatus("error")
      toast.error("Failed to start interview")
    }
  }, [createSession])

  // End interview
  const endInterview = useCallback(async () => {
    try {
      setStatus("saving_results")
      addDebugMessage("Ending interview")

      // Stop recording
      audioRecorder.current?.stop()
      
      // Disconnect from Live API
      liveApiClient.current?.disconnect()
      
      // Stop playback
      playbackQueue.current?.stop()

      // Calculate audio metrics
      const wordsSpoken = transcript.filter(t => t.speaker === "user").join(" ").split(" ").length
      const duration = elapsedTime / 1000 / 60 // minutes
      const speakingPace = Math.round(wordsSpoken / duration)

      // Save results
      if (sessionIdRef.current) {
        const token = await getToken()
        await fetch(`/api/live-session/${sessionIdRef.current}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "end_session",
            data: {
              audioMetrics: {
                speakingPace,
                silenceDuration: audioMetrics.silenceDuration,
                fillerWordCount: audioMetrics.fillerWordCount,
              },
            },
          }),
        })
      }

      setStatus("ended")
      setIsActive(false)
      
      // Redirect to feedback page
      if (sessionIdRef.current) {
        router.push(`/feedback?session=${sessionIdRef.current}`)
      }
    } catch (error) {
      console.error("End interview error:", error)
      toast.error("Failed to save interview results")
    }
  }, [transcript, elapsedTime, audioMetrics, getToken, router])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
    if (isMuted) {
      toast.info("Microphone unmuted")
    } else {
      toast.info("Microphone muted")
    }
  }, [isMuted])

  // Send text message (for accessibility)
  const sendTextMessage = useCallback((text: string) => {
    if (liveApiClient.current && isActive) {
      addMessage("user", text)
      liveApiClient.current.sendText(text)
    }
  }, [isActive])

  return {
    // State
    status,
    messages,
    transcript,
    debugMessages,
    isActive,
    isConnecting,
    isMuted,
    elapsedTime,
    sessionData,
    
    // Actions
    startInterview,
    endInterview,
    toggleMute,
    sendTextMessage,
    
    // Auth state
    isAuthenticated: isLoaded && isSignedIn,
  }
}