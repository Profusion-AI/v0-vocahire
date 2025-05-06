"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Interview {
  id: string
  createdAt: string
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

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews")

        if (!response.ok) {
          throw new Error("Failed to fetch interviews")
        }

        const data = await response.json()
        setInterviews(data)
      } catch (error) {
        console.error("Error fetching interviews:", error)
        toast({
          title: "Error",
          description: "Failed to load interviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterviews()
  }, [toast])

  return (
    <AuthGuard>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Your Interview History</h1>
        <p className="text-center text-gray-500 mb-8">Review your past interviews and feedback</p>

        <div className="flex justify-end mb-6">
          <Button onClick={() => router.push("/interview")}>Start New Interview</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
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
                        {formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true })}
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
          </>
        )}
      </div>
    </AuthGuard>
  )
}
