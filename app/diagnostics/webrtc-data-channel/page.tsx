"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function WebRTCDataChannelTest() {
  const [status, setStatus] = useState<string>("idle")
  const [sessionId, setSessionId] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)
  const [messages, setMessages] = useState<{ type: string; content: string; direction: "in" | "out" }[]>([])

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [`[${new Date().toISOString()}] ${message}`, ...prev])
  }

  const createSession = async () => {
    try {
      setStatus("creating_session")
      setError(null)
      addLog("Creating session...")

      const response = await fetch("/api/realtime-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: "Software Engineer",
          resumeText: "Test resume for WebRTC data channel diagnostic",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create session: ${errorText}`)
      }

      const data = await response.json()
      setSessionId(data.id)
      setToken(data.token)
      addLog(`Session created with ID: ${data.id}`)
      addLog(`Using model: ${data.model || "unknown"}`)
      return { id: data.id, token: data.token, model: data.model }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Session creation failed: ${message}`)
      addLog(`ERROR: ${message}`)
      throw err
    }
  }

  const setupWebRTC = async () => {
    try {
      if (!sessionId || !token) {
        throw new Error("Session ID and token are required")
      }

      setStatus("setting_up_webrtc")
      addLog("Setting up WebRTC...")

      // Request microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        addLog(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)
      } catch (err) {
        throw new Error(`Microphone access denied: ${err instanceof Error ? err.message : String(err)}`)
      }

      // Create peer connection
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
        setConnected(true)
        addMessage("system", "Data channel connected", "in")
      }

      dataChannel.onclose = () => {
        addLog("Data channel closed")
        setConnected(false)
        addMessage("system", "Data channel disconnected", "in")
      }

      dataChannel.onerror = (event) => {
        addLog(`Data channel error: ${event}`)
        setError(`Data channel error: ${event}`)
      }

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          addLog(`Received message: ${JSON.stringify(data).substring(0, 100)}...`)
          addMessage(data.type || "unknown", JSON.stringify(data, null, 2), "in")

          // Handle audio data if present
          if (data.type === "response.audio.delta" && data.delta) {
            playAudio(data.delta)
          }
        } catch (err) {
          addLog(`Error parsing message: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      // Add audio track
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0]
        peerConnection.addTrack(audioTrack, localStreamRef.current)
      }

      // Set up peer connection event handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          addLog(`New ICE candidate: ${event.candidate.candidate.substring(0, 50)}...`)
        } else {
          addLog("ICE gathering complete")
        }
      }

      peerConnection.oniceconnectionstatechange = () => {
        addLog(`ICE connection state: ${peerConnection.iceConnectionState}`)
      }

      peerConnection.ontrack = (event) => {
        addLog(`Received remote track: ${event.track.kind}`)
        if (event.streams && event.streams[0] && audioRef.current) {
          audioRef.current.srcObject = event.streams[0]
          audioRef.current.play().catch((err) => {
            addLog(`Error playing audio: ${err}`)
          })
          addLog("Remote audio track connected to audio element")
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

      // Exchange SDP
      addLog("Exchanging SDP with OpenAI...")
      const exchangeResponse = await fetch("/api/webrtc-exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          token,
          sdp: completeOffer,
        }),
      })

      if (!exchangeResponse.ok) {
        const errorText = await exchangeResponse.text()
        throw new Error(`SDP exchange failed: ${errorText}`)
      }

      const { sdp: answerSdp } = await exchangeResponse.json()
      if (!answerSdp) {
        throw new Error("No SDP answer received")
      }

      addLog("Received SDP answer")

      // Set remote description
      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: answerSdp,
      })

      await peerConnection.setRemoteDescription(answer)
      addLog("Remote description set")
      setStatus("connected")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`WebRTC setup failed: ${message}`)
      addLog(`ERROR: ${message}`)
      cleanup()
    }
  }

  const sendMessage = (type: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      setError("Data channel not open")
      return
    }

    try {
      let message: any = {}

      switch (type) {
        case "response.create":
          message = { type: "response.create" }
          break
        case "session.update":
          message = {
            type: "session.update",
            session: {
              instructions: "You are an AI interviewer for a diagnostic test.",
            },
          }
          break
        case "custom":
          // You could add a text input for custom messages
          message = { type: "custom.message", content: "This is a test message" }
          break
        default:
          message = { type }
      }

      const messageStr = JSON.stringify(message)
      dataChannelRef.current.send(messageStr)
      addLog(`Sent message: ${messageStr}`)
      addMessage(message.type, JSON.stringify(message, null, 2), "out")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to send message: ${message}`)
      addLog(`ERROR: ${message}`)
    }
  }

  const addMessage = (type: string, content: string, direction: "in" | "out") => {
    setMessages((prev) => [...prev, { type, content, direction }])
  }

  const playAudio = (base64Audio: string) => {
    try {
      const audioData = base64ToArrayBuffer(base64Audio)
      const blob = new Blob([audioData], { type: "audio/mp3" })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.play().catch((err) => {
        addLog(`Error playing audio: ${err}`)
      })
    } catch (err) {
      addLog(`Error playing audio: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  }

  const cleanup = () => {
    // Close data channel
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close()
      } catch (err) {
        addLog(`Error closing data channel: ${err}`)
      }
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close()
      } catch (err) {
        addLog(`Error closing peer connection: ${err}`)
      }
      peerConnectionRef.current = null
    }

    // Stop local stream
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      } catch (err) {
        addLog(`Error stopping audio tracks: ${err}`)
      }
      localStreamRef.current = null
    }

    setConnected(false)
    setStatus("idle")
  }

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">WebRTC Data Channel Test</h1>
      <p className="mb-4">This page tests the WebRTC data channel implementation for OpenAI&apos;s Realtime API.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection</CardTitle>
            <CardDescription>Create a session and establish a WebRTC connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      status === "idle"
                        ? "bg-gray-200"
                        : status === "connected"
                          ? "bg-green-200 text-green-800"
                          : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {sessionId && (
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Session ID:</span>
                    <span className="text-sm font-mono">{sessionId.substring(0, 12)}...</span>
                  </div>
                )}

                {token && (
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Token:</span>
                    <span className="text-sm font-mono">{token.substring(0, 12)}...</span>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Button onClick={createSession} disabled={status !== "idle" && status !== "error"} className="w-full">
                  1. Create Session
                </Button>
                <Button
                  onClick={setupWebRTC}
                  disabled={!sessionId || !token || status === "connected" || status === "setting_up_webrtc"}
                  className="w-full"
                >
                  2. Setup WebRTC
                </Button>
                <Button onClick={cleanup} disabled={status === "idle"} variant="outline" className="w-full">
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Channel</CardTitle>
            <CardDescription>Send and receive messages over the data channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Data Channel Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${connected ? "bg-green-200 text-green-800" : "bg-gray-200"}`}
                  >
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => sendMessage("response.create")} disabled={!connected}>
                  Send response.create
                </Button>
                <Button onClick={() => sendMessage("session.update")} disabled={!connected}>
                  Send session.update
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Messages</h3>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-md text-sm ${
                            msg.direction === "in"
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : "bg-gray-50 border-l-4 border-gray-500"
                          }`}
                        >
                          <div className="font-semibold">
                            {msg.direction === "in" ? "← Received" : "→ Sent"} {msg.type}
                          </div>
                          <pre className="whitespace-pre-wrap text-xs mt-1 overflow-auto max-h-[100px]">
                            {msg.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>Detailed logs of the WebRTC connection process</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] border rounded-md p-2">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No logs yet</p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((log, i) => (
                    <div key={i} className="border-b border-gray-100 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <audio ref={audioRef} autoPlay playsInline className="hidden" />
    </div>
  )
}
