"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeUpload } from "@/components/resume-upload"
import { ResumeInput, type ResumeData } from "@/components/resume-input" // Imported ResumeData type

import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";

function PreparePageContent() {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [resumeData, setResumeData] = useState<ResumeData>({
    jobTitle: "Software Engineer",
    skills: "",
    experience: "",
    education: "", // Initialize education
    achievements: "", // Initialize achievements
    resumeUrl: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleStartInterview = () => {
    setIsLoading(true)

    // Save job title and resume data to localStorage
    localStorage.setItem("vocahire_job_title", jobTitle)
    localStorage.setItem("vocahire_resume_data", JSON.stringify(resumeData))

    // Navigate to interview page
    router.push("/interview")
  }

  const handleResumeUpload = (url: string, _filename: string) => {
    setResumeData((prev: ResumeData) => ({ // Added type for prev
      ...prev,
      resumeUrl: url,
    }))
  }

  return (
    <SessionLayout>
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">
        Prepare for Your Interview
      </h1>
      <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl text-center">
        Set up your mock interview by providing some basic information
      </p>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Job Information</CardTitle>
          <CardDescription className="text-gray-600">Tell us what position you're interviewing for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="job-title" className="text-gray-700">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Software Engineer, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-md p-1">
          <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Upload Resume</TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Enter Manually</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <ResumeUpload onUploadComplete={handleResumeUpload} />
        </TabsContent>
        <TabsContent value="manual">
          <ResumeInput value={resumeData} onChange={setResumeData} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleStartInterview} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">
          {isLoading ? "Preparing..." : "Start Interview"}
        </Button>
      </div>
    </SessionLayout>
  )
}

export default function PreparePage() {
  return (
    <AuthGuard>
      <PreparePageContent />
    </AuthGuard>
  );
}
