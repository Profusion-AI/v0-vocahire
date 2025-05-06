"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"

interface Interview {
  id: string
  created_at: string
  duration: number | null
  feedback: {
    summary: string
  } | null
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        if (!user) return

        const { data, error } = await supabase.from("interviews").select("*").order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setInterviews(data || [])
      } catch (error) {
        console.error("Error fetching interviews:", error)
        toast({
          title: "Error",
          description: "Failed to load interviews. Please try again.",
          variant: "destructive",
        })

        // For demo purposes, show some sample interviews
        setInterviews([
          {
            id: "interview_1",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            duration: 600,
            feedback: {
              summary: "You demonstrated good technical knowledge and communication skills during the interview.",
            },
          },
          {
            id: "interview_2",
            created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
            duration: 540,
            feedback: {
              summary: "Your answers were concise and relevant, showing good preparation for the interview.",
            },
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchInterviews()
    }
  }, [toast, router, user])

  if (isLoading || loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Your Interview History</h1>
      <p className="text-center text-gray-500 mb-8">Review your past interviews and feedback</p>

      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push("/interview")}>Start New Interview</Button>
      </div>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500 mb-4">You haven't completed any interviews yet.</p>
            <Button onClick={() => router.push("/interview")}>Start Your First Interview</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {interviews.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <CardTitle>Interview Session</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interview.feedback ? (
                  <p className="line-clamp-2">{interview.feedback.summary}</p>
                ) : (
                  <p className="text-gray-500">No feedback available</p>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/feedback?id=${interview.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Feedback
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
