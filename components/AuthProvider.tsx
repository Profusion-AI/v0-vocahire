"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider refetchInterval={0}>{children}</SessionProvider>
}
