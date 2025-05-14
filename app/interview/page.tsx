"use client"

import { useState, useEffect, useCallback } from "react"
import InterviewRoom from "@/components/InterviewRoom"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import type { ResumeData } from "@/components/resume-input"

import AuthGuard from "@/components/auth/AuthGuard";

function InterviewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobTitle, setJobTitle] = useState<string>("Software Engineer")
  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [hasResumeData, setHasResumeData] = useState<boolean>(false)
  const [skipResume, setSkipResume] = useState(false)

  // Use useCallback for the interview completion handler to prevent recreation on every render
  const handleInterviewComplete = useCallback(
    (messages: any[]) => {
      // Store messages in localStorage for the feedback page
      localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages))

      // Navigate to feedback page
      router.push("/feedback")
    },
    [router],
  )

  // Get job title from query params and load resume data - only run once on mount
  useEffect(() => {
    // Get skipResume from URL once
    setSkipResume(searchParams.get("skipResume") === "true")

    const title = searchParams.get("jobTitle")
    if (title) {
      setJobTitle(title)
    }

    // Try to get resume data from localStorage
    try {
      const storedResumeData = localStorage.getItem("vocahire_resume_data")
      if (storedResumeData) {
        const parsedData = JSON.parse(storedResumeData)
        setResumeData(parsedData)
        setHasResumeData(true)

        // Use job title from resume data if not specified in URL
        if (!title && parsedData.jobTitle) {
          setJobTitle(parsedData.jobTitle)
        }
      } else {
        setHasResumeData(false)
      }
    } catch (err) {
      console.error("Error loading resume data:", err)
      setHasResumeData(false)
    }

    setIsLoading(false)
  }, []) // Empty dependency array - only run once on mount

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
        <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
      </div>
    )
  }

  // If no resume data and not skipping resume step, show resume prompt
  if (!hasResumeData && !skipResume) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Mock Interview</h1>
        <p className="text-center text-muted-foreground mb-8">
          For a more personalized interview experience, please provide some details about your background
        </p>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Add Resume Details</CardTitle>
            <CardDescription>
              Adding details from your resume will help our AI interviewer ask more relevant questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The AI interviewer will use your resume information to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Ask targeted questions about your experience</li>
              <li>Focus on skills relevant to the {jobTitle} position</li>
              <li>Provide more personalized feedback</li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={`/prepare?jobTitle=${encodeURIComponent(jobTitle)}`}>Add Resume Details</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={`/interview?skipResume=true&jobTitle=${encodeURIComponent(jobTitle)}`}>Skip this step</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Interview Session</h1>
      <div className="mb-4 text-center text-sm text-muted-foreground">
        <p>
          Position: <strong>{jobTitle}</strong>
          {hasResumeData && " • Resume data loaded"}
        </p>
      </div>
      <InterviewRoom jobTitle={jobTitle} onComplete={handleInterviewComplete} resumeData={resumeData} />
    </div>
  )
}

export default function InterviewPage() {
  return (
    <AuthGuard>
      <InterviewPageContent />
    </AuthGuard>
  );
}
