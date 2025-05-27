"use client"

import { useState, useEffect } from "react"
import { useLiveInterviewSession } from "@/hooks/useLiveInterviewSession"
import { LiveInterviewRoom } from "@/components/LiveInterviewRoom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles } from "lucide-react"
import { InterviewLoadingScreen } from "@/components/InterviewLoadingScreen"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth/AuthGuard"

export default function LiveInterviewPage() {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [difficulty, setDifficulty] = useState<"entry" | "mid" | "senior">("mid")
  const [resumeText, setResumeText] = useState("")
  const [showPrep, setShowPrep] = useState(true)

  const {
    status,
    messages,
    transcript,
    debugMessages,
    isActive,
    isConnecting,
    isMuted,
    elapsedTime,
    sessionData,
    startInterview,
    endInterview,
    toggleMute,
    sendTextMessage,
    isAuthenticated,
  } = useLiveInterviewSession({
    jobTitle,
    difficulty,
    resumeData: resumeText ? {
      jobTitle,
      skills: resumeText,
      experience: "",
      education: "",
      achievements: "",
    } : null,
  })

  // Handle interview start
  const handleStartInterview = () => {
    setShowPrep(false)
    startInterview()
  }

  // Show loading screen during connection
  if (!showPrep && (isConnecting || ["requesting_mic", "creating_session", "connecting_live_api"].includes(status))) {
    return <InterviewLoadingScreen />
  }

  // Show interview room when active
  if (!showPrep && (isActive || status === "active")) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-4 max-w-4xl h-screen">
          <LiveInterviewRoom
            status={status}
            messages={messages}
            isActive={isActive}
            isMuted={isMuted}
            elapsedTime={elapsedTime}
            onToggleMute={toggleMute}
            onEndInterview={endInterview}
            onSendText={sendTextMessage}
            debugMessages={debugMessages}
          />
        </div>
      </AuthGuard>
    )
  }

  // Show preparation screen
  return (
    <AuthGuard>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Live AI Interview (Beta)</h1>
          <p className="text-lg text-muted-foreground">
            Experience real-time conversation with Google's Gemini Live API
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Powered by GenKit + Live API</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interview Setup</CardTitle>
            <CardDescription>
              Prepare for your AI-powered mock interview session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Experience Level</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="resume">Resume Summary (Optional)</Label>
              <Textarea
                id="resume"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your key skills, experience, and achievements..."
                rows={5}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">What to Expect:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time voice conversation with AI interviewer</li>
                <li>• Natural, flowing dialogue with follow-up questions</li>
                <li>• Professional feedback after the interview</li>
                <li>• ~20-30 minute interview session</li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => router.push("/interview")}
              >
                Use Classic Mode
              </Button>
              <Button
                size="lg"
                onClick={handleStartInterview}
                disabled={!jobTitle.trim()}
                className="min-w-[200px]"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Live Interview
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🎤 Make sure your microphone is ready and you're in a quiet environment</p>
          <p className="mt-2">💡 This uses Google's Live API for ultra-low latency conversation</p>
        </div>
      </div>
    </AuthGuard>
  )
}