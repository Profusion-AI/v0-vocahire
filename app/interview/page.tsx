"use client"

import { useState, useEffect, useCallback } from "react"
import InterviewRoom from "@/components/InterviewRoom";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import type { ResumeData } from "@/components/resume-input";
import { Navbar } from "@/components/navbar"; // Import Navbar
import ProfilePage from "@/app/profile/page"; // Import ProfilePage
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import Tabs for view switching

import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";

function InterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobTitle, setJobTitle] = useState<string>("Software Engineer");
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasResumeData, setHasResumeData] = useState<boolean>(false);
  const [skipResume, setSkipResume] = useState(false);
  const [currentView, setCurrentView] = useState<"interview" | "profile">("interview"); // State to manage view

  // Use useCallback for the interview completion handler to prevent recreation on every render
  const handleInterviewComplete = useCallback(
    (messages: any[]) => {
      // Store messages in localStorage for the feedback page
      localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages));

      // Navigate to feedback page
      router.push("/feedback");
    },
    [router]
  );

  // Get job title from query params and load resume data - only run once on mount
  useEffect(() => {
    // Get skipResume from URL once
    setSkipResume(searchParams.get("skipResume") === "true");

    const title = searchParams.get("jobTitle");
    if (title) {
      setJobTitle(title);
    }

    // Try to get resume data from localStorage
    try {
      const storedResumeData = localStorage.getItem("vocahire_resume_data");
      if (storedResumeData) {
        const parsedData = JSON.parse(storedResumeData);
        setResumeData(parsedData);
        setHasResumeData(true);

        // Use job title from resume data if not specified in URL
        if (!title && parsedData.jobTitle) {
          setJobTitle(parsedData.jobTitle);
        }
      } else {
        setHasResumeData(false);
      }
    } catch (err) {
      console.error("Error loading resume data:", err);
      setHasResumeData(false);
    }

    setIsLoading(false);
  }, []); // Empty dependency array - only run once on mount

  if (isLoading) {
    return (
      <> {/* Use fragment to include Navbar */}
        <Navbar /> {/* Include Navbar */}
        <SessionLayout>
          <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
        </SessionLayout>
      </>
    );
  }

  // If no resume data and not skipping resume step, show resume prompt
  if (!hasResumeData && !skipResume && currentView === "interview") { // Conditionally render based on view
    return (
      <> {/* Use fragment to include Navbar */}
        <Navbar /> {/* Include Navbar */}
        <SessionLayout>
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">Mock Interview</h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl text-center">
            For a more personalized interview experience, please provide some details about your background
          </p>

          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Add Resume Details</CardTitle>
              <CardDescription className="text-gray-600">
                Adding details from your resume will help our AI interviewer ask more relevant questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700">The AI interviewer will use your resume information to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
                <li>Ask targeted questions about your experience</li>
                <li>Focus on skills relevant to the {jobTitle} position</li>
                <li>Provide more personalized feedback</li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">
                <Link href={`/prepare?jobTitle=${encodeURIComponent(jobTitle)}`}>Add Resume Details</Link>
              </Button>
              <Button variant="outline" asChild className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md">
                <Link href={`/interview?skipResume=true&jobTitle=${encodeURIComponent(jobTitle)}`}>Skip this step</Link>
              </Button>
            </CardFooter>
          </Card>
        </SessionLayout>
      </>
    );
  }

  return (
    <> {/* Use fragment to include Navbar */}
      <Navbar /> {/* Include Navbar */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "interview" | "profile")} className="w-full">
        <div className="flex justify-center py-4 bg-gray-100 dark:bg-gray-800"> {/* Added background for tabs */}
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-md p-1"> {/* Styled TabsList */}
            <TabsTrigger value="interview" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">Interview</TabsTrigger> {/* Styled TabsTrigger */}
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">Profile</TabsTrigger> {/* Styled TabsTrigger */}
          </TabsList>
        </div>
        <TabsContent value="interview" className="mt-0"> {/* Removed default margin-top */}
          <SessionLayout>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center mb-8">Interview Session</h1>
            <div className="mb-4 text-center text-base text-gray-700">
              <p>
                Position: <strong>{jobTitle}</strong>
                {hasResumeData && " • Resume data loaded"}
              </p>
            </div>
            <InterviewRoom jobTitle={jobTitle} onComplete={handleInterviewComplete} resumeData={resumeData} />
          </SessionLayout>
        </TabsContent>
        <TabsContent value="profile" className="mt-0"> {/* Removed default margin-top */}
           {/* ProfilePage is already wrapped in SessionLayout */}
           <ProfilePage />
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function InterviewPage() {
  return (
    <AuthGuard>
      <InterviewPageContent />
    </AuthGuard>
  );
}
