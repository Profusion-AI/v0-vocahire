"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function DirectWebRTCTest() {
  // State
  const [status, setStatus] = useState<string>("idle")
  const [sessionId, setSessionId] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [model, setModel] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [progress, setProgress] = useState(0)

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Add log message
  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toISOString()} - ${message}`])
  }

  // Scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  // Create session
  const createSession = async () => {
    try {
      setError(null)
      setIsConnecting(true)
      setStatus("Creating session...")
      addLog("Creating session...")

      const response = await fetch("/api/realtime-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: "Software Engineer",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create session: ${errorText}`)
      }

      const data = await response.json()
      setSessionId(data.id)
      setToken(data.token)
      setModel(data.model || "")

      addLog(`Session created: ${data.id}`)
      addLog(`Using model: ${data.model || "unknown"}`)
      setStatus("Session created")
      setProgress(25)
    } catch (err) {
      setError(`Error creating session: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("Error")
      setIsConnecting(false)
    }
  }

  // Setup WebRTC
  const setupWebRTC = async () => {
    if (!sessionId || !token) {
      setError("No session ID or token available")
      return
    }

    try {
      setStatus("Setting up WebRTC...")
      addLog("Setting up WebRTC connection...")

      // Request microphone access
      addLog("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      addLog(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)
      setProgress(50)

      // Create RTCPeerConnection
      const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnectionRef.current = peerConnection

      // Create data channel
      addLog("Creating data channel...")
      const dataChannel = peerConnection.createDataChannel("oai-events", {
        ordered: true,
        protocol: "json",
      })
      dataChannelRef.current = dataChannel

      // Set up data channel event handlers
      dataChannel.onopen = () => {
        addLog("Data channel opened")
        setIsConnected(true)
        setIsConnecting(false)
        setStatus("Connected")
        setProgress(100)

        // Send initial message
        sendMessage("response.create")
      }

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          addLog(`Received message: ${data.type}`)

          if (data.type === "response.text.delta" && data.delta) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage && lastMessage.role === "assistant") {
                // Update last message
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + data.delta,
                }
                return newMessages
              } else {
                // Add new message
                return [...prev, { role: "assistant", content: data.delta }]
              }
            })
          } else if (data.type === "conversation.item.input_audio_transcription.delta" && data.delta) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage && lastMessage.role === "user") {
                // Update last message
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + data.delta,
                }
                return newMessages
              } else {
                // Add new message
                return [...prev, { role: "user", content: data.delta }]
              }
            })
          }
        } catch (err) {
          addLog(`Error parsing message: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      dataChannel.onerror = (error) => {
        addLog(`Data channel error: ${error}`)
        setError("Data channel error")
      }

      dataChannel.onclose = () => {
        addLog("Data channel closed")
        setIsConnected(false)
      }

      // Add audio track
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      peerConnection.addTrack(audioTrack, localStreamRef.current)

      // Handle incoming audio
      peerConnection.ontrack = (event) => {
        addLog(`Received track: ${event.track.kind}`)
        if (event.streams && event.streams[0] && audioRef.current) {
          audioRef.current.srcObject = event.streams[0]
          audioRef.current.play().catch((err) => {
            addLog(`Error playing audio: ${err}`)
          })
          addLog("Audio playback started")
        }
      }

      // ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          addLog(`New ICE candidate: ${event.candidate.candidate.substring(0, 50)}...`)
        } else {
          addLog("ICE gathering complete")
        }
      }

      // Create offer
      addLog("Creating SDP offer...")
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })

      // Set local description
      await peerConnection.setLocalDescription(offer)
      addLog("Local description set")
      setProgress(75)

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

      // Get complete offer
      const completeOffer = peerConnection.localDescription?.sdp
      if (!completeOffer) {
        throw new Error("Failed to create SDP offer")
      }

      // Exchange SDP directly with OpenAI
      addLog("Exchanging SDP directly with OpenAI...")
      setStatus("Exchanging SDP...")

      // Construct URL
      const modelParam = model ? `model=${encodeURIComponent(model)}` : ""
      const sessionParam = `session_id=${encodeURIComponent(sessionId)}`
      const url = `https://api.openai.com/v1/realtime?${modelParam ? `${modelParam}&` : ""}${sessionParam}`

      addLog(`Sending SDP to: ${url}`)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
          Authorization: `Bearer ${token}`,
          "OpenAI-Beta": "realtime",
        },
        body: completeOffer,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SDP exchange failed (${response.status}): ${errorText}`)
      }

      // Get SDP answer
      const answerSdp = await response.text()
      addLog("Received SDP answer")

      // Set remote description
      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: answerSdp,
      })

      await peerConnection.setRemoteDescription(answer)
      addLog("Remote description set")
      setStatus("Waiting for data channel to open...")
    } catch (err) {
      setError(`Error setting up WebRTC: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("Error")
      setIsConnecting(false)
    }
  }

  // Send message
  const sendMessage = (type: string, payload?: any) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      addLog("Cannot send message: data channel not open")
      return
    }

    const message = {
      type,
      ...payload,
    }

    addLog(`Sending message: ${type}`)
    dataChannelRef.current.send(JSON.stringify(message))
  }

  // Disconnect
  const disconnect = () => {
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

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    setIsConnected(false)
    setStatus("Disconnected")
    addLog("Disconnected")
    setProgress(0)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Direct WebRTC Test</h1>
      <p className="text-gray-500 mb-8">
        This page tests direct WebRTC connection with OpenAI's Realtime API without using a backend proxy for SDP
        exchange.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current status: {status}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Session ID</p>
                <p className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{sessionId || "Not created"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Token</p>
                <p className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {token ? `${token.substring(0, 10)}...` : "Not created"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Model</p>
                <p className="text-xs bg-gray-100 p-2 rounded">{model || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex space-x-2 w-full">
              <Button onClick={createSession} disabled={isConnecting || isConnected} className="flex-1">
                1. Create Session
              </Button>
              <Button onClick={setupWebRTC} disabled={!sessionId || isConnecting || isConnected} className="flex-1">
                2. Setup WebRTC
              </Button>
            </div>
            <Button onClick={disconnect} disabled={!isConnected} variant="destructive" className="w-full">
              Disconnect
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Messages exchanged with the AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto border rounded p-2">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center mt-4">No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`mb-2 p-2 rounded ${msg.role === "assistant" ? "bg-blue-50" : "bg-gray-50"}`}>
                    <p className="text-xs font-bold">{msg.role === "assistant" ? "AI" : "You"}</p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <audio ref={audioRef} autoPlay controls className="w-full mt-4" />
          </CardContent>
          <CardFooter>
            <Button onClick={() => sendMessage("response.create")} disabled={!isConnected} className="w-full">
              Send response.create
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Detailed connection logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-y-auto border rounded p-2 bg-gray-50 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
