"use client"

import { useState, useEffect } from "react"

/**
 * React hook for managing and tracking a user's agreement to terms on a per-user basis.
 *
 * Maintains state for whether the user has agreed to terms, controls the visibility of the terms modal, and provides a function to mark the terms as agreed. The agreement status is persisted in localStorage using a key specific to the provided {@link userId}.
 *
 * @param userId - The unique identifier for the user whose agreement status should be tracked. If undefined, agreement state is reset.
 * @returns An object containing:
 *   - {@link hasAgreedToTerms}: Whether the user has agreed to the terms (true, false, or null if not loaded).
 *   - {@link showTermsModal}: Whether the terms modal should be displayed.
 *   - {@link setShowTermsModal}: Setter to manually control modal visibility.
 *   - {@link agreeToTerms}: Function to mark the terms as agreed for the current user.
 *   - {@link isLoaded}: Whether the agreement status has been initialized.
 *
 * @remark
 * The agreement status is stored in localStorage under a key unique to each user. If {@link userId} is undefined, the hook resets its state and does not persist or retrieve any agreement status.
 */
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
    // Use Clerk userId for per-user agreement tracking
    const key = `agreedToTerms_${userId}`
    const agreedToTerms = localStorage.getItem(key)
    setHasAgreedToTerms(agreedToTerms === "true")

    // Only show the modal after we've checked localStorage
    // This prevents flashing on page load
    if (agreedToTerms !== "true") {
      setShowTermsModal(true)
    }

    setIsLoaded(true)
  }, [userId])

  const agreeToTerms = () => {
    if (!userId) return
    const key = `agreedToTerms_${userId}`
    localStorage.setItem(key, "true")
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
