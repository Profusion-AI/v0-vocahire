"use client"

import { useState, useEffect, Suspense } from "react"
import InterviewRoom from "@/components/InterviewRoom"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ResumeData } from "@/components/resume-input"

export default function InterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobTitle, setJobTitle] = useState<string>("Software Engineer")
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [hasResumeData, setHasResumeData] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Get job title from query params if available
    const jobTitleParam = searchParams.get("jobTitle")
    if (jobTitleParam) {
      setJobTitle(jobTitleParam)
    }

    // Check if we have saved resume data
    const savedData = localStorage.getItem("vocahire_resume_data")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setResumeData(parsedData)
        setHasResumeData(true)

        // Use job title from resume data if not specified in URL
        if (!jobTitleParam && parsedData.jobTitle) {
          setJobTitle(parsedData.jobTitle)
        }
      } catch (err) {
        console.error("Error parsing saved resume data:", err)
        setHasResumeData(false)
      }
    } else {
      setHasResumeData(false)
    }

    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Mock Interview</h1>
        <div className="flex justify-center">
          <Skeleton className="h-[500px] w-full max-w-3xl" />
        </div>
      </div>
    )
  }

  if (!hasResumeData) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Mock Interview</h1>
        <p className="text-center text-muted-foreground mb-8">
          For a more personalized interview experience, please provide some details about your background
        </p>

        <div className="max-w-md mx-auto text-center">
          <p className="mb-6">
            Adding details from your resume will help our AI interviewer ask more relevant questions and provide better
            feedback.
          </p>
          <Button asChild size="lg">
            <Link href={`/prepare?jobTitle=${encodeURIComponent(jobTitle)}`}>Add Resume Details</Link>
          </Button>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href={`?skipResume=true&jobTitle=${encodeURIComponent(jobTitle)}`}>Skip this step</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mock Interview</h1>

      <div className="mb-4 text-center text-sm text-muted-foreground">
        <p>
          Interview for: <strong>{jobTitle}</strong>
        </p>
      </div>

      <Suspense fallback={<InterviewSkeleton />}>
        <InterviewRoom jobTitle={jobTitle} resumeData={resumeData} />
      </Suspense>
    </div>
  )
}

function InterviewSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
  )
}
