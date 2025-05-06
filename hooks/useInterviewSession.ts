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

// Interface for ICE servers response
interface IceServersResponse {
  iceServers: Array<{
    urls: string | string[]
    username?: string
    credential?: string
  }>
}

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
  const iceErrorCount = useRef<number>(0)
  const stunServersAttempted = useRef<Set<string>>(new Set())
  const currentStunServerIndex = useRef<number>(0)

  // List of reliable STUN servers to try in sequence if one fails
  const fallbackStunServers = [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:stun3.l.google.com:19302",
    "stun:stun4.l.google.com:19302",
    "stun:stun.stunprotocol.org:3478",
    "stun:stun.voip.blackberry.com:3478",
    "stun:stun.nextcloud.com:443",
  ]

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

      // If we've had STUN binding timeout errors, try a different STUN server
      if (iceErrorCount.current > 0 && currentStunServerIndex.current < fallbackStunServers.length - 1) {
        currentStunServerIndex.current++
        const nextStunServer = fallbackStunServers[currentStunServerIndex.current]

        // Only use this STUN server if we haven't tried it yet
        if (!stunServersAttempted.current.has(nextStunServer)) {
          stunServersAttempted.current.add(nextStunServer)
          addDebugMessage(`Trying alternative STUN server: ${nextStunServer}`)

          // Replace the first STUN server with our next fallback
          const modifiedIceServers = [...data.iceServers]
          modifiedIceServers[0] = { urls: nextStunServer }

          return {
            iceServers: modifiedIceServers,
            iceCandidatePoolSize: 10,
            iceTransportPolicy: "all",
            rtcpMuxPolicy: "require",
          }
        }
      }

      return {
        iceServers: data.iceServers,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all",
        rtcpMuxPolicy: "require",
      }
    } catch (error) {
      console.error("Error fetching ICE servers:", error)
      addDebugMessage(`Error fetching ICE servers: ${error instanceof Error ? error.message : String(error)}`)

      // Always return a valid fallback configuration
      addDebugMessage("Using fallback static ICE configuration")

      // If we've had STUN binding timeout errors, try a different STUN server
      let stunServers = [fallbackStunServers[0]]
      if (iceErrorCount.current > 0 && currentStunServerIndex.current < fallbackStunServers.length - 1) {
        currentStunServerIndex.current++
        const nextStunServer = fallbackStunServers[currentStunServerIndex.current]

        // Only use this STUN server if we haven't tried it yet
        if (!stunServersAttempted.current.has(nextStunServer)) {
          stunServersAttempted.current.add(nextStunServer)
          addDebugMessage(`Trying alternative STUN server: ${nextStunServer}`)
          stunServers = [nextStunServer]
        }
      }

      // Define a fallback configuration with the selected STUN servers
      const fallbackConfig: RTCConfiguration = {
        iceServers: stunServers.map((url) => ({ urls: url })),
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all",
        rtcpMuxPolicy: "require",
      }

      // Add TURN servers if credentials are available
      const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
      const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

      if (turnUsername && turnCredential) {
        fallbackConfig.iceServers.push({
          urls: ["turn:global.xirsys.net:3478?transport=udp", "turn:global.xirsys.net:5349?transport=tcp"],
          username: turnUsername,
          credential: turnCredential,
        })
        addDebugMessage("Added TURN servers to fallback configuration")
      }

      return fallbackConfig
    }
  }, [addDebugMessage])

  // Function to retry connection with a different STUN server
  const retryWithDifferentStunServer = useCallback(
    async (jobRole: string) => {
      addDebugMessage("Retrying connection with a different STUN server...")

      // Clean up existing connection
      if (peerConnection.current) {
        peerConnection.current.close()
        peerConnection.current = null
      }

      if (dataChannel.current) {
        dataChannel.current.close()
        dataChannel.current = null
      }

      // Try to start again with a new STUN server
      try {
        await start(jobRole)
      } catch (error) {
        console.error("Retry with different STUN server failed:", error)
        addDebugMessage(`Retry failed: ${error instanceof Error ? error.message : String(error)}`)

        // If we've tried multiple STUN servers and still failed, show a more helpful error
        if (stunServersAttempted.current.size >= 3) {
          setError(
            "Unable to establish connection after multiple attempts. Your network may be blocking WebRTC connections. " +
              "Please try using a different network or the non-WebRTC mock interview mode.",
          )
        }
      }
    },
    [addDebugMessage, setError, start],
  )

  const start = useCallback(
    async (jobRole = "Software Engineer") => {
      try {
        setState((prev) => ({
          ...prev,
          status: "connecting",
          error: undefined,
          debug: "Starting interview session...",
        }))

        // Reset error count for this new attempt
        if (stunServersAttempted.current.size === 0) {
          iceErrorCount.current = 0
        }

        // Clear any existing timeout
        if (connectTimeoutRef.current) {
          clearTimeout(connectTimeoutRef.current)
          connectTimeoutRef.current = null
        }

        // 1. Get user's microphone
        addDebugMessage("Requesting microphone access...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStream.current = stream
        addDebugMessage("Microphone access granted")

        // 2. Fetch ephemeral token from our API
        addDebugMessage("Fetching OpenAI token...")
        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-vocahire-test-mode": "true", // Enable test mode for development
          },
          body: JSON.stringify({ jobRole }),
        })

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json()
          throw new Error(errorData.error || "Failed to create session")
        }

        const { token, sessionId: sid } = await tokenResponse.json()
        sessionId.current = sid
        addDebugMessage(`Token received, session ID: ${sid}`)

        // 3. Get ICE servers configuration
        const rtcConfig = await getIceServers()
        addDebugMessage(`Using ${rtcConfig.iceServers.length} ICE servers for WebRTC connection`)

        // Log the STUN servers we're using
        rtcConfig.iceServers.forEach((server, index) => {
          const urls = Array.isArray(server.urls) ? server.urls.join(", ") : server.urls
          addDebugMessage(`ICE Server ${index + 1}: ${urls}`)

          // Add to our attempted set
          if (typeof server.urls === "string") {
            stunServersAttempted.current.add(server.urls)
          } else if (Array.isArray(server.urls)) {
            server.urls.forEach((url) => stunServersAttempted.current.add(url))
          }
        })

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
            stop()
          }
        }, 15000)

        // Add local audio track
        stream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, stream)
        })
        addDebugMessage("Added local audio track")

        // Set up data channel for receiving transcripts
        const dc = pc.createDataChannel("oai-events")
        dataChannel.current = dc
        addDebugMessage("Created data channel")

        // Add enhanced event logging
        dc.onopen = () => {
          addDebugMessage("Data channel opened")

          // 1. Send session metadata
          const metadata = {
            userId: "user-123", // In a real app, get this from your auth system
            userName: "User", // In a real app, get this from your auth system
            jobRole,
            experienceYears: 3, // This could be from user profile or form input
            sessionType: "mock-interview",
          }

          try {
            dc.send(
              JSON.stringify({
                type: "session.update",
                metadata,
              }),
            )
            addDebugMessage(`Sent session metadata successfully`)
            console.debug("Sent session metadata:", metadata)
          } catch (err) {
            console.error("Failed to send session metadata:", err)
            addDebugMessage(`Failed to send session metadata: ${err instanceof Error ? err.message : String(err)}`)
          }

          // 2. Send system-level prompt
          const systemPrompt = getSystemPrompt(jobRole, metadata.userName, metadata.experienceYears)

          try {
            dc.send(
              JSON.stringify({
                type: "conversation.item.create",
                item: {
                  role: "system",
                  content: systemPrompt,
                },
              }),
            )
            addDebugMessage("Sent system prompt successfully")
            console.debug("Sent system prompt:", systemPrompt)
          } catch (err) {
            console.error("Failed to send system prompt:", err)
            addDebugMessage(`Failed to send system prompt: ${err instanceof Error ? err.message : String(err)}`)
          }
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

        // Log ICE connection state changes
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
          }

          // Handle disconnection
          if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            addDebugMessage(`ICE connection ${pc.iceConnectionState} - attempting to recover...`)

            if (pc.iceConnectionState === "failed") {
              // If we have STUN binding timeout errors and haven't tried too many servers yet,
              // attempt to retry with a different STUN server
              if (
                iceErrorCount.current > 0 &&
                stunServersAttempted.current.size < 3 &&
                currentStunServerIndex.current < fallbackStunServers.length - 1
              ) {
                addDebugMessage("Will attempt to retry with a different STUN server")
                stop()
                // Wait a moment before retrying
                setTimeout(() => {
                  retryWithDifferentStunServer(jobRole)
                }, 1000)
              } else {
                setError(
                  "Connection failed. Your network may be blocking WebRTC connections. " +
                    "Please try using a different network or the non-WebRTC mock interview mode.",
                )
                stop()
              }
            }
          }
        }

        // Log signaling state changes
        pc.onsignalingstatechange = () => {
          addDebugMessage(`Signaling state: ${pc.signalingState}`)
          console.debug("Signaling state changed:", pc.signalingState)
        }

        // Log ICE candidate errors with improved handling
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

            console.error("ICE Candidate Error:", errorInfo)
            addDebugMessage(`ICE Candidate Error: Code ${errorInfo.errorCode} - ${errorInfo.errorText}`)

            // Increment error count
            iceErrorCount.current += 1

            // Specifically handle STUN binding timeout errors (701)
            if (errorInfo.errorCode === 701 && errorInfo.errorText.includes("STUN binding request timed out")) {
              addDebugMessage("STUN binding request timed out - likely network restriction")

              // If we're still in the connecting phase and have had multiple timeouts,
              // try a different STUN server
              if (
                pc.iceConnectionState !== "connected" &&
                pc.iceConnectionState !== "completed" &&
                iceErrorCount.current >= 3 &&
                stunServersAttempted.current.size < 3 &&
                currentStunServerIndex.current < fallbackStunServers.length - 1
              ) {
                addDebugMessage("Multiple STUN timeouts - will try a different STUN server")

                // Clear the existing timeout since we're going to retry
                if (connectTimeoutRef.current) {
                  clearTimeout(connectTimeoutRef.current)
                  connectTimeoutRef.current = null
                }

                stop()

                // Wait a moment before retrying
                setTimeout(() => {
                  retryWithDifferentStunServer(jobRole)
                }, 1000)

                return
              }

              // If we've tried multiple STUN servers or have too many errors, show a helpful message
              if (stunServersAttempted.current.size >= 3 || iceErrorCount.current >= 8) {
                setError(
                  "Network connectivity issue detected. Your network appears to be blocking WebRTC connections. " +
                    "This is common on corporate networks, VPNs, or networks with strict firewalls. " +
                    "Please try using a different network (like a mobile hotspot) or use the non-WebRTC mock interview mode.",
                )
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

        // We don't need to manually add a welcome message anymore since the AI will greet the user
        // based on the system prompt
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
        stop()
        throw error // Re-throw to allow the component to handle the error
      }
    },
    [addMessage, addDebugMessage, setError, getIceServers, retryWithDifferentStunServer, stop],
  )

  const stop = useCallback(() => {
    addDebugMessage("Stopping interview session...")

    // Clear connection timeout if it exists
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    // Close data channel
    if (dataChannel.current) {
      try {
        dataChannel.current.close()
        addDebugMessage("Data channel closed")
      } catch (err) {
        console.error("Error closing data channel:", err)
        addDebugMessage(`Error closing data channel: ${err instanceof Error ? err.message : String(err)}`)
      }
      dataChannel.current = null
    }

    // Close peer connection
    if (peerConnection.current) {
      try {
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
      }
      stop()
    }
  }, [stop])

  return {
    ...state,
    start,
    stop,
    isConnecting: state.status === "connecting",
    isActive: state.status === "active",
  }
}
