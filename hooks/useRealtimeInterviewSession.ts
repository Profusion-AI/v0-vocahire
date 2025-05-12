"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAudioPlayer } from "./useAudioPlayer"

export interface InterviewMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number // Added for transcript confidence
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
  // State
  const [status, setStatus] = useState<InterviewStatus>("idle")
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [aiCaptions, setAiCaptions] = useState<string>("")
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

  // Add a message to the conversation - IMPROVED to handle finalized messages
  const addMessage = useCallback((role: "user" | "assistant", content: string, confidence?: number) => {
    // Add a new message to the conversation
    setMessages((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: Date.now(),
        confidence,
      },
    ])

    // Reset the current transcript refs
    if (role === "user") {
      currentUserTranscriptRef.current = ""
      transcriptConfidenceRef.current = null
    } else {
      currentAssistantTextRef.current = ""
    }

    // Clear the live transcript display
    setLiveTranscript(null)
  }, [])

  // Update live transcript for streaming updates
  const updateLiveTranscript = useCallback((role: "user" | "assistant", content: string) => {
    setLiveTranscript({ role, content })
  }, [])

  // Handle transcript confidence scores
  const handleTranscriptConfidence = useCallback(
    (logprobs: any) => {
      if (!logprobs) return

      try {
        // This is a simplified example - actual implementation would depend on the structure of logprobs
        // For now, we'll just calculate an average confidence score
        let totalConfidence = 0
        let count = 0

        // Assuming logprobs is an array of token probabilities
        if (Array.isArray(logprobs)) {
          logprobs.forEach((item) => {
            if (typeof item === "number") {
              totalConfidence += Math.exp(item) // Convert log probability to probability
              count++
            }
          })
        }

        const avgConfidence = count > 0 ? totalConfidence / count : null
        transcriptConfidenceRef.current = avgConfidence

        addDebugMessage(`Transcript confidence: ${avgConfidence}`)
      } catch (err) {
        addDebugMessage(`Error processing transcript confidence: ${err}`)
      }
    },
    [addDebugMessage],
  )

  // Function to clean up resources
  const cleanup = useCallback(() => {
    addDebugMessage("Cleaning up resources")

    // Close data channel
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close()
      } catch (err) {
        addDebugMessage(`Error closing data channel: ${err}`)
      }
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close()
      } catch (err) {
        addDebugMessage(`Error closing peer connection: ${err}`)
      }
      peerConnectionRef.current = null
    }

    // Stop local stream
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      } catch (err) {
        addDebugMessage(`Error stopping audio tracks: ${err}`)
      }
      localStreamRef.current = null
    }

    // Reset session info
    sessionInfoRef.current = null

    // Reset reconnect attempts
    reconnectAttemptsRef.current = 0

    // Reset transcript refs
    currentUserTranscriptRef.current = ""
    currentAssistantTextRef.current = ""
    transcriptConfidenceRef.current = null

    // Reset live states
    setLiveTranscript(null)
    setAiCaptions("")
    setIsUserSpeaking(false)
  }, [addDebugMessage])

  // Create and exchange SDP offer/answer directly with OpenAI
  const setupWebRTC = useCallback(
    async (sessionId: string, token: string, model?: string) => {
      try {
        if (!localStreamRef.current) {
          throw new Error("No local stream available")
        }

        addDebugMessage("Setting up WebRTC connection...")
        setStatus("creating_offer")

        // Create a new RTCPeerConnection
        const configuration: RTCConfiguration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun1.l.google.com:19302" }],
        }

        // Try to get TURN servers from our API
        try {
          const turnResponse = await fetch("/api/ice-servers")
          if (turnResponse.ok) {
            const turnData = await turnResponse.json()
            if (turnData.iceServers && turnData.iceServers.length > 0) {
              configuration.iceServers = turnData.iceServers
              addDebugMessage(`Using ${turnData.iceServers.length} ICE servers from API`)
            }
          }
        } catch (err) {
          addDebugMessage(`Failed to get TURN servers: ${err}. Using default STUN servers.`)
        }

        const peerConnection = new RTCPeerConnection(configuration)
        peerConnectionRef.current = peerConnection

        // Create data channel for events BEFORE creating the offer
        addDebugMessage("Creating RTCDataChannel for events...")
        const dataChannel = peerConnection.createDataChannel("oai-events", {
          ordered: true,
          protocol: "json",
        })
        dataChannelRef.current = dataChannel

        // Set up data channel event handlers
        dataChannel.onopen = () => {
          addDebugMessage("RTCDataChannel 'oai-events' OPENED")
          setStatus("data_channel_open")

          // Now that the data channel is open, we can consider the connection active
          setIsActive(true)
          setIsConnecting(false)

          // Send initial response.create to start the conversation
          addDebugMessage("Sending initial response.create over data channel...")
          dataChannel.send(
            JSON.stringify({
              type: "response.create",
            }),
          )
        }

        dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            addDebugMessage(`RTCDataChannel received message type: ${data.type}`)

            // Handle different event types from OpenAI
            switch (data.type) {
              // Audio data from the AI
              case "response.audio.delta":
                if (data.delta) {
                  const audioData = base64ToArrayBuffer(data.delta)
                  handleAudioData(audioData)
                }
                break

              // Text response from the AI
              case "response.text.delta":
                if (data.delta) {
                  // Accumulate the assistant's text
                  currentAssistantTextRef.current += data.delta
                  // Update the live transcript for UI
                  updateLiveTranscript("assistant", currentAssistantTextRef.current)
                }
                break

              // Transcript of the AI's audio (for captions)
              case "response.audio_transcript.delta":
                if (data.delta) {
                  setAiCaptions((prev) => prev + data.delta)
                }
                break

              // Transcript of user's speech
              case "conversation.item.input_audio_transcription.delta":
                if (data.delta) {
                  // Accumulate the user's transcript
                  currentUserTranscriptRef.current += data.delta
                  // Update the live transcript for UI
                  updateLiveTranscript("user", currentUserTranscriptRef.current)
                }
                break

              // Final transcript of user's speech
              case "conversation.item.input_audio_transcription.completed":
                // Use the final transcript from the event if available
                const finalUserTranscript = data.transcript || currentUserTranscriptRef.current
                // Add the finalized user message
                addMessage("user", finalUserTranscript, transcriptConfidenceRef.current || undefined)
                // Process confidence scores if available
                if (data.logprobs) {
                  handleTranscriptConfidence(data.logprobs)
                }
                break

              // Response is complete
              case "response.done":
                // Finalize the assistant's message if there's content
                if (currentAssistantTextRef.current.trim()) {
                  addMessage("assistant", currentAssistantTextRef.current.trim())
                }
                // Reset captions
                setAiCaptions("")
                break

              // User started speaking (VAD)
              case "input_audio_buffer.speech_started":
                setIsUserSpeaking(true)
                break

              // User stopped speaking (VAD)
              case "input_audio_buffer.speech_stopped":
                setIsUserSpeaking(false)
                break

              // Error from OpenAI
              case "error":
                addDebugMessage(`OpenAI error: ${JSON.stringify(data.error)}`)
                setError(`OpenAI error: ${data.error?.message || "Unknown error"}`)
                break

              // Default case for unhandled events
              default:
                addDebugMessage(`Unhandled event type: ${data.type}`)
            }
          } catch (err) {
            addDebugMessage(`Error parsing RTCDataChannel message: ${err instanceof Error ? err.message : String(err)}`)
          }
        }

        dataChannel.onerror = (error) => {
          addDebugMessage(`RTCDataChannel error: ${error}`)
          setError("WebRTC Data Channel error")
        }

        dataChannel.onclose = () => {
          addDebugMessage("RTCDataChannel 'oai-events' CLOSED")
          if (isActive) {
            setError("WebRTC Data Channel closed unexpectedly")
            setStatus("error")
            setIsActive(false)
          }
        }

        // Add the local stream to the peer connection
        const audioTrack = localStreamRef.current.getAudioTracks()[0]
        audioSenderRef.current = peerConnection.addTrack(audioTrack, localStreamRef.current)

        // Set up event handlers
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            addDebugMessage(`New ICE candidate: ${event.candidate.candidate.substring(0, 50)}...`)
          } else {
            addDebugMessage("ICE gathering complete")
          }
        }

        peerConnection.oniceconnectionstatechange = () => {
          addDebugMessage(`ICE connection state: ${peerConnection.iceConnectionState}`)

          if (
            peerConnection.iceConnectionState === "failed" ||
            peerConnection.iceConnectionState === "disconnected" ||
            peerConnection.iceConnectionState === "closed"
          ) {
            addDebugMessage("ICE connection failed or disconnected")
            if (isActive) {
              setError("WebRTC connection lost")
              setStatus("error")
              setIsActive(false)
            }
          }
        }

        // Handle incoming audio tracks from OpenAI
        peerConnection.ontrack = (event) => {
          addDebugMessage(`Received remote track: ${event.track.kind}`)

          // Connect the remote stream to the audio element
          if (event.streams && event.streams[0]) {
            if (aiAudioRef.current) {
              aiAudioRef.current.srcObject = event.streams[0]
              aiAudioRef.current.play().catch((err) => {
                addDebugMessage(`Error playing AI audio: ${err}`)
              })
              addDebugMessage("Attached remote stream to AI audio element for playback")
            } else {
              addDebugMessage("AI audio element ref is null. Cannot play AI audio.")
            }
          } else {
            addDebugMessage("No streams in the track event. Cannot play AI audio.")
          }
        }

        // Create an offer
        addDebugMessage("Creating SDP offer...")
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        })

        // Set local description
        await peerConnection.setLocalDescription(offer)

        // Wait for ICE gathering to complete
        if (peerConnection.iceGatheringState !== "complete") {
          await new Promise<void>((resolve) => {
            const checkState = () => {
              if (peerConnection.iceGatheringState === "complete") {
                resolve()
              } else {
                setTimeout(checkState, 100)
              }
            }
            checkState()
          })
        }

        // Get the complete offer with ICE candidates
        const completeOffer = peerConnection.localDescription?.sdp
        if (!completeOffer) {
          throw new Error("Failed to create SDP offer")
        }

        // Exchange SDP directly with OpenAI
        addDebugMessage("Exchanging SDP directly with OpenAI...")
        setStatus("exchanging_sdp")

        try {
          // Construct the URL for the OpenAI Realtime API
          const modelParam = model ? `model=${encodeURIComponent(model)}` : ""
          const sessionParam = `session_id=${encodeURIComponent(sessionId)}`
          const url = `https://api.openai.com/v1/realtime?${modelParam ? `${modelParam}&` : ""}${sessionParam}`

          addDebugMessage(`Sending SDP offer directly to OpenAI: ${url}`)

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/sdp",
              Authorization: `Bearer ${token}`, // Using the ephemeral token
              "OpenAI-Beta": "realtime",
            },
            body: completeOffer, // Send the raw SDP offer
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`SDP exchange failed (${response.status}): ${errorText}`)
          }

          // Get the SDP answer as text
          const answerSdp = await response.text()
          addDebugMessage("Received SDP answer from OpenAI")

          // Set remote description
          const answer = new RTCSessionDescription({
            type: "answer",
            sdp: answerSdp,
          })

          await peerConnection.setRemoteDescription(answer)
          addDebugMessage("Remote description set successfully")

          // Now we wait for the data channel to open (handled in dataChannel.onopen)
          setStatus("connecting_webrtc")

          // Return a promise that resolves when the data channel opens
          return new Promise<void>((resolve, reject) => {
            // Set a timeout in case the data channel doesn't open
            const timeout = setTimeout(() => {
              if (dataChannelRef.current?.readyState !== "open") {
                reject(new Error("Data channel failed to open within timeout"))
              }
            }, 10000) // 10 second timeout

            // Check if the data channel is already open
            if (dataChannelRef.current?.readyState === "open") {
              clearTimeout(timeout)
              resolve()
            } else {
              // Set up a one-time event listener for the data channel opening
              const onOpen = () => {
                clearTimeout(timeout)
                resolve()
              }

              // Store the original onopen handler
              const originalOnOpen = dataChannel.onopen

              // Replace with our handler that calls both
              dataChannel.onopen = (event) => {
                // Call the original handler
                if (originalOnOpen) {
                  originalOnOpen.call(dataChannel, event)
                }
                // Call our resolver
                onOpen()
              }
            }
          })
        } catch (err) {
          addDebugMessage(
            `Error during direct SDP exchange with OpenAI: ${err instanceof Error ? err.message : String(err)}`,
          )
          throw err
        }
      } catch (err) {
        addDebugMessage(`WebRTC setup error: ${err instanceof Error ? err.message : String(err)}`)
        throw err
      }
    },
    [
      addDebugMessage,
      handleAudioData,
      aiAudioRef,
      addMessage,
      isActive,
      updateLiveTranscript,
      handleTranscriptConfidence,
    ],
  )

  const start = useCallback(
    async (jobTitle: string, resumeData?: any) => {
      try {
        setStatus("requesting_mic")
        setError(null)
        setIsConnecting(true)
        addDebugMessage("Starting interview session...")

        // Request microphone access
        try {
          addDebugMessage("Requesting microphone access...")
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          localStreamRef.current = stream
          addDebugMessage(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)
        } catch (err) {
          addDebugMessage(`Error accessing microphone: ${err instanceof Error ? err.message : String(err)}`)
          throw new Error(`Microphone access denied: ${err instanceof Error ? err.message : String(err)}`)
        }

        // Test API connection
        try {
          setStatus("testing_api")
          addDebugMessage("Testing API connection...")
          const testResponse = await fetch("/api/test-openai")
          const testData = await testResponse.json()

          if (testData.status !== "success") {
            throw new Error("OpenAI API test failed. The service is currently unavailable.")
          }
        } catch (err) {
          addDebugMessage(`API test failed: ${err instanceof Error ? err.message : String(err)}`)
          throw err
        }

        // Fetch session token
        try {
          setStatus("fetching_token")
          addDebugMessage("Fetching session token...")
          addDebugMessage("Calling /api/realtime-session...")

          // Prepare resume text if available
          let resumeText = ""
          if (resumeData) {
            if (resumeData.skills) resumeText += `Skills: ${resumeData.skills}\n`
            if (resumeData.experience) resumeText += `Experience: ${resumeData.experience}\n`
            if (resumeData.education) resumeText += `Education: ${resumeData.education}\n`
            if (resumeData.achievements) resumeText += `Achievements: ${resumeData.achievements}\n`
          }

          const tokenResponse = await fetch("/api/realtime-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobTitle: jobTitle,
              resumeText: resumeText?.trim() || "",
              // Add optimized VAD settings
              turnDetection: {
                enabled: true,
                silence_threshold: 1.0,
                speech_threshold: 0.5,
                silence_duration_ms: 800, // Increased from default for better interview experience
                type: "semantic_vad", // Use semantic VAD for more natural turn-taking
              },
            }),
          })

          addDebugMessage(`/api/realtime-session response status: ${tokenResponse.status}`)

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            addDebugMessage(`/api/realtime-session error: ${errorText}`)
            throw new Error(`Failed to get session token (status ${tokenResponse.status}): ${errorText}`)
          }

          addDebugMessage("Successfully called /api/realtime-session")
          const sessionData = await tokenResponse.json()
          const { token, id: sessionId, model, usedFallbackModel } = sessionData

          sessionInfoRef.current = { id: sessionId, token, model }

          addDebugMessage(`Token received: ${sessionId}${usedFallbackModel ? " (using fallback model)" : ""}`)
          if (model) {
            addDebugMessage(`Using model: ${model}`)
          }
        } catch (err) {
          addDebugMessage(`Error fetching token: ${err instanceof Error ? err.message : String(err)}`)
          throw err
        }

        // Set up WebRTC
        try {
          if (!sessionInfoRef.current) {
            throw new Error("Session info is null after token fetch")
          }

          const { id: sessionId, token, model } = sessionInfoRef.current
          addDebugMessage("Attempting to setup WebRTC...")
          await setupWebRTC(sessionId, token, model)

          // If we get here, WebRTC setup was successful and the data channel is open
          addDebugMessage("WebRTC setup complete and data channel is open")
          setStatus("active")
        } catch (err) {
          addDebugMessage(`ERROR during setupWebRTC: ${err instanceof Error ? err.message : String(err)}`)
          throw err
        }
      } catch (err) {
        addDebugMessage(`Error starting interview: ${err instanceof Error ? err.message : String(err)}`)
        setError(err instanceof Error ? err.message : "Failed to start interview")
        setStatus("error")
        setIsConnecting(false)
        cleanup()
      }
    },
    [addDebugMessage, setupWebRTC, cleanup],
  )

  const stop = useCallback(() => {
    addDebugMessage("Ending interview...")
    cleanup()
    setStatus("ended")
    setIsConnecting(false)
    setIsActive(false)
    addDebugMessage("Interview ended")
  }, [addDebugMessage, cleanup])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

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
    isUserSpeaking,
    aiCaptions,
    liveTranscript,
    start,
    stop,
    addDebugMessage,
    localStreamRef,
    aiAudioRef,
    peerConnection: peerConnectionRef.current,
    dataChannel: dataChannelRef.current,
  }
}
