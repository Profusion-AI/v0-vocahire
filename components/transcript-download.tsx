"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface TranscriptDownloadProps {
  messages: Array<{ role: string; content: string; timestamp: number }>
  jobTitle?: string
}

export function TranscriptDownload({ messages, jobTitle = "Interview" }: TranscriptDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateMarkdown = () => {
    const date = new Date().toLocaleDateString()
    const title = `# ${jobTitle} Interview Transcript - ${date}\n\n`

    const content = messages
      .map((msg) => {
        const role = msg.role === "assistant" ? "Interviewer" : "You"
        const time = new Date(msg.timestamp).toLocaleTimeString()
        return `## ${role} (${time})\n\n${msg.content}\n\n`
      })
      .join("---\n\n")

    return title + content
  }

  const downloadTranscript = () => {
    setIsGenerating(true)

    try {
      const markdown = generateMarkdown()
      const blob = new Blob([markdown], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${jobTitle.toLowerCase().replace(/\s+/g, "-")}-interview-transcript.md`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error generating transcript:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={downloadTranscript} disabled={isGenerating || messages.length === 0}>
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : "Download Transcript"}
    </Button>
  )
}
