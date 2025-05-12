"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TermsModal } from "@/components/terms-modal"

export default function TestTermsPage() {
  const [showTerms, setShowTerms] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const handleAgree = () => {
    setShowTerms(false)
    setAccepted(true)
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Test Terms of Service Modal</h1>

      <div className="space-y-6">
        <div className="p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the "Open Terms of Service" button below</li>
            <li>Scroll through the entire Terms of Service content</li>
            <li>The button at the bottom should change from "Please scroll to the bottom" to "I Accept"</li>
            <li>Click "I Accept" to close the modal and see a confirmation message</li>
          </ol>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={() => setShowTerms(true)}>
            Open Terms of Service
          </Button>

          {accepted && (
            <div className="p-4 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-md">
              You have successfully accepted the Terms of Service!
            </div>
          )}
        </div>
      </div>

      <TermsModal open={showTerms} onOpenChange={setShowTerms} onAgree={handleAgree} />
    </div>
  )
}
