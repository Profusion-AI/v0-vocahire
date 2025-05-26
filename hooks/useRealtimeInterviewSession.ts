"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

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
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()
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

  // WebRTC and WebSocket refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const sessionDataRef = useRef<SessionData | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  
  // Debug logging
  const debugLogRef = useRef<string>("")
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  
  // Prevent duplicate session creation attempts
  const sessionCreationInProgress = useRef(false)
  
  // Heartbeat interval
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Add debug message
  const addDebugMessage = useCallback((message: string) => {
    console.log("🔧 Debug:", message)
    const timestamp = new Date().toISOString()
    debugLogRef.current = `${timestamp} - ${message}\n${debugLogRef.current}`.substring(0, 5000)
    setDebug(debugLogRef.current)
  }, [])

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
      addDebugMessage(`Sent WS message: ${message.type}`)
    } else {
      addDebugMessage(`Cannot send WS message, socket not open: ${message.type}`)
    }
  }, [addDebugMessage])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(async (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data)
      addDebugMessage(`WS message received: ${message.type}`)
      
      switch (message.type) {
        case "session.status":
          addDebugMessage(`Session status: ${message.data.status}`)
          if (message.data.status === "connected") {
            setStatus("establishing_webrtc")
            // Server is ready, we can now create WebRTC offer
            if (!peerConnectionRef.current && sessionDataRef.current) {
              await setupWebRTC(sessionDataRef.current)
            }
          } else if (message.data.status === "active") {
            setStatus("active")
            setIsActive(true)
            setIsConnecting(false)
          }
          break
          
        case "webrtc.answer":
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(message.data)
            )
            addDebugMessage("Set remote description (answer)")
          }
          break
          
        case "webrtc.ice_candidate":
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(
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
            setStatus("error")
          }
          break
      }
    } catch (error) {
      addDebugMessage(`Error handling WebSocket message: ${error}`)
    }
  }, [addDebugMessage, addMessage])

  // Setup WebRTC data channel
  const setupDataChannel = useCallback((pc: RTCPeerConnection) => {
    const dataChannel = pc.createDataChannel("vocahire-control", {
      ordered: true
    })
    
    dataChannelRef.current = dataChannel
    
    dataChannel.onopen = () => {
      addDebugMessage("Data channel opened")
      
      // Send initial audio metadata
      dataChannel.send(JSON.stringify({
        type: "audio.metadata",
        timestamp: new Date().toISOString(),
        data: {
          format: "opus",
          sampleRate: 48000,
          channels: 1,
          chunkDuration: 20
        }
      }))
      
      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (dataChannel.readyState === "open") {
          dataChannel.send(JSON.stringify({
            type: "heartbeat",
            timestamp: new Date().toISOString(),
            data: {
              ping: Date.now()
            }
          }))
        }
      }, 5000)
    }
    
    dataChannel.onclose = () => {
      addDebugMessage("Data channel closed")
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
    }
    
    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === "heartbeat_ack") {
          const latency = Date.now() - message.data.pong
          addDebugMessage(`Heartbeat latency: ${latency}ms`)
        }
      } catch (error) {
        addDebugMessage(`Error handling data channel message: ${error}`)
      }
    }
  }, [addDebugMessage])

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
      
      // Setup data channel
      setupDataChannel(pc)
      
      // Setup connection state monitoring
      pc.onconnectionstatechange = () => {
        addDebugMessage(`WebRTC connection state: ${pc.connectionState}`)
        if (pc.connectionState === "connected") {
          // Don't set active here - wait for server confirmation
          addDebugMessage("WebRTC connected, waiting for server to activate session")
        } else if (pc.connectionState === "failed") {
          setError("WebRTC connection failed")
          setStatus("error")
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
  }, [addDebugMessage, sendWebSocketMessage, setupDataChannel])

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

      // Create session with the new orchestrator endpoints
      const response = await fetch("/api/v1/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: userId || "anonymous",
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
      
      return sessionData
      
    } catch (error: any) {
      addDebugMessage(`Session creation error: ${error.message}`)
      throw error
    } finally {
      sessionCreationInProgress.current = false
    }
  }, [addDebugMessage, isLoaded, isSignedIn, getToken, userId, jobTitle, resumeData])

  // Setup WebSocket connection
  const setupWebSocket = useCallback(async (sessionData: SessionData, authToken: string) => {
    try {
      setStatus("connecting_websocket")
      addDebugMessage("Connecting to WebSocket...")
      
      // Add token as query parameter as per spec
      const wsUrl = `${sessionData.websocketUrl}?token=${authToken}`
      const ws = new WebSocket(wsUrl)
      websocketRef.current = ws
      
      ws.onopen = () => {
        addDebugMessage("WebSocket connected")
        // Server will send session.status message when ready
      }
      
      ws.onmessage = handleWebSocketMessage
      
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
  }, [addDebugMessage, handleWebSocketMessage, status])

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
      
      // WebRTC setup will happen after WebSocket connects and server sends status
      
    } catch (error: any) {
      addDebugMessage(`Start error: ${error.message}`)
      setError(error.message)
      setStatus("error")
      setIsConnecting(false)
      
      // Handle retry logic for transient errors
      if (retryCount < maxRetries && !error.message.includes("RATE_LIMIT") && !error.message.includes("Insufficient")) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => start(), 2000 * (retryCount + 1))
      }
    }
  }, [isConnecting, status, addDebugMessage, createSession, getToken, setupWebSocket, retryCount])

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
      
      // Close data channel
      if (dataChannelRef.current) {
        dataChannelRef.current.close()
        dataChannelRef.current = null
      }
      
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
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
            await fetch(`/api/v1/sessions/${sessionDataRef.current.sessionId}/end`, {
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
      
      // Reset state
      setStatus("ended")
      setIsActive(false)
      setIsConnecting(false)
      
      // Save results if we have messages
      if (messages.length > 0) {
        setStatus("saving_results")
        await saveSessionResults()
        
        // Navigate to feedback page
        const sessionId = sessionDataRef.current?.sessionId || Date.now().toString()
        router.push(`/feedback?sessionId=${sessionId}`)
      }
      
      sessionDataRef.current = null
      
    } catch (error) {
      addDebugMessage(`Stop error: ${error}`)
    }
  }, [addDebugMessage, sendWebSocketMessage, getToken, messages, router])

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (status === "active" || isConnecting) {
        stop()
      }
    }
  }, []) // Only on unmount

  // Handle auth changes
  useEffect(() => {
    if (isLoaded && !isSignedIn && status !== "idle") {
      addDebugMessage("User signed out, stopping session")
      stop()
    }
  }, [isLoaded, isSignedIn, status, stop, addDebugMessage])

  // Start interview when connection is ready
  useEffect(() => {
    if (status === "active" && websocketRef.current?.readyState === WebSocket.OPEN) {
      sendWebSocketMessage({
        type: "control.start_interview",
        data: {}
      })
    }
  }, [status, sendWebSocketMessage])

  return {
    // State
    status,
    messages,
    error,
    debug,
    isConnecting,
    isActive,
    
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