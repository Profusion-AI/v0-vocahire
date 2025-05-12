"use client"

import { useState, useRef, useCallback } from "react"

interface InterviewRecorderProps {
  onRecordingComplete?: (blob: Blob, url: string) => void
}

export function useInterviewRecorder({ onRecordingComplete }: InterviewRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    try {
      setError(null)

      // Reset previous recording if any
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl)
        setRecordingUrl(null)
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setRecordingUrl(url)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        // Call callback if provided
        if (onRecordingComplete) {
          onRecordingComplete(blob, url)
        }
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      startTimeRef.current = Date.now()

      // Start timer to track duration
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError(err instanceof Error ? err.message : "Failed to start recording")
    }
  }, [onRecordingComplete, recordingUrl])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const saveRecording = useCallback(
    async (sessionId: string) => {
      if (!recordingUrl || chunksRef.current.length === 0) {
        setError("No recording available to save")
        return null
      }

      try {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })

        const formData = new FormData()
        formData.append("audio", blob)
        formData.append("sessionId", sessionId)

        const response = await fetch("/api/recordings", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to save recording")
        }

        const data = await response.json()
        return data.url
      } catch (err) {
        console.error("Error saving recording:", err)
        setError(err instanceof Error ? err.message : "Failed to save recording")
        return null
      }
    },
    [recordingUrl],
  )

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return {
    isRecording,
    recordingUrl,
    error,
    duration,
    formattedDuration: formatDuration(duration),
    startRecording,
    stopRecording,
    saveRecording,
  }
}
