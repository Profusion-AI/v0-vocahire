"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useInterviewSession } from "@/hooks/useInterviewSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, AlertCircle, WifiOff, ExternalLink, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectionQualityIndicator } from "@/components/connection-quality-indicator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface InterviewRoomProps {
  onComplete?: (messages: Array<{ role: string; content: string; timestamp: number }>) => void
  jobTitle?: string
}

export default function InterviewRoom({ onComplete, jobTitle = "Software Engineer" }: InterviewRoomProps) {
  const router = useRouter()
  const { status, messages, start, stop, isConnecting, isActive, error, debug } = useInterviewSession()

  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiErrorCode, setApiErrorCode] = useState<string | null>(null)
  const [apiErrorDetails, setApiErrorDetails] = useState<any>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<any>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])

  // Add a new state variable to track if we're using Xirsys
  const [usingXirsys, setUsingXirsys] = useState<boolean | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Get access to the peer connection for the connection quality indicator
  useEffect(() => {
    if (typeof window !== "undefined") {
      // This is a hack to access the peer connection from the hook
      // In a real app, you would refactor the hook to expose the peer connection
      const checkForPeerConnection = () => {
        // @ts-ignore - accessing a private property for demo purposes
        if (window._vocahirePeerConnection) {
          peerConnectionRef.current = window._vocahirePeerConnection
        }
      }

      // Check every second for the peer connection
      const intervalId = setInterval(checkForPeerConnection, 1000)
      checkForPeerConnection() // Check immediately

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [])

  // Add this effect to check if we're using Xirsys servers when the connection is established
  useEffect(() => {
    if (peerConnectionRef.current && isActive) {
      // Check if any of the ICE servers are from Xirsys
      const configuration = peerConnectionRef.current.getConfiguration()
      const hasXirsysServer = configuration.iceServers?.some((server) => {
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
        return urls.some((url) => url.includes("xirsys"))
      })

      setUsingXirsys(hasXirsysServer || false)
    } else {
      setUsingXirsys(null)
    }
  }, [isActive])

  // Check for microphone permission
  useEffect(() => {
    async function checkMicPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setIsPermissionGranted(true)
      } catch (err) {
        console.error("Microphone permission denied:", err)
        setIsPermissionGranted(false)
      } finally {
        setIsInitializing(false)
      }
    }

    checkMicPermission()
  }, [])

  // Timer countdown when interview is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId)
            handleInterviewComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isActive, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    try {
      setApiError(null)
      setApiErrorCode(null)
      setApiErrorDetails(null)
      await start(jobTitle)
    } catch (err) {
      console.error("Failed to start interview:", err)

      // Extract more detailed error information
      let errorMessage = "An unknown error occurred while starting the interview"
      let errorCode = "unknown_error"
      let errorDetails = null

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "object" && err !== null) {
        errorMessage = JSON.stringify(err)
      }

      // Try to parse the error response if it's a JSON string
      try {
        if (errorMessage.includes("{") && errorMessage.includes("}")) {
          const jsonStartIndex = errorMessage.indexOf("{")
          const jsonString = errorMessage.substring(jsonStartIndex)
          const errorJson = JSON.parse(jsonString)

          if (errorJson.message) errorMessage = errorJson.message
          if (errorJson.code) errorCode = errorJson.code
          errorDetails = errorJson

          console.log("Parsed error details:", errorJson)
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }

      // Check for specific error patterns
      if (errorMessage.includes("Token API error: 500")) {
        if (errorCode === "missing_api_key") {
          errorMessage = "OpenAI API key is missing. Please check the environment variables."
        } else {
          errorMessage = "Server error: Unable to connect to OpenAI. Please try again later or contact support."
        }
      } else if (errorMessage.includes("Token API error: 401") || errorMessage.includes("Token API error: 403")) {
        errorMessage = "Authentication error: API key may be invalid or expired. Please contact support."
      } else if (errorMessage.includes("Token API error: 429")) {
        errorMessage = "Rate limit exceeded: Too many requests to OpenAI. Please try again in a few minutes."
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = "Network error: Unable to connect to the server. Please check your internet connection."
      }

      setApiError(errorMessage)
      setApiErrorCode(errorCode)
      setApiErrorDetails(errorDetails)

      // Add more detailed logging for debugging
      if (typeof err === "object" && err !== null) {
        console.error("Error details:", JSON.stringify(err, null, 2))
      }
    }
  }

  const handleInterviewComplete = () => {
    stop()

    // In a real implementation, you would save the interview data to your database
    // and then redirect to the feedback page
    setTimeout(() => {
      router.push("/feedback")
    }, 2000)

    if (onComplete) {
      onComplete(messages)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Function to test OpenAI API connectivity
  const testOpenAiApi = async () => {
    setIsTestingApi(true)
    setApiTestResult(null)

    try {
      const response = await fetch("/api/test-openai")
      const data = await response.json()
      setApiTestResult(data)

      // Store available models for use in the UI
      if (data.openaiResponse?.sampleModels) {
        setAvailableModels(data.openaiResponse.sampleModels)
      }

      // If the test is successful but we had an error before, try starting the interview again
      if (data.status === "success" && apiError) {
        setApiError("API connection successful. You can try starting the interview again.")
        setApiErrorCode(null)
      }
    } catch (error) {
      setApiTestResult({
        status: "error",
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsTestingApi(false)
    }
  }

  // Render missing API key error
  const renderMissingApiKeyError = () => {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>OpenAI API Key Issue</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            There's an issue with the OpenAI API key. This is required for the interview functionality to work.
          </p>

          {apiErrorDetails && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
              <p className="font-medium mb-1">Error Details:</p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiErrorDetails, null, 2)}</pre>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={testOpenAiApi} disabled={isTestingApi} className="text-xs">
              {isTestingApi ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Testing API...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Test OpenAI Connection
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/test-interview-mock" className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Try Mock Interview Mode
              </Link>
            </Button>
          </div>

          {apiTestResult && (
            <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
              <p className="font-medium mb-1">API Test Result:</p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiTestResult, null, 2)}</pre>
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Helper function to render network error messages with helpful suggestions
  const renderNetworkError = (errorMessage: string) => {
    // Don't show any error for User-Initiated Abort - this is expected behavior
    if (errorMessage.includes("User-Initiated Abort") || errorMessage.includes("Server initiated disconnect")) {
      return null
    }

    // Check if this is a missing API key error
    if (apiErrorCode === "missing_api_key" || errorMessage.includes("API key is missing")) {
      return renderMissingApiKeyError()
    }

    const isNetworkError =
      errorMessage.includes("network") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("ICE") ||
      errorMessage.includes("STUN") ||
      errorMessage.includes("TURN") ||
      errorMessage.includes("WebRTC") ||
      errorMessage.includes("audio")

    const isDataChannelError = errorMessage.includes("DataChannel")

    const isApiError =
      errorMessage.includes("API error") || errorMessage.includes("Token") || errorMessage.includes("OpenAI")

    if (isDataChannelError) {
      // Existing data channel error handling...
      return (
        <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-md text-amber-700 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Connection Notice:</p>
              <p>
                The text messaging channel was closed by the server, but the interview can continue with audio only.
              </p>
              <p className="text-sm mt-2">
                This is normal behavior with OpenAI's Realtime API and doesn't affect the quality of your interview.
                Please continue speaking clearly into your microphone.
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (isApiError) {
      return (
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">API Connection Error:</p>
              <p>{errorMessage}</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">Possible solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Try again in a few minutes</li>
                  <li>Check if the OpenAI service is experiencing issues</li>
                  <li>Your account may not have access to the required model (gpt-4o-realtime-preview-2024-12-17)</li>
                  <li>Contact support if the problem persists</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testOpenAiApi}
                    disabled={isTestingApi}
                    className="text-xs"
                  >
                    {isTestingApi ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Testing API...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test OpenAI Connection
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/test-interview-mock" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Try Mock Interview Mode
                    </Link>
                  </Button>
                </div>
              </div>

              {apiTestResult && (
                <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
                  <p className="font-medium mb-1">API Test Result:</p>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(apiTestResult, null, 2)}</pre>
                </div>
              )}

              {availableModels.length > 0 && (
                <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                  <p className="font-medium mb-1">Available Models:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {availableModels.map((model, index) => (
                      <li
                        key={index}
                        className={model.includes("realtime") ? "text-green-600 dark:text-green-400" : ""}
                      >
                        {model}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-amber-600 dark:text-amber-400">
                    {availableModels.some((m) => m.includes("realtime"))
                      ? "You have access to realtime models, but there might be an issue with the specific model we're trying to use."
                      : "You don't appear to have access to any realtime models, which are required for this feature."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
        <div className="flex items-start gap-2">
          {isNetworkError ? (
            <WifiOff className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">Connection Error:</p>
            <p>{errorMessage}</p>
            {isNetworkError && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try using a different network (switch from WiFi to mobile data)</li>
                  <li>Disable any VPN or proxy services</li>
                  <li>Try using a different browser</li>
                  <li>Make sure your firewall isn't blocking WebRTC connections</li>
                </ul>
                <div className="mt-3">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/test-interview-mock" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Try Mock Interview Mode Instead
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mock Interview: {jobTitle}</CardTitle>
          <div className="flex items-center gap-4">
            {isActive && (
              <ConnectionQualityIndicator
                peerConnection={peerConnectionRef.current}
                className="bg-background/80 border"
              />
            )}
            {isActive && usingXirsys !== null && (
              <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                {usingXirsys ? "Xirsys TURN" : "Standard STUN"}
              </div>
            )}
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              <span className={timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isInitializing ? (
          <div className="space-y-3">
            <Skeleton className="h-[20px] w-[250px]" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : isPermissionGranted === false ? (
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <p>
              Microphone access is required for the interview. Please allow microphone access in your browser settings
              and refresh the page.
            </p>
          </div>
        ) : error ? (
          renderNetworkError(error)
        ) : apiError ? (
          apiErrorCode === "missing_api_key" ? (
            renderMissingApiKeyError()
          ) : (
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">API Error:</p>
                  <p>{apiError}</p>
                  <p className="text-sm mt-2">
                    There was an issue connecting to the OpenAI API. Please try again later or contact support.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testOpenAiApi}
                      disabled={isTestingApi}
                      className="text-xs"
                    >
                      {isTestingApi ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Testing API...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Test OpenAI Connection
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href="/test-interview-mock" className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Try Mock Interview Mode
                      </Link>
                    </Button>
                  </div>

                  {apiTestResult && (
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono overflow-x-auto">
                      <p className="font-medium mb-1">API Test Result:</p>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(apiTestResult, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            <div className="min-h-[300px] p-4 rounded-md bg-muted">
              {status === "idle" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Ready to start your mock interview?</h3>
                  <p className="text-muted-foreground mb-4">
                    You'll have a 10-minute conversation with an AI interviewer who will ask you questions about your
                    experience and skills for a {jobTitle} position.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tips:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside text-left max-w-md mx-auto">
                      <li>Speak clearly and at a normal pace</li>
                      <li>Answer questions thoroughly but concisely</li>
                      <li>Use specific examples from your experience</li>
                      <li>The interview will automatically end after 10 minutes</li>
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleStartInterview} size="lg">
                      Start Interview
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/test-interview-mock" className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Try Mock Mode (No WebRTC)
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {(isConnecting || isActive) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        isActive ? "bg-green-100 dark:bg-green-900/20" : "bg-amber-100 dark:bg-amber-900/20"
                      }`}
                    >
                      {isActive ? (
                        <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                      ) : (
                        <Mic className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    {isConnecting && (
                      <div className="flex flex-col items-center">
                        <p>Connecting to interviewer...</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-sm text-muted-foreground">Establishing secure connection</span>
                        </div>
                      </div>
                    )}
                    {isActive && <p>Interview in progress. Speak clearly into your microphone.</p>}
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && isActive && (
                      <div className="text-center text-muted-foreground italic">
                        <p>The interviewer will begin shortly...</p>
                      </div>
                    )}
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.role === "assistant" ? "bg-primary/10 ml-4" : "bg-secondary/10 mr-4"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.role === "assistant" ? "Interviewer" : "You"}</p>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status === "ended" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Interview Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    Your interview has ended. You'll be redirected to your feedback shortly.
                  </p>
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
            </div>

            {/* Hidden audio element for AI voice */}
            <audio ref={audioRef} autoPlay playsInline className="hidden" />
          </>
        )}

        {debug && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-x-auto">
            <p className="font-medium mb-1">Debug Info:</p>
            <p>{debug}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {isActive && (
          <Button variant="destructive" onClick={handleInterviewComplete}>
            End Interview Early
          </Button>
        )}
        {!isActive && status !== "idle" && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Start New Interview
          </Button>
        )}
        {status === "ended" && (
          <Button asChild>
            <Link href="/feedback">View Feedback</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
