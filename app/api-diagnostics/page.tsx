"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ApiDiagnosticsPage() {
  const [isTestingBasicApi, setIsTestingBasicApi] = useState(false)
  const [basicApiResult, setBasicApiResult] = useState<any>(null)

  const [isTestingRealtimeApi, setIsTestingRealtimeApi] = useState(false)
  const [realtimeApiResult, setRealtimeApiResult] = useState<any>(null)

  const testBasicApi = useCallback(async () => {
    setIsTestingBasicApi(true)
    setBasicApiResult(null)

    try {
      const response = await fetch("/api/test-openai")
      const data = await response.json()
      setBasicApiResult(data)
    } catch (error) {
      setBasicApiResult({
        status: "error",
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsTestingBasicApi(false)
    }
  }, [])

  const testRealtimeApi = useCallback(async () => {
    setIsTestingRealtimeApi(true)
    setRealtimeApiResult(null)

    try {
      const response = await fetch("/api/test-realtime-api")
      const data = await response.json()
      setRealtimeApiResult(data)
    } catch (error) {
      setRealtimeApiResult({
        status: "error",
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsTestingRealtimeApi(false)
    }
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">OpenAI API Diagnostics</h1>
      <p className="text-center text-muted-foreground mb-8">Test your OpenAI API key and Realtime API access</p>

      <Tabs defaultValue="basic" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic API Test</TabsTrigger>
          <TabsTrigger value="realtime">Realtime API Test</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic OpenAI API Test</CardTitle>
              <CardDescription>
                Tests if your OpenAI API key is valid and can access the models list endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This test will verify if your OpenAI API key is valid and can access the basic API endpoints. It will
                  check if you can list models and if any realtime models are available.
                </p>

                {basicApiResult && (
                  <div className="mt-4">
                    {basicApiResult.status === "success" ? (
                      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>API Key Valid</AlertTitle>
                        <AlertDescription>
                          Your OpenAI API key is valid and can access the models list endpoint.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>API Key Invalid</AlertTitle>
                        <AlertDescription>{basicApiResult.message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(basicApiResult, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={testBasicApi} disabled={isTestingBasicApi}>
                {isTestingBasicApi ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Basic API"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Realtime API Test</CardTitle>
              <CardDescription>
                Attempts to create a realtime session via the official /v1/audio/realtime/sessions endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This test will verify if your OpenAI API key can access the Realtime API endpoints. It will try to
                  create a realtime session with different model and voice combinations.
                </p>

                {/* Display available realtime models */}
                {realtimeApiResult?.tests?.modelsApi?.realtimeModels?.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-md">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Detected realtime-preview models:
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {realtimeApiResult.tests.modelsApi.realtimeModels.map((model: string) => (
                        <li key={model} className="text-sm">
                          {model}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                      These are the models that will be tested with different voices.
                    </p>
                  </div>
                )}

                {realtimeApiResult && realtimeApiResult.tests?.realtimeApi && (
                  <div className="mt-4">
                    {/* Success/Failure Alert */}
                    {realtimeApiResult.status === "success" &&
                    realtimeApiResult.tests?.realtimeApi?.some((r: any) => r.ok) ? (
                      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Realtime API Access Confirmed</AlertTitle>
                        <AlertDescription>
                          Your OpenAI API key can access the Realtime API. At least one model and voice combination
                          worked.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Realtime API Access Failed</AlertTitle>
                        <AlertDescription>
                          {realtimeApiResult.recommendations ||
                            "Your OpenAI API key may not have access to the Realtime API. Please check your OpenAI account permissions."}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Results Table */}
                    <div className="mt-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Model</TableHead>
                            <TableHead>Voice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>HTTP</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {realtimeApiResult.tests.realtimeApi.map((result: any, index: number) => (
                            <TableRow
                              key={index}
                              className={
                                result.ok ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                              }
                            >
                              <TableCell className="font-mono text-xs">{result.model}</TableCell>
                              <TableCell>{result.voice}</TableCell>
                              <TableCell>{result.ok ? "✅" : "❌"}</TableCell>
                              <TableCell>{result.status}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {result.errorMessage ||
                                  (result.ok ? "—" : JSON.stringify(result.response).substring(0, 50))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {realtimeApiResult.possibleIssues && realtimeApiResult.possibleIssues.length > 0 && (
                      <Alert className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <AlertTitle>Possible Issues</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {realtimeApiResult.possibleIssues.map((issue: string, index: number) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {realtimeApiResult.nextSteps && realtimeApiResult.nextSteps.length > 0 && (
                      <Alert className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle>Next Steps</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {realtimeApiResult.nextSteps.map((step: string, index: number) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Raw JSON (Collapsed) */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        Show Raw JSON Response
                      </summary>
                      <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(realtimeApiResult, null, 2)}</pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={testRealtimeApi} disabled={isTestingRealtimeApi}>
                {isTestingRealtimeApi ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Realtime API"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
