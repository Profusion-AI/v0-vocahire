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
  stop: (reason?: string) => void
  isConnecting: boolean
  isActive: boolean
}

// Mock interview data for fallback mode
const mockInterviewQuestions = [
  "Hello! I'll be conducting your interview today. Could you start by telling me a bit about your background and experience?",
  "That's interesting. Can you tell me about a challenging project you worked on recently?",
  "How do you approach problem-solving in your work?",
  "What are your strengths and weaknesses as a professional?",
  "Where do you see yourself in 5 years?",
  "Thank you for your time today. Do you have any questions for me?",
]

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

  // Error and reliability tracking refs
  const iceErrorCount = useRef<number>(0) // General ICE errors
  const xirsysTurnErrorCount = useRef<number>(0) // Specific Xirsys TURN/network interface errors
  const dataChannelReconnectAttempts = useRef<number>(0)
  const dataChannelErrorCount = useRef<number>(0)

  const isReconnecting = useRef<boolean>(false) // For ICE reconnection state
  const isStopping = useRef<boolean>(false) // To prevent actions during stop
  const systemPromptSent = useRef<boolean>(false)
  const metadataSent = useRef<boolean>(false)
  const lastJobRole = useRef<string>("")
  const pendingMessages = useRef<Array<any>>([])
  const messageHandlers = useRef<Set<(event: MessageEvent) => void>>(new Set())

  // Reliability and ICE strategy refs
  const unreliableStunServers = useRef<Set<string>>(new Set())
  const unreliableTurnServers = useRef<Set<string>>(new Set())
  const serverInitiatedDataChannelClose = useRef<boolean>(false) // If OpenAI closes DataChannel
  const isDataChannelEnabled = useRef<boolean>(true) // If DataChannel should be used/recreated
  const preferTcp = useRef<boolean>(false) // Strategy for next session attempt if current fails

  // Mock mode refs
  const isMockMode = useRef<boolean>(false)
  const mockQuestionIndex = useRef<number>(0)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
      debug: `${new Date().toISOString()} - ${message}\n${prev.debug || ""}`.substring(0, 1000),
    }))
  }, [])

  const setError = useCallback((errorMessage: string) => {
    setState((prev) => ({ ...prev, status: "error", error: errorMessage }))
  }, [])

  const cleanupDataChannelListeners = useCallback((dc: RTCDataChannel | null) => {
    if (!dc) return
    try {
      dc.onopen = null
      dc.onclose = null
      dc.onerror = null
      dc.onmessage = null
      messageHandlers.current.clear()
    } catch (err) {
      console.error("Error cleaning up DC listeners:", err)
    }
  }, [])

  const stopSession = useCallback(
    (reason = "user_initiated") => {
      if (isStopping.current && reason !== "force_stop") return // Prevent re-entry unless forced
      isStopping.current = true
      addDebugMessage(`Stopping interview session. Reason: ${reason}`)

      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
      if (dataChannelTimeoutRef.current) clearTimeout(dataChannelTimeoutRef.current)
      if (mockIntervalRef.current) clearTimeout(mockIntervalRef.current)

      connectTimeoutRef.current = null
      dataChannelTimeoutRef.current = null
      mockIntervalRef.current = null
      isReconnecting.current = false
      pendingMessages.current = []

      if (dataChannel.current) {
        try {
          cleanupDataChannelListeners(dataChannel.current)
          if (dataChannel.current.readyState === "open") dataChannel.current.close()
          addDebugMessage(
            `Data channel ${dataChannel.current.readyState === "open" ? "closed" : "already " + dataChannel.current.readyState}`,
          )
        } catch (err) {
          addDebugMessage(`Error closing DC: ${err}`)
        }
        dataChannel.current = null
      }

      if (peerConnection.current) {
        try {
          peerConnection.current.oniceconnectionstatechange = null
          peerConnection.current.onsignalingstatechange = null
          peerConnection.current.onicecandidateerror = null
          peerConnection.current.onicegatheringstatechange = null
          peerConnection.current.onicecandidate = null
          peerConnection.current.ontrack = null
          if (peerConnection.current.signalingState !== "closed") peerConnection.current.close()
          addDebugMessage(
            `Peer connection ${peerConnection.current.signalingState !== "closed" ? "closed" : "already closed"}`,
          )
        } catch (err) {
          addDebugMessage(`Error closing PC: ${err}`)
        }
        peerConnection.current = null
      }

      if (localStream.current) {
        try {
          localStream.current.getTracks().forEach((track) => track.stop())
          addDebugMessage("Local audio tracks stopped")
        } catch (err) {
          addDebugMessage(`Error stopping audio tracks: ${err}`)
        }
        localStream.current = null
      }

      if (audioElement.current) {
        audioElement.current.srcObject = null
        addDebugMessage("Audio element cleared")
      }

      // Reset mock mode
      isMockMode.current = false
      mockQuestionIndex.current = 0

      // serverInitiatedDataChannelClose is reset in startSession for the next attempt

      setState((prev) => ({
        ...prev,
        status: prev.status === "error" && reason !== "user_initiated" ? "error" : "ended",
        debug: `Interview session ended. Reason: ${reason}`,
      }))

      // Allow a brief moment for cleanup before resetting isStopping
      setTimeout(() => {
        isStopping.current = false
      }, 500)
    },
    [addDebugMessage, cleanupDataChannelListeners],
  )

  const safeSendThroughDataChannel = useCallback(
    (data: any, isRetry = false): boolean => {
      if (
        isStopping.current ||
        !isDataChannelEnabled.current ||
        !dataChannel.current ||
        dataChannel.current.readyState !== "open"
      ) {
        if (!isRetry && !isStopping.current) {
          addDebugMessage(
            `Cannot send: stopping=${isStopping.current}, dcEnabled=${isDataChannelEnabled.current}, dcNull=${!dataChannel.current}, dcState=${dataChannel.current?.readyState}`,
          )
          pendingMessages.current.push(data)
        }
        return false
      }
      try {
        const serializedData = JSON.stringify(data)
        dataChannel.current.send(serializedData)
        return true
      } catch (err) {
        addDebugMessage(`Error sending DC data: ${err}`)
        if (!isRetry) pendingMessages.current.push(data)
        dataChannelErrorCount.current += 1
        if (dataChannelErrorCount.current > 5) {
          addDebugMessage("Too many DC send errors, disabling DC.")
          isDataChannelEnabled.current = false
          // cleanupDataChannelListeners(dataChannel.current); // Already handled if it closes
          // if(dataChannel.current?.readyState === "open") dataChannel.current.close();
        }
        return false
      }
    },
    [addDebugMessage],
  )

  const processPendingMessages = useCallback(() => {
    if (pendingMessages.current.length === 0 || !isDataChannelEnabled.current || isStopping.current) return
    addDebugMessage(`Attempting to send ${pendingMessages.current.length} pending messages`)
    const stillPending: any[] = []
    pendingMessages.current.forEach((message) => {
      if (!safeSendThroughDataChannel(message, true)) stillPending.push(message)
    })
    pendingMessages.current = stillPending
    addDebugMessage(
      stillPending.length > 0 ? `${stillPending.length} messages still pending` : "All pending messages sent",
    )
  }, [addDebugMessage, safeSendThroughDataChannel])

  const sendSystemPrompt = useCallback(
    (jobRole: string, userName = "there", experienceYears = 3) => {
      if (systemPromptSent.current || isStopping.current || !isDataChannelEnabled.current) return
      const systemPrompt = getSystemPrompt(jobRole, userName, experienceYears)
      const success = safeSendThroughDataChannel({
        type: "conversation.item.create",
        item: { role: "system", content: systemPrompt },
      })
      if (success) {
        addDebugMessage("Sent system prompt")
        systemPromptSent.current = true
      } else addDebugMessage("Failed to send system prompt - will retry")
    },
    [addDebugMessage, safeSendThroughDataChannel],
  )

  const sendSessionMetadata = useCallback(
    (jobRole: string) => {
      if (metadataSent.current || isStopping.current || !isDataChannelEnabled.current) return
      const metadata = {
        userId: "user-123",
        userName: "User",
        jobRole,
        experienceYears: 3,
        sessionType: "mock-interview",
      }
      const success = safeSendThroughDataChannel({ type: "session.update", metadata })
      if (success) {
        addDebugMessage("Sent session metadata")
        metadataSent.current = true
      } else addDebugMessage("Failed to send session metadata - will retry")
    },
    [addDebugMessage, safeSendThroughDataChannel],
  )

  const filterIceServers = useCallback(
    (servers: RTCIceServer[]): RTCIceServer[] => {
      return servers.filter((server) => {
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
        const reliableUrls = urls.filter((url) => {
          const urlLower = url.toLowerCase()
          if (urlLower.startsWith("stun:") && unreliableStunServers.current.has(urlLower)) return false
          if (urlLower.startsWith("turn:") && unreliableTurnServers.current.has(urlLower)) return false
          return true
        })
        if (reliableUrls.length === 0 && urls.length > 0) {
          addDebugMessage(`Filtering out entirely unreliable server: ${urls.join(", ")}`)
          return false
        }
        server.urls = reliableUrls.length === 1 ? reliableUrls[0] : reliableUrls // Update server with only reliable URLs
        return true
      })
    },
    [addDebugMessage],
  )

  const getIceServers = useCallback(async (): Promise<RTCConfiguration> => {
    let iceServers: RTCIceServer[] = []
    let source = "none"
    try {
      addDebugMessage(`Fetching Xirsys ICE (preferTcp: ${preferTcp.current})...`)
      const response = await fetch("/api/xirsys-ice-servers") // This API should handle preferTcp if needed, or return all options
      if (!response.ok) throw new Error(`Xirsys API error: ${response.status}`)
      const data = await response.json()
      if (!data.iceServers || data.iceServers.length === 0) throw new Error("No ICE servers from Xirsys")
      iceServers = data.iceServers
      source = data.source || "xirsys" // Your backend xirsys route includes a source
      addDebugMessage(`Fetched ${iceServers.length} servers from ${source}`)
    } catch (xirsysError) {
      addDebugMessage(`Xirsys fetch failed: ${xirsysError}. Trying fallback API.`)
      try {
        const response = await fetch("/api/ice-servers") // Your original fallback
        if (!response.ok) throw new Error(`Fallback API error: ${response.status}`)
        const data = await response.json()
        if (!data.iceServers || data.iceServers.length === 0) throw new Error("No ICE servers from fallback")
        iceServers = data.iceServers
        source = "fallback_api"
        addDebugMessage(`Fetched ${iceServers.length} servers from ${source}`)
      } catch (fallbackApiError) {
        addDebugMessage(`Fallback API failed: ${fallbackApiError}. Using static STUN.`)
        iceServers = [{ urls: "stun:stun.l.google.com:19302" } /* more google stun */]
        source = "static_stun"
      }
    }

    const filteredServers = filterIceServers(iceServers)
    addDebugMessage(`Using ${filteredServers.length} ICE servers from ${source} after filtering.`)

    return {
      iceServers: filteredServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: "all", // Let browser choose best path initially
      rtcpMuxPolicy: "require",
    }
  }, [addDebugMessage, filterIceServers /* preferTcp is used for strategy, not direct fetch modification here */])

  const handleServerInitiatedDataChannelClose = useCallback(
    (reason: string) => {
      if (serverInitiatedDataChannelClose.current) return // Already handled
      serverInitiatedDataChannelClose.current = true
      isDataChannelEnabled.current = false // Disable further DC use for this session
      addDebugMessage(`Server initiated DataChannel close: ${reason}. Switching to audio-only mode.`)
      if (state.status === "active" && state.messages.length === 0 && !systemPromptSent.current) {
        setTimeout(() => {
          if (isStopping.current || state.status !== "active") return
          addMessage(
            "assistant",
            `Hello! I'm your AI interviewer for ${lastJobRole.current || "this role"}. Let's begin. Tell me about yourself.`,
          )
        }, 1500)
      }
    },
    [addDebugMessage, addMessage, state.status, state.messages.length],
  )

  const setupDataChannel = useCallback(
    (pc: RTCPeerConnection, jobRole: string) => {
      if (!isDataChannelEnabled.current || isStopping.current || serverInitiatedDataChannelClose.current) {
        addDebugMessage(
          `Skipping DC setup: enabled=${isDataChannelEnabled.current}, stopping=${isStopping.current}, serverClosed=${serverInitiatedDataChannelClose.current}`,
        )
        return null
      }
      try {
        const dc = pc.createDataChannel("oai-events") // OpenAI spec
        dataChannel.current = dc
        addDebugMessage("DataChannel created.")
        systemPromptSent.current = false
        metadataSent.current = false // Reset for new DC

        dc.onopen = () => {
          if (isStopping.current || serverInitiatedDataChannelClose.current) return
          addDebugMessage("DataChannel opened.")
          dataChannelReconnectAttempts.current = 0
          dataChannelErrorCount.current = 0
          if (dataChannelTimeoutRef.current) clearTimeout(dataChannelTimeoutRef.current)
          dataChannelTimeoutRef.current = null
          sendSessionMetadata(jobRole)
          sendSystemPrompt(jobRole)
          processPendingMessages()
        }

        dc.onerror = (event: Event) => {
          if (isStopping.current) return
          let errorName = "GenericDCError",
            errorMessage = "Unknown"
          if (event instanceof RTCErrorEvent) {
            errorName = event.error.name || "UnknownRTCError"
            errorMessage = event.error.message || "No message"
            // SCTP Cause Code 12: User-Initiated Abort (often server closing channel normally)
            if (event.error.sctpCauseCode === 12 || errorMessage.includes("User-Initiated Abort")) {
              handleServerInitiatedDataChannelClose(`SCTP Abort: ${errorName} - ${errorMessage}`)
              return
            }
          }
          addDebugMessage(`DataChannel Error - ${errorName}: ${errorMessage}. State: ${dc.readyState}`)
          dataChannelErrorCount.current += 1
          if (dataChannelErrorCount.current > 3 && !serverInitiatedDataChannelClose.current) {
            // Reduced threshold
            addDebugMessage("Too many DC errors, disabling DC for this session.")
            isDataChannelEnabled.current = false
            // No need to manually close here, onclose will handle if it transitions
          }
        }

        dc.onclose = () => {
          if (isStopping.current) {
            addDebugMessage("DC closed during stop.")
            return
          }
          if (serverInitiatedDataChannelClose.current) {
            addDebugMessage("DC closed by server (expected).")
            return
          }
          addDebugMessage("DataChannel closed unexpectedly.")
          if (
            state.status === "active" &&
            peerConnection.current &&
            (peerConnection.current.iceConnectionState === "connected" ||
              peerConnection.current.iceConnectionState === "completed") &&
            !isReconnecting.current &&
            isDataChannelEnabled.current
          ) {
            if (dataChannelReconnectAttempts.current < 2) {
              // Reduced attempts
              dataChannelReconnectAttempts.current++
              const delay = Math.min(1000 * Math.pow(2, dataChannelReconnectAttempts.current - 1), 5000)
              addDebugMessage(
                `Will attempt DC recreate in ${delay}ms (attempt ${dataChannelReconnectAttempts.current})`,
              )
              dataChannelTimeoutRef.current = setTimeout(() => {
                if (isStopping.current || serverInitiatedDataChannelClose.current || !isDataChannelEnabled.current)
                  return
                if (
                  peerConnection.current &&
                  (peerConnection.current.iceConnectionState === "connected" ||
                    peerConnection.current.iceConnectionState === "completed")
                ) {
                  addDebugMessage(`Recreating DC (attempt ${dataChannelReconnectAttempts.current})`)
                  setupDataChannel(peerConnection.current, lastJobRole.current || "Software Engineer")
                } else {
                  addDebugMessage("Cannot recreate DC - PC not connected.")
                }
              }, delay)
            } else {
              addDebugMessage("Max DC reconnections. Disabling DC for this session.")
              isDataChannelEnabled.current = false
              if (state.messages.length === 0 && !systemPromptSent.current) {
                /* simulate welcome */
              }
            }
          }
        }
        dc.onmessage = (event: MessageEvent) => {
          if (isStopping.current) return
          try {
            const data = JSON.parse(event.data)
            if (data.type === "transcript" && data.transcript) addMessage("user", data.transcript)
            else if (data.type === "message" && data.content) addMessage("assistant", data.content)
            else if (data.type === "error") {
              addDebugMessage(`Error from OpenAI DC: ${data.error?.message || JSON.stringify(data)}`)
              if (String(data.error?.message).match(/token|expired|invalid|unauthorized|permission/i)) {
                handleServerInitiatedDataChannelClose(`API Error: ${data.error.message}`)
              }
            }
          } catch (e) {
            addDebugMessage(`Error parsing DC message: ${e}`)
          }
        }
        messageHandlers.current.add(dc.onmessage) // Assuming this is how you track it
        return dc
      } catch (error) {
        addDebugMessage(`Error setting up DC: ${error}. Disabling DC.`)
        isDataChannelEnabled.current = false
        return null
      }
    },
    [
      addDebugMessage,
      addMessage,
      state.status,
      state.messages.length,
      sendSessionMetadata,
      sendSystemPrompt,
      processPendingMessages,
      handleServerInitiatedDataChannelClose /* ... other stable deps */,
    ],
  )

  // New function to start a mock interview session
  const startMockSession = useCallback(
    (jobRole: string) => {
      addDebugMessage("Starting mock interview session")
      isMockMode.current = true
      mockQuestionIndex.current = 0
      lastJobRole.current = jobRole

      setState((prev) => ({ ...prev, status: "active", error: undefined, messages: [] }))

      // Add the first question after a short delay
      setTimeout(() => {
        if (isStopping.current) return
        addMessage(
          "assistant",
          `Hello! I'm your AI interviewer for a ${jobRole} position. ${mockInterviewQuestions[0]}`,
        )
        mockQuestionIndex.current = 1
      }, 1500)

      // Set up a timer to simulate user responses and add new questions
      mockIntervalRef.current = setInterval(() => {
        if (isStopping.current || mockQuestionIndex.current >= mockInterviewQuestions.length) {
          if (mockIntervalRef.current) clearInterval(mockIntervalRef.current)
          return
        }

        // Simulate a delay between questions
        if (Math.random() > 0.7 && mockQuestionIndex.current < mockInterviewQuestions.length) {
          addMessage("assistant", mockInterviewQuestions[mockQuestionIndex.current])
          mockQuestionIndex.current++
        }
      }, 20000) // Ask a new question roughly every 20 seconds

      return true
    },
    [addDebugMessage, addMessage],
  )

  const startSession = useCallback(
    async (jobRole = "Software Engineer") => {
      addDebugMessage(`Attempting to start session. preferTcp strategy: ${preferTcp.current}`)
      try {
        setState((prev) => ({ ...prev, status: "connecting", error: undefined, debug: "Starting...", messages: [] }))
        isStopping.current = false
        lastJobRole.current = jobRole
        // Reset all relevant states for a new session attempt
        iceErrorCount.current = 0
        xirsysTurnErrorCount.current = 0
        dataChannelReconnectAttempts.current = 0
        dataChannelErrorCount.current = 0
        isReconnecting.current = false
        systemPromptSent.current = false
        metadataSent.current = false
        pendingMessages.current = []
        messageHandlers.current.clear()
        unreliableStunServers.current.clear()
        unreliableTurnServers.current.clear()
        serverInitiatedDataChannelClose.current = false // Crucial reset
        isDataChannelEnabled.current = true // Re-enable for new session
        isMockMode.current = false
        mockQuestionIndex.current = 0

        // `preferTcp.current` is NOT reset here; it's a strategy carried over for restarts.
        // It should be reset by the UI if the user starts a fresh session manually.
        // Or, reset it if this `startSession` is known to be a user's first click, not a programmatic restart.
        // For now, assume programmatic restarts might want to use the toggled preferTcp.

        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
        if (dataChannelTimeoutRef.current) clearTimeout(dataChannelTimeoutRef.current)
        if (mockIntervalRef.current) clearTimeout(mockIntervalRef.current)

        addDebugMessage("Requesting microphone...")
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
        addDebugMessage("Microphone granted.")

        // First, try to test the OpenAI API to see if we have a valid API key
        try {
          addDebugMessage("Testing OpenAI API connection...")
          const testResponse = await fetch("/api/test-openai")
          const testData = await testResponse.json()

          if (testData.status !== "success" || !testData.openaiResponse?.hasRealtimeModels) {
            addDebugMessage("OpenAI API test failed or no realtime models available. Falling back to mock mode.")
            return startMockSession(jobRole)
          }

          addDebugMessage("OpenAI API test successful. Proceeding with real-time session.")
        } catch (testError) {
          addDebugMessage(`OpenAI API test error: ${testError}. Falling back to mock mode.`)
          return startMockSession(jobRole)
        }

        addDebugMessage("Fetching OpenAI token...")
        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobRole }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          addDebugMessage(`Token API error: ${tokenResponse.status} - ${errorText}`)

          // If we get a 500 error, it's likely due to missing API key or other server issues
          // Fall back to mock mode
          if (tokenResponse.status === 500) {
            addDebugMessage("Token API error 500. Falling back to mock mode.")
            return startMockSession(jobRole)
          }

          throw new Error(`Token API error: ${tokenResponse.status}`)
        }

        const { token, sessionId: sid } = await tokenResponse.json()
        sessionId.current = sid
        addDebugMessage(`Token received: ${sid}`)

        const rtcConfig = await getIceServers() // This now uses preferTcp for its strategy if restarting

        const pc = new RTCPeerConnection(rtcConfig)
        peerConnection.current = pc
        // @ts-ignore
        if (typeof window !== "undefined") window._vocahirePeerConnection = pc

        connectTimeoutRef.current = setTimeout(() => {
          if (isStopping.current || pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed")
            return
          addDebugMessage("ICE connection timed out (30s) - CALLING stopSession()")
          setError("Audio connection timed out. Check network or try again.")
          stopSession("ice_timeout")
        }, 30000)

        localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current!))
        addDebugMessage("Local audio track added.")

        setupDataChannel(pc, jobRole) // Initial DC setup

        pc.ontrack = (event) => {
          if (isStopping.current) return
          addDebugMessage(`Remote track received: ${event.streams.length} streams`)
          if (audioElement.current && event.streams[0]) audioElement.current.srcObject = event.streams[0]
        }

        pc.oniceconnectionstatechange = () => {
          if (isStopping.current || !peerConnection.current) return // Guard against race conditions on stop
          const currentPC = peerConnection.current // Capture current PC for safety in async checks
          addDebugMessage(`ICE state: ${currentPC.iceConnectionState}`)
          if (currentPC.iceConnectionState === "connected" || currentPC.iceConnectionState === "completed") {
            if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
            addDebugMessage("ICE connected successfully.")
            iceErrorCount.current = 0
            xirsysTurnErrorCount.current = 0 // Reset errors on success
            isReconnecting.current = false
            if (
              isDataChannelEnabled.current &&
              !serverInitiatedDataChannelClose.current &&
              (!dataChannel.current || dataChannel.current.readyState !== "open")
            ) {
              addDebugMessage("ICE connected, but DC not open. Attempting DC setup/re-setup.")
              setupDataChannel(currentPC, lastJobRole.current)
            }
          } else if (currentPC.iceConnectionState === "disconnected") {
            addDebugMessage("ICE disconnected. Attempting recovery...")
            isReconnecting.current = true
            // WebRTC might recover on its own. Don't stop immediately.
          } else if (currentPC.iceConnectionState === "failed") {
            addDebugMessage("ICE connection failed - CALLING stopSession()")
            setError("Audio connection failed. Check network or try again.")
            stopSession("ice_failed")
          }
        }

        pc.onsignalingstatechange = () => {
          if (isStopping.current || !peerConnection.current) return
          addDebugMessage(`Signaling state: ${peerConnection.current.signalingState}`)
        }

        pc.onicecandidateerror = (event) => {
          if (isStopping.current || !peerConnection.current) return
          const currentPC = peerConnection.current // Capture current PC

          if (event instanceof RTCPeerConnectionIceErrorEvent) {
            const errorInfo = {
              errorCode: event.errorCode,
              errorText: event.errorText,
              address: event.address,
              port: event.port,
              url: event.url,
            }
            const { errorCode, errorText, url, address } = errorInfo

            const isIPv6 = url && (url.includes("[") || address?.includes(":")) // Simplified IPv6 check
            if (isIPv6 && errorCode === 701 && errorText?.includes("STUN host lookup")) {
              console.info("IPv6 STUN Lookup Issue (handled):", errorInfo)
              addDebugMessage(`IPv6 STUN issue (handled): ${url}`)
              return
            }

            const isStunTimeout = errorCode === 701 && errorText?.includes("STUN binding request timed out")
            if (isStunTimeout) {
              console.warn("STUN Server Timeout (handled):", errorInfo)
              addDebugMessage(`STUN timeout (handled): ${url}`)
              if (url && url.toLowerCase().startsWith("stun:")) unreliableStunServers.current.add(url.toLowerCase())
              return
            }

            const isXirsysTurnUrl =
              url && url.toLowerCase().includes("xirsys.com") && url.toLowerCase().startsWith("turn")
            const isProblematicTurnErrorText =
              errorText &&
              (errorText.includes("Address not associated") ||
                errorText.includes("network interface") ||
                errorText.includes("Failed to establish connection"))

            if (errorCode === 701 && isXirsysTurnUrl && isProblematicTurnErrorText) {
              console.warn("Xirsys TURN Server Issue (handling):", errorInfo)
              addDebugMessage(`Xirsys TURN issue (${errorText}): ${url}`)
              if (url) unreliableTurnServers.current.add(url.toLowerCase())

              xirsysTurnErrorCount.current += 1
              if (
                xirsysTurnErrorCount.current >= 2 && // Reduced threshold for Xirsys specific issues
                currentPC.iceConnectionState !== "connected" &&
                currentPC.iceConnectionState !== "completed"
              ) {
                addDebugMessage(
                  `Too many Xirsys TURN issues (${xirsysTurnErrorCount.current}). Restarting session, toggling TCP preference.`,
                )
                preferTcp.current = !preferTcp.current // Toggle for the next attempt
                stopSession("xirsys_turn_error_restart")
                setTimeout(() => {
                  if (isStopping.current) return
                  addDebugMessage(`Restarting session with preferTcp: ${preferTcp.current}`)
                  startSession(lastJobRole.current) // Recursive call for restart
                }, 1000)
                return
              }
              return
            }

            console.error("Generic ICE Candidate Error:", errorInfo)
            addDebugMessage(`Generic ICE Error: Code ${errorCode} - ${errorText} at ${url || "N/A"}`)
            iceErrorCount.current += 1
            if (url) {
              /* Add to unreliable lists if desired */
            }
            if (
              iceErrorCount.current > 5 &&
              currentPC.iceConnectionState !== "connected" &&
              currentPC.iceConnectionState !== "completed"
            ) {
              addDebugMessage("High general ICE error count. Connection may fail.")
            }
          } else {
            addDebugMessage("Unknown ICE Candidate Error type")
          }
        }

        pc.onicegatheringstatechange = () => {}
        pc.onicecandidate = (event) => {}

        addDebugMessage("Creating SDP offer...")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        addDebugMessage("Local description set.")

        addDebugMessage("Waiting for ICE gathering (max 5s)...")
        await new Promise<void>((resolve) => {
          // ICE Gathering wait
          if (pc.iceGatheringState === "complete") return resolve()
          const timeout = setTimeout(resolve, 5000)
          pc.addEventListener("icegatheringstatechange", function listener() {
            if (pc.iceGatheringState === "complete") {
              clearTimeout(timeout)
              pc.removeEventListener("icegatheringstatechange", listener)
              resolve()
            }
          })
        })
        addDebugMessage(`ICE gathering state after wait: ${pc.iceGatheringState}`)
        if (!pc.localDescription || !pc.localDescription.sdp)
          throw new Error("Local SDP is missing after ICE gathering.")

        addDebugMessage("Sending SDP offer to OpenAI...")
        const sdpResponse = await fetch("https://api.openai.com/v1/realtime", {
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${token}`,
            Model: "gpt-4o-realtime-preview-2024-12-17", // Updated to match the available model in your account
            "OpenAI-Beta": "realtime", // Add this header as it might be required
          },
          method: "POST",
          body: pc.localDescription.sdp,
        })
        if (!sdpResponse.ok) {
          const errorText = await sdpResponse.text()
          throw new Error(`OpenAI SDP offer error: ${sdpResponse.status} - ${errorText}`)
        }
        const answerSDP = await sdpResponse.text()
        addDebugMessage("Received SDP answer from OpenAI.")

        // Critical check before setRemoteDescription
        addDebugMessage(
          `Before setRemoteDescription - SignalingState: ${pc.signalingState}, ICEState: ${pc.iceConnectionState}`,
        )
        if (pc.signalingState === "closed") {
          throw new Error("PeerConnection is closed before setRemoteDescription. Aborting.")
        }
        await pc.setRemoteDescription({ type: "answer", sdp: answerSDP } as RTCSessionDescriptionInit)
        addDebugMessage("Remote description set.")

        setState((prev) => ({ ...prev, status: "active", debug: "Interview session active." }))
        if (!isDataChannelEnabled.current && !systemPromptSent.current) {
          /* simulate welcome */
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addDebugMessage(`Error starting interview: ${errorMessage} - CALLING stopSession() from main catch`)

        // If we encounter an error with the real-time session, fall back to mock mode
        if (!isMockMode.current) {
          addDebugMessage("Error with real-time session. Falling back to mock mode.")
          stopSession("real_time_error")
          return startMockSession(jobRole)
        }

        setError(errorMessage)
        stopSession("start_session_error") // Pass reason
        // No re-throw here, error is handled by setting state. UI can react to error state.
      }
    },
    [
      addDebugMessage,
      setError,
      getIceServers,
      setupDataChannel,
      stopSession,
      startMockSession /* other stable useCallback deps */,
    ],
  )

  // Add a simulated user response in mock mode
  const simulateUserResponse = useCallback(
    (content: string) => {
      if (!isMockMode.current || isStopping.current) return
      addMessage("user", content)
    },
    [addMessage],
  )

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      addDebugMessage("Component unmounting - CALLING stopSession()")
      stopSession("unmount")
    }
  }, [stopSession, addDebugMessage]) // Ensure addDebugMessage is stable if used in stopSession for unmount logging

  return {
    ...state,
    start: startSession,
    stop: stopSession,
    isConnecting: state.status === "connecting",
    isActive: state.status === "active",
  }
}
