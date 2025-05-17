"use client"

import { useTermsAgreement } from "@/hooks/use-terms-agreement"
import { TermsModal } from "@/components/terms-modal"
import { useUser } from "@clerk/nextjs"

/**
 * Displays a modal prompting the current user to agree to terms if required.
 *
 * Renders nothing until the user's terms agreement status is loaded.
 */
export function TermsAgreement() {
  const { user } = useUser()
  const { showTermsModal, setShowTermsModal, agreeToTerms, isLoaded } = useTermsAgreement(user?.id)

  // Only render the modal after we've checked localStorage
  if (!isLoaded) return null

  return <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} onAgree={agreeToTerms} />
}
