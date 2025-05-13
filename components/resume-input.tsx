"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export interface ResumeData {
  jobTitle: string
  skills: string
  experience: string
  education: string
  achievements: string
  // Ensure resumeUrl is part of ResumeData if it's expected by the parent
  resumeUrl?: string; 
}

interface ResumeInputProps {
  onSubmit?: (resumeData: ResumeData) => void
  defaultJobTitle?: string
  value?: ResumeData // Added value prop
  onChange?: (newData: ResumeData) => void // Added onChange prop
}

export function ResumeInput({
  onSubmit,
  defaultJobTitle = "Software Engineer",
  value: controlledValue, // Renamed for clarity
  onChange: onControlledChange, // Renamed for clarity
}: ResumeInputProps) {
  const router = useRouter()
  // Internal state for uncontrolled mode or as initial state for controlled mode
  const [internalResumeData, setInternalResumeData] = useState<ResumeData>(() => {
    if (controlledValue) return controlledValue;
    return {
      jobTitle: defaultJobTitle,
      skills: "",
      experience: "",
      education: "",
      achievements: "",
      resumeUrl: "", // Initialize resumeUrl
    }
  })

  // Determine if the component is controlled
  const isControlled = controlledValue !== undefined;

  // Effect to update internal state if controlledValue changes (for controlled mode)
  useEffect(() => {
    if (isControlled && controlledValue) {
      setInternalResumeData(controlledValue);
    }
  }, [controlledValue, isControlled]);

  // Use controlledValue if provided, otherwise internal state
  const currentResumeData = isControlled ? controlledValue : internalResumeData;

  const handleChange = (field: keyof ResumeData, newValue: string) => {
    const updatedData = { ...currentResumeData, [field]: newValue }
    if (isControlled && onControlledChange) {
      onControlledChange(updatedData)
    } else {
      setInternalResumeData(updatedData)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Store resume data in localStorage for persistence
    localStorage.setItem("vocahire_resume_data", JSON.stringify(currentResumeData))

    if (onSubmit) {
      onSubmit(currentResumeData)
    } else {
      // If no onSubmit handler is provided, navigate to the interview page
      router.push(`/interview?jobTitle=${encodeURIComponent(currentResumeData?.jobTitle || defaultJobTitle)}`)
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
              value={currentResumeData?.jobTitle || ""}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Key Skills</Label>
            <Textarea
              id="skills"
              value={currentResumeData?.skills || ""}
              onChange={(e) => handleChange("skills", e.target.value)}
              placeholder="List your key technical and soft skills"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea
              id="experience"
              value={currentResumeData?.experience || ""}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder="Summarize your relevant work experience"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={currentResumeData?.education || ""}
              onChange={(e) => handleChange("education", e.target.value)}
              placeholder="Your educational background"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Key Achievements</Label>
            <Textarea
              id="achievements"
              value={currentResumeData?.achievements || ""}
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
