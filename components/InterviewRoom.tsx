"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface InterviewRoomProps {
  onInterviewComplete: (transcript: string) => void
}

export function InterviewRoom({ onInterviewComplete }: InterviewRoomProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle")
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [transcript, setTranscript] = useState<string>("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const { toast } = useToast()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch token and initialize WebRTC when starting interview
  const startInterview = async () => {
    setStatus("connecting")

    try {
      // In a real implementation, we would use the token to initialize WebRTC
      // For now, we'll simulate the interview

      // Start the interview
      setStatus("active")
      startTimer()

      // Add initial message
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your interview coach. Let's start with a common question: Can you tell me about yourself and your background?",
        },
      ])
    } catch (error) {
      console.error("Error starting interview:", error)
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      })
      setStatus("idle")
    }
  }

  // Start the timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endInterview()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // End the interview
  const endInterview = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setStatus("ended")

    // Generate a transcript from the messages
    const fullTranscript = messages
      .map((msg) => `${msg.role === "assistant" ? "Interviewer" : "You"}: ${msg.content}`)
      .join("\n\n")
    setTranscript(fullTranscript)

    // Call the callback with the transcript
    onInterviewComplete(fullTranscript)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Simulate user response (in a real app, this would be replaced with actual voice input)
  const simulateUserResponse = () => {
    const userResponses = [
      "I have 5 years of experience in software development, specializing in frontend technologies like React and Vue. I've worked on projects ranging from e-commerce platforms to data visualization dashboards.",
      "In my previous role, I led a team of 3 developers to deliver a major feature that increased user engagement by 25%. We implemented a new notification system that was well-received by users.",
      "I believe my strongest skill is problem-solving. I enjoy breaking down complex issues into manageable parts and finding efficient solutions.",
      "One challenge I faced was optimizing a slow-performing application. I identified bottlenecks through profiling and implemented caching strategies that improved load times by 40%.",
      "I'm looking for opportunities to grow my skills in cloud architecture and work with distributed systems at scale.",
    ]

    const randomResponse = userResponses[Math.floor(Math.random() * userResponses.length)]

    setMessages((prev) => [...prev, { role: "user", content: randomResponse }])

    // Simulate interviewer follow-up after a delay
    setTimeout(() => {
      const interviewerFollowUps = [
        "That's interesting. Can you tell me about a specific challenge you faced in your previous role and how you overcame it?",
        "What would you say are your greatest strengths and weaknesses?",
        "How do you handle tight deadlines and pressure?",
        "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
        "Where do you see yourself in 5 years?",
      ]

      const randomFollowUp = interviewerFollowUps[Math.floor(Math.random() * interviewerFollowUps.length)]

      setMessages((prev) => [...prev, { role: "assistant", content: randomFollowUp }])
    }, 2000)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                status === "idle"
                  ? "bg-gray-400"
                  : status === "connecting"
                    ? "bg-yellow-400"
                    : status === "active"
                      ? "bg-green-400 animate-pulse"
                      : "bg-blue-400"
              }`}
            />
            <span className="font-medium">
              {status === "idle"
                ? "Ready to start"
                : status === "connecting"
                  ? "Connecting..."
                  : status === "active"
                    ? "Interview in progress"
                    : "Interview completed"}
            </span>
          </div>
          {(status === "active" || status === "ended") && (
            <div className="text-sm font-mono">
              {status === "active" ? `Time remaining: ${formatTime(timeRemaining)}` : "Time's up!"}
            </div>
          )}
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {status === "idle"
                  ? "Click 'Start Interview' to begin"
                  : status === "connecting"
                    ? "Connecting to interview session..."
                    : "No messages yet"}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === "assistant" ? "bg-gray-100 dark:bg-gray-800" : "bg-primary/10 ml-8"
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.role === "assistant" ? "Interviewer" : "You"}</p>
                <p>{message.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          {status === "idle" && (
            <Button onClick={startInterview} className="w-full">
              Start Interview
            </Button>
          )}
          {status === "active" && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Speak clearly and answer the interviewer's questions</p>
                <Button variant="outline" size="sm" onClick={endInterview}>
                  End Early
                </Button>
              </div>
              {/* This button is just for demo purposes to simulate user responses */}
              <Button onClick={simulateUserResponse}>Simulate Response</Button>
            </div>
          )}
          {status === "ended" && (
            <p className="text-center text-gray-500">Interview completed. Generating your feedback...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
