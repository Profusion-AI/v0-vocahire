"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAudioPlayer } from "./useAudioPlayer"

export interface InterviewMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

type InterviewStatus =
  | "idle"
  | "requesting_mic"
  | "testing_api"
  | "fetching_token"
  | "connecting_webrtc"
  | "active"
  | "ended"
  | "error"

export function useInterviewSession() {
  // State
  const [status, setStatus] = useState<InterviewStatus>("idle")
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const sessionInfoRef = useRef<{ id: string; token: string } | null>(null)
  const webSocketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const debugLogRef = useRef<string>("")

  // Use our audio player hook
  const {
    audioRef: aiAudioRef,
    isPlaying: isAudioPlaying,
    error: audioError,
    playAudioFromArrayBuffer,
  } = useAudioPlayer()

  // Add debug message without causing infinite loops
  const addDebugMessage = useCallback((message: string) => {
    console.log("Debug:", message)
    // Use a ref to store the debug log to avoid state updates in every render
    debugLogRef.current = `${new Date().toISOString()} - ${message}\n${debugLogRef.current}`.substring(0, 5000)
    // Update state less frequently
    setDebug(debugLogRef.current)
  }, [])

  // Handle audio data from the server
  const handleAudioData = useCallback(
    (audioData: ArrayBuffer) => {
      try {
        const success = playAudioFromArrayBuffer(audioData)
        if (!success) {
          addDebugMessage("Failed to play audio from server")
        }
      } catch (err) {
        addDebugMessage(`Error handling audio data: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [playAudioFromArrayBuffer, addDebugMessage],
  )

  // Add a message to the conversation
  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content, timestamp: Date.now() }])
  }, [])

  const start = useCallback(
    async (jobTitle: string) => {
      try {
        setStatus("requesting_mic")
        setError(null)
        setIsConnecting(true)
        addDebugMessage("Starting interview session...")

        // Request microphone access
        addDebugMessage("Requesting microphone access...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        addDebugMessage(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)

        // Test API connection
        setStatus("testing_api")
        addDebugMessage("Testing API connection...")
        const testResponse = await fetch("/api/test-openai")
        const testData = await testResponse.json()

        if (testData.status !== "success") {
          throw new Error("OpenAI API test failed. The service is currently unavailable.")
        }

        // Fetch session token
        setStatus("fetching_token")
        addDebugMessage("Fetching session token...")

        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobTitle: jobTitle }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          throw new Error(`Failed to get session token: ${errorText}`)
        }

        const { token, id: sessionId } = await tokenResponse.json()
        sessionInfoRef.current = { id: sessionId, token }

        // Connect to WebSocket
        setStatus("connecting_webrtc")
        addDebugMessage(`Connecting to WebSocket with session ID: ${sessionId}`)

        const wsUrl = `wss://api.openai.com/v1/realtime/ws?session_id=${sessionId}`
        const ws = new WebSocket(wsUrl)
        webSocketRef.current = ws

        ws.onopen = () => {
          addDebugMessage("WebSocket connection established")

          // Send authentication message
          ws.send(
            JSON.stringify({
              type: "authentication",
              token,
            }),
          )

          // Set up audio processing
          setupAudioProcessing(stream, ws)

          // Set status to active
          setIsActive(true)
          setStatus("active")
          setIsConnecting(false)

          // Add initial message
          setTimeout(() => {
            addMessage(
              "assistant",
              `Hello! I'll be conducting your interview for the ${jobTitle} position. Could you start by telling me about your background and experience?`,
            )
          }, 1000)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            addDebugMessage(`Received WebSocket message: ${data.type}`)

            if (data.type === "audio") {
              // Handle audio data
              const audioData = base64ToArrayBuffer(data.audio)
              handleAudioData(audioData)
            } else if (data.type === "message") {
              // Handle text message
              addMessage("assistant", data.content)
            } else if (data.type === "transcript") {
              // Handle transcript
              addMessage("user", data.text)
            } else if (data.type === "error") {
              addDebugMessage(`Error from server: ${JSON.stringify(data.error)}`)
              setError(`Error from server: ${data.error.message || "Unknown error"}`)
            }
          } catch (err) {
            addDebugMessage(`Error parsing WebSocket message: ${err instanceof Error ? err.message : String(err)}`)
          }
        }

        ws.onerror = (event) => {
          addDebugMessage(`WebSocket error: ${JSON.stringify(event)}`)
          setError("WebSocket connection error")
        }

        ws.onclose = (event) => {
          addDebugMessage(`WebSocket closed: ${event.code} - ${event.reason}`)
          if (status === "active") {
            setError(`WebSocket connection closed: ${event.reason || "Unknown reason"}`)
          }
        }
      } catch (err) {
        addDebugMessage(`Error starting interview: ${err instanceof Error ? err.message : String(err)}`)
        setError(err instanceof Error ? err.message : "Failed to start interview")
        setStatus("error")
        setIsConnecting(false)
      }
    },
    [addDebugMessage, addMessage, handleAudioData, setupAudioProcessing],
  )

  const stop = useCallback(() => {
    addDebugMessage("Ending interview...")

    // Close WebSocket
    if (webSocketRef.current) {
      webSocketRef.current.close()
      webSocketRef.current = null
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    // Reset session info
    sessionInfoRef.current = null

    // Set status to ended
    setStatus("ended")
    setIsConnecting(false)
    setIsActive(false)

    addDebugMessage("Interview ended")
  }, [addDebugMessage])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Close WebSocket
      if (webSocketRef.current) {
        webSocketRef.current.close()
        webSocketRef.current = null
      }

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
        localStreamRef.current = null
      }

      addDebugMessage("Component unmounted, resources cleaned up")
    }
  }, [addDebugMessage])

  // Periodically update the debug state from the ref
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (debugLogRef.current !== debug) {
        setDebug(debugLogRef.current)
      }
    }, 1000) // Update once per second at most

    return () => clearInterval(intervalId)
  }, [debug])

  // Helper functions
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    return window.btoa(binary)
  }

  function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
    const l = buffer.length
    const buf = new Int16Array(l)

    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, buffer[i]) * 0x7fff
    }

    return buf
  }

  return {
    status,
    messages,
    error: error || audioError,
    debug,
    isConnecting,
    isActive,
    start,
    stop,
    addDebugMessage,
    localStreamRef,
    aiAudioRef,
  }
}
