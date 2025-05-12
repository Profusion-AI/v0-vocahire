"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, WifiOff } from "lucide-react"

interface ConnectionQualityIndicatorProps {
  peerConnection: RTCPeerConnection | null
}

export function ConnectionQualityIndicator({ peerConnection }: ConnectionQualityIndicatorProps) {
  const [quality, setQuality] = useState<"excellent" | "good" | "fair" | "poor" | "disconnected">("disconnected")
  const [stats, setStats] = useState<{
    rtt?: number
    packetsLost?: number
    jitter?: number
    timestamp?: number
  }>({})

  useEffect(() => {
    if (!peerConnection) {
      setQuality("disconnected")
      return
    }

    // Update connection state immediately
    updateConnectionState(peerConnection)

    // Set up interval to check connection quality
    const interval = setInterval(() => {
      updateConnectionState(peerConnection)
    }, 2000)

    return () => clearInterval(interval)
  }, [peerConnection])

  const updateConnectionState = async (pc: RTCPeerConnection) => {
    // First check the connection state
    if (
      pc.connectionState === "disconnected" ||
      pc.connectionState === "failed" ||
      pc.connectionState === "closed" ||
      pc.iceConnectionState === "disconnected" ||
      pc.iceConnectionState === "failed" ||
      pc.iceConnectionState === "closed"
    ) {
      setQuality("disconnected")
      return
    }

    // If connected, get stats to determine quality
    try {
      const stats = await pc.getStats()
      let rtt: number | undefined
      let packetsLost: number | undefined
      let jitter: number | undefined
      let timestamp: number | undefined

      stats.forEach((report) => {
        if (report.type === "remote-inbound-rtp" && report.kind === "audio") {
          rtt = report.roundTripTime
          packetsLost = report.packetsLost
          jitter = report.jitter
          timestamp = report.timestamp
        }
      })

      // Update stats
      setStats({
        rtt,
        packetsLost,
        jitter,
        timestamp,
      })

      // Determine quality based on stats
      if (rtt !== undefined && packetsLost !== undefined && jitter !== undefined) {
        if (rtt < 0.1 && packetsLost < 5 && jitter < 0.01) {
          setQuality("excellent")
        } else if (rtt < 0.3 && packetsLost < 15 && jitter < 0.05) {
          setQuality("good")
        } else if (rtt < 0.5 && packetsLost < 30 && jitter < 0.1) {
          setQuality("fair")
        } else {
          setQuality("poor")
        }
      } else {
        // If we can't get detailed stats but connection is active
        if (pc.connectionState === "connected" || pc.iceConnectionState === "connected") {
          setQuality("good") // Default to good if connected but no detailed stats
        } else {
          setQuality("fair") // Default to fair if in connecting state
        }
      }
    } catch (err) {
      console.error("Error getting WebRTC stats:", err)

      // Fallback to basic state check
      if (pc.connectionState === "connected" || pc.iceConnectionState === "connected") {
        setQuality("fair")
      } else {
        setQuality("poor")
      }
    }
  }

  // Render different indicators based on quality
  const renderIndicator = () => {
    switch (quality) {
      case "excellent":
        return <Wifi className="h-5 w-5 text-green-500" />
      case "good":
        return <Wifi className="h-5 w-5 text-green-400" />
      case "fair":
        return <Wifi className="h-5 w-5 text-yellow-500" />
      case "poor":
        return <Wifi className="h-5 w-5 text-orange-500" />
      case "disconnected":
        return <WifiOff className="h-5 w-5 text-red-500" />
    }
  }

  // Format stats for tooltip
  const formatStats = () => {
    if (quality === "disconnected") {
      return "Not connected"
    }

    return [
      `Connection: ${quality}`,
      stats.rtt !== undefined ? `Latency: ${Math.round(stats.rtt * 1000)}ms` : null,
      stats.packetsLost !== undefined ? `Packets lost: ${stats.packetsLost}` : null,
      stats.jitter !== undefined ? `Jitter: ${Math.round(stats.jitter * 1000)}ms` : null,
    ]
      .filter(Boolean)
      .join("\n")
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {renderIndicator()}
            <span className="text-xs capitalize hidden sm:inline">{quality}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="whitespace-pre-line text-xs">{formatStats()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
