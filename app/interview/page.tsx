"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { InterviewRoom } from "@/components/InterviewRoom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InterviewPage() {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tableError, setTableError] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  // Check if the interviews table exists
  useEffect(() => {
    const checkTable = async () => {
      if (!user) return

      try {
        // Try to query the interviews table
        const { error } = await supabase.from("interviews").select("id").limit(1)

        // If there's an error about the table not existing
        if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
          setTableError(true)
        }
      } catch (error) {
        console.error("Error checking table:", error)
      }
    }

    checkTable()
  }, [user])

  const handleInterviewComplete = async (interviewTranscript: string) => {
    setTranscript(interviewTranscript)
    setIsProcessing(true)

    try {
      if (!user) {
        throw new Error("No user found")
      }

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

  // If the table doesn't exist, show a message and redirect to dashboard
  if (tableError) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Database Setup Required</h1>

        <Alert variant="warning" className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription>
            The interviews table doesn't exist in your database yet. Please go to the dashboard to set up your database.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
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
