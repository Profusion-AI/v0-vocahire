"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function RealtimeDebugPage() {
  const [apiKey, setApiKey] = useState("")
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [sessionId, setSessionId] = useState("")
  const [token, setToken] = useState("")
  const [model, setModel] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [sessionResponse, setSessionResponse] = useState<any>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`])
  }

  const testOpenAI = async () => {
    try {
      setStatus("loading")
      setError(null)
      addLog("Testing OpenAI API connection...")

      const response = await fetch("/api/test-openai")
      const data = await response.json()

      if (data.status === "success") {
        addLog("✅ OpenAI API connection successful")
      } else {
        addLog(`❌ OpenAI API test failed: ${data.message || "Unknown error"}`)
        setError(`OpenAI API test failed: ${data.message || "Unknown error"}`)
      }

      setStatus("idle")
    } catch (err) {
      addLog(`❌ Error testing OpenAI API: ${err instanceof Error ? err.message : String(err)}`)
      setError(`Error testing OpenAI API: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("error")
    }
  }

  const createSession = async () => {
    try {
      setStatus("loading")
      setError(null)
      addLog(`Creating Realtime session for job title: ${jobTitle}`)

      const response = await fetch("/api/realtime-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobTitle }),
      })

      const responseText = await response.text()
      addLog(`Response status: ${response.status}`)
      addLog(`Response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? "..." : ""}`)

      if (!response.ok) {
        throw new Error(`Failed to create session: ${responseText}`)
      }

      try {
        const data = JSON.parse(responseText)
        setSessionResponse(data)
        setSessionId(data.id || "")
        setToken(data.token || "")
        setModel(data.model || "")

        addLog(`✅ Session created successfully:`)
        addLog(`   Session ID: ${data.id}`)
        addLog(`   Token: ${data.token ? data.token.substring(0, 10) + "..." : "Not provided"}`)
        addLog(`   Model: ${data.model || "Not specified"}`)

        setStatus("success")
      } catch (parseErr) {
        addLog(`❌ Error parsing JSON response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
        setError(`Error parsing JSON response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
        setStatus("error")
      }
    } catch (err) {
      addLog(`❌ Error creating session: ${err instanceof Error ? err.message : String(err)}`)
      setError(`Error creating session: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("error")
    }
  }

  const testSdpExchange = async () => {
    try {
      if (!sessionId || !token) {
        setError("Session ID and token are required")
        return
      }

      setStatus("loading")
      setError(null)
      addLog("Testing SDP exchange with mock offer...")

      // Create a simple mock SDP offer
      const mockSdp = `v=0
o=- 1234567890 1 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=msid-semantic: WMS
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:mock
a=ice-pwd:mockpassword
a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=sendrecv
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
`

      const response = await fetch("/api/webrtc-exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          token,
          sdp: mockSdp,
          model: model || undefined,
        }),
      })

      const responseText = await response.text()
      addLog(`Response status: ${response.status}`)
      addLog(`Response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? "..." : ""}`)

      if (!response.ok) {
        throw new Error(`SDP exchange failed: ${responseText}`)
      }

      try {
        const data = JSON.parse(responseText)
        if (data.sdp) {
          addLog(`✅ SDP exchange successful. Received SDP answer (${data.sdp.length} chars)`)
          setStatus("success")
        } else {
          addLog(`❌ SDP exchange response missing SDP answer`)
          setError("SDP exchange response missing SDP answer")
          setStatus("error")
        }
      } catch (parseErr) {
        addLog(`❌ Error parsing JSON response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
        setError(`Error parsing JSON response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
        setStatus("error")
      }
    } catch (err) {
      addLog(`❌ Error testing SDP exchange: ${err instanceof Error ? err.message : String(err)}`)
      setError(`Error testing SDP exchange: ${err instanceof Error ? err.message : String(err)}`)
      setStatus("error")
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">OpenAI Realtime API Debugging</h1>

      <Tabs defaultValue="api-test">
        <TabsList className="mb-4">
          <TabsTrigger value="api-test">API Test</TabsTrigger>
          <TabsTrigger value="session">Session Creation</TabsTrigger>
          <TabsTrigger value="sdp">SDP Exchange</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="api-test">
          <Card>
            <CardHeader>
              <CardTitle>Test OpenAI API Connection</CardTitle>
              <CardDescription>
                Verify that the OpenAI API key is valid and has access to the required models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testOpenAI} disabled={status === "loading"}>
                {status === "loading" ? "Testing..." : "Test OpenAI API"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle>Create Realtime Session</CardTitle>
              <CardDescription>Test creating a session with the OpenAI Realtime API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createSession} disabled={status === "loading"}>
                {status === "loading" ? "Creating..." : "Create Session"}
              </Button>
            </CardFooter>
          </Card>

          {sessionResponse && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Session Response</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(sessionResponse, null, 2)}
                  readOnly
                  className="font-mono text-xs h-64"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sdp">
          <Card>
            <CardHeader>
              <CardTitle>Test SDP Exchange</CardTitle>
              <CardDescription>Test exchanging a mock SDP offer with OpenAI</CardDescription>
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
              <Button onClick={testSdpExchange} disabled={status === "loading" || !sessionId || !token}>
                {status === "loading" ? "Testing..." : "Test SDP Exchange"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 font-mono text-xs p-4 rounded h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setLogs([])}>
                Clear Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === "success" && !error && (
        <Alert className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
