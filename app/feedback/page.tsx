"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { FeedbackCard } from "@/components/FeedbackCard"
import { Button } from "@/components/ui/button"
import { PurchaseButton } from "@/components/PurchaseButton"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackItem {
  id: string
  title: string
  content: string
  type: "positive" | "improvement" | "neutral"
}

interface FeedbackData {
  summary: string
  items: FeedbackItem[]
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const interviewId = searchParams.get("id")
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        if (!interviewId) {
          // If no interview ID, show demo feedback
          setTimeout(() => {
            setFeedback({
              summary:
                "You demonstrated good technical knowledge and communication skills during the interview. There are some areas for improvement in structuring your responses and providing specific examples.",
              items: [
                {
                  id: "1",
                  title: "Strong Technical Knowledge",
                  content:
                    "You provided clear explanations of technical concepts and demonstrated a solid understanding of the technologies discussed.",
                  type: "positive",
                },
                {
                  id: "2",
                  title: "Communication Skills",
                  content:
                    "Your communication was clear and professional. You maintained good energy throughout the interview.",
                  type: "positive",
                },
                {
                  id: "3",
                  title: "Response Structure",
                  content:
                    "Your answers could benefit from a more structured approach. Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions.",
                  type: "improvement",
                },
                {
                  id: "4",
                  title: "Specific Examples",
                  content:
                    "Try to include more specific metrics and outcomes when discussing your achievements. This helps interviewers understand the impact of your work.",
                  type: "improvement",
                },
                {
                  id: "5",
                  title: "Question Handling",
                  content:
                    "You handled most questions well, though sometimes took too long to get to the main point. Practice being more concise while still being thorough.",
                  type: "neutral",
                },
              ],
            })
            setIsLoading(false)
          }, 1500)
          return
        }

        // Fetch real feedback from API
        const response = await fetch(`/api/interviews/${interviewId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch feedback")
        }

        const data = await response.json()
        setFeedback(data.feedback)
      } catch (error) {
        console.error("Error fetching feedback:", error)
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [interviewId, toast])

  return (
    <AuthGuard>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Your Interview Feedback</h1>
        <p className="text-center text-gray-500 mb-8">
          Review your personalized feedback and insights from your mock interview
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {feedback && (
              <>
                <div className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h2 className="text-xl font-bold mb-4">Summary</h2>
                  <p>{feedback.summary}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {feedback.items.map((item) => (
                    <FeedbackCard key={item.id} title={item.title} content={item.content} type={item.type} />
                  ))}
                </div>
              </>
            )}

            <div className="mt-12 space-y-6">
              <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold mb-4">Want more detailed feedback?</h2>
                <p className="mb-6">
                  Purchase a premium session to receive in-depth analysis, personalized improvement strategies, and
                  access to additional practice interviews.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <PurchaseButton userId={session?.user?.id || ""} className="flex-1">
                    Upgrade to Premium
                  </PurchaseButton>
                  <Button variant="outline" className="flex-1" onClick={() => router.push("/interview")}>
                    Try Another Interview
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  )
}
