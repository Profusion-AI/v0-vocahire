"use client"

import { useEffect, useState } from "react"
import { config } from "@/lib/config"

export function EnvDebug() {
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Only show in development
    setShowDebug(process.env.NODE_ENV !== "production")
  }, [])

  if (!showDebug) return null

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">Environment Debug</h3>
      <ul className="space-y-1">
        <li>NEXT_PUBLIC_SUPABASE_URL: {config.supabase.url ? "✅" : "❌"}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {config.supabase.anonKey ? "✅" : "❌"}</li>
        <li>NEXT_PUBLIC_APP_URL: {config.app.url ? "✅" : "❌"}</li>
      </ul>
    </div>
  )
}
