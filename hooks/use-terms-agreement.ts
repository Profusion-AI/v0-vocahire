"use client"

import { useState, useEffect } from "react"

export function useTermsAgreement() {
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if user has already agreed to terms
    const agreedToTerms = localStorage.getItem("agreedToTerms")
    setHasAgreedToTerms(agreedToTerms === "true")

    // Only show the modal after we've checked localStorage
    // This prevents flashing on page load
    if (agreedToTerms !== "true") {
      setShowTermsModal(true)
    }

    setIsLoaded(true)
  }, [])

  const agreeToTerms = () => {
    localStorage.setItem("agreedToTerms", "true")
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
