"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackCard } from "@/components/feedback-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, RefreshCw } from "lucide-react"

export default function FeedbackPage() {
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
    // Check if we have interview data in localStorage
    const messagesJson = localStorage.getItem("vocahire_interview_messages")
    const fillerWordsJson = localStorage.getItem("vocahire_filler_words")
    const resumeDataJson = localStorage.getItem("vocahire_resume_data")
    const recordingUrlJson = localStorage.getItem("vocahire_recording_url")

    if (recordingUrlJson) {
      setRecordingUrl(recordingUrlJson)
    }

    if (!messagesJson) {
      setIsLoading(false)
      setError("No interview data found. Please complete an interview first.")
      return
    }

    const messages = JSON.parse(messagesJson)
    const fillerWordCounts = fillerWordsJson ? JSON.parse(fillerWordsJson) : {}
    const resumeData = resumeDataJson ? JSON.parse(resumeDataJson) : null

    // Calculate filler word stats
    if (fillerWordsJson) {
      const counts = JSON.parse(fillerWordsJson)
      const total = Object.values(counts).reduce((sum: number, count: number) => sum + count, 0)
      const mostCommon = Object.entries(counts)
        .map(([word, count]) => ({ word, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      setFillerWordStats({ total, mostCommon })
    }

    // Generate feedback
    generateFeedback(messages, fillerWordCounts, resumeData)
  }, [])

  const generateFeedback = async (
    messages: Array<{ role: string; content: string }>,
    fillerWordCounts: { [key: string]: number } = {},
    resumeData: any = null,
  ) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          fillerWordCounts,
          resumeData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate feedback")
      }

      const data = await response.json()
      setFeedback(data.feedback)
    } catch (err) {
      console.error("Error generating feedback:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")

      // Fall back to mock feedback if generation fails
      setFeedback([
        {
          category: "Communication Skills",
          rating: "Good",
          feedback:
            "You articulated your thoughts clearly and provided specific examples to support your points. Your responses were well-structured, though occasionally you could be more concise. Continue practicing active listening and responding directly to the questions asked.",
        },
        {
          category: "Technical Knowledge",
          rating: "Excellent",
          feedback:
            "You demonstrated strong understanding of the technical concepts discussed and explained complex ideas in an accessible way. Your examples of past projects showed both depth and breadth of knowledge. Keep up with current trends to maintain this strength.",
        },
        {
          category: "Problem-Solving Approach",
          rating: "Good",
          feedback:
            "You approached problems methodically, breaking them down into manageable components. You asked clarifying questions when needed and considered multiple solutions. To improve, try to verbalize your thought process more clearly as you work through problems.",
        },
        {
          category: "Areas for Improvement",
          rating: "Consider",
          feedback:
            "Focus on being more concise in your responses while still providing sufficient detail. Practice quantifying your achievements with specific metrics. Work on maintaining consistent eye contact and reducing filler words like 'um' and 'like' in your speech.",
        },
      ])
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const handleRegenerateFeedback = () => {
    const messagesJson = localStorage.getItem("vocahire_interview_messages")
    const fillerWordsJson = localStorage.getItem("vocahire_filler_words")
    const resumeDataJson = localStorage.getItem("vocahire_resume_data")

    if (!messagesJson) {
      setError("No interview data found. Please complete an interview first.")
      return
    }

    const messages = JSON.parse(messagesJson)
    const fillerWordCounts = fillerWordsJson ? JSON.parse(fillerWordsJson) : {}
    const resumeData = resumeDataJson ? JSON.parse(resumeDataJson) : null

    generateFeedback(messages, fillerWordCounts, resumeData)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Generating Interview Feedback</h1>
        <p className="text-center text-muted-foreground mb-8">
          Please wait while we analyze your interview performance...
        </p>

        <div className="grid gap-6 max-w-3xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
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
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Interview Feedback</h1>
      <p className="text-center text-muted-foreground mb-8">
        Here's your personalized feedback from your mock interview
      </p>

      {error && (
        <Alert variant="destructive" className="max-w-3xl mx-auto mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 max-w-3xl mx-auto">
        {feedback &&
          feedback.map((item, index) => (
            <FeedbackCard key={index} category={item.category} rating={item.rating} feedback={item.feedback} />
          ))}

        {fillerWordStats && fillerWordStats.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Speech Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

        {recordingUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Recording</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your interview was recorded and is available for review. Listening to your responses can help you
                identify areas for improvement.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <a href={recordingUrl} target="_blank" rel="noopener noreferrer" download="interview-recording.webm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Practice makes perfect! Schedule another mock interview to continue improving your skills.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/interview">Start New Interview</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleRegenerateFeedback} disabled={isGenerating}>
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
    </div>
  )
}
