"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function DirectWebRTCTest() {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [userInput, setUserInput] = useState("")

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const addLog = useCallback((message: string) => {
    console.log(message)
    setLogs((prev) => [`[${new Date().toISOString()}] ${message}`, ...prev])
  }, [])

  const createSession = useCallback(async () => {
    try {
      addLog("Creating session...")
      setStatus("connecting")
      setError(null)

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
        throw new Error(`Failed to create session: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      addLog(`Session created: ${data.id}`)
      setSessionId(data.id)
      setToken(data.token)

      return { id: data.id, token: data.token }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      addLog(`Error creating session: ${errorMessage}`)
      setError(`Failed to create session: ${errorMessage}`)
      setStatus("error")
      throw err
    }
  }, [addLog])

  const setupWebRTC = useCallback(
    async (sessionId: string, token: string) => {
      try {
        addLog("Setting up WebRTC connection...")

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        addLog("Microphone access granted")

        // Create RTCPeerConnection
        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        }

        // Try to get TURN servers
        try {
          const turnResponse = await fetch("/api/ice-servers")
          if (turnResponse.ok) {
            const turnData = await turnResponse.json()
            if (turnData.iceServers && turnData.iceServers.length > 0) {
              configuration.iceServers = turnData.iceServers
            }
          }
        } catch (err) {
          addLog(`Failed to get TURN servers: ${err}. Using default STUN servers.`)
        }

        const pc = new RTCPeerConnection(configuration)
        peerConnectionRef.current = pc

        // Add local audio track
        stream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, stream)
        })

        // Create data channel
        const dataChannel = pc.createDataChannel("oai-events", { ordered: true })
        dataChannelRef.current = dataChannel

        // Set up data channel handlers
        dataChannel.onopen = () => {
          addLog("Data channel opened")
          setStatus("connected")

          // Send initial message
          dataChannel.send(
            JSON.stringify({
              type: "response.create",
            }),
          )
        }

        dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            addLog(`Received message: ${data.type}`)

            if (data.type === "response.audio.delta" && data.delta) {
              // Handle audio data
              const audioData = base64ToArrayBuffer(data.delta)
              playAudio(audioData)
            } else if (data.type === "response.text.delta" && data.delta) {
              // Handle text message
              setMessages((prev) => [...prev, { role: "assistant", content: data.delta }])
            } else if (data.type === "conversation.item.input_audio_transcription.delta" && data.delta) {
              // Handle transcript of user's speech
              setMessages((prev) => [...prev, { role: "user", content: data.delta }])
            }
          } catch (err) {
            addLog(`Error parsing data channel message: ${err instanceof Error ? err.message : String(err)}`)
          }
        }

        dataChannel.onerror = (event) => {
          addLog(`Data channel error: ${JSON.stringify(event)}`)
          setError("Data channel error")
        }

        dataChannel.onclose = () => {
          addLog("Data channel closed")
          setStatus("idle")
        }

        // Handle incoming audio
        pc.ontrack = (event) => {
          addLog("Received remote track")
          if (event.streams && event.streams[0]) {
            const audioElement = new Audio()
            audioElement.srcObject = event.streams[0]
            audioElement.play()
          }
        }

        // Create offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        })

        await pc.setLocalDescription(offer)

        // Wait for ICE gathering to complete
        const completeOffer = await new Promise<RTCSessionDescriptionInit>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve(pc.localDescription!)
          } else {
            const checkState = () => {
              if (pc.iceGatheringState === "complete") {
                resolve(pc.localDescription!)
              } else {
                setTimeout(checkState, 100)
              }
            }
            setTimeout(checkState, 100)
          }
        })

        // Send offer to OpenAI - Use model parameter as per OpenAI docs
        const model = "gpt-4o-mini-realtime-preview" // Use the model from your session creation
        const sdpUrl = `https://api.openai.com/v1/realtime?model=${model}`

        addLog(`Sending SDP offer to: ${sdpUrl}`)

        const response = await fetch(sdpUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
            Authorization: `Bearer ${token}`,
          },
          body: completeOffer.sdp,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`SDP exchange failed: ${response.status} - ${errorText}`)
        }

        // Get answer SDP
        const answerSdp = await response.text()

        // Set remote description
        await pc.setRemoteDescription({
          type: "answer",
          sdp: answerSdp,
        })

        addLog("WebRTC connection established")
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addLog(`Error setting up WebRTC: ${errorMessage}`)
        setError(`WebRTC setup failed: ${errorMessage}`)
        setStatus("error")
        throw error
      }
    },
    [addLog],
  )

  const startTest = useCallback(async () => {
    try {
      const { id, token } = await createSession()
      await setupWebRTC(id, token)
    } catch (err) {
      // Error already handled in individual functions
    }
  }, [createSession, setupWebRTC])

  const sendMessage = useCallback(() => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open" || !userInput.trim()) {
      return
    }

    try {
      // Send message over data channel
      dataChannelRef.current.send(
        JSON.stringify({
          type: "input_text",
          text: userInput,
        }),
      )

      setMessages((prev) => [...prev, { role: "user", content: userInput }])
      setUserInput("")
    } catch (err) {
      addLog(`Error sending message: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [userInput, addLog])

  const cleanup = useCallback(() => {
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

    setStatus("idle")
    setSessionId(null)
    setToken(null)
  }, [])

  // Helper function to play audio
  const playAudio = useCallback(
    (audioData: ArrayBuffer) => {
      try {
        // Create a blob from the audio data
        const blob = new Blob([audioData], { type: "audio/wav" })
        const url = URL.createObjectURL(blob)

        // Create an audio element if it doesn't exist
        if (!audioRef.current) {
          const audio = new Audio()
          audio.onended = () => {
            URL.revokeObjectURL(audio.src) // Clean up the blob URL
          }
          audioRef.current = audio
        }

        // Set the source and play
        audioRef.current.src = url
        audioRef.current.play().catch((err) => {
          addLog(`Error playing audio: ${err}`)
        })
      } catch (err) {
        addLog(`Error processing audio data: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [addLog],
  )

  // Helper function to convert base64 to ArrayBuffer
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Direct WebRTC Connection Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === "idle"
                      ? "bg-gray-400"
                      : status === "connecting"
                        ? "bg-yellow-400 animate-pulse"
                        : status === "connected"
                          ? "bg-green-500"
                          : "bg-red-500"
                  }`}
                ></div>
                <span className="font-medium">
                  {status === "idle"
                    ? "Not Connected"
                    : status === "connecting"
                      ? "Connecting..."
                      : status === "connected"
                        ? "Connected"
                        : "Error"}
                </span>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {sessionId && (
                <div>
                  <p className="text-sm font-medium">Session ID:</p>
                  <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{sessionId}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={startTest} disabled={status === "connecting" || status === "connected"}>
                  {status === "connecting" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                    </>
                  ) : (
                    "Start Test"
                  )}
                </Button>
                <Button variant="outline" onClick={cleanup} disabled={status === "idle"}>
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto border rounded-md p-3 mb-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 italic">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.role === "assistant" ? "bg-blue-100 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{msg.role === "assistant" ? "Assistant" : "You"}</p>
                      <p>{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-md"
                disabled={status !== "connected"}
              />
              <Button onClick={sendMessage} disabled={status !== "connected" || !userInput.trim()}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto border rounded-md p-3 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-center text-gray-500 italic">No logs yet</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
