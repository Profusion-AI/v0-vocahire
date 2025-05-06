"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, WifiOffIcon as WifiLow } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionQualityIndicatorProps {
  peerConnection: RTCPeerConnection | null
  className?: string
}

export function ConnectionQualityIndicator({ peerConnection, className }: ConnectionQualityIndicatorProps) {
  const [quality, setQuality] = useState<"good" | "fair" | "poor" | "disconnected">("disconnected")
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

    // Initial quality check
    checkConnectionQuality()

    // Set up interval to check connection quality
    const intervalId = setInterval(checkConnectionQuality, 2000)

    return () => {
      clearInterval(intervalId)
    }

    async function checkConnectionQuality() {
      try {
        if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
          setQuality("disconnected")
          return
        }

        if (peerConnection.connectionState === "connecting") {
          setQuality("poor")
          return
        }

        // Get connection stats
        const stats = await peerConnection.getStats()
        let rtt: number | undefined
        let packetsLost: number | undefined
        let jitter: number | undefined
        const timestamp = Date.now()

        stats.forEach((report) => {
          if (report.type === "remote-inbound-rtp" && report.kind === "audio") {
            rtt = report.roundTripTime
            packetsLost = report.packetsLost
          }

          if (report.type === "inbound-rtp" && report.kind === "audio") {
            jitter = report.jitter
          }
        })

        setStats({ rtt, packetsLost, jitter, timestamp })

        // Determine quality based on stats
        if (rtt !== undefined && packetsLost !== undefined) {
          if (rtt > 0.3 || packetsLost > 50) {
            setQuality("poor")
          } else if (rtt > 0.15 || packetsLost > 10) {
            setQuality("fair")
          } else {
            setQuality("good")
          }
        } else if (peerConnection.connectionState === "connected") {
          // If we can't get detailed stats but connection is established
          setQuality("fair")
        }
      } catch (error) {
        console.error("Error getting connection stats:", error)
        // If we can't get stats but connection exists, assume fair
        if (peerConnection.connectionState === "connected") {
          setQuality("fair")
        } else {
          setQuality("disconnected")
        }
      }
    }
  }, [peerConnection])

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
        quality === "good" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        quality === "fair" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        quality === "poor" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        quality === "disconnected" && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
        className,
      )}
    >
      {quality === "good" && <Wifi className="h-3 w-3" />}
      {quality === "fair" && <WifiLow className="h-3 w-3" />}
      {quality === "poor" && <WifiLow className="h-3 w-3" />}
      {quality === "disconnected" && <WifiOff className="h-3 w-3" />}
      <span>
        {quality === "good" && "Good"}
        {quality === "fair" && "Fair"}
        {quality === "poor" && "Poor"}
        {quality === "disconnected" && "Disconnected"}
      </span>
    </div>
  )
}
