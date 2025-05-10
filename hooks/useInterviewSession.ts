"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface InterviewSessionState {
  status: "idle" | "connecting" | "active" | "ended" | "error"
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: number
  }>
  error?: string
  debug?: string
}

interface UseInterviewSessionReturn extends InterviewSessionState {
  start: (jobRole?: string) => Promise<void>
  stop: () => void
  isConnecting: boolean
  isActive: boolean
}

// Define a system prompt for the interview
const getSystemPrompt = (jobRole: string, userName = "there", experienceYears = 3) =>
  `
You are VocaHire, an AI interview coach.
Your candidate is ${userName}, a ${jobRole} with ${experienceYears} years of experience.
Start by greeting them by name, then conduct a 10-minute mock interview focused on their role.
Ask relevant technical and behavioral questions that assess their skills and experience for a ${jobRole} role.
Listen carefully to their responses and ask follow-up questions.
Be professional, encouraging, and provide a realistic interview experience.
Keep your responses concise (1-3 sentences) to maintain conversation flow.
End by saying "This concludes our mock interview. I will now prepare your feedback."
`.trim()

export function useInterviewSession(): UseInterviewSessionReturn {
  const [state, setState] = useState<InterviewSessionState>({
    status: "idle",
    messages: [],
  })

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const dataChannel = useRef<RTCDataChannel | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const sessionId = useRef<string | null>(null)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dataChannelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const iceErrorCount = useRef<number>(0)
  const dataChannelReconnectAttempts = useRef<number>(0)
  const isReconnecting = useRef<boolean>(false)
  const systemPromptSent = useRef<boolean>(false)
  const metadataSent = useRef<boolean>(false)
  const lastJobRole = useRef<string>("")
  const pendingMessages = useRef<Array<any>>([]) // Store messages that couldn't be sent due to closed DataChannel
  const dataChannelErrorCount = useRef<number>(0)
  const isDataChannelEnabled = useRef<boolean>(true) // Flag to disable DataChannel if it consistently fails

  // Create audio element for AI voice output
  useEffect(() => {
    if (typeof window !== "undefined" && !audioElement.current) {
      const audio = new Audio()
      audio.autoplay = true
      audioElement.current = audio

      return () => {
        audio.srcObject = null
      }
    }
  }, [])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role, content, timestamp: Date.now() }],
    }))
  }, [])

  const addDebugMessage = useCallback((message: string) => {
    console.log("Debug:", message)
    setState((prev) => ({
      ...prev,
      debug: message,
    }))
  }, [])

  const setError = useCallback((errorMessage: string) => {
    setState((prev) => ({
      ...prev,
      status: "error",
      error: errorMessage,
    }))
  }, [])

  // Define the stop function first to avoid circular dependency
  const stopSession = useCallback(() => {
    addDebugMessage("Stopping interview session...")

    // Clear all timeouts
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    if (dataChannelTimeoutRef.current) {
      clearTimeout(dataChannelTimeoutRef.current)
      dataChannelTimeoutRef.current = null
    }

    // Reset reconnection flags
    isReconnecting.current = false

    // Clear pending messages
    pendingMessages.current = []

    // Close data channel with proper error handling
    if (dataChannel.current) {
      try {
        // Remove all event listeners first to prevent errors during close
        dataChannel.current.onopen = null
        dataChannel.current.onclose = null
        dataChannel.current.onerror = null
        dataChannel.current.onmessage = null

        // Check if the data channel is still open before trying to close it
        if (dataChannel.current.readyState === "open") {
          dataChannel.current.close()
          addDebugMessage("Data channel closed")
        } else {
          addDebugMessage(`Data channel already in state: ${dataChannel.current.readyState}`)
        }
      } catch (err) {
        console.error("Error closing data channel:", err)
        addDebugMessage(`Error closing data channel: ${err instanceof Error ? err.message : String(err)}`)
      }
      dataChannel.current = null
    }

    // Close peer connection
    if (peerConnection.current) {
      try {
        // Remove all event listeners first to prevent errors during close
        peerConnection.current.oniceconnectionstatechange = null
        peerConnection.current.onsignalingstatechange = null
        peerConnection.current.onicecandidateerror = null
        peerConnection.current.onicegatheringstatechange = null
        peerConnection.current.onicecandidate = null
        peerConnection.current.ontrack = null

        peerConnection.current.close()
        addDebugMessage("Peer connection closed")
      } catch (err) {
        console.error("Error closing peer connection:", err)
        addDebugMessage(`Error closing peer connection: ${err instanceof Error ? err.message : String(err)}`)
      }
      peerConnection.current = null
    }

    // Stop local stream tracks
    if (localStream.current) {
      try {
        localStream.current.getTracks().forEach((track) => track.stop())
        addDebugMessage("Local audio tracks stopped")
      } catch (err) {
        console.error("Error stopping audio tracks:", err)
        addDebugMessage(`Error stopping audio tracks: ${err instanceof Error ? err.message : String(err)}`)
      }
      localStream.current = null
    }

    // Clear audio element
    if (audioElement.current) {
      audioElement.current.srcObject = null
      addDebugMessage("Audio element cleared")
    }

    setState((prev) => ({
      ...prev,
      status: prev.status === "error" ? "error" : "ended",
      debug: "Interview session ended",
    }))
  }, [addDebugMessage])

  // Function to safely send data through the data channel
  const safeSendThroughDataChannel = useCallback(
    (data: any, isRetry = false): boolean => {
      // If DataChannel is disabled, don't even try to send
      if (!isDataChannelEnabled.current) {
        if (!isRetry) {
          addDebugMessage("DataChannel is disabled, storing message for later")
          pendingMessages.current.push(data)
        }
        return false
      }

      // If we don't have a data channel, store the message for later
      if (!dataChannel.current) {
        if (!isRetry) {
          addDebugMessage("Cannot send data: DataChannel is null, storing for later")
          pendingMessages.current.push(data)
        }
        return false
      }

      // If the data channel isn't open, store the message for later
      if (dataChannel.current.readyState !== "open") {
        if (!isRetry) {
          addDebugMessage(
            `Cannot send data: DataChannel is not open (state: ${dataChannel.current.readyState}), storing for later`,
          )
          pendingMessages.current.push(data)
        }
        return false
      }

      try {
        dataChannel.current.send(JSON.stringify(data))
        return true
      } catch (err) {
        console.error("Error sending data through DataChannel:", err)
        addDebugMessage(`Error sending data: ${err instanceof Error ? err.message : String(err)}`)

        // If this is a new message (not a retry), store it for later
        if (!isRetry) {
          pendingMessages.current.push(data)
        }

        // Increment error count for sending failures
        dataChannelErrorCount.current += 1

        // If we've had too many errors, disable the DataChannel
        if (dataChannelErrorCount.current > 10) {
          addDebugMessage("Too many DataChannel errors, disabling DataChannel")
          isDataChannelEnabled.current = false

          // Try to close the DataChannel to prevent further errors
          try {
            if (dataChannel.current) {
              dataChannel.current.onopen = null
              dataChannel.current.onclose = null
              dataChannel.current.onerror = null
              dataChannel.current.onmessage = null

              if (dataChannel.current.readyState === "open") {
                dataChannel.current.close()
              }
              dataChannel.current = null
            }
          } catch (closeErr) {
            console.error("Error closing problematic DataChannel:", closeErr)
          }
        }

        return false
      }
    },
    [addDebugMessage],
  )

  // Function to attempt to send any pending messages
  const processPendingMessages = useCallback(() => {
    if (pendingMessages.current.length === 0 || !isDataChannelEnabled.current) return

    addDebugMessage(`Attempting to send ${pendingMessages.current.length} pending messages`)

    // Try to send each pending message
    const stillPending: any[] = []

    pendingMessages.current.forEach((message) => {
      const sent = safeSendThroughDataChannel(message, true)
      if (!sent) {
        stillPending.push(message)
      }
    })

    // Update the pending messages list
    pendingMessages.current = stillPending

    if (stillPending.length > 0) {
      addDebugMessage(`${stillPending.length} messages still pending`)
    } else {
      addDebugMessage("All pending messages sent successfully")
    }
  }, [addDebugMessage, safeSendThroughDataChannel])

  // Function to send system prompt
  const sendSystemPrompt = useCallback(
    (jobRole: string, userName = "there", experienceYears = 3) => {
      if (systemPromptSent.current) {
        addDebugMessage("System prompt already sent, skipping")
        return
      }

      const systemPrompt = getSystemPrompt(jobRole, userName, experienceYears)

      const success = safeSendThroughDataChannel({
        type: "conversation.item.create",
        item: {
          role: "system",
          content: systemPrompt,
        },
      })

      if (success) {
        addDebugMessage("Sent system prompt successfully")
        systemPromptSent.current = true
      } else {
        addDebugMessage("Failed to send system prompt - will retry when connection is established")
      }
    },
    [addDebugMessage, safeSendThroughDataChannel],
  )

  // Function to send session metadata
  const sendSessionMetadata = useCallback(
    (jobRole: string) => {
      if (metadataSent.current) {
        addDebugMessage("Session metadata already sent, skipping")
        return
      }

      const metadata = {
        userId: "user-123", // In a real app, get this from your auth system
        userName: "User", // In a real app, get this from your auth system
        jobRole,
        experienceYears: 3, // This could be from user profile or form input
        sessionType: "mock-interview",
      }

      const success = safeSendThroughDataChannel({
        type: "session.update",
        metadata,
      })

      if (success) {
        addDebugMessage("Sent session metadata successfully")
        metadataSent.current = true
      } else {
        addDebugMessage("Failed to send session metadata - will retry when connection is established")
      }
    },
    [addDebugMessage, safeSendThroughDataChannel],
  )

  // Function to get ICE servers configuration
  const getIceServers = useCallback(async (): Promise<RTCConfiguration> => {
    try {
      addDebugMessage("Fetching ICE servers from server...")

      // Use our server-side API route
      const response = await fetch("/api/ice-servers")

      if (!response.ok) {
        throw new Error(`Failed to fetch ICE servers: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("ICE servers response:", data)

      // Ensure we have a valid iceServers array
      if (!data.iceServers || !Array.isArray(data.iceServers) || data.iceServers.length === 0) {
        throw new Error("Invalid ICE servers configuration returned from server")
      }

      addDebugMessage(`Successfully fetched ICE servers: ${data.iceServers.length} servers`)

      return {
        iceServers: data.iceServers,
        iceCandidatePoolSize: 10,
        // Prefer IPv4 to avoid IPv6 issues
        iceTransportPolicy: "all",
        rtcpMuxPolicy: "require",
      }
    } catch (error) {
      console.error("Error fetching ICE servers:", error)
      addDebugMessage(`Error fetching ICE servers: ${error instanceof Error ? error.message : String(error)}`)

      // Always return a valid fallback configuration
      addDebugMessage("Using fallback static ICE configuration")

      // Define a fallback configuration with multiple reliable STUN servers
      // Use a variety of public STUN servers for redundancy
      // Avoid xirsys servers since they're causing errors
      return {
        iceServers: [
          // Google's STUN servers are very reliable and support IPv4
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          // Add only the most reliable public STUN servers
          { urls: "stun:stun.stunprotocol.org:3478" },
          // Removed problematic blackberry STUN server
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all", // Use "relay" if you want to force TURN
        rtcpMuxPolicy: "require",
      }
    }
  }, [addDebugMessage])

  // Function to set up the data channel
  const setupDataChannel = useCallback(
    (pc: RTCPeerConnection, jobRole: string) => {
      // If DataChannel is disabled, don't try to create one
      if (!isDataChannelEnabled.current) {
        addDebugMessage("DataChannel is disabled, skipping creation")
        return null
      }

      try {
        // Create data channel with more reliable settings
        const dc = pc.createDataChannel("oai-events", {
          ordered: true, // Guarantee message order
          maxRetransmits: 10, // Allow up to 10 retransmission attempts
        })

        dataChannel.current = dc
        addDebugMessage("Created data channel with reliability options")

        // Reset flags when creating a new data channel
        systemPromptSent.current = false
        metadataSent.current = false

        // Add enhanced event logging
        dc.onopen = () => {
          addDebugMessage("Data channel opened")
          dataChannelReconnectAttempts.current = 0 // Reset reconnect attempts on successful open
          dataChannelErrorCount.current = 0 // Reset error count on successful open

          // Clear any existing data channel timeout
          if (dataChannelTimeoutRef.current) {
            clearTimeout(dataChannelTimeoutRef.current)
            dataChannelTimeoutRef.current = null
          }

          // Send session metadata
          sendSessionMetadata(jobRole)

          // Send system-level prompt
          sendSystemPrompt(jobRole)

          // Try to send any pending messages
          processPendingMessages()
        }

        // Add detailed data channel error logging
        dc.onerror = (event) => {
          // Extract relevant properties instead of stringifying the entire event
          const errorInfo = {
            type: "data_channel_error",
            readyState: dc.readyState,
            timestamp: new Date().toISOString(),
          }

          console.error("DataChannel Error:", errorInfo)
          addDebugMessage(`DataChannel Error - Ready State: ${dc.readyState}`)

          // Increment error count
          dataChannelErrorCount.current += 1

          // If we've had too many errors, disable the DataChannel
          if (dataChannelErrorCount.current > 5) {
            addDebugMessage("Too many DataChannel errors, disabling DataChannel")
            isDataChannelEnabled.current = false

            // Try to close the DataChannel to prevent further errors
            try {
              dc.onopen = null
              dc.onclose = null
              dc.onerror = null
              dc.onmessage = null

              if (dc.readyState === "open") {
                dc.close()
              }
              dataChannel.current = null
            } catch (closeErr) {
              console.error("Error closing problematic DataChannel:", closeErr)
            }

            return
          }

          // If the data channel is closed due to an error and we still want to use DataChannels,
          // attempt to reopen it
          if (dc.readyState === "closed" && !isReconnecting.current && isDataChannelEnabled.current) {
            addDebugMessage("DataChannel closed due to error - attempting to reestablish")

            // Only attempt to reconnect if we haven't exceeded the maximum attempts
            if (dataChannelReconnectAttempts.current < 3) {
              dataChannelReconnectAttempts.current++

              // Wait a moment before attempting to recreate the data channel
              // Use exponential backoff for retries
              const delay = Math.min(1000 * Math.pow(2, dataChannelReconnectAttempts.current - 1), 10000)

              addDebugMessage(
                `Will attempt to recreate data channel in ${delay}ms (attempt ${dataChannelReconnectAttempts.current})`,
              )

              setTimeout(() => {
                if (
                  peerConnection.current &&
                  (peerConnection.current.connectionState === "connected" ||
                    peerConnection.current.iceConnectionState === "connected" ||
                    peerConnection.current.iceConnectionState === "completed")
                ) {
                  addDebugMessage(
                    `Attempting to recreate data channel (attempt ${dataChannelReconnectAttempts.current})`,
                  )
                  setupDataChannel(peerConnection.current, lastJobRole.current)
                } else {
                  addDebugMessage("Cannot recreate data channel - peer connection not in connected state")
                }
              }, delay)
            } else {
              addDebugMessage("Maximum data channel reconnection attempts reached, disabling DataChannel")
              isDataChannelEnabled.current = false
            }
          }
        }

        // Handle data channel closing
        dc.onclose = () => {
          addDebugMessage("Data channel closed")

          // If we're not in the process of stopping the session and the peer connection is still active,
          // try to reestablish the data channel
          if (
            state.status === "active" &&
            peerConnection.current &&
            (peerConnection.current.connectionState === "connected" ||
              peerConnection.current.iceConnectionState === "connected" ||
              peerConnection.current.iceConnectionState === "completed") &&
            !isReconnecting.current &&
            isDataChannelEnabled.current
          ) {
            addDebugMessage("Data channel unexpectedly closed - attempting to reestablish")

            // Only attempt to reconnect if we haven't exceeded the maximum attempts
            if (dataChannelReconnectAttempts.current < 3) {
              dataChannelReconnectAttempts.current++

              // Wait a moment before attempting to recreate the data channel
              // Use exponential backoff for retries
              const delay = Math.min(1000 * Math.pow(2, dataChannelReconnectAttempts.current - 1), 10000)

              addDebugMessage(
                `Will attempt to recreate data channel in ${delay}ms (attempt ${dataChannelReconnectAttempts.current})`,
              )

              // Set a timeout to recreate the data channel
              dataChannelTimeoutRef.current = setTimeout(() => {
                if (
                  peerConnection.current &&
                  (peerConnection.current.connectionState === "connected" ||
                    peerConnection.current.iceConnectionState === "connected" ||
                    peerConnection.current.iceConnectionState === "completed")
                ) {
                  addDebugMessage(
                    `Attempting to recreate data channel (attempt ${dataChannelReconnectAttempts.current})`,
                  )
                  setupDataChannel(peerConnection.current, lastJobRole.current)
                } else {
                  addDebugMessage("Cannot recreate data channel - peer connection not in connected state")
                }
              }, delay)
            } else {
              addDebugMessage("Maximum data channel reconnection attempts reached, disabling DataChannel")
              isDataChannelEnabled.current = false
            }
          }
        }

        // Enhanced message logging
        dc.onmessage = (event) => {
          console.debug("DataChannel Message Raw:", event.data)

          try {
            const data = JSON.parse(event.data)
            console.debug("Parsed DataChannel message:", data)

            if (data.type === "transcript" && data.transcript) {
              addMessage("user", data.transcript)
              addDebugMessage(`Received transcript: "${data.transcript.substring(0, 30)}..."`)
            } else if (data.type === "message" && data.content) {
              addMessage("assistant", data.content)
              addDebugMessage(`Received message: "${data.content.substring(0, 30)}..."`)
            } else if (data.type === "error") {
              const errorMessage = data.error?.message || JSON.stringify(data)
              addDebugMessage(`Error from OpenAI: ${errorMessage}`)
              console.error("OpenAI error:", data)
            } else {
              addDebugMessage(`Received data of type: ${data.type}`)
            }
          } catch (e) {
            console.error("Error parsing data channel message:", e)
            addDebugMessage(`Error parsing message: ${e instanceof Error ? e.message : String(e)}`)
          }
        }

        return dc
      } catch (error) {
        console.error("Error setting up data channel:", error)
        addDebugMessage(`Error setting up data channel: ${error instanceof Error ? error.message : String(error)}`)

        // If we can't set up the DataChannel, disable it
        isDataChannelEnabled.current = false
        return null
      }
    },
    [addDebugMessage, addMessage, processPendingMessages, sendSessionMetadata, sendSystemPrompt, state.status],
  )

  const startSession = useCallback(
    async (jobRole = "Software Engineer") => {
      try {
        setState((prev) => ({
          ...prev,
          status: "connecting",
          error: undefined,
          debug: "Starting interview session...",
        }))

        // Store the job role for potential reconnection attempts
        lastJobRole.current = jobRole

        // Reset flags and counters
        iceErrorCount.current = 0
        dataChannelReconnectAttempts.current = 0
        dataChannelErrorCount.current = 0
        isReconnecting.current = false
        systemPromptSent.current = false
        metadataSent.current = false
        pendingMessages.current = []
        isDataChannelEnabled.current = true // Re-enable DataChannel on new session

        // Clear any existing timeouts
        if (connectTimeoutRef.current) {
          clearTimeout(connectTimeoutRef.current)
          connectTimeoutRef.current = null
        }

        if (dataChannelTimeoutRef.current) {
          clearTimeout(dataChannelTimeoutRef.current)
          dataChannelTimeoutRef.current = null
        }

        // 1. Get user's microphone
        addDebugMessage("Requesting microphone access...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStream.current = stream
        addDebugMessage("Microphone access granted")

        // 2. Fetch ephemeral token from our API with timeout
        addDebugMessage("Fetching OpenAI token...")
        const tokenPromise = fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-vocahire-test-mode": "true", // Enable test mode for development
          },
          body: JSON.stringify({ jobRole }),
        })

        // Add a timeout to the fetch
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API request timed out after 10 seconds")), 10000),
        )

        // Race the fetch against the timeout
        const tokenResponse = (await Promise.race([tokenPromise, timeoutPromise]).catch((error) => {
          addDebugMessage(`API request failed: ${error.message}`)
          throw new Error(`Failed to get session token: ${error.message}`)
        })) as Response

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to create session: ${tokenResponse.status}`)
        }

        const { token, sessionId: sid } = await tokenResponse.json()
        sessionId.current = sid
        addDebugMessage(`Token received, session ID: ${sid}`)

        // 3. Get ICE servers configuration
        const rtcConfig = await getIceServers()
        addDebugMessage(`Using ${rtcConfig.iceServers.length} ICE servers for WebRTC connection`)

        // 4. Create and configure WebRTC peer connection
        const pc = new RTCPeerConnection(rtcConfig)
        peerConnection.current = pc

        // Expose the peer connection to the window object for the connection quality indicator
        if (typeof window !== "undefined") {
          // @ts-ignore - adding a property for demo purposes
          window._vocahirePeerConnection = pc
        }

        // Set up connection timeout (15 seconds)
        connectTimeoutRef.current = setTimeout(() => {
          if (pc.iceConnectionState !== "connected" && pc.iceConnectionState !== "completed") {
            addDebugMessage("ICE connection timed out after 15 seconds")
            setError("Unable to establish audio connection—please check your network or try again")
            stopSession()
          }
        }, 15000)

        // Add local audio track
        stream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, stream)
        })
        addDebugMessage("Added local audio track")

        // Set up data channel - but don't fail if it doesn't work
        try {
          setupDataChannel(pc, jobRole)
        } catch (dcError) {
          console.error("Error setting up initial data channel:", dcError)
          addDebugMessage(
            `Error setting up initial data channel: ${dcError instanceof Error ? dcError.message : String(dcError)}`,
          )
          // Continue without the data channel - we'll rely on audio only
          isDataChannelEnabled.current = false
        }

        // Handle incoming audio track with better logging
        pc.ontrack = (event) => {
          console.debug("Track event—setting up audio:", event.streams.length)
          addDebugMessage(`Received remote audio track: ${event.streams.length} streams`)
          if (audioElement.current && event.streams && event.streams.length > 0) {
            audioElement.current.srcObject = event.streams[0]
            addDebugMessage("Audio element connected to remote stream")
          } else {
            addDebugMessage("No audio streams available or audio element not ready")
          }
        }

        // Enhanced ICE connection state change handler with recovery attempts
        pc.oniceconnectionstatechange = () => {
          addDebugMessage(`ICE connection state: ${pc.iceConnectionState}`)
          console.debug("ICE connection state changed:", pc.iceConnectionState)

          // Clear timeout when connected
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            if (connectTimeoutRef.current) {
              clearTimeout(connectTimeoutRef.current)
              connectTimeoutRef.current = null
            }
            addDebugMessage("ICE connected successfully")

            // Reset error count on successful connection
            iceErrorCount.current = 0

            // If we're reconnecting, make sure to send system prompt and metadata again
            if (isReconnecting.current && dataChannel.current && dataChannel.current.readyState === "open") {
              addDebugMessage("Reconnected - resending metadata and system prompt")
              sendSessionMetadata(lastJobRole.current)
              sendSystemPrompt(lastJobRole.current)
              isReconnecting.current = false
            }

            // If the data channel is not open and we want to use DataChannels, try to recreate it
            if (isDataChannelEnabled.current && (!dataChannel.current || dataChannel.current.readyState !== "open")) {
              addDebugMessage("ICE connected but data channel not open - attempting to create/recreate data channel")
              setupDataChannel(pc, lastJobRole.current)
            }
          }

          // Handle disconnection with recovery attempts
          if (pc.iceConnectionState === "disconnected") {
            addDebugMessage("ICE connection disconnected - attempting to recover...")
            isReconnecting.current = true

            // Don't immediately fail - give it time to recover
            // Set a timeout to check if we recover
            setTimeout(() => {
              if (pc.iceConnectionState === "disconnected") {
                addDebugMessage("ICE connection still disconnected after timeout")
                // Still don't fail yet - WebRTC can often recover from disconnected state
              }
            }, 5000)
          }

          // Only fail on definite failure
          if (pc.iceConnectionState === "failed") {
            addDebugMessage("ICE connection failed - connection cannot be established")
            setError("Connection failed. Please check your network and try again.")
            stopSession()
          }
        }

        // Log signaling state changes
        pc.onsignalingstatechange = () => {
          addDebugMessage(`Signaling state: ${pc.signalingState}`)
          console.debug("Signaling state changed:", pc.signalingState)
        }

        // Enhance the ICE candidate error handling to better handle IPv6-related issues
        pc.onicecandidateerror = (event) => {
          // Extract relevant properties from the event
          if (event instanceof RTCPeerConnectionIceErrorEvent) {
            const errorInfo = {
              errorCode: event.errorCode,
              errorText: event.errorText,
              address: event.address,
              port: event.port,
              url: event.url,
            }

            // Check if this is an IPv6-related error
            const isIPv6Error =
              errorInfo.address &&
              (errorInfo.address.includes(":") ||
                (errorInfo.errorText && errorInfo.errorText.toLowerCase().includes("ipv6")))

            // Log differently based on error type
            if (isIPv6Error) {
              console.log("IPv6 ICE Candidate Error (expected, non-critical):", errorInfo)
              addDebugMessage(`IPv6 STUN lookup failed (normal) - using IPv4 fallbacks`)
              // Don't increment error count for expected IPv6 failures
              return
            } else {
              console.error("ICE Candidate Error:", errorInfo)
              addDebugMessage(`ICE Candidate Error: Code ${errorInfo.errorCode} - ${errorInfo.errorText}`)
            }

            // Increment error count for non-IPv6 errors
            iceErrorCount.current += 1

            // STUN host lookup errors (701) are common and often not fatal
            if (errorInfo.errorCode === 701) {
              // If this is a known problematic STUN server, ignore it
              if (
                errorInfo.url &&
                (errorInfo.url.includes("xirsys") ||
                  errorInfo.url.includes("blackberry") ||
                  errorInfo.url.includes("nextcloud"))
              ) {
                addDebugMessage("Known problematic STUN server unreachable, using fallback servers")
                // Don't increment the error count for these errors
                iceErrorCount.current -= 1
                return
              }

              // If we're getting too many STUN errors, it might indicate a network issue
              if (iceErrorCount.current > 10) {
                // Only show the error to the user if we're still in the connecting state
                // and haven't successfully connected yet
                if (pc.iceConnectionState !== "connected" && pc.iceConnectionState !== "completed") {
                  addDebugMessage("Too many STUN errors - possible network issue")
                }
              }
            } else {
              // For other error types, we might want to be more aggressive
              if (
                iceErrorCount.current > 5 &&
                pc.iceConnectionState !== "connected" &&
                pc.iceConnectionState !== "completed"
              ) {
                addDebugMessage(`Persistent ICE errors: ${errorInfo.errorCode} - ${errorInfo.errorText}`)
              }
            }
          } else {
            console.error("Unknown ICE Candidate Error type")
            addDebugMessage("Unknown ICE Candidate Error type")
          }
        }

        // Log ICE gathering state changes
        pc.onicegatheringstatechange = () => {
          addDebugMessage(`ICE gathering state: ${pc.iceGatheringState}`)
          console.debug("ICE gathering state changed:", pc.iceGatheringState)
        }

        // Log individual ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.debug("New ICE candidate:", event.candidate)
            // Log more details about the candidate
            if (event.candidate.candidate) {
              addDebugMessage(`New ICE candidate: ${event.candidate.candidate.substring(0, 30)}...`)
            }
          } else {
            console.debug("All ICE candidates have been sent")
            addDebugMessage("All ICE candidates have been gathered")
          }
        }

        // Create offer
        addDebugMessage("Creating SDP offer...")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        addDebugMessage("Local description set")

        // Wait for ICE gathering to complete or timeout after 5 seconds
        addDebugMessage("Waiting for ICE gathering to complete...")
        await Promise.race([
          new Promise<void>((resolve) => {
            if (pc.iceGatheringState === "complete") {
              resolve()
            } else {
              const checkState = () => {
                if (pc.iceGatheringState === "complete") {
                  pc.removeEventListener("icegatheringstatechange", checkState)
                  resolve()
                }
              }
              pc.addEventListener("icegatheringstatechange", checkState)
            }
          }),
          new Promise<void>((resolve) => setTimeout(resolve, 5000)), // 5 second timeout
        ])

        // Even if ICE gathering isn't complete, we'll proceed after the timeout
        addDebugMessage(`ICE gathering state: ${pc.iceGatheringState}`)

        // Ensure we have a valid local description before proceeding
        if (!pc.localDescription || !pc.localDescription.sdp) {
          throw new Error("Failed to create local description")
        }

        // Send offer to OpenAI
        addDebugMessage("Sending SDP offer to OpenAI...")
        console.debug("SDP offer being sent (length):", pc.localDescription.sdp.length)

        const sdpResponse = await fetch("https://api.openai.com/v1/realtime", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/sdp",
          },
          body: pc.localDescription.sdp,
        })

        if (!sdpResponse.ok) {
          const errorText = await sdpResponse.text()
          console.error("SDP response error:", errorText)
          throw new Error(`Failed to establish connection with OpenAI: ${errorText}`)
        }

        const answerSDP = await sdpResponse.text()
        addDebugMessage("Received SDP answer from OpenAI")
        console.debug("SDP answer received (length):", answerSDP.length)

        await pc.setRemoteDescription({ type: "answer", sdp: answerSDP } as RTCSessionDescriptionInit)
        addDebugMessage("Remote description set")

        setState((prev) => ({ ...prev, status: "active", debug: "Interview session active" }))

        // Add a welcome message if we're not using the DataChannel
        if (!isDataChannelEnabled.current) {
          // Add a simulated welcome message since we can't receive one through the DataChannel
          setTimeout(() => {
            addMessage(
              "assistant",
              `Hello there! I'm your AI interviewer for this ${jobRole} position. Let's start the mock interview. Could you tell me a bit about your background and experience?`,
            )
          }, 2000)
        }
      } catch (error) {
        console.error("Error starting interview:", error)

        // Extract more detailed error information if available
        let errorMessage = "Unknown error occurred"
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "object" && error !== null) {
          errorMessage = String(error)
        }

        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
          debug: `Error: ${errorMessage}`,
        }))
        stopSession()
        throw error // Re-throw to allow the component to handle the error
      }
    },
    [
      addDebugMessage,
      addMessage,
      getIceServers,
      sendSessionMetadata,
      sendSystemPrompt,
      setError,
      setupDataChannel,
      stopSession,
    ],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
      }
      if (dataChannelTimeoutRef.current) {
        clearTimeout(dataChannelTimeoutRef.current)
      }
      stopSession()
    }
  }, [stopSession])

  return {
    ...state,
    start: startSession,
    stop: stopSession,
    isConnecting: state.status === "connecting",
    isActive: state.status === "active",
  }
}
