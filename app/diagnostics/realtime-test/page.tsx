"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function TestRealtimePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testDebugEndpoint = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug-realtime")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">OpenAI Realtime API Diagnostics</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Realtime API Connection</CardTitle>
          <CardDescription>
            This will test if your OpenAI API key has access to the Realtime API and fetch available models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testDebugEndpoint} disabled={loading}>
            {loading ? "Testing..." : "Run Diagnostics"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Error
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <>
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={`mb-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}
          >
            <AlertTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" /> Success
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" /> Failed
                </>
              )}
            </AlertTitle>
            <AlertDescription>
              {result.success
                ? "Your API key has access to the OpenAI Realtime API."
                : "Your API key does not have access to the OpenAI Realtime API."}
            </AlertDescription>
          </Alert>

          {result.hasRealtimeAccess && result.sessionInfo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>Successfully created a test session with the OpenAI Realtime API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[200px]">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result.sessionInfo, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {result.availableModels && result.availableModels.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Available Realtime Models</CardTitle>
                <CardDescription>These models are available for use with the Realtime API.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {result.availableModels.map((model: string) => (
                    <li key={model} className="text-sm">
                      {model}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {!result.success && result.rawResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Raw Response
                </CardTitle>
                <CardDescription>
                  This is the raw response from the OpenAI API. It may help diagnose the issue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[500px]">
                  <pre className="whitespace-pre-wrap text-sm">
                    {typeof result.rawResponse === "string"
                      ? result.rawResponse
                      : JSON.stringify(result.rawResponse, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
