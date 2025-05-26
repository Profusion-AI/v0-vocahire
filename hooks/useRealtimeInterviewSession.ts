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
  | "creating_session"
  | "connecting_websocket"
  | "establishing_webrtc"
  | "active"
  | "ended"
  | "error"
  | "saving_results"

interface SessionData {
  sessionId: string
  websocketUrl: string
  iceServers: RTCIceServer[]
  expiresAt: string
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
  
  // Preserve session state across Clerk re-renders
  const sessionStateRef = useRef<{
    isActive: boolean
    status: InterviewStatus
    sessionData: SessionData | null
  }>({
    isActive: false,
    status: "idle",
    sessionData: null
  })

  // Core state - initialize from ref to preserve across re-renders
  const [status, setStatusState] = useState<InterviewStatus>(sessionStateRef.current.status)
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActiveState, setIsActiveState] = useState(sessionStateRef.current.isActive)
  
  // Wrapped setters that update both state and ref
  const setStatus = useCallback((newStatus: InterviewStatus) => {
    sessionStateRef.current.status = newStatus
    setStatusState(newStatus)
  }, [])
  
  const setIsActive = useCallback((active: boolean) => {
    sessionStateRef.current.isActive = active
    setIsActiveState(active)
  }, [])
  
  // Real-time state
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [aiCaptions, setAiCaptions] = useState("")
  const [liveTranscript, setLiveTranscript] = useState<{ role: "user" | "assistant"; content: string } | null>(null)
  
  // Mute state
  const [isMuted, setIsMuted] = useState(false)

  // WebRTC and WebSocket refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const sessionDataRef = useRef<SessionData | null>(null)
  
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

  // Send WebSocket message
  const sendWebSocketMessage = useCallback((message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }))
    }
  }, [])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(async (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data)
      addDebugMessage(`WS message: ${message.type}`)
      
      switch (message.type) {
        case "session.status":
          if (message.data.status === "connected") {
            setStatus("establishing_webrtc")
          }
          break
          
        case "webrtc.answer":
          if (peerConnectionRef.current) {
            peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(message.data)
            )
            addDebugMessage("Set remote description (answer)")
          }
          break
          
        case "webrtc.ice_candidate":
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(message.data)
            )
            addDebugMessage("Added ICE candidate from server")
          }
          break
          
        case "transcript.user":
          if (message.data.isFinal) {
            addMessage("user", message.data.text, message.data.confidence)
            setLiveTranscript(null)
          } else {
            setLiveTranscript({ role: "user", content: message.data.text })
          }
          break
          
        case "transcript.ai":
          if (message.data.isFinal) {
            addMessage("assistant", message.data.text)
            setLiveTranscript(null)
          } else {
            setLiveTranscript({ role: "assistant", content: message.data.text })
          }
          break
          
        case "ai.thinking":
          setAiCaptions(message.data.status === "processing" ? "Thinking..." : "")
          break
          
        case "audio.level":
          // Could use this for visualizations
          break
          
        case "conversation.turn":
          if (message.data.speaker === "user") {
            setIsUserSpeaking(message.data.action === "speaking")
          }
          break
          
        case "error":
          addDebugMessage(`Server error: ${message.data.message}`)
          if (message.data.severity === "critical") {
            setError(message.data.message)
          }
          break
      }
    } catch (error) {
      addDebugMessage(`Error handling WebSocket message: ${error}`)
    }
  }, [addDebugMessage, addMessage, setStatus])

  // Setup WebRTC connection
  const setupWebRTC = useCallback(async (sessionData: SessionData): Promise<boolean> => {
    try {
      addDebugMessage("Setting up WebRTC connection...")
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: sessionData.iceServers,
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
          setStatus("active")
          setIsActive(true)
          setIsConnecting(false)
          
          // Start the interview
          sendWebSocketMessage({
            type: "control.start_interview",
            data: {}
          })
        } else if (pc.connectionState === "failed") {
          throw new Error("WebRTC connection failed")
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWebSocketMessage({
            type: "webrtc.ice_candidate",
            data: {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid
            }
          })
        }
      }

      // Handle remote audio track
      pc.ontrack = (event) => {
        addDebugMessage(`Received ${event.track.kind} track`)
        if (event.track.kind === "audio") {
          const audio = new Audio()
          audio.srcObject = event.streams[0]
          audio.autoplay = true
          audio.play().catch(e => {
            addDebugMessage(`Audio play failed: ${e}`)
          })
        }
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      })
      
      localStreamRef.current = stream
      
      // Add audio track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Create and send offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      sendWebSocketMessage({
        type: "webrtc.offer",
        data: {
          sdp: offer.sdp,
          type: "offer"
        }
      })
      
      addDebugMessage("Sent WebRTC offer")
      return true
      
    } catch (error) {
      addDebugMessage(`WebRTC setup failed: ${error}`)
      setError(`WebRTC setup failed: ${error}`)
      return false
    }
  }, [addDebugMessage, sendWebSocketMessage, setIsActive, setStatus, interviewSessionManager])

  // Create session with orchestrator
  const createSession = useCallback(async (): Promise<SessionData> => {
    // Prevent duplicate session creation attempts
    if (sessionCreationInProgress.current) {
      addDebugMessage("Session creation already in progress, skipping...")
      throw new Error("Session creation already in progress")
    }
    
    sessionCreationInProgress.current = true
    
    try {
      setStatus("creating_session")
      addDebugMessage("Creating interview session...")
      
      // Get auth token
      if (!isLoaded || !isSignedIn) {
        throw new Error("User not authenticated")
      }
      
      const authToken = await getToken()
      if (!authToken) {
        throw new Error("No authentication token available")
      }

      // TODO: [Gemini] - Update this endpoint to point to the new orchestrator service
      // For now, using placeholder URL that will be replaced when orchestrator is deployed
      const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:5000"

      // Create session
      const response = await fetch(`${orchestratorUrl}/api/v1/sessions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: sessionStateRef.current.sessionData?.sessionId || "temp_user_id", // TODO: Get actual user ID
          jobTitle,
          resumeContext: resumeData ? `${resumeData.skills} ${resumeData.experience}` : "",
          interviewType: "behavioral",
          preferences: {
            difficulty: "senior",
            duration: 30,
            focusAreas: ["behavioral", "technical", "leadership"]
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        
        // Handle specific error codes
        if (response.status === 429) {
          throw new Error(`Too many interview attempts. Please wait and try again.`)
        } else if (response.status === 403) {
          throw new Error(errorData.error?.message || "Insufficient VocahireCredits")
        }
        
        throw new Error(`Session creation failed: ${errorData.error?.message || "Unknown error"}`)
      }

      const sessionData = await response.json()
      
      if (!sessionData.sessionId || !sessionData.websocketUrl) {
        throw new Error("Invalid session data received")
      }
      
      addDebugMessage(`Session created: ${sessionData.sessionId}`)
      sessionDataRef.current = sessionData
      sessionStateRef.current.sessionData = sessionData
      
      return sessionData
      
    } catch (error: any) {
      addDebugMessage(`Session creation error: ${error.message}`)
      throw error
    } finally {
      sessionCreationInProgress.current = false
    }
  }, [addDebugMessage, setStatus, isLoaded, isSignedIn, getToken, jobTitle, resumeData])

  // Setup WebSocket connection
  const setupWebSocket = useCallback(async (sessionData: SessionData, authToken: string) => {
    try {
      setStatus("connecting_websocket")
      addDebugMessage("Connecting to WebSocket...")
      
      const ws = new WebSocket(`${sessionData.websocketUrl}?token=${authToken}`)
      websocketRef.current = ws
      
      ws.onopen = () => {
        addDebugMessage("WebSocket connected")
        // Server will send session.status message, which triggers WebRTC setup
      }
      
      ws.onmessage = async (event) => {
        await handleWebSocketMessage(event)
        
        // Check if we need to start WebRTC after status message
        if (sessionStateRef.current.status === "establishing_webrtc" && !peerConnectionRef.current) {
          await setupWebRTC(sessionData)
        }
      }
      
      ws.onerror = (error) => {
        addDebugMessage(`WebSocket error: ${error}`)
        setError("WebSocket connection error")
      }
      
      ws.onclose = () => {
        addDebugMessage("WebSocket closed")
        if (status === "active") {
          setStatus("ended")
        }
      }
      
    } catch (error) {
      addDebugMessage(`WebSocket setup error: ${error}`)
      throw error
    }
  }, [addDebugMessage, handleWebSocketMessage, setStatus, status])

  // Start interview
  const start = useCallback(async () => {
    if (isConnecting || status === "active") {
      addDebugMessage("Already connecting or active, skipping start")
      return
    }
    
    try {
      setIsConnecting(true)
      setError(null)
      setMessages([])
      setRetryCount(0)
      
      // Request microphone access
      setStatus("requesting_mic")
      addDebugMessage("Requesting microphone access...")
      
      await navigator.mediaDevices.getUserMedia({ audio: true })
      addDebugMessage("Microphone access granted")
      
      // Create session
      const sessionData = await createSession()
      
      // Get auth token for WebSocket
      const authToken = await getToken()
      if (!authToken) {
        throw new Error("No authentication token available")
      }
      
      // Setup WebSocket connection
      await setupWebSocket(sessionData, authToken)
      
      // WebRTC setup will happen after WebSocket connects
      
    } catch (error: any) {
      addDebugMessage(`Start error: ${error.message}`)
      setError(error.message)
      setStatus("error")
      setIsConnecting(false)
      
      // Handle retry logic for transient errors
      if (retryCount < maxRetries && !error.message.includes("RATE_LIMIT")) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => start(), 2000 * (retryCount + 1))
      }
    }
  }, [isConnecting, status, addDebugMessage, setStatus, createSession, getToken, setupWebSocket, retryCount])

  // Stop interview
  const stop = useCallback(async () => {
    addDebugMessage("Stopping interview session...")
    
    try {
      // Send end message if WebSocket is open
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        sendWebSocketMessage({
          type: "control.end",
          data: {}
        })
      }
      
      // Close WebSocket
      if (websocketRef.current) {
        websocketRef.current.close()
        websocketRef.current = null
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }
      
      // End session via API if we have session data
      if (sessionDataRef.current?.sessionId) {
        try {
          const authToken = await getToken()
          if (authToken) {
            const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:5000"
            await fetch(`${orchestratorUrl}/api/v1/sessions/${sessionDataRef.current.sessionId}/end`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${authToken}`
              }
            })
          }
        } catch (error) {
          addDebugMessage(`Error ending session via API: ${error}`)
        }
      }
      
      // Update session manager
      if (interviewSessionManager) {
        await interviewSessionManager.notifySessionEnd(hookSessionId.current)
      }
      
      // Reset state
      setStatus("ended")
      setIsActive(false)
      setIsConnecting(false)
      sessionDataRef.current = null
      sessionStateRef.current.sessionData = null
      
      // Save results if we have messages
      if (messages.length > 0) {
        setStatus("saving_results")
        await saveSessionResults()
        
        // Navigate to feedback page
        const sessionId = sessionDataRef.current?.sessionId || hookSessionId.current
        router.push(`/feedback?sessionId=${sessionId}`)
      }
      
    } catch (error) {
      addDebugMessage(`Stop error: ${error}`)
    }
  }, [addDebugMessage, sendWebSocketMessage, getToken, setStatus, setIsActive, messages, router, interviewSessionManager])

  // Save session results
  const saveSessionResults = useCallback(async () => {
    try {
      addDebugMessage("Saving interview results...")
      
      const authToken = await getToken()
      if (!authToken) {
        throw new Error("No authentication token")
      }
      
      const transcript = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString()
      }))
      
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          jobTitle,
          transcript
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to save interview results")
      }
      
      addDebugMessage("Interview results saved successfully")
      
    } catch (error) {
      addDebugMessage(`Save results error: ${error}`)
      // Don't throw - we still want to navigate to feedback even if save fails
    }
  }, [addDebugMessage, getToken, messages, jobTitle])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
        addDebugMessage(`Microphone ${audioTrack.enabled ? "unmuted" : "muted"}`)
      }
    }
  }, [addDebugMessage])

  // Set stop ref
  useEffect(() => {
    stopRef.current = stop
  }, [stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopRef.current && (status === "active" || isConnecting)) {
        stopRef.current()
      }
    }
  }, [status, isConnecting])

  // Handle auth changes
  useEffect(() => {
    if (isLoaded && !isSignedIn && status !== "idle") {
      addDebugMessage("User signed out, stopping session")
      stop()
    }
  }, [isLoaded, isSignedIn, status, stop, addDebugMessage])

  return {
    // State
    status,
    messages,
    error,
    debug,
    isConnecting,
    isActive: isActiveState,
    
    // Real-time state
    isUserSpeaking,
    aiCaptions,
    liveTranscript,
    isMuted,
    
    // Actions
    start,
    stop,
    toggleMute,
    
    // Metadata
    retryCount,
    maxRetries,
  }
}