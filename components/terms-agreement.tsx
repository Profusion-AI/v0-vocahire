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

  // Only render the hook after component is mounted
  // This prevents any server-side localStorage access
  const termsHook = isMounted ? useTermsAgreement(user?.id) : null
  
  // Combine the state from the hook with our local state
  useEffect(() => {
    if (termsHook && termsHook.isLoaded && termsHook.showTermsModal !== undefined) {
      setShowModal(termsHook.showTermsModal)
    }
  }, [termsHook])
  
  // Only update modal visibility on the client side via the hook
  const handleModalChange = (open: boolean) => {
    if (termsHook) {
      termsHook.setShowTermsModal(open)
    }
    // Always update local state for consistent UI
    setShowModal(open)
  }
  
  // Handle terms agreement
  const handleAgreeToTerms = () => {
    if (termsHook) {
      termsHook.agreeToTerms()
    }
    // Also update local state
    setShowModal(false)
  }

  // Don't render anything during server-side rendering
  // or until everything is loaded on the client
  if (!isMounted || !isUserLoaded || !termsHook?.isLoaded) {
    return null
  }

  return (
    <TermsModal 
      open={showModal} 
      onOpenChange={handleModalChange} 
      onAgree={handleAgreeToTerms} 
    />
  )
}
