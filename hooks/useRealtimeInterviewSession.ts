"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"

export interface InterviewMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
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

interface SessionData {
  id: string
  token: string
  expires_at?: number
}

export function useRealtimeInterviewSession() {
  // Authentication
  const { isLoaded, isSignedIn, getToken } = useAuth()

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
      
      // Setup connection state monitoring
      pc.onconnectionstatechange = () => {
        addDebugMessage(`WebRTC connection state: ${pc.connectionState}`)
        if (pc.connectionState === "connected") {
          setStatus("active")
          setIsActive(true)
          setIsConnecting(false)
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
          const audioElement = new Audio()
          audioElement.srcObject = event.streams[0]
          audioElement.autoplay = true
          aiAudioElementRef.current = audioElement
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
          model: "gpt-4o-realtime-preview-2024-12-17"
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
  }, [addDebugMessage, getIceServers, isActive])

  // Handle OpenAI message from data channel
  const handleOpenAIMessage = useCallback((data: any) => {
    addDebugMessage(`Received OpenAI message: ${data.type}`)
    
    switch (data.type) {
      case "conversation.item.created":
        if (data.item.role === "assistant" && data.item.content) {
          const content = data.item.content[0]?.transcript || data.item.content[0]?.text || ""
          if (content) {
            addMessage("assistant", content)
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
        
      case "response.audio.delta":
        // Audio data is handled via WebRTC audio track
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
  }, [addDebugMessage, addMessage])

  // Create session with OpenAI
  const createSession = useCallback(async (jobTitle: string): Promise<SessionData> => {
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
        if (response.status === 503) {
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
    }
  }, [isLoaded, isSignedIn, getToken, addDebugMessage])

  // Main start function
  const start = useCallback(async (jobTitle: string) => {
    try {
      setStatus("requesting_mic")
      setIsConnecting(true)
      setError(null)
      setRetryCount(0)
      addDebugMessage(`Starting interview session for: ${jobTitle}`)

      // Create session
      const sessionData = await createSession(jobTitle)
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
          createSession(jobTitle).then(sessionData => {
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
  }, [createSession, setupWebRTC, addDebugMessage, retryCount, maxRetries])

  // Stop function
  const stop = useCallback(() => {
    try {
      addDebugMessage("Stopping interview session...")
      
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
        aiAudioElementRef.current = null
      }
      
      // Reset state
      setStatus("idle")
      setIsActive(false)
      setIsConnecting(false)
      setIsUserSpeaking(false)
      setAiCaptions("")
      setLiveTranscript(null)
      sessionDataRef.current = null
      
      addDebugMessage("Interview session stopped")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage)
      addDebugMessage(`Stop error: ${errorMessage}`)
    }
  }, [addDebugMessage])

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

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
    
    // Functions
    start,
    stop,
    addDebugMessage,
    sendMessage,
    
    // Refs
    localStreamRef,
    aiAudioElementRef,
    peerConnection: peerConnectionRef.current,
    dataChannel: dataChannelRef.current,
  }
}