"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import type { InterviewMessage } from "@/hooks/useRealtimeInterviewSession"

interface TranscriptDownloadProps {
  messages: InterviewMessage[]
  jobTitle: string
}

export function TranscriptDownload({ messages, jobTitle }: TranscriptDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadTranscript = () => {
    try {
      setIsGenerating(true)

      // Format the transcript
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      let transcriptContent = `# Interview Transcript - ${jobTitle}\n`
      transcriptContent += `Date: ${formattedDate}\n\n`

      messages.forEach((msg, index) => {
        const speaker = msg.role === "assistant" ? "Interviewer" : "You"
        const timestamp = new Date(msg.timestamp).toLocaleTimeString()
        transcriptContent += `**${speaker}** (${timestamp}):\n${msg.content}\n\n`
      })

      // Create a blob and download link
      const blob = new Blob([transcriptContent], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `interview-transcript-${new Date().toISOString().split("T")[0]}.md`
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsGenerating(false)
      }, 100)
    } catch (error) {
      console.error("Error generating transcript:", error)
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadTranscript}
      disabled={isGenerating || messages.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Download Transcript"}
    </Button>
  )
}
