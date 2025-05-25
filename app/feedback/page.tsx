"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FeedbackCard from "@/components/FeedbackCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, RefreshCw, CloudUpload } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";
import EnhancedFeedbackCTA from "@/components/EnhancedFeedbackCTA";
import EnhancedFeedbackDisplay from "@/components/EnhancedFeedbackDisplay";

// Safe localStorage access wrapped in try/catch
const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch (err) {
    console.error(`Error accessing localStorage (${key}):`, err)
  }
  return null
}

// Helper function to load interview data from localStorage
function loadInterviewData() {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return { error: "Loading interview data...", isSSR: true }
  }
  
  // Use safe localStorage accessors
  const messagesJson = safeLocalStorageGet("vocahire_interview_messages")
  const fillerWordsJson = safeLocalStorageGet("vocahire_filler_words")
  const resumeDataJson = safeLocalStorageGet("vocahire_resume_data")
  const recordingUrlJson = safeLocalStorageGet("vocahire_recording_url")
  
  if (!messagesJson) {
    return { error: "No interview data found. Please complete an interview first." }
  }
  
  try {
    const messages = JSON.parse(messagesJson)
    const _fillerWordCounts = fillerWordsJson ? JSON.parse(fillerWordsJson) : {}
    const resumeData = resumeDataJson ? JSON.parse(resumeDataJson) : null
    
    // Calculate filler word stats
    let fillerWordStats = null
    if (fillerWordsJson) {
      const counts: Record<string, number> = JSON.parse(fillerWordsJson)
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
      const mostCommon = Object.entries(counts)
        .map(([word, count]) => ({ word, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
      
      fillerWordStats = { total, mostCommon }
    }
    
    return {
      messages,
      fillerWordCounts: _fillerWordCounts,
      resumeData,
      recordingUrl: recordingUrlJson,
      fillerWordStats,
      error: null
    }
  } catch (error) {
    console.error("Error parsing interview data:", error)
    return { error: "Error loading interview data. Please try again." }
  }
}

function FeedbackPageContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Array<{
    category: string
    rating: string
    feedback: string
  }> | null>(null)
  const [fillerWordStats, setFillerWordStats] = useState<{
    total: number
    mostCommon: Array<{ word: string; count: number }>
  } | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  
  // Sync functionality states
  const [hasLocalData, setHasLocalData] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Enhanced feedback states
  const [userCredits, setUserCredits] = useState(0)
  const [showEnhancedFeedback, setShowEnhancedFeedback] = useState(false)
  const [isProcessingEnhanced, setIsProcessingEnhanced] = useState(false)
  const [enhancedFeedback, setEnhancedFeedback] = useState(null)
  
  const searchParams = useSearchParams()
  const { getToken, userId } = useAuth()

  // Add a mounting check for client-side only code
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle mounting state
  useEffect(() => {
    setIsMounted(true)
    // Return cleanup function that safely sets mounted to false
    return () => {
      setIsMounted(false)
    }
  }, [])
  
  // Fetch user credits when component mounts
  useEffect(() => {
    if (userId) {
      fetchUserCredits()
    }
  }, [userId])
  
  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setUserCredits(data.credits || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user credits:', error)
    }
  }
  
  const loadFeedbackFromDatabase = async (sessionId: string) => {
    try {
      // TODO: Create API endpoint to fetch interview session with feedback
      // For now, we'll use the existing feedback generation approach
      setIsLoading(false)
      setError("Database loading not yet implemented. Please use the interview completion flow.")
    } catch (error) {
      console.error('Failed to load feedback:', error)
      setError("Failed to load feedback. Please try again.")
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    // Skip during server-side rendering or if component is not mounted
    if (!isMounted) {
      return;
    }
    
    // Check if we have a session ID in URL (database-powered)
    const sessionId = searchParams.get('session')
    
    if (sessionId) {
      // Load from database
      setIsLoading(true)
      loadFeedbackFromDatabase(sessionId)
      return
    }
    
    // Otherwise, check for localStorage data
    const data = loadInterviewData()
    
    if (data.error) {
      setIsLoading(false)
      setError(data.error)
      
      // If it's a server-side rendering error, don't return yet
      if (data.isSSR) {
        return;
      }
      return;
    }
    
    // We have local data
    setHasLocalData(true)
    
    if (data.recordingUrl) {
      setRecordingUrl(data.recordingUrl)
    }
    
    if (data.fillerWordStats) {
      setFillerWordStats(data.fillerWordStats)
    }
    
    // Generate feedback from local data
    generateFeedback(data.messages, data.fillerWordCounts, data.resumeData)
  }, [isMounted, searchParams])

  const generateFeedback = async (
    messages: Array<{ role: string; content: string }>,
    _fillerWordCounts: { [key: string]: number } = {},
    _resumeData: any = null,
  ) => {
    setIsGenerating(true)
    setError(null)

    try {
      // For localStorage-based feedback, we'll generate feedback without creating a database session
      // The feedback API now supports fromLocalStorage flag to handle this case
      const interviewId = null // We don't need an interview ID for localStorage-based feedback
      
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId,
          transcript: messages,
          fromLocalStorage: true, // Flag to indicate this is localStorage-based feedback
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || errorData.message || `Failed to generate feedback (${response.status})`)
      }

      const data = await response.json()
      
      // Convert the API response to the format expected by the UI
      if (data.feedback) {
        const formattedFeedback = []
        
        // Add interview metrics if available (for edge cases)
        if (data.feedback.interviewMetrics?.completeness === "partial") {
          formattedFeedback.push({
            category: "Interview Completion",
            rating: "Info",
            feedback: `This was a ${data.feedback.interviewMetrics.completeness} interview with ${data.feedback.interviewMetrics.userResponses} responses. Complete interviews typically have 5+ substantive responses for comprehensive feedback.`
          })
        }
        
        // Add main feedback sections
        formattedFeedback.push(
          {
            category: "Overall Summary",
            rating: "Feedback",
            feedback: data.feedback.summary || "Unable to generate detailed summary. Please complete a full interview for comprehensive feedback."
          },
          {
            category: "Strengths",
            rating: "Good",
            feedback: data.feedback.strengths || "Continue practicing to identify and build upon your strengths."
          },
          {
            category: "Areas for Improvement",
            rating: "Consider",
            feedback: data.feedback.areasForImprovement || "Complete a full interview session to receive specific improvement recommendations."
          },
          {
            category: "Performance Score",
            rating: data.feedback.transcriptScore >= 3 ? "Good" : data.feedback.transcriptScore >= 2 ? "Satisfactory" : "Needs Improvement",
            feedback: `Your overall performance score is ${data.feedback.transcriptScore?.toFixed(2) || 'N/A'} out of 4.${
              data.feedback.transcriptScore < 2 ? " Focus on providing more detailed and relevant responses." : ""
            }`
          }
        )
        
        setFeedback(formattedFeedback)
      } else {
        throw new Error("Invalid feedback response format")
      }
    } catch (err) {
      console.error("Error generating feedback:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      // Don't set mock feedback - let the error be visible
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const handleRegenerateFeedback = () => {
    // Skip during server-side rendering or if component is not mounted
    if (typeof window === 'undefined' || !isMounted) {
      return;
    }
    
    const data = loadInterviewData()
    
    if (data.error) {
      setError(data.error)
      // If it's a server-side rendering error, don't return
      if (data.isSSR) {
        return;
      }
      return
    }
    
    if (data.recordingUrl) {
      setRecordingUrl(data.recordingUrl)
    }
    
    if (data.fillerWordStats) {
      setFillerWordStats(data.fillerWordStats)
    }
    
    generateFeedback(data.messages, data.fillerWordCounts, data.resumeData)
  }
  
  const handleEnhancedFeedbackPurchase = async () => {
    if (userCredits < 0.5) {
      toast.error("Insufficient VocahireCredits", {
        description: "You need at least 0.50 VocahireCredits to unlock enhanced feedback."
      })
      return
    }
    
    setIsProcessingEnhanced(true)
    
    try {
      // Get interview ID from search params or localStorage
      const sessionId = searchParams.get('session')
      const localInterviewId = safeLocalStorageGet("vocahire_interview_id")
      const interviewId = sessionId || localInterviewId
      
      if (!interviewId) {
        toast.error("No interview found", {
          description: "Please complete an interview first."
        })
        return
      }
      
      // Call enhanced feedback API
      const response = await fetch('/api/feedback/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interviewId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate enhanced feedback')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Update user credits display
        setUserCredits(prev => prev - (data.creditsDeducted || 0))
        
        // Store enhanced feedback
        setEnhancedFeedback(data.enhancedFeedback)
        setShowEnhancedFeedback(true)
        
        toast.success("Enhanced feedback unlocked!", {
          description: "Your detailed analysis is ready."
        })
        
        // Optionally refresh user data to get updated credits
        fetchUserCredits()
      }
      
    } catch (error) {
      console.error("Failed to generate enhanced feedback:", error)
      toast.error("Failed to generate enhanced feedback", {
        description: error instanceof Error ? error.message : "Please try again later."
      })
    } finally {
      setIsProcessingEnhanced(false)
    }
  }

  // Sync localStorage data to database
  const attemptDataSync = async () => {
    const localMessages = safeLocalStorageGet('vocahire_interview_messages')
    const localMetadata = safeLocalStorageGet('vocahire_interview_metadata')
    
    if (!localMessages) {
      toast.error("No local data to sync")
      return
    }
    
    setIsSyncing(true)
    
    try {
      const messages = JSON.parse(localMessages)
      const metadata = localMetadata ? JSON.parse(localMetadata) : {}
      const authToken = await getToken()
      
      if (!authToken) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionId: `local-${Date.now()}`, // Generate unique ID for local session
          jobTitle: metadata.jobTitle || "Software Engineer",
          resumeData: null,
          messages: messages,
          startTime: messages[0]?.timestamp || metadata.timestamp,
          endTime: messages[messages.length - 1]?.timestamp || Date.now(),
          duration: (messages[messages.length - 1]?.timestamp || Date.now()) - (messages[0]?.timestamp || metadata.timestamp),
          metrics: {
            totalUserMessages: messages.filter((m: any) => m.role === "user").length,
            totalAssistantMessages: messages.filter((m: any) => m.role === "assistant").length,
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to sync data")
      }
      
      const result = await response.json()
      
      // Clear localStorage after successful sync
      localStorage.removeItem('vocahire_interview_messages')
      localStorage.removeItem('vocahire_interview_metadata')
      localStorage.removeItem('vocahire_interview_id')
      
      toast.success('Interview data synced successfully!', {
        description: 'Your interview has been saved to your account.'
      })
      
      // Redirect to the database-powered feedback page
      window.location.href = result.redirectUrl || `/feedback?session=${result.id}`
      
    } catch (error) {
      console.error("Sync failed:", error)
      toast.error('Failed to sync interview data', {
        description: error instanceof Error ? error.message : 'Please try again later.'
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <SessionLayout>
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">Generating Interview Feedback</h1>
        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl text-center">
          Please wait while we analyze your interview performance...
        </p>

        <div className="grid gap-6 max-w-3xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-6 w-[100px]" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-[80%]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </SessionLayout>
    )
  }

  return (
    <SessionLayout>
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">Interview Feedback</h1>
      <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl text-center mb-8">
        Here's your personalized feedback from your mock interview
      </p>

      {error && (
        <Alert variant="destructive" className="max-w-3xl mx-auto mb-6 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasLocalData && (
        <Alert className="max-w-3xl mx-auto mb-6 shadow-lg">
          <CloudUpload className="h-4 w-4" />
          <AlertTitle>Local Interview Data</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>This interview is saved locally in your browser. Would you like to sync it to your account?</p>
            <Button 
              onClick={attemptDataSync} 
              disabled={isSyncing}
              size="sm"
              className="mt-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Sync to Account
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 max-w-3xl mx-auto">
        {feedback &&
          feedback.map((item, index) => (
            <FeedbackCard key={index} category={item.category} rating={item.rating} feedback={item.feedback} />
          ))}

        {fillerWordStats && fillerWordStats.total > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Speech Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                During your interview, you used <strong>{fillerWordStats.total} filler words</strong> in total.
                {fillerWordStats.total > 15
                  ? " This is higher than recommended for professional communication."
                  : fillerWordStats.total > 5
                    ? " Try to reduce this in future interviews."
                    : " This is a good level - keep it up!"}
              </p>

              {fillerWordStats.mostCommon.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Most common filler words:</p>
                  <ul className="list-disc pl-5">
                    {fillerWordStats.mostCommon.map((item, i) => (
                      <li key={i}>
                        "{item.word}" - used {item.count} time{item.count !== 1 ? "s" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Enhanced Feedback CTA - Show after basic feedback */}
        {feedback && !showEnhancedFeedback && !enhancedFeedback && (
          <EnhancedFeedbackCTA
            onPurchase={handleEnhancedFeedbackPurchase}
            userCredits={userCredits}
            isProcessing={isProcessingEnhanced}
          />
        )}
        
        {/* Enhanced Feedback Display - Show when available */}
        {showEnhancedFeedback && enhancedFeedback && (
          <EnhancedFeedbackDisplay enhancedFeedback={enhancedFeedback} />
        )}

        {recordingUrl && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Interview Recording</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Your interview was recorded and is available for review. Listening to your responses can help you
                identify areas for improvement.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md">
                  <a href={recordingUrl} target="_blank" rel="noopener noreferrer" download="interview-recording.webm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>Practice makes perfect! Schedule another mock interview to continue improving your skills.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">
                <Link href="/interview">Start New Interview</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleRegenerateFeedback} disabled={isGenerating} className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md">
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Regenerate Feedback"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SessionLayout>
  )
}

export default function FeedbackPage() {
  return (
    <AuthGuard>
      <FeedbackPageContent />
    </AuthGuard>
  );
}
