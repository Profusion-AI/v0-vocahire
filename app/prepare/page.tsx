"use client"

import { useState, useEffect } from "react"
import { ResumeInput, type ResumeData } from "@/components/resume-input"
import { useRouter, useSearchParams } from "next/navigation"

export default function PreparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [defaultJobTitle, setDefaultJobTitle] = useState("Software Engineer")

  useEffect(() => {
    // Get job title from query params if available
    const jobTitle = searchParams.get("jobTitle")
    if (jobTitle) {
      setDefaultJobTitle(jobTitle)
    }

    // Check if we have saved resume data
    const savedData = localStorage.getItem("vocahire_resume_data")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.jobTitle) {
          setDefaultJobTitle(parsedData.jobTitle)
        }
      } catch (err) {
        console.error("Error parsing saved resume data:", err)
      }
    }
  }, [searchParams])

  const handleSubmit = (resumeData: ResumeData) => {
    // Store resume data in localStorage
    localStorage.setItem("vocahire_resume_data", JSON.stringify(resumeData))

    // Navigate to interview page
    router.push(`/interview?jobTitle=${encodeURIComponent(resumeData.jobTitle)}`)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Prepare for Your Interview</h1>
      <p className="text-center text-muted-foreground mb-8">
        Provide details from your resume to make the interview more relevant to your experience
      </p>

      <div className="max-w-3xl mx-auto">
        <ResumeInput onSubmit={handleSubmit} defaultJobTitle={defaultJobTitle} />
      </div>
    </div>
  )
}
