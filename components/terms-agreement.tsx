"use client"

import { useTermsAgreement } from "@/hooks/use-terms-agreement"
import { TermsModal } from "@/components/terms-modal"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

export function TermsAgreement() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { showTermsModal, setShowTermsModal, agreeToTerms, isLoaded: isTermsLoaded } = useTermsAgreement(user?.id)
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle component mounting state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Only render the modal after:
  // 1. The component is mounted on the client
  // 2. User data is loaded from Clerk
  // 3. Terms agreement status is loaded from localStorage
  if (!isMounted || !isUserLoaded || !isTermsLoaded) return null

  return <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} onAgree={agreeToTerms} />
}
