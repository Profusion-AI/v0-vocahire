"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function WebRTCTestPage() {
  const [sessionId, setSessionId] = useState("")
  const [token, setToken] = useState("")
  const [model, setModel] = useState("")
  const [sdpOffer, setSdpOffer] = useState("")
  const [sdpAnswer, setSdpAnswer] = useState("")
  const [status, setStatus] = useState<"idle" | "creating" | "exchanging" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const addLog = (message: string) => {
    setLog((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`])
  }

  useEffect(() => {
    return () => {
      // Clean up resources
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const createOffer = async () => {
    try {
      setStatus("creating")
      setError(null)
      addLog("Creating SDP offer...")

      // Request microphone access
      addLog("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      addLog(`Microphone access granted. Audio tracks: ${stream.getAudioTracks().length}`)

      // Create a new RTCPeerConnection
      const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      // Try to get TURN servers from our API
      try {
        const turnResponse = await fetch("/api/ice-servers")
        if (turnResponse.ok) {
          const turnData = await turnResponse.json()
          if (turnData.iceServers && turnData.iceServers.length > 0) {
            configuration.iceServers = turnData.iceServers
            addLog(`Using ${turnData.iceServers.length} ICE servers from API`)
          }
        }
      } catch (err) {
        addLog(`Failed to get TURN servers: ${err}. Using default STUN servers.`)
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnectionRef.current = peerConnection

      // Add the local stream to the peer connection
      const audioTrack = stream.getAudioTracks()[0]
      peerConnection.addTrack(audioTrack, stream)

      // Set up event handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          addLog(`New ICE candidate: ${event.candidate.candidate.substring(0, 50)}...`)
        } else {
          addLog("ICE gathering complete")
          // Get the complete offer with ICE candidates
          const completeOffer = peerConnection.localDescription?.sdp
          if (completeOffer) {
            setSdpOffer(completeOffer)
            addLog("SDP offer created and ready for exchange")
          }
        }
      }

      peerConnection.oniceconnectionstatechange = () => {
        addLog(`ICE connection state: ${peerConnection.iceConnectionState}`)
      }

      // Create an offer
      addLog("Creating SDP offer...")
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })

      // Set local description
      await peerConnection.setLocalDescription(offer)
      addLog("Local description set")

      setStatus("idle")
    } catch (err) {
      console.error("Error creating offer:", err)
      setError(`Error creating offer: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("error")
    }
  }

  const exchangeSDP = async () => {
    try {
      if (!sessionId || !token || !sdpOffer) {
        setError("Session ID, token, and SDP offer are required")
        return
      }

      setStatus("exchanging")
      setError(null)
      addLog("Exchanging SDP with OpenAI...")

      const response = await fetch("/api/webrtc-exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          token,
          sdp: sdpOffer,
          model: model || undefined,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SDP exchange failed: ${errorText}`)
      }

      const data = await response.json()
      if (!data.sdp) {
        throw new Error("No SDP answer received from server")
      }

      setSdpAnswer(data.sdp)
      addLog("Received SDP answer from server")

      // Set remote description
      if (peerConnectionRef.current) {
        const answer = new RTCSessionDescription({
          type: "answer",
          sdp: data.sdp,
        })

        await peerConnectionRef.current.setRemoteDescription(answer)
        addLog("Remote description set successfully")
        setStatus("success")
      } else {
        throw new Error("Peer connection not initialized")
      }
    } catch (err) {
      console.error("Error exchanging SDP:", err)
      setError(`Error exchanging SDP: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("error")
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">WebRTC SDP Exchange Test</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Enter the session details from a successful /api/realtime-session call</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Session ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., sess_123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Token (client_secret)</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., secret_123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model (optional)</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., gpt-4o-mini-realtime-preview"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createOffer} disabled={status === "creating" || status === "exchanging"}>
              Create SDP Offer
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SDP Exchange</CardTitle>
            <CardDescription>Create an offer, then exchange it with OpenAI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SDP Offer</label>
              <Textarea
                value={sdpOffer}
                onChange={(e) => setSdpOffer(e.target.value)}
                className="font-mono text-xs h-32"
                placeholder="SDP offer will appear here after creation"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SDP Answer</label>
              <Textarea
                value={sdpAnswer}
                className="font-mono text-xs h-32"
                placeholder="SDP answer will appear here after exchange"
                readOnly
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={exchangeSDP}
              disabled={!sdpOffer || !sessionId || !token || status === "creating" || status === "exchanging"}
            >
              Exchange SDP
            </Button>
          </CardFooter>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === "success" && (
        <Alert className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>SDP exchange completed successfully!</AlertDescription>
        </Alert>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 font-mono text-xs p-4 rounded h-64 overflow-y-auto">
            {log.map((entry, index) => (
              <div key={index}>{entry}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
