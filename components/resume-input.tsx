"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface ResumeInputProps {
  onSubmit?: (resumeData: ResumeData) => void
  defaultJobTitle?: string
}

export interface ResumeData {
  jobTitle: string
  skills: string
  experience: string
  education: string
  achievements: string
}

export function ResumeInput({ onSubmit, defaultJobTitle = "Software Engineer" }: ResumeInputProps) {
  const router = useRouter()
  const [resumeData, setResumeData] = useState<ResumeData>({
    jobTitle: defaultJobTitle,
    skills: "",
    experience: "",
    education: "",
    achievements: "",
  })

  const handleChange = (field: keyof ResumeData, value: string) => {
    setResumeData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Store resume data in localStorage for persistence
    localStorage.setItem("vocahire_resume_data", JSON.stringify(resumeData))

    if (onSubmit) {
      onSubmit(resumeData)
    } else {
      // If no onSubmit handler is provided, navigate to the interview page
      router.push(`/interview?jobTitle=${encodeURIComponent(resumeData.jobTitle)}`)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personalize Your Interview</CardTitle>
        <CardDescription>
          Provide details from your resume to make the interview more relevant to your experience
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Target Job Title</Label>
            <Input
              id="jobTitle"
              value={resumeData.jobTitle}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Key Skills</Label>
            <Textarea
              id="skills"
              value={resumeData.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
              placeholder="List your key technical and soft skills"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea
              id="experience"
              value={resumeData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder="Summarize your relevant work experience"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={resumeData.education}
              onChange={(e) => handleChange("education", e.target.value)}
              placeholder="Your educational background"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Key Achievements</Label>
            <Textarea
              id="achievements"
              value={resumeData.achievements}
              onChange={(e) => handleChange("achievements", e.target.value)}
              placeholder="Notable achievements or projects"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Start Personalized Interview
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
