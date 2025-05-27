"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { AudioProcessor, AudioRecorder, AudioPlaybackQueue } from "@/lib/audio-processing"
import { toast } from "sonner"
import type { 
  RealtimeInputSchema, 
  RealtimeOutputSchema,
  InterviewDifficultySchema 
} from "@/src/genkit/schemas/types"
import { z } from "zod"

interface UseGenkitRealtimeInterviewProps {
  jobRole: string;
  difficulty: z.infer<typeof InterviewDifficultySchema>;
  systemInstruction: string;
}

export function useGenkitRealtimeInterview({
  jobRole,
  difficulty,
  systemInstruction,
}: UseGenkitRealtimeInterviewProps) {
  const { userId, getToken } = useAuth()
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'ended'>('idle')
  const [transcript, setTranscript] = useState<Array<{ speaker: 'user' | 'ai'; text: string; timestamp: string }>>([])
  const [isRecording, setIsRecording] = useState(false)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const audioProcessorRef = useRef<AudioProcessor | null>(null)
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const playbackQueueRef = useRef<AudioPlaybackQueue | null>(null)
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substring(7)}`)

  // Initialize audio components
  useEffect(() => {
    audioProcessorRef.current = new AudioProcessor()
    playbackQueueRef.current = new AudioPlaybackQueue()
    audioRecorderRef.current = new AudioRecorder()

    return () => {
      if (audioRecorderRef.current?.getIsRecording()) {
        audioRecorderRef.current.stop()
      }
      playbackQueueRef.current?.stop()
    }
  }, [])

  // Connect to GenKit SSE endpoint
  const connect = useCallback(async () => {
    if (!userId) {
      toast.error('User not authenticated')
      return
    }

    try {
      setStatus('connecting')
      const token = await getToken()

      // Initial connection request
      const response = await fetch('/api/genkit-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          jobRole,
          difficulty,
          systemInstruction,
          controlMessage: { type: 'start' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
      })

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`)
      }

      // Set up EventSource for SSE
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      // Process SSE stream
      const processStream = async () => {
        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              const eventType = line.substring(6).trim()
              continue
            }
            
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.substring(5))
                handleSSEMessage(data)
              } catch (error) {
                console.error('Error parsing SSE data:', error)
              }
            }
          }
        }
      }

      processStream().catch(console.error)
      
      // Start audio recording
      startRecording()
      
    } catch (error) {
      console.error('Connection error:', error)
      setStatus('error')
      toast.error('Failed to connect to interview service')
    }
  }, [userId, getToken, jobRole, difficulty, systemInstruction])

  // Handle SSE messages
  const handleSSEMessage = useCallback((message: z.infer<typeof RealtimeOutputSchema>) => {
    switch (message.type) {
      case 'control':
        if (message.data.status === 'connected' || message.data.status === 'ready') {
          setStatus('connected')
          toast.success('Connected to interview service')
        } else if (message.data.status === 'disconnected') {
          setStatus('ended')
          toast.info('Interview session ended')
        }
        break

      case 'audio':
        // Play audio response
        if (audioProcessorRef.current && playbackQueueRef.current) {
          const audioBuffer = audioProcessorRef.current.base64ToArrayBuffer(message.data)
          audioProcessorRef.current.processAudioFromLiveAPI(audioBuffer)
            .then(buffer => playbackQueueRef.current?.enqueue(buffer))
            .catch(console.error)
        }
        break

      case 'transcript':
        // Update transcript
        setTranscript(prev => [...prev, {
          speaker: message.data.speaker,
          text: message.data.text,
          timestamp: message.data.timestamp || new Date().toISOString(),
        }])
        break

      case 'error':
        console.error('Stream error:', message.data)
        toast.error(message.data.message || 'An error occurred')
        if (!message.data.retryable) {
          setStatus('error')
        }
        break

      case 'thinking':
        // Could show thinking indicator
        break
    }
  }, [])

  // Start audio recording
  const startRecording = useCallback(async () => {
    try {
      await audioRecorderRef.current?.start(async (chunk) => {
        if (audioProcessorRef.current && status === 'connected') {
          const pcmData = await audioProcessorRef.current.processAudioForLiveAPI(chunk)
          sendAudioChunk(pcmData)
        }
      })
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      toast.error('Microphone access denied')
    }
  }, [status])

  // Send audio chunk via fetch
  const sendAudioChunk = useCallback(async (audioBuffer: ArrayBuffer) => {
    if (!userId || status !== 'connected') return

    try {
      const token = await getToken()
      const base64Audio = audioProcessorRef.current?.arrayBufferToBase64(audioBuffer)

      await fetch('/api/genkit-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          jobRole,
          difficulty,
          systemInstruction,
          audioChunk: base64Audio,
        } satisfies z.infer<typeof RealtimeInputSchema>),
      })
    } catch (error) {
      console.error('Error sending audio:', error)
    }
  }, [userId, status, getToken, jobRole, difficulty, systemInstruction])

  // Send text message
  const sendText = useCallback(async (text: string) => {
    if (!userId || status !== 'connected') return

    try {
      const token = await getToken()

      await fetch('/api/genkit-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          jobRole,
          difficulty,
          systemInstruction,
          textInput: text,
        } satisfies z.infer<typeof RealtimeInputSchema>),
      })
    } catch (error) {
      console.error('Error sending text:', error)
      toast.error('Failed to send message')
    }
  }, [userId, status, getToken, jobRole, difficulty, systemInstruction])

  // End interview
  const endInterview = useCallback(async () => {
    if (!userId) return

    try {
      const token = await getToken()

      await fetch('/api/genkit-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          jobRole,
          difficulty,
          systemInstruction,
          controlMessage: { type: 'stop' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
      })

      // Stop recording
      audioRecorderRef.current?.stop()
      playbackQueueRef.current?.stop()
      setIsRecording(false)
      setStatus('ended')
    } catch (error) {
      console.error('Error ending interview:', error)
    }
  }, [userId, getToken, jobRole, difficulty, systemInstruction])

  // Interrupt AI
  const interrupt = useCallback(async () => {
    if (!userId || status !== 'connected') return

    try {
      const token = await getToken()

      await fetch('/api/genkit-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          jobRole,
          difficulty,
          systemInstruction,
          controlMessage: { type: 'interrupt' },
        } satisfies z.infer<typeof RealtimeInputSchema>),
      })

      playbackQueueRef.current?.clear()
    } catch (error) {
      console.error('Error interrupting:', error)
    }
  }, [userId, status, getToken, jobRole, difficulty, systemInstruction])

  return {
    status,
    transcript,
    isRecording,
    connect,
    sendText,
    endInterview,
    interrupt,
    sessionId: sessionIdRef.current,
  }
}