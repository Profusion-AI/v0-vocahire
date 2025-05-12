"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ApiKeyCheckPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkApiKey = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/diagnostic/api-key-check", {
        method: "POST",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API check failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">OpenAI API Key Validation</h1>

      <Card>
        <CardHeader>
          <CardTitle>API Key Check</CardTitle>
          <CardDescription>
            Verify that your OpenAI API key has the correct permissions for the Realtime API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkApiKey} disabled={loading} className="w-full">
            {loading ? "Checking..." : "Check API Key Permissions"}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="mt-4 space-y-4">
              <Alert variant={results.valid ? "default" : "destructive"} className="bg-green-50 border-green-200">
                {results.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{results.valid ? "API Key Valid" : "API Key Invalid"}</AlertTitle>
                <AlertDescription>{results.message}</AlertDescription>
              </Alert>

              {results.models && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Available Models:</h3>
                  <ul className="space-y-1 text-sm">
                    {results.models.map((model: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
                        {model}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.permissions && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">API Key Permissions:</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(results.permissions, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          This tool checks if your API key can access the OpenAI Realtime API and the required models.
        </CardFooter>
      </Card>
    </div>
  )
}
