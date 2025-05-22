"use client"

import { useTermsAgreement } from "@/hooks/use-terms-agreement"
import { TermsModal } from "@/components/terms-modal"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

export function TermsAgreement() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  
  // Initialize these with default values
  const [showModal, setShowModal] = useState(false)
  
  // Handle component mounting state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Call the hook unconditionally
  const {
    hasAgreedToTerms,
    showTermsModal: hookShowTermsModal,
    setShowTermsModal: hookSetShowTermsModal,
    agreeToTerms: hookAgreeToTerms,
    isLoaded: termsHookIsLoaded
  } = useTermsAgreement(user?.id)
  
  // Synchronize local showModal state with the hook's state
  useEffect(() => {
    if (termsHookIsLoaded && hookShowTermsModal !== undefined) {
      setShowModal(hookShowTermsModal)
    }
  }, [termsHookIsLoaded, hookShowTermsModal])
  
  // Update modal visibility via the hook
  const handleModalChange = (open: boolean) => {
    if (isMounted) { // Ensure hook interaction only happens client-side
      hookSetShowTermsModal(open)
    }
    setShowModal(open) // Keep local state in sync for immediate UI updates
  }
  
  // Handle terms agreement via the hook
  const handleAgreeToTerms = () => {
    if (isMounted) { // Ensure hook interaction only happens client-side
      hookAgreeToTerms()
    }
    setShowModal(false) // Keep local state in sync
  }

  // Debug logging to track rendering state
  console.log('TermsAgreement render state:', {
    isMounted,
    isUserLoaded,
    termsHookIsLoaded,
    showModal,
    hookShowTermsModal,
    hasAgreedToTerms
  })

  // Only prevent rendering during server-side rendering and initial user loading
  // Don't wait for termsHookIsLoaded to prevent blocking after terms acceptance
  if (!isMounted || !isUserLoaded) {
    console.log('TermsAgreement returning null - not mounted or user not loaded')
    return null
  }

  return (
    <TermsModal 
      open={termsHookIsLoaded ? showModal : false} 
      onOpenChange={handleModalChange} 
      onAgree={handleAgreeToTerms} 
    />
  )
}
