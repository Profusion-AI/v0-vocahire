"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Play, Square, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useInterviewSession } from "@/hooks/useInterviewSession"

interface InterviewRoomProps {
  onInterviewComplete: (transcript: string) => void
}

export function InterviewRoom({ onInterviewComplete }: InterviewRoomProps) {
  const [userInput, setUserInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)

  const { status, messages, transcript, timeLeft, start, end, simulateUserSpeaking, audioRef } = useInterviewSession({
    onTranscriptUpdate: (updatedTranscript) => {
      // This would be called whenever the transcript is updated
      console.log("Transcript updated:", updatedTranscript)
    },
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndInterview = () => {
    end()
    onInterviewComplete(transcript)
  }

  const handleSendMessage = () => {
    if (userInput.trim() && status === "recording") {
      simulateUserSpeaking(userInput.trim())
      setUserInput("")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Mock Interview</span>
          <span className={`font-mono ${timeLeft < 60 ? "text-red-500" : ""}`}>{formatTime(timeLeft)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-y-auto p-4 border rounded-md">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Start the interview to begin the conversation
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === "assistant" ? "bg-gray-100 dark:bg-gray-800" : "bg-primary/10 ml-8"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>

        {status === "recording" && (
          <div className="flex space-x-2">
            <Textarea
              placeholder="Type your response here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button onClick={handleSendMessage} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-center">
          {status === "recording" && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording</span>
            </div>
          )}
        </div>

        {/* Hidden audio element for playing AI responses */}
        <audio ref={audioRef} className="hidden" />
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <Button onClick={start} className="w-full">
            <Play className="mr-2 h-4 w-4" /> Start Interview
          </Button>
        )}

        {status === "connecting" && (
          <Button disabled className="w-full">
            Connecting...
          </Button>
        )}

        {status === "recording" && (
          <div className="w-full flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsMuted(!isMuted)}
              className={isMuted ? "bg-red-100 dark:bg-red-900" : ""}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="ml-2">Mic</span>
            </Button>
            <Button variant="destructive" onClick={handleEndInterview}>
              <Square className="mr-2 h-4 w-4" /> End Interview
            </Button>
          </div>
        )}

        {status === "ended" && (
          <Button disabled className="w-full">
            Interview Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
