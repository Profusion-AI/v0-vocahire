"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { InterviewRoom } from "@/components/InterviewRoom"
import { useToast } from "@/hooks/use-toast"

export default function InterviewPage() {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInterviewComplete = async (interviewTranscript: string) => {
    setTranscript(interviewTranscript)
    setIsProcessing(true)

    try {
      // Create a new interview record and generate feedback
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: interviewTranscript,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process interview")
      }

      const data = await response.json()

      // Redirect to feedback page
      router.push(`/feedback?id=${data.id}`)
    } catch (error) {
      console.error("Error processing interview:", error)
      toast({
        title: "Error",
        description: "Failed to process interview. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Mock Interview Session</h1>

        {isProcessing ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p>Generating your feedback...</p>
            </div>
            <p className="text-sm text-gray-500">You will be redirected to your feedback shortly.</p>
          </div>
        ) : (
          <InterviewRoom onInterviewComplete={handleInterviewComplete} />
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a simulated interview experience. Speak clearly and answer as you would in a real interview.</p>
        </div>
      </div>
    </AuthGuard>
  )
}
