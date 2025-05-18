"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackCard } from "@/components/feedback-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, RefreshCw } from "lucide-react"

import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";

// Helper function to load interview data from localStorage
function loadInterviewData() {
  const messagesJson = localStorage.getItem("vocahire_interview_messages")
  const fillerWordsJson = localStorage.getItem("vocahire_filler_words")
  const resumeDataJson = localStorage.getItem("vocahire_resume_data")
  const recordingUrlJson = localStorage.getItem("vocahire_recording_url")
  
  if (!messagesJson) {
    return { error: "No interview data found. Please complete an interview first." }
  }
  
  const messages = JSON.parse(messagesJson)
  const fillerWordCounts = fillerWordsJson ? JSON.parse(fillerWordsJson) : {}
  const resumeData = resumeDataJson ? JSON.parse(resumeDataJson) : null
  
  // Calculate filler word stats
  const fillerWordArray = Object.entries(fillerWordCounts)
    .map(([word, count]) => ({ word, count: count as number }))
    .sort((a, b) => b.count - a.count)
  
  const totalFillerWords = fillerWordArray.reduce((sum, item) => sum + item.count, 0)
  
  return {
    messages,
    resumeData,
    interviewType: localStorage.getItem("vocahire_interview_type") || "general",
    interviewTime: localStorage.getItem("vocahire_interview_time") || Date.now().toString(),
    recordingUrl: recordingUrlJson ? JSON.parse(recordingUrlJson) : null,
    fillerWordStats: {
      total: totalFillerWords,
      mostCommon: fillerWordArray.slice(0, 5)
    }
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

  useEffect(() => {
    const interviewData = loadInterviewData()
    
    if ('error' in interviewData) {
      setError(interviewData.error)
      setIsLoading(false)
      return
    }
    
    setFillerWordStats(interviewData.fillerWordStats)
    setRecordingUrl(interviewData.recordingUrl)
    
    // Check if feedback already exists in localStorage
    const existingFeedback = localStorage.getItem("vocahire_interview_feedback")
    if (existingFeedback) {
      setFeedback(JSON.parse(existingFeedback))
      setIsLoading(false)
    } else {
      generateFeedback()
    }
  }, [])

  const generateFeedback = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const interviewData = loadInterviewData()
      
      if ('error' in interviewData) {
        throw new Error(interviewData.error)
      }
      
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: interviewData.messages,
          resumeData: interviewData.resumeData,
          interviewType: interviewData.interviewType,
          interviewTime: interviewData.interviewTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate feedback')
      }

      const data = await response.json()
      setFeedback(data)
      
      // Store feedback in localStorage for persistence
      localStorage.setItem("vocahire_interview_feedback", JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate feedback')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const downloadTranscript = () => {
    const interviewData = loadInterviewData()
    
    if ('error' in interviewData) {
      setError(interviewData.error)
      return
    }
    
    const transcript = interviewData.messages
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => `${msg.role === 'user' ? 'You' : 'AI Interviewer'}: ${msg.content}`)
      .join('\n\n')
    
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'interview-transcript.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadRecording = () => {
    if (!recordingUrl) return
    
    const a = document.createElement('a')
    a.href = recordingUrl
    a.download = 'interview-recording.webm'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading && !isGenerating) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/interview">
            <Button>Start New Interview</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Interview Feedback</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadTranscript}>
            <Download className="mr-2 h-4 w-4" />
            Transcript
          </Button>
          {recordingUrl && (
            <Button variant="outline" size="sm" onClick={downloadRecording}>
              <Download className="mr-2 h-4 w-4" />
              Recording
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={generateFeedback} disabled={isGenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {isGenerating && (
        <Alert className="mb-6">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Generating Feedback</AlertTitle>
          <AlertDescription>
            Analyzing your interview performance. This may take a moment...
          </AlertDescription>
        </Alert>
      )}

      {fillerWordStats && fillerWordStats.total > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filler Words Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Total filler words: {fillerWordStats.total}</p>
            {fillerWordStats.mostCommon.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Most common:</p>
                <div className="flex gap-2">
                  {fillerWordStats.mostCommon.map(({ word, count }) => (
                    <span key={word} className="rounded bg-muted px-2 py-1 text-sm">
                      {word} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {feedback && (
        <div className="space-y-6">
          {feedback.map((item, index) => (
            <FeedbackCard
              key={index}
              category={item.category}
              rating={item.rating as "excellent" | "good" | "satisfactory" | "needs improvement"}
              feedback={item.feedback}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Link href="/interview">
          <Button variant="outline">Practice Again</Button>
        </Link>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <AuthGuard>
      <SessionLayout variant="feedback">
        <FeedbackPageContent />
      </SessionLayout>
    </AuthGuard>
  )
}