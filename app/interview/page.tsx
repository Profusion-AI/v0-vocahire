"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InterviewRoom } from "@/components/InterviewRoom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"

export default function InterviewPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  const handleInterviewComplete = async (messages: Array<{ role: string; content: string; timestamp: number }>) => {
    setIsProcessing(true)

    try {
      if (!user) {
        throw new Error("No user found")
      }

      // Extract transcript from messages
      const transcript = messages
        .map((msg) => `${msg.role === "assistant" ? "Interviewer" : "You"}: ${msg.content}`)
        .join("\n\n")

      // Check if the table exists first
      const { error: checkError } = await supabase.from("interviews").select("id").limit(1)

      if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
        // Table doesn't exist, redirect to dashboard for setup
        router.push("/dashboard")
        return
      }

      // Create a new interview record
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          user_id: user.id,
          transcript: transcript,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Generate feedback (in a real app, this would be done by an AI service)
      // For now, we'll redirect to the feedback page
      router.push(`/feedback?id=${data.id}`)
    } catch (error) {
      console.error("Error processing interview:", error)
      toast({
        title: "Error",
        description: "Failed to process interview. Please try again.",
        variant: "destructive",
      })

      // For demo purposes, redirect to feedback page anyway
      router.push("/feedback")
    } finally {
      setIsProcessing(false)
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
        <InterviewRoom onComplete={handleInterviewComplete} />
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This is a simulated interview experience. Speak clearly and answer as you would in a real interview.</p>
      </div>
    </div>
  )
}
