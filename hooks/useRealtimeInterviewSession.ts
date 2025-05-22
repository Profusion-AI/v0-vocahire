"use client"

import { useState, useRef, useCallback } from "react"

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

export function useInterviewSession() {
  // Initialize state hooks individually to prevent hydration issues
  const [status, setStatus] = useState<InterviewStatus>("idle")
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [aiCaptions, setAiCaptions] = useState("")
  const [liveTranscript, setLiveTranscript] = useState<{ role: "user" | "assistant"; content: string } | null>(null)

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const sessionInfoRef = useRef<{ id: string; token: string; model?: string } | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const debugLogRef = useRef<string>("")
  const audioSenderRef = useRef<RTCRtpSender | null>(null)
  const aiAudioElementRef = useRef<HTMLAudioElement | null>(null)

  // Refs for accumulating streaming text
  const currentUserTranscriptRef = useRef<string>("")
  const currentAssistantTextRef = useRef<string>("")
  const transcriptConfidenceRef = useRef<number | null>(null)

  // Add debug message without causing infinite loops
  const addDebugMessage = useCallback((message: string) => {
    console.log("Debug:", message)
    // Use a ref to store the debug log to avoid state updates in every render
    debugLogRef.current = `${new Date().toISOString()} - ${message}\n${debugLogRef.current}`.substring(0, 5000)
    // Update state less frequently
  }, [])

  return {
    status,
    messages,
    error,
    debug,
    isConnecting,
    isActive,
    isUserSpeaking,
    aiCaptions,
    liveTranscript,
    addDebugMessage,
    localStreamRef,
    aiAudioElementRef,
    peerConnection: peerConnectionRef.current,
    dataChannel: dataChannelRef.current,
  }
}
