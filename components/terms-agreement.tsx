"use client"

import { useTermsAgreement } from "@/hooks/use-terms-agreement"
import { TermsModal } from "@/components/terms-modal"

export function TermsAgreement() {
  const { showTermsModal, setShowTermsModal, agreeToTerms, isLoaded } = useTermsAgreement()

  // Only render the modal after we've checked localStorage
  if (!isLoaded) return null

  return <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} onAgree={agreeToTerms} />
}
