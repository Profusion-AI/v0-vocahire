"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function TestTerminatePage() {
  const [sessionId, setSessionId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    if (!sessionId) {
      setError("Please enter a session ID")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/test-terminate?sessionId=${encodeURIComponent(sessionId)}`)
      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Error running test:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Test OpenAI Session Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-id">Session ID:</Label>
            <Input
              id="session-id"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter OpenAI Realtime session ID (e.g., sess_123456)"
            />
            <p className="text-xs text-muted-foreground">
              Enter a session ID from a previous test to terminate it. You can get this from the /test page response.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div>
              <div
                className={`p-4 rounded-md mb-4 ${result.success ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  <p className="font-medium">{result.success ? "Success!" : "Test Failed"}</p>
                </div>
                <p>
                  {result.message ||
                    (result.success ? "Session terminated successfully" : "Failed to terminate session")}
                </p>
                {result.status && <p className="mt-1">Status: {result.status}</p>}
                {result.sessionId && <p className="mt-1">Session ID: {result.sessionId}</p>}
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <p className="font-medium mb-2">Response Details:</p>
                <pre className="whitespace-pre-wrap text-xs overflow-x-auto max-h-[300px] overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runTest} disabled={loading || !sessionId}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Terminate Session"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
