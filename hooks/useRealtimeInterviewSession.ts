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
  // Create an initial fixed state object to ensure consistent hook calls
  const [sessionState] = useState({
    status: "idle" as InterviewStatus,
    messages: [] as InterviewMessage[],
    error: null as string | null,
    debug: null as string | null,
    isConnecting: false,
    isActive: false,
    isUserSpeaking: false,
    aiCaptions: "",
    liveTranscript: null as { role: "user" | "assistant"; content: string } | null
  })

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
    status: sessionState.status,
    messages: sessionState.messages,
    error: sessionState.error,
    debug: sessionState.debug,
    isConnecting: sessionState.isConnecting,
    isActive: sessionState.isActive,
    isUserSpeaking: sessionState.isUserSpeaking,
    aiCaptions: sessionState.aiCaptions,
    liveTranscript: sessionState.liveTranscript,
    addDebugMessage,
    localStreamRef,
    aiAudioElementRef,
    peerConnection: peerConnectionRef.current,
    dataChannel: dataChannelRef.current,
  }
}
