"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InterviewRoom } from "@/components/InterviewRoom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"

export default function InterviewPage() {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, session } = useAuth()

  const handleInterviewComplete = async (interviewTranscript: string) => {
    setTranscript(interviewTranscript)
    setIsProcessing(true)

    try {
      if (!session) {
        throw new Error("No session available")
      }

      // Create a new interview record and generate feedback
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          user_id: user?.id,
          transcript: interviewTranscript,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

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

      // For demo purposes, redirect to feedback page anyway
      router.push("/feedback")
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
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
  )
}
