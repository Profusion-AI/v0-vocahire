"use client"

import { useState, useRef, useCallback } from "react"

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeBlobs = useRef<string[]>([])

  // Function to play audio from an ArrayBuffer
  const playAudioFromArrayBuffer = useCallback((audioData: ArrayBuffer): boolean => {
    try {
      // Create a blob from the audio data
      const blob = new Blob([audioData], { type: "audio/wav" })
      const url = URL.createObjectURL(blob)

      // Add to active blobs list
      activeBlobs.current.push(url)

      // Create an audio element if it doesn't exist
      if (!audioRef.current) {
        const audio = new Audio()

        audio.onplay = () => {
          setIsPlaying(true)
        }

        audio.onended = audio.onpause = () => {
          setIsPlaying(false)

          // Clean up this blob URL
          if (audio.src) {
            const blobUrl = audio.src
            URL.revokeObjectURL(blobUrl)

            // Remove from active blobs list
            activeBlobs.current = activeBlobs.current.filter((url) => url !== blobUrl)
          }
        }

        audio.onerror = (e) => {
          setError(`Audio error: ${audio.error?.code} - ${audio.error?.message}`)
          setIsPlaying(false)

          // Clean up this blob URL
          if (audio.src) {
            URL.revokeObjectURL(audio.src)

            // Remove from active blobs list
            activeBlobs.current = activeBlobs.current.filter((url) => url !== audio.src)
          }
        }

        audioRef.current = audio
      }

      // Set the source and play
      audioRef.current.src = url
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err)
        setError(`Failed to play audio: ${err.message}`)
        setIsPlaying(false)
        return false
      })

      return true
    } catch (err) {
      console.error("Error processing audio data:", err)
      setError(`Error processing audio: ${err instanceof Error ? err.message : String(err)}`)
      setIsPlaying(false)
      return false
    }
  }, [])

  // Clean up function to revoke all blob URLs
  const cleanup = useCallback(() => {
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    // Revoke all active blob URLs
    activeBlobs.current.forEach((url) => {
      URL.revokeObjectURL(url)
    })

    // Clear the list
    activeBlobs.current = []
  }, [])

  return {
    audioRef,
    isPlaying,
    error,
    playAudioFromArrayBuffer,
    cleanup,
  }
}
