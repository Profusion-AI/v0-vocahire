"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock } from "lucide-react"

export default function TestInterviewMockPage() {
  const [status, setStatus] = useState<"idle" | "active" | "ended">("idle")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [inputText, setInputText] = useState("")

  // Mock interview questions
  const mockQuestions = [
    "Hello! I'll be conducting your interview today. Could you start by telling me a bit about your background and experience?",
    "That's interesting. Can you tell me about a challenging project you worked on recently?",
    "How do you approach problem-solving in your work?",
    "What are your strengths and weaknesses as a professional?",
    "Where do you see yourself in 5 years?",
    "Thank you for your time today. Do you have any questions for me?",
  ]

  // Timer countdown when interview is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (status === "active" && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId)
            setStatus("ended")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [status, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = () => {
    setStatus("active")
    // Add the first question
    setMessages([{ role: "assistant", content: mockQuestions[0] }])
  }

  const handleEndInterview = () => {
    setStatus("ended")
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: inputText }])
    setInputText("")

    // Simulate AI response after a delay
    setTimeout(() => {
      const questionIndex = Math.min(Math.floor(messages.length / 2) + 1, mockQuestions.length - 1)
      setMessages((prev) => [...prev, { role: "assistant", content: mockQuestions[questionIndex] }])
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Mock Interview Simulation</h1>
      <p className="text-center text-muted-foreground mb-8">
        This is a simplified mock interview that doesn't require the OpenAI API
      </p>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mock Interview: Software Engineer</CardTitle>
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              <span className={timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="min-h-[300px] p-4 rounded-md bg-muted">
            {status === "idle" && (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Ready to start your mock interview?</h3>
                <p className="text-muted-foreground mb-4">
                  This is a simplified mock interview simulation that doesn't require the OpenAI API.
                </p>
                <Button onClick={handleStartInterview} className="mt-6" size="lg">
                  Start Mock Interview
                </Button>
              </div>
            )}

            {status === "active" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                  </div>
                </div>

                <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.role === "assistant" ? "bg-primary/10 ml-4" : "bg-secondary/10 mr-4"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{msg.role === "assistant" ? "Interviewer" : "You"}</p>
                      <p>{msg.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <textarea
                      className="flex-1 p-2 border rounded-md resize-none"
                      placeholder="Type your response..."
                      rows={2}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={status !== "active"}
                    ></textarea>
                    <Button onClick={handleSendMessage} disabled={!inputText.trim() || status !== "active"}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "ended" && (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Interview Complete</h3>
                <p className="text-muted-foreground mb-4">
                  Your mock interview has ended. In a real implementation, you would be redirected to your feedback.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Start New Mock Interview
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {status === "active" && (
            <Button variant="destructive" onClick={handleEndInterview}>
              End Interview Early
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
