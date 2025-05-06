"use client"

import { useState } from "react"
import { useInterviewSession } from "@/hooks/useInterviewSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Clock, Volume2, VolumeX, Bug } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TestInterviewPage() {
  const { status, messages, start, stop, isConnecting, isActive, error, debug } = useInterviewSession()
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isMuted, setIsMuted] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [selectedRole, setSelectedRole] = useState("Software Engineer")

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    try {
      await start(selectedRole)
    } catch (err) {
      console.error("Failed to start interview:", err)
    }
  }

  const toggleMute = () => {
    const audioElements = document.querySelectorAll("audio")
    audioElements.forEach((audio) => {
      audio.muted = !isMuted
    })
    setIsMuted(!isMuted)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Test Interview Session</h1>
      <p className="text-center text-muted-foreground mb-8">
        This page allows you to test the real-time voice interview functionality
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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
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

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-1"
                >
                  <Bug className="h-4 w-4" />
                  {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                </Button>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mock Interview: {selectedRole}</CardTitle>
              {isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {showDebug && debug && (
              <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-md text-blue-700 dark:text-blue-300 text-sm font-mono">
                <p className="font-medium mb-2">Debug Info:</p>
                <p>{debug}</p>
              </div>
            )}

            <div className="min-h-[300px] p-4 rounded-md bg-muted">
              {status === "idle" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Ready to test the interview functionality?</h3>
                  <p className="text-muted-foreground mb-4">
                    This will start a real-time voice conversation with an AI interviewer for a {selectedRole} position.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Before starting:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside text-left max-w-md mx-auto">
                      <li>Ensure your microphone is working</li>
                      <li>Make sure your speakers or headphones are connected</li>
                      <li>You can end the interview at any time</li>
                    </ul>
                  </div>
                  <Button onClick={handleStartInterview} className="mt-6" size="lg">
                    Start Test Interview
                  </Button>
                </div>
              )}

              {(isConnecting || isActive) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        isActive ? "bg-green-100 dark:bg-green-900/20" : "bg-amber-100 dark:bg-amber-900/20"
                      }`}
                    >
                      {isActive ? (
                        <Mic className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                      ) : (
                        <Mic className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    {isConnecting && <p>Connecting to interviewer...</p>}
                    {isActive && <p>Interview in progress. Speak clearly into your microphone.</p>}
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {messages.length === 0 && isActive && (
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
                </div>
              )}

              {status === "ended" && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Interview Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    The test interview has ended. You can start a new one to continue testing.
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            {isActive && (
              <Button variant="destructive" onClick={stop}>
                End Interview
              </Button>
            )}
            {!isActive && status !== "idle" && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Start New Test
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
