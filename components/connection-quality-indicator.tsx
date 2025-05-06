"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionQualityIndicatorProps {
  peerConnection: RTCPeerConnection | null
  className?: string
}

export function ConnectionQualityIndicator({ peerConnection, className }: ConnectionQualityIndicatorProps) {
  const [quality, setQuality] = useState<"unknown" | "poor" | "medium" | "good">("unknown")
  const [stats, setStats] = useState<{
    packetsLost?: number
    packetsReceived?: number
    jitter?: number
    roundTripTime?: number
  }>({})

  useEffect(() => {
    if (!peerConnection) {
      setQuality("unknown")
      return
    }

    let intervalId: NodeJS.Timeout

    // Start monitoring connection quality
    const monitorConnectionQuality = async () => {
      try {
        // Get stats from the peer connection
        const stats = await peerConnection.getStats()
        let packetsLost = 0
        let packetsReceived = 0
        let jitter = 0
        let roundTripTime = 0

        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && report.kind === "audio") {
            packetsLost = report.packetsLost || 0
            packetsReceived = report.packetsReceived || 0
            jitter = report.jitter || 0
          }
          if (report.type === "remote-inbound-rtp") {
            roundTripTime = report.roundTripTime || 0
          }
        })

        setStats({
          packetsLost,
          packetsReceived,
          jitter,
          roundTripTime,
        })

        // Calculate packet loss percentage
        const packetLossPercentage = packetsReceived > 0 ? (packetsLost / packetsReceived) * 100 : 0

        // Determine connection quality based on metrics
        if (peerConnection.iceConnectionState !== "connected" && peerConnection.iceConnectionState !== "completed") {
          setQuality("poor")
        } else if (packetLossPercentage > 5 || jitter > 0.1 || roundTripTime > 0.5) {
          setQuality("poor")
        } else if (packetLossPercentage > 1 || jitter > 0.05 || roundTripTime > 0.2) {
          setQuality("medium")
        } else {
          setQuality("good")
        }
      } catch (error) {
        console.error("Error getting connection stats:", error)
      }
    }

    // Check connection quality every 2 seconds
    intervalId = setInterval(monitorConnectionQuality, 2000)
    monitorConnectionQuality() // Initial check

    return () => {
      clearInterval(intervalId)
    }
  }, [peerConnection])

  const getQualityColor = () => {
    switch (quality) {
      case "good":
        return "text-green-500"
      case "medium":
        return "text-amber-500"
      case "poor":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  const getQualityText = () => {
    switch (quality) {
      case "good":
        return "Good"
      case "medium":
        return "Fair"
      case "poor":
        return "Poor"
      default:
        return "Unknown"
    }
  }

  const getQualityIcon = () => {
    if (quality === "poor" || quality === "unknown") {
      return <WifiOff className="h-4 w-4" />
    }
    return <Wifi className="h-4 w-4" />
  }

  return (
    <div
      className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", getQualityColor(), className)}
      title={`Connection Quality: ${getQualityText()}${
        stats.roundTripTime ? ` (RTT: ${(stats.roundTripTime * 1000).toFixed(0)}ms)` : ""
      }`}
    >
      {getQualityIcon()}
      <span>{getQualityText()}</span>
    </div>
  )
}
