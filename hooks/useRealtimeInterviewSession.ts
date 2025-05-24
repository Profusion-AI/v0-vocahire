"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { interviewSessionManager, SessionState } from "@/lib/interview-session-manager"

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
  | "testing_api"
  | "fetching_token"
  | "creating_offer"
  | "exchanging_sdp"
  | "connecting_webrtc"
  | "data_channel_open"
  | "active"
  | "ended"
  | "error"
  | "saving_results"

interface SessionData {
  id: string
  token: string
  expires_at?: number
}

interface UseRealtimeInterviewSessionProps {
  jobTitle?: string
  resumeData?: ResumeData | null
}

export function useRealtimeInterviewSession(props: UseRealtimeInterviewSessionProps = {}) {
  const { jobTitle = "Software Engineer", resumeData = null } = props
  
  // Authentication and routing
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const router = useRouter()

  // Core state
  const [status, setStatus] = useState<InterviewStatus>("idle")
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false)
  
  // Real-time state
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [aiCaptions, setAiCaptions] = useState("")
  const [liveTranscript, setLiveTranscript] = useState<{ role: "user" | "assistant"; content: string } | null>(null)
  
  // Mute state
  const [isMuted, setIsMuted] = useState(false)

  // WebRTC refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const sessionDataRef = useRef<SessionData | null>(null)
  const aiAudioElementRef = useRef<HTMLAudioElement | null>(null)
  
  // Debug logging
  const debugLogRef = useRef<string>("")
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  
  // Prevent duplicate session creation attempts
  const sessionCreationInProgress = useRef(false)
  
  // Unique session ID for this hook instance
  const hookSessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  // Ref to handle forward reference of stop function
  const stopRef = useRef<(() => void) | null>(null)

  // Add debug message
  const addDebugMessage = useCallback((message: string) => {
    console.log("🔧 Debug:", message)
    const timestamp = new Date().toISOString()
    debugLogRef.current = `${timestamp} - ${message}\n${debugLogRef.current}`.substring(0, 5000)
    setDebug(debugLogRef.current)
  }, [])
  
  // Set up session manager debug callback
  useEffect(() => {
    if (interviewSessionManager) {
      interviewSessionManager.setDebugCallback(addDebugMessage)
    }
  }, [addDebugMessage])

  // Add message to conversation
  const addMessage = useCallback((role: "user" | "assistant", content: string, confidence?: number) => {
    const message: InterviewMessage = {
      role,
      content,
      timestamp: Date.now(),
      confidence
    }
    setMessages(prev => [...prev, message])
    addDebugMessage(`Added ${role} message: ${content.substring(0, 50)}...`)
  }, [addDebugMessage])

  // Get ICE servers
  const getIceServers = useCallback(async (): Promise<RTCIceServer[]> => {
    try {
      const response = await fetch("/api/ice-servers")
      if (response.ok) {
        const { iceServers } = await response.json()
        addDebugMessage(`Loaded ${iceServers.length} ICE servers`)
        return iceServers
      }
    } catch (error) {
      addDebugMessage(`ICE server fetch failed: ${error}`)
    }
    
    // Fallback to public STUN servers
    const fallbackServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
    addDebugMessage("Using fallback STUN servers")
    return fallbackServers
  }, [addDebugMessage])

  // Setup WebRTC connection
  const setupWebRTC = useCallback(async (sessionData: SessionData): Promise<boolean> => {
    try {
      addDebugMessage("Setting up WebRTC connection...")
      
      // Get ICE servers
      const iceServers = await getIceServers()
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10
      })
      
      peerConnectionRef.current = pc
      
      // Register peer connection with session manager
      if (interviewSessionManager) {
        interviewSessionManager.registerPeerConnection(hookSessionId.current, pc)
      }
      
      // Setup connection state monitoring
      pc.onconnectionstatechange = () => {
        addDebugMessage(`WebRTC connection state: ${pc.connectionState}`)
        if (pc.connectionState === "connected") {
          // Check if data channel is ready before going active
          if (dataChannelRef.current?.readyState === "open") {
            addDebugMessage("Connection established with open data channel - activating")
            setStatus("active")
            setIsActive(true)
            setIsConnecting(false)
          } else {
            addDebugMessage("Connected but data channel not ready yet")
            // Wait a bit for data channel
            setTimeout(() => {
              if (dataChannelRef.current?.readyState === "open") {
                setStatus("active")
                setIsActive(true)
                setIsConnecting(false)
              }
            }, 1000)
          }
        } else if (pc.connectionState === "failed") {
          throw new Error("WebRTC connection failed")
        }
      }

      // Setup data channel for JSON messages
      const dataChannel = pc.createDataChannel("messages", {
        ordered: true
      })
      
      dataChannelRef.current = dataChannel
      
      dataChannel.onopen = () => {
        addDebugMessage("Data channel opened")
        setStatus("data_channel_open")
        
        // CRITICAL: Send session configuration immediately
        const sessionUpdate = {
          type: "session.update",
          session: {
            instructions: `You are an AI job interview coach. Conduct a mock interview for a ${jobTitle} position. Start by greeting the candidate and asking them to tell you about themselves.`,
            voice: "alloy",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            },
            modalities: ["text", "audio"]
          }
        }
        
        dataChannel.send(JSON.stringify(sessionUpdate))
        addDebugMessage("Sent session configuration")
        
        // Force transition to active state after sending config
        setTimeout(() => {
          setStatus("active")
          setIsActive(true)
          setIsConnecting(false)
          addDebugMessage("Interview session is now active")
        }, 500)
      }
      
      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleOpenAIMessage(data)
        } catch (error) {
          addDebugMessage(`Failed to parse data channel message: ${error}`)
        }
      }
      
      dataChannel.onclose = () => {
        addDebugMessage("Data channel closed")
        if (isActive) {
          throw new Error("Data channel closed unexpectedly")
        }
      }

      // Handle incoming audio
      pc.ontrack = (event) => {
        addDebugMessage("Received remote audio track")
        if (event.streams && event.streams[0]) {
          // Clean up any existing audio element
          if (aiAudioElementRef.current) {
            aiAudioElementRef.current.pause()
            aiAudioElementRef.current.srcObject = null
          }
          
          const audioElement = new Audio()
          audioElement.srcObject = event.streams[0]
          audioElement.autoplay = true
          aiAudioElementRef.current = audioElement
          
          // Register with session manager
          if (interviewSessionManager) {
            interviewSessionManager.registerAudioElement(hookSessionId.current, audioElement)
          }
          
          audioElement.play().catch(e => addDebugMessage(`Audio play failed: ${e}`))
        }
      }

      // Get user media for microphone
      addDebugMessage("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        } 
      })
      
      localStreamRef.current = stream
      
      // Register media stream with session manager
      if (interviewSessionManager) {
        interviewSessionManager.registerMediaStream(hookSessionId.current, stream)
      }
      
      // Add audio track to peer connection
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream)
        addDebugMessage("Added audio track to peer connection")
      })

      // Create offer
      setStatus("creating_offer")
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      })

      await pc.setLocalDescription(offer)
      addDebugMessage("Created and set local description")

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") {
          resolve()
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === "complete") {
              resolve()
            } else {
              setTimeout(checkState, 100)
            }
          }
          setTimeout(checkState, 100)
        }
      })

      // Exchange SDP with OpenAI via backend proxy
      setStatus("exchanging_sdp")
      addDebugMessage("Exchanging SDP with OpenAI...")
      
      const response = await fetch("/api/webrtc-exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          token: sessionData.token,
          sdp: pc.localDescription!.sdp,
          model: "gpt-4o-mini-realtime-preview"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(`SDP exchange failed: ${response.status} - ${errorData.error || "Unknown error"}`)
      }

      const responseData = await response.json()
      
      // Set remote description
      setStatus("connecting_webrtc")
      await pc.setRemoteDescription({
        type: "answer",
        sdp: responseData.sdp,
      })

      addDebugMessage("WebRTC connection established successfully")
      return true
      
    } catch (error) {
      addDebugMessage(`WebRTC setup failed: ${error}`)
      throw error
    }
  }, [addDebugMessage, getIceServers, isActive, jobTitle])

  // Handle OpenAI message from data channel
  const handleOpenAIMessage = useCallback((data: any) => {
    addDebugMessage(`Received OpenAI message: ${data.type}`)
    
    switch (data.type) {
      case "session.created":
        addDebugMessage("Session created successfully")
        // Ensure we're in active state
        if (status !== "active") {
          setStatus("active")
          setIsActive(true)
          setIsConnecting(false)
        }
        break
        
      case "conversation.item.created":
        // Handle both user and assistant items
        if (data.item && data.item.content) {
          const content = data.item.content[0]?.transcript || data.item.content[0]?.text || ""
          if (content && data.item.role) {
            addMessage(data.item.role, content)
            addDebugMessage(`${data.item.role} item created: ${content.substring(0, 50)}...`)
          }
        }
        break
        
      case "input_audio_buffer.speech_started":
        setIsUserSpeaking(true)
        addDebugMessage("User started speaking")
        break
        
      case "input_audio_buffer.speech_stopped":
        setIsUserSpeaking(false)
        addDebugMessage("User stopped speaking")
        break
        
      case "conversation.item.input_audio_transcription.completed":
        // Handle completed user transcription
        if (data.transcript) {
          addMessage("user", data.transcript)
          addDebugMessage(`User transcript: ${data.transcript}`)
        }
        break
        
      case "conversation.item.input_audio_transcription.delta":
        // Handle incremental user transcription (for real-time display)
        if (data.delta) {
          setLiveTranscript({ role: "user", content: data.delta })
        }
        break
        
      case "response.audio_transcript.delta":
        // Handle assistant transcript delta
        if (data.delta) {
          setLiveTranscript({ role: "assistant", content: data.delta })
        }
        break
        
      case "response.audio_transcript.done":
        // Handle completed assistant transcript
        if (data.transcript) {
          addMessage("assistant", data.transcript)
          setLiveTranscript(null)
        }
        break
        
      case "response.audio.delta":
        // Audio data is handled via WebRTC audio track
        break
        
      case "response.audio.done":
        // Audio playback completed
        addDebugMessage("Audio response completed")
        break
        
      case "response.text.delta":
        if (data.delta) {
          setAiCaptions(prev => prev + data.delta)
        }
        break
        
      case "response.done":
        setAiCaptions("")
        addDebugMessage("Response completed")
        break
        
      case "error":
        addDebugMessage(`OpenAI error: ${data.error?.message || "Unknown error"}`)
        setError(data.error?.message || "OpenAI error occurred")
        break
        
      default:
        addDebugMessage(`Unhandled message type: ${data.type}`)
    }
  }, [addDebugMessage, addMessage, status])

  // Create session with OpenAI
  const createSession = useCallback(async (jobTitle: string): Promise<SessionData> => {
    // Prevent duplicate session creation attempts
    if (sessionCreationInProgress.current) {
      addDebugMessage("Session creation already in progress, skipping...")
      throw new Error("Session creation already in progress")
    }
    
    sessionCreationInProgress.current = true
    
    try {
      setStatus("fetching_token")
      addDebugMessage("Creating OpenAI session...")
      
      // Get auth token
      if (!isLoaded || !isSignedIn) {
        throw new Error("User not authenticated")
      }
      
      const authToken = await getToken()
      if (!authToken) {
        throw new Error("No authentication token available")
      }

      // Create session
      const response = await fetch("/api/realtime-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          jobTitle,
          resumeText: "", // Could be populated from props if needed
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        
        // Handle specific error codes
        if (response.status === 429) {
          // Rate limit exceeded - don't retry
          const resetIn = errorData.resetIn || 60
          throw new Error(`RATE_LIMIT_ERROR: Too many interview attempts. Please wait ${Math.ceil(resetIn / 60)} minutes before trying again.`)
        } else if (response.status === 503) {
          // Service unavailable - likely database timeout
          const retryAfter = errorData.retryAfter || 5
          throw new Error(`Service temporarily unavailable. Please wait ${retryAfter} seconds and try again.`)
        } else if (response.status === 504) {
          // Gateway timeout - OpenAI API slow
          throw new Error("The AI service is taking longer than expected. Please try again.")
        } else if (response.status === 403) {
          // Insufficient credits
          throw new Error(errorData.message || errorData.error || "Insufficient credits")
        }
        
        throw new Error(`Session creation failed: ${response.status} - ${errorData.error || errorData.message || "Unknown error"}`)
      }

      const sessionData = await response.json()
      
      if (!sessionData.id || !sessionData.token) {
        throw new Error("Invalid session data received")
      }

      addDebugMessage(`Session created: ${sessionData.id}`)
      return {
        id: sessionData.id,
        token: sessionData.token,
        expires_at: sessionData.expires_at
      }
      
    } catch (error) {
      addDebugMessage(`Session creation failed: ${error}`)
      throw error
    } finally {
      // Always reset the flag when session creation completes (success or failure)
      sessionCreationInProgress.current = false
    }
  }, [isLoaded, isSignedIn, getToken, addDebugMessage])

  // Main start function
  const start = useCallback(async (overrideJobTitle?: string) => {
    const effectiveJobTitle = overrideJobTitle || jobTitle
    try {
      // Check if we have a paused session to resume
      if (interviewSessionManager && interviewSessionManager.isSessionPaused(hookSessionId.current)) {
        addDebugMessage(`Resuming paused session: ${hookSessionId.current}`)
        interviewSessionManager.resumeSession(hookSessionId.current)
        setStatus("active")
        setIsActive(true)
        setIsConnecting(false)
        return // Don't create a new session
      }
      
      // Register this session with the manager, providing cleanup callback
      if (interviewSessionManager) {
        interviewSessionManager.registerSession(hookSessionId.current, () => {
          // This will be called by the manager when terminating the session
          addDebugMessage(`Session ${hookSessionId.current} termination requested by manager`)
          // Call stop function via ref
          if (stopRef.current) {
            stopRef.current()
          }
        })
        addDebugMessage(`Session ${hookSessionId.current} registered with manager`)
      }
      
      setStatus("requesting_mic")
      setIsConnecting(true)
      setError(null)
      setRetryCount(0)
      addDebugMessage(`Starting interview session ${hookSessionId.current} for: ${effectiveJobTitle}`)

      // Create session
      const sessionData = await createSession(effectiveJobTitle)
      sessionDataRef.current = sessionData

      // Setup WebRTC
      await setupWebRTC(sessionData)
      
      addDebugMessage("Interview session started successfully")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage)
      setStatus("error")
      setIsConnecting(false)
      addDebugMessage(`Start failed: ${errorMessage}`)
      
      // Retry logic with exponential backoff
      const shouldRetry = retryCount < maxRetries && 
        !errorMessage.includes("authentication") &&
        !errorMessage.includes("Insufficient") &&
        !errorMessage.includes("API key not configured") &&
        !errorMessage.includes("Invalid OpenAI API key") &&
        !errorMessage.includes("RATE_LIMIT_ERROR") && // Don't retry rate limit errors
        (errorMessage.includes("temporarily unavailable") || 
         errorMessage.includes("timeout") ||
         errorMessage.includes("taking longer") ||
         errorMessage.includes("502") ||
         errorMessage.includes("External API error"))
      
      if (shouldRetry) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000) // 1s, 2s, 4s, max 10s
        addDebugMessage(`Retrying in ${backoffDelay/1000} seconds... (${retryCount + 1}/${maxRetries})`)
        
        // Reset to idle state before retry
        setStatus("idle")
        setError(null)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          // Don't call start directly to avoid loops
          createSession(effectiveJobTitle).then(sessionData => {
            sessionDataRef.current = sessionData
            return setupWebRTC(sessionData)
          }).catch(retryError => {
            const retryErrorMessage = retryError instanceof Error ? retryError.message : String(retryError)
            setError(retryErrorMessage)
            setStatus("error")
            setIsConnecting(false)
            addDebugMessage(`Retry ${retryCount + 1} failed: ${retryErrorMessage}`)
          })
        }, backoffDelay)
      }
      
      throw error
    }
  }, [createSession, setupWebRTC, addDebugMessage, retryCount, maxRetries, jobTitle])

  // Stop function
  const stop = useCallback(() => {
    try {
      addDebugMessage(`Stopping interview session ${hookSessionId.current}...`)
      
      // Delegate cleanup to session manager if available
      if (interviewSessionManager) {
        // Manager will handle all resource cleanup
        interviewSessionManager.terminateSession(hookSessionId.current)
        
        // Reset state
        setStatus("idle")
        setIsActive(false)
        setIsConnecting(false)
        setIsUserSpeaking(false)
        setAiCaptions("")
        setLiveTranscript(null)
        sessionDataRef.current = null
        
        // Clear refs (they should be cleaned by manager but ensure they're null)
        dataChannelRef.current = null
        peerConnectionRef.current = null
        localStreamRef.current = null
        aiAudioElementRef.current = null
        
        addDebugMessage("Interview session stopped via manager")
      } else {
        // Manual cleanup if session manager not available
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
        
        // Stop media stream
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop())
          localStreamRef.current = null
        }
        
        // Stop AI audio
        if (aiAudioElementRef.current) {
          aiAudioElementRef.current.pause()
          aiAudioElementRef.current.srcObject = null
          aiAudioElementRef.current = null
        }
      }
      
      // Reset state
      setStatus("idle")
      setIsActive(false)
      setIsConnecting(false)
      setIsUserSpeaking(false)
      setAiCaptions("")
      setLiveTranscript(null)
      sessionDataRef.current = null
      
      // Clear refs
      dataChannelRef.current = null
      peerConnectionRef.current = null
      localStreamRef.current = null
      aiAudioElementRef.current = null
      
      addDebugMessage("Interview session stopped")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage)
      addDebugMessage(`Stop error: ${errorMessage}`)
    }
  }, [addDebugMessage])
  
  // Set stop ref for forward reference
  stopRef.current = stop

  // Pause function
  const pause = useCallback(() => {
    if (interviewSessionManager && isActive) {
      addDebugMessage(`Pausing interview session ${hookSessionId.current}`)
      interviewSessionManager.pauseSession(hookSessionId.current)
      setStatus("idle")
      setIsActive(false)
    }
  }, [isActive, addDebugMessage])
  
  // Resume function
  const resume = useCallback(() => {
    if (interviewSessionManager && interviewSessionManager.isSessionPaused(hookSessionId.current)) {
      addDebugMessage(`Resuming interview session ${hookSessionId.current}`)
      interviewSessionManager.resumeSession(hookSessionId.current)
      setStatus("active")
      setIsActive(true)
    }
  }, [addDebugMessage])

  // Toggle mute function
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) {
      addDebugMessage("No local stream to mute/unmute")
      return
    }

    const audioTracks = localStreamRef.current.getAudioTracks()
    if (audioTracks.length === 0) {
      addDebugMessage("No audio tracks found")
      return
    }

    const newMutedState = !isMuted
    audioTracks.forEach(track => {
      track.enabled = !newMutedState
    })

    setIsMuted(newMutedState)
    addDebugMessage(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`)
  }, [isMuted, addDebugMessage])

  // Send message via data channel
  const sendMessage = useCallback((type: string, data: any = {}) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
      const message = {
        type,
        ...data,
        timestamp: Date.now()
      }
      dataChannelRef.current.send(JSON.stringify(message))
      addDebugMessage(`Sent message: ${type}`)
    } else {
      addDebugMessage("Cannot send message: data channel not open")
    }
  }, [addDebugMessage])

  // Helper function to calculate average response time
  const calculateAverageResponseTime = useCallback((messages: InterviewMessage[]) => {
    const responseTimes: number[] = []
    let lastUserMessageTime: number | null = null
    
    for (const message of messages) {
      if (message.role === "user") {
        lastUserMessageTime = message.timestamp
      } else if (message.role === "assistant" && lastUserMessageTime !== null) {
        responseTimes.push(message.timestamp - lastUserMessageTime)
        lastUserMessageTime = null
      }
    }
    
    if (responseTimes.length === 0) return 0
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  }, [])

  // Save interview session to database
  const saveInterviewSession = useCallback(async () => {
    if (messages.length === 0 || !sessionDataRef.current?.id) {
      addDebugMessage("No messages or session ID to save")
      return null
    }
    
    setStatus("saving_results")
    const sessionStartTime = messages[0]?.timestamp || Date.now()
    const sessionEndTime = messages[messages.length - 1]?.timestamp || Date.now()
    
    try {
      // Get auth token for API call
      const authToken = await getToken()
      if (!authToken) throw new Error("No auth token available")
      
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionId: sessionDataRef.current.id,
          jobTitle,
          resumeData: resumeData || null,
          messages,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          duration: sessionEndTime - sessionStartTime,
          // Include performance metrics
          metrics: {
            totalUserMessages: messages.filter(m => m.role === "user").length,
            totalAssistantMessages: messages.filter(m => m.role === "assistant").length,
            averageResponseTime: calculateAverageResponseTime(messages)
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save interview")
      }
      
      const result = await response.json()
      addDebugMessage(`Interview saved with ID: ${result.id}`)
      
      // Clear session data
      sessionDataRef.current = null
      
      return result
    } catch (error) {
      addDebugMessage(`Failed to save interview: ${error}`)
      const errorMessage = `Failed to save interview results: ${error instanceof Error ? error.message : String(error)}`
      setError(errorMessage)
      throw error
    } finally {
      setStatus("idle")
    }
  }, [messages, jobTitle, resumeData, getToken, addDebugMessage, calculateAverageResponseTime])

  // Handle visibility changes to maintain connection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // Tab is hidden - pause the session
        addDebugMessage("Tab hidden, pausing interview session")
        if (interviewSessionManager) {
          interviewSessionManager.pauseSession(hookSessionId.current)
        }
      } else if (!document.hidden) {
        // Tab is visible again - check if we need to resume
        if (interviewSessionManager && interviewSessionManager.isSessionPaused(hookSessionId.current)) {
          addDebugMessage("Tab visible again, resuming interview session")
          interviewSessionManager.resumeSession(hookSessionId.current)
          
          // The session manager will handle audio resumption, but ensure our state is synced
          if (interviewSessionManager.getSessionState(hookSessionId.current) === SessionState.ACTIVE) {
            setIsActive(true)
            setStatus("active")
          }
        }
      }
    }

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Handle actual page navigation (not just tab switches)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        // Save interview state to localStorage for potential recovery
        const interviewState = {
          sessionId: sessionDataRef.current?.id,
          messages,
          jobTitle,
          resumeData,
          timestamp: Date.now()
        }
        localStorage.setItem('vocahire_active_interview', JSON.stringify(interviewState))
        
        // Show browser confirmation dialog
        e.preventDefault()
        e.returnValue = 'You have an active interview. Are you sure you want to leave?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Component unmounting - pause instead of terminate
      if (interviewSessionManager && interviewSessionManager.isSessionActive(hookSessionId.current)) {
        addDebugMessage("Component unmounting - pausing active session for potential resume")
        interviewSessionManager.pauseSession(hookSessionId.current)
      } else if (interviewSessionManager && interviewSessionManager.isSessionPaused(hookSessionId.current)) {
        addDebugMessage("Component unmounting - session already paused, preserving")
      } else {
        // Session is terminated or no manager available
        addDebugMessage("Component unmounting - no active session to pause")
      }
    }
  }, [isActive, stop, addDebugMessage, messages, jobTitle, resumeData])

  return {
    // State
    status,
    messages,
    error,
    debug,
    isConnecting,
    isActive,
    isUserSpeaking,
    aiCaptions,
    liveTranscript,
    isMuted,
    
    // Functions
    start,
    stop,
    pause,
    resume,
    toggleMute,
    addDebugMessage,
    sendMessage,
    saveInterviewSession,
    
    // Refs
    localStreamRef,
    aiAudioElementRef,
    peerConnection: peerConnectionRef.current,
    dataChannel: dataChannelRef.current,
  }
}