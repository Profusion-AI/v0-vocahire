"use client"

import React, { useEffect, useRef, useState } from 'react'

interface AudioLevelIndicatorProps {
  /**
   * Whether to actively monitor audio levels
   */
  isActive?: boolean
  /**
   * Height of the indicator bars
   */
  height?: number
  /**
   * Number of bars to display
   */
  barCount?: number
  /**
   * Whether to show noise level feedback text
   */
  showFeedback?: boolean
  /**
   * Custom CSS classes
   */
  className?: string
  /**
   * Callback when permission is denied
   */
  onPermissionDenied?: () => void
  /**
   * Callback when microphone is successfully accessed
   */
  onMicrophoneReady?: () => void
}

export function AudioLevelIndicator({
  isActive = true,
  height = 60,
  barCount = 5,
  showFeedback = true,
  className = '',
  onPermissionDenied,
  onMicrophoneReady,
}: AudioLevelIndicatorProps) {
  const [audioLevel, setAudioLevel] = useState(0)
  const [noiseFeedback, setNoiseFeedback] = useState<string>('')
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!isActive) {
      // Clean up when not active
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      return
    }

    const setupAudioAnalyser = async () => {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        setPermissionState('granted')
        onMicrophoneReady?.()

        // Create audio context and analyser
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext

        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser

        // Connect microphone to analyser
        const microphone = audioContext.createMediaStreamSource(stream)
        microphoneRef.current = microphone
        microphone.connect(analyser)

        // Start monitoring audio levels
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        
        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray)
            
            // Calculate average volume level
            const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
            const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1
            
            setAudioLevel(normalizedLevel)
            
            // Update noise feedback
            if (showFeedback) {
              if (normalizedLevel < 0.05) {
                setNoiseFeedback('No audio detected - Check your microphone')
              } else if (normalizedLevel < 0.2) {
                setNoiseFeedback('Audio level is good')
              } else if (normalizedLevel < 0.5) {
                setNoiseFeedback('Speaking clearly - Perfect!')
              } else if (normalizedLevel < 0.7) {
                setNoiseFeedback('A bit loud - You might be too close to the mic')
              } else {
                setNoiseFeedback('Too loud! - Possible background noise or mic sensitivity')
              }
            }
            
            animationFrameRef.current = requestAnimationFrame(updateLevel)
          }
        }
        
        updateLevel()
        
      } catch (error) {
        console.error('Error accessing microphone:', error)
        setPermissionState('denied')
        onPermissionDenied?.()
      }
    }

    setupAudioAnalyser()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [isActive, showFeedback, onPermissionDenied, onMicrophoneReady])

  // Determine color based on audio level
  const getBarColor = (barIndex: number, totalBars: number) => {
    const barThreshold = (barIndex + 1) / totalBars
    
    if (audioLevel < barThreshold) {
      return 'bg-gray-300' // Inactive bar
    }
    
    // Active bar colors based on level
    if (audioLevel < 0.5) {
      return 'bg-green-500' // Good level
    } else if (audioLevel < 0.7) {
      return 'bg-yellow-500' // Getting loud
    } else {
      return 'bg-red-500' // Too loud
    }
  }

  // Determine feedback text color
  const getFeedbackColor = () => {
    if (audioLevel < 0.05) return 'text-gray-500'
    if (audioLevel < 0.5) return 'text-green-600'
    if (audioLevel < 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (permissionState === 'denied') {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-red-600 text-sm">Microphone access denied</p>
        <p className="text-gray-500 text-xs mt-1">Please allow microphone access in your browser settings</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Audio level bars */}
      <div className="flex items-end justify-center gap-1" style={{ height: `${height}px` }}>
        {Array.from({ length: barCount }).map((_, index) => {
          const barHeight = ((index + 1) / barCount) * 100
          const isActive = audioLevel > (index / barCount)
          
          return (
            <div
              key={index}
              className={`w-3 rounded-t transition-all duration-150 ease-out ${
                getBarColor(index, barCount)
              }`}
              style={{
                height: `${isActive ? barHeight : 20}%`,
                opacity: isActive ? 1 : 0.3,
              }}
            />
          )
        })}
      </div>
      
      {/* Noise feedback */}
      {showFeedback && noiseFeedback && (
        <p className={`text-center text-sm font-medium ${getFeedbackColor()}`}>
          {noiseFeedback}
        </p>
      )}
      
      {/* Visual indicator for audio detection */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <div 
            className={`h-2 w-2 rounded-full transition-all duration-150 ${
              audioLevel > 0.05 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-xs text-gray-600">
            {audioLevel > 0.05 ? 'Microphone active' : 'Waiting for audio...'}
          </span>
        </div>
      </div>
    </div>
  )
}