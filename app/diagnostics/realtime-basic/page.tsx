"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function RealtimeBasicTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState("gpt-4o-mini-realtime-preview")
  const [voice, setVoice] = useState("alloy")
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseIsJson, setResponseIsJson] = useState<boolean | null>(null)

  const models = [
    "gpt-4o-mini-realtime-preview",
    "gpt-4o-mini-realtime",
    "gpt-4o-realtime-preview",
    "gpt-4o-realtime",
    "gpt-4o-mini-realtime-preview-2024-12-17",
    "gpt-4o-realtime-preview-2024-12-17",
    "gpt-4o-realtime-preview-2024-10-01",
  ]

  const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

  const testRealtimeSession = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)
    setResponseStatus(null)
    setResponseIsJson(null)

    try {
      const res = await fetch("/api/test-basic-realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          voice,
        }),
      })

      setResponseStatus(res.status)

      // Try to parse as JSON first
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        setResponse(data)
        setResponseIsJson(true)
      } catch (_e) {
        // Not JSON, likely HTML
        setResponse(text)
        setResponseIsJson(false)
      }

      if (!res.ok) {
        setError(`API returned status ${res.status}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Basic Realtime API Test</h1>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test OpenAI Realtime Session Creation</CardTitle>
            <CardDescription>This tool makes a minimal request to the OpenAI Realtime API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger id="voice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testRealtimeSession} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Testing..." : "Test Realtime Session"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {responseStatus !== null && (
        <div className="space-y-6">
          <Alert variant={responseStatus >= 200 && responseStatus < 300 ? "default" : "destructive"}>
            {responseStatus >= 200 && responseStatus < 300 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>Response Status: {responseStatus}</AlertTitle>
            <AlertDescription>
              {responseIsJson ? "Received JSON response" : "Received non-JSON response (likely HTML)"}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Response {responseIsJson ? "Data" : "Body"}</CardTitle>
            </CardHeader>
            <CardContent>
              {responseIsJson ? (
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-[600px]">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-[600px]">
                  {typeof response === "string" ? (
                    response.length > 1000 ? (
                      <>
                        <div>{response.substring(0, 1000)}</div>
                        <div className="mt-2 font-semibold">[...truncated, total length: {response.length} chars]</div>
                      </>
                    ) : (
                      response
                    )
                  ) : (
                    String(response)
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
