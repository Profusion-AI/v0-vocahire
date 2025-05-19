"use client"

import { useState, useEffect } from "react"

export function useTermsAgreement(userId: string | undefined) {
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!userId) {
      setIsLoaded(true)
      setHasAgreedToTerms(null)
      setShowTermsModal(false)
      return
    }
    
    // Protect localStorage access for SSR
    if (typeof window !== 'undefined') {
      // Use Clerk userId for per-user agreement tracking
      const key = `agreedToTerms_${userId}`
      const agreedToTerms = localStorage.getItem(key)
      setHasAgreedToTerms(agreedToTerms === "true")

      // Only show the modal after we've checked localStorage
      // This prevents flashing on page load
      if (agreedToTerms !== "true") {
        setShowTermsModal(true)
      }
    }

    setIsLoaded(true)
  }, [userId])

  const agreeToTerms = () => {
    if (!userId) return
    const key = `agreedToTerms_${userId}`
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, "true")
    }
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
