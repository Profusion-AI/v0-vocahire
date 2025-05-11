"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function TestInterviewMockPage() {
  const [status, setStatus] = useState<"idle" | "active" | "ended">("idle")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: number }>>(
    [],
  )
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [selectedRole, setSelectedRole] = useState("Software Engineer")
  const [userInput, setUserInput] = useState("")

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

    // Add initial interviewer message
    setTimeout(() => {
      addMessage(
        "assistant",
        `Hello! I'll be conducting your interview for the ${selectedRole} position. Could you start by telling me about your background and experience?`,
      )
    }, 1000)
  }

  const handleEndInterview = () => {
    setStatus("ended")
  }

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content, timestamp: Date.now() }])
  }

  const handleUserTextInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Add user message
    addMessage("user", userInput)
    setUserInput("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      // Generate a simple response based on the user's input
      let response = ""

      if (userInput.toLowerCase().includes("experience") || userInput.toLowerCase().includes("background")) {
        response = `Thank you for sharing your experience. Can you tell me about a challenging project you worked on recently?`
      } else if (userInput.toLowerCase().includes("project") || userInput.toLowerCase().includes("challenge")) {
        response = `That sounds interesting. How did you approach problem-solving in that situation?`
      } else if (userInput.toLowerCase().includes("problem") || userInput.toLowerCase().includes("solution")) {
        response = `Great approach. What would you say are your key strengths and areas for improvement?`
      } else if (userInput.toLowerCase().includes("strength") || userInput.toLowerCase().includes("weakness")) {
        response = `Thank you for sharing that. Where do you see yourself in 5 years?`
      } else if (userInput.toLowerCase().includes("year") || userInput.toLowerCase().includes("future")) {
        response = `Interesting goals. How do you stay updated with the latest trends in your field?`
      } else if (userInput.toLowerCase().includes("learn") || userInput.toLowerCase().includes("trend")) {
        response = `That's a good approach to learning. Do you have any questions for me about the position?`
      } else if (userInput.toLowerCase().includes("question")) {
        response = `Thank you for your time today. We'll be in touch with next steps.`
      } else {
        response = `Thank you for sharing that. Can you tell me more about how your skills align with this ${selectedRole} position?`
      }

      addMessage("assistant", response)
    }, 1500)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Mock Interview (Text-Based)</h1>
      <p className="text-center text-muted-foreground mb-8">
        This page allows you to test the interview functionality in text-only mode
      </p>

      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole} disabled={status !== "idle"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="UX Designer">UX Designer</SelectItem>
                    <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className={timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mock Interview: {selectedRole}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="min-h-[300px] p-4 rounded-md bg-muted">
              {status === "idle" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Ready to test the interview functionality?</h3>
                  <p className="text-muted-foreground mb-4">
                    This will start a text-based mock interview for a {selectedRole} position.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Note:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside text-left max-w-md mx-auto">
                      <li>This is a simplified text-based interview</li>
                      <li>You can type your responses in the text box</li>
                      <li>The interview will last 10 minutes</li>
                      <li>You can end the interview at any time</li>
                    </ul>
                  </div>
                  <Button onClick={handleStartInterview} className="mt-6" size="lg">
                    Start Mock Interview
                  </Button>
                </div>
              )}

              {status === "active" && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p>Text-based interview in progress. Type your responses below.</p>
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground italic">
                        <p>The interviewer will begin shortly...</p>
                      </div>
                    )}
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

                  {/* Text input */}
                  <form onSubmit={handleUserTextInput} className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your response here..."
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button type="submit" disabled={!userInput.trim()}>
                        Send
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {status === "ended" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Interview Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    The mock interview has ended. You can start a new one to continue testing.
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            {status === "active" && (
              <Button variant="destructive" onClick={handleEndInterview}>
                End Interview
              </Button>
            )}
            {status === "ended" && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Start New Interview
              </Button>
            )}
            {status === "ended" && (
              <Button asChild>
                <Link href="/feedback">View Feedback</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
