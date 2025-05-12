"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface DiagnosticResult {
  stage: string
  success: boolean
  message: string
  details?: any
  error?: any
  raw?: string
}

interface DiagnosticResponse {
  timestamp: string
  success: boolean
  message: string
  results: DiagnosticResult[]
}

export default function OpenAIDiagnosticPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const runDiagnostic = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/diagnostic/realtime")

      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${await res.text()}`)
      }

      const data = await res.json()
      setDiagnosticResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">OpenAI Realtime API Diagnostics</h1>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Diagnostic Tool</CardTitle>
            <CardDescription>
              This tool tests all aspects of OpenAI Realtime API access and helps identify issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click the button below to run a full diagnostic on the OpenAI Realtime API. This will:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Verify your API key format and access</li>
              <li>Test general OpenAI API connectivity</li>
              <li>Check for realtime model availability</li>
              <li>Test realtime session creation with various models</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={runDiagnostic} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Running Diagnostic..." : "Run Diagnostic"}
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

      {diagnosticResults && (
        <div className="space-y-6">
          <Alert variant={diagnosticResults.success ? "default" : "destructive"}>
            {diagnosticResults.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>
              {diagnosticResults.success ? "All diagnostics passed successfully" : "Some diagnostics failed"}
            </AlertTitle>
            <AlertDescription>
              {diagnosticResults.message}
              <div className="text-xs mt-1">Timestamp: {new Date(diagnosticResults.timestamp).toLocaleString()}</div>
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Results</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Diagnostic Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {diagnosticResults.results.map((result, index) => (
                      <div key={index} className="flex items-center p-2 rounded border">
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <div className="font-medium">{result.stage}</div>
                          <div className="text-sm text-gray-500">{result.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              {diagnosticResults.results.map((result, index) => (
                <Card key={index}>
                  <CardHeader className={result.success ? "bg-green-50" : "bg-red-50"}>
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <CardTitle>{result.stage}</CardTitle>
                    </div>
                    <CardDescription>{result.message}</CardDescription>
                  </CardHeader>
                  {(result.details || result.error) && (
                    <CardContent className="pt-4">
                      {result.details && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-1">Details:</h4>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {result.error && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Error:</h4>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(result.error, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="raw" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Diagnostic Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-[600px]">
                    {JSON.stringify(diagnosticResults, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
