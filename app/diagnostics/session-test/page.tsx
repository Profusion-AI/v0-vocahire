"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSessionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/test-session", {
        method: "POST",
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>OpenAI Realtime Session Test</CardTitle>
          <CardDescription>Tests the minimal OpenAI Realtime session creation endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testSession} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test Session Creation"}
            </Button>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

            {result && (
              <div className="space-y-4">
                <div className="p-2 bg-gray-50 rounded-md">
                  <div className="font-semibold">
                    Status:{" "}
                    <span className={result.status === 200 ? "text-green-600" : "text-red-600"}>{result.status}</span>
                  </div>
                  <div className="font-semibold">
                    Content-Type: <span className="font-normal">{result.contentType}</span>
                  </div>
                </div>

                {result.json ? (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="font-semibold text-green-700 mb-2">JSON Response:</div>
                    <pre className="text-xs overflow-auto p-2 bg-white rounded border">
                      {JSON.stringify(result.json, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 border rounded-md">
                    <div className="font-semibold mb-2">Raw Response:</div>
                    <pre className="text-xs overflow-auto p-2 bg-white rounded border">{result.body}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">Check server logs for complete diagnostic information</CardFooter>
      </Card>
    </div>
  )
}
