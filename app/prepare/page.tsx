"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeUpload } from "@/components/resume-upload"
import { ResumeInput } from "@/components/resume-input"

export default function PreparePage() {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [resumeData, setResumeData] = useState({
    skills: "",
    experience: "",
    resumeUrl: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleStartInterview = () => {
    setIsLoading(true)

    // Save job title and resume data to localStorage
    localStorage.setItem("vocahire_job_title", jobTitle)
    localStorage.setItem(
      "vocahire_resume_data",
      JSON.stringify({
        jobTitle,
        ...resumeData,
      }),
    )

    // Navigate to interview page
    router.push("/interview")
  }

  const handleResumeUpload = (url: string, filename: string) => {
    setResumeData((prev) => ({
      ...prev,
      resumeUrl: url,
    }))
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Prepare for Your Interview</h1>
      <p className="text-center text-muted-foreground mb-8">
        Set up your mock interview by providing some basic information
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>Tell us what position you're interviewing for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Software Engineer, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="manual">Enter Manually</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <ResumeUpload onUploadComplete={handleResumeUpload} />
        </TabsContent>
        <TabsContent value="manual">
          <ResumeInput value={resumeData} onChange={setResumeData} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleStartInterview} disabled={isLoading}>
          {isLoading ? "Preparing..." : "Start Interview"}
        </Button>
      </div>
    </div>
  )
}
