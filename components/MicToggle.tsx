"use client"

import React from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MicToggleProps {
  isMuted: boolean
  onToggle: () => void
  showReminder?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function MicToggle({ 
  isMuted, 
  onToggle, 
  showReminder = false,
  size = 'default',
  className = '' 
}: MicToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        onClick={onToggle}
        size={size}
        variant={isMuted ? 'destructive' : 'default'}
        className={`
          relative transition-all duration-300 ease-out
          ${isMuted 
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
            : 'bg-green-600 hover:bg-green-700 shadow-green-500/25'
          }
          shadow-lg hover:shadow-xl transform hover:scale-105
        `}
      >
        <div className="relative">
          {isMuted ? (
            <MicOff className={`
              ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
              transition-transform duration-300
              ${isMuted ? 'animate-pulse' : ''}
            `} />
          ) : (
            <Mic className={`
              ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
              transition-transform duration-300
            `} />
          )}
        </div>
        
        {/* Animated ring effect when muted */}
        {isMuted && (
          <div className="absolute inset-0 rounded-md">
            <div className="absolute inset-0 rounded-md bg-red-400 opacity-75 animate-ping" />
          </div>
        )}
      </Button>
      
      {/* Reminder text when muted during active interview */}
      {showReminder && isMuted && (
        <div className="flex items-center gap-2 text-sm animate-fade-in">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-600 font-medium">Microphone is muted</span>
        </div>
      )}
    </div>
  )
}