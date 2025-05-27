"use client"

import { useState, useEffect } from "react"

// Safe localStorage access wrapped in try/catch
const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch (err) {
    console.error("Error accessing localStorage (get):", err)
  }
  return null
}

const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
      return true
    }
  } catch (err) {
    console.error("Error accessing localStorage (set):", err)
  }
  return false
}

export function useTermsAgreement(userId: string | undefined) {
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Add a safeguard to prevent rendering logic before component is mounted
  const [isMounted, setIsMounted] = useState(false)
  
  // Check if we're in dev mode with auth bypass
  const isDevMode = process.env.NODE_ENV === 'development' && 
                   process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true'

  // Handle mounting state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    // Skip terms modal entirely in dev mode
    if (isDevMode) {
      setIsLoaded(true)
      setHasAgreedToTerms(true)
      setShowTermsModal(false)
      return
    }
    
    // Don't run any localStorage logic if not mounted or no userId
    if (!isMounted || !userId) {
      setIsLoaded(true)
      setHasAgreedToTerms(null)
      setShowTermsModal(false)
      return
    }
    
    // Delay localStorage check slightly to ensure client hydration is complete
    const timer = setTimeout(() => {
      // Use Clerk userId for per-user agreement tracking
      const key = `agreedToTerms_${userId}`
      const agreedToTerms = safeLocalStorageGet(key)
      
      setHasAgreedToTerms(agreedToTerms === "true")

      // Only show the modal after we've checked localStorage
      // This prevents flashing on page load
      if (agreedToTerms !== "true") {
        setShowTermsModal(true)
      }
      
      setIsLoaded(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [userId, isMounted, isDevMode])

  const agreeToTerms = () => {
    if (!userId || !isMounted) return
    
    // Skip in dev mode
    if (isDevMode) {
      setHasAgreedToTerms(true)
      setShowTermsModal(false)
      return
    }
    
    const key = `agreedToTerms_${userId}`
    safeLocalStorageSet(key, "true")
    
    setHasAgreedToTerms(true)
    setShowTermsModal(false)
  }

  return {
    hasAgreedToTerms,
    showTermsModal,
    setShowTermsModal,
    agreeToTerms,
    isLoaded,
  }
}
