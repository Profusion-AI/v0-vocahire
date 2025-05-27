"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Phone, Loader2, Volume2, MessageSquare } from "lucide-react"
import { InterviewMessage } from "@/hooks/useLiveInterviewSession"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface LiveInterviewRoomProps {
  status: string
  messages: InterviewMessage[]
  isActive: boolean
  isMuted: boolean
  elapsedTime: number
  onToggleMute: () => void
  onEndInterview: () => void
  onSendText?: (text: string) => void
  debugMessages?: string[]
}

export function LiveInterviewRoom({
  status,
  messages,
  isActive,
  isMuted,
  elapsedTime,
  onToggleMute,
  onEndInterview,
  onSendText,
  debugMessages = [],
}: LiveInterviewRoomProps) {
  const [textInput, setTextInput] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  // Format elapsed time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
    }
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
  }

  // Detect AI thinking state
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      const timeSinceLastMessage = Date.now() - lastMessage.timestamp
      
      if (lastMessage.role === "user" && timeSinceLastMessage < 3000) {
        setIsThinking(true)
      } else {
        setIsThinking(false)
      }
    }
  }, [messages])

  // Handle text input
  const handleSendText = () => {
    if (textInput.trim() && onSendText) {
      onSendText(textInput.trim())
      setTextInput("")
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[800px] relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Badge variant={isActive ? "default" : "secondary"} className="animate-pulse">
            {isActive ? "Interview Active" : status.replace(/_/g, " ").toUpperCase()}
          </Badge>
          {isActive && (
            <span className="text-sm text-muted-foreground font-mono">
              {formatTime(elapsedTime)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {process.env.NODE_ENV === "development" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
            >
              Debug {showDebug ? "ON" : "OFF"}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMute}
            disabled={!isActive}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onEndInterview}
            disabled={!isActive}
          >
            <Phone className="h-4 w-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <Card
                className={cn(
                  "max-w-[70%] p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-start gap-2">
                  {message.role === "assistant" && (
                    <Volume2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm">{message.content}</p>
                    {message.confidence && (
                      <p className="text-xs opacity-70">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <Card className="p-4 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text Input (Accessibility) */}
      {onSendText && (
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendText()
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type a message (for accessibility)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={!isActive}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!isActive || !textInput.trim()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Audio Visualizer */}
      {isActive && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: [10, 20, 10],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && debugMessages.length > 0 && (
        <div className="absolute inset-0 bg-black/80 z-50 p-4 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-white font-mono text-sm mb-2">Debug Messages:</h3>
            {debugMessages.map((msg, i) => (
              <div key={i} className="text-xs text-green-400 font-mono">
                {msg}
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowDebug(false)}
            className="mt-4"
          >
            Close Debug
          </Button>
        </div>
      )}
    </div>
  )
}