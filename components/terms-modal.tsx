"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgree: () => void
}

export function TermsModal({ open, onOpenChange, onAgree }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Reset scroll state when modal opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false)

      // Reset scroll position when modal opens
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    }
  }, [open])

  const handleScroll = () => {
    if (!contentRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current

    // Consider "scrolled to bottom" when within 20px of the bottom or at the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 20

    if (isAtBottom) {
      setHasScrolledToBottom(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>VocaHire Coach Terms of Service</DialogTitle>
          <DialogDescription>Last updated: May 6, 2024</DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-4 text-sm text-muted-foreground">
          Please read through our Terms of Service and scroll to the bottom to accept.
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto max-h-[50vh] pr-4 border rounded-md"
          style={{ overflowY: "auto" }}
        >
          <div className="text-sm space-y-4 p-4">
            <p>
              Welcome to VocaHire Coach ("we," "us," "our"). These Terms of Service ("Terms") govern your use of our
              AI-powered mock interview platform, available at https://vocahire.com (the "Service"). By accessing or
              using the Service, you agree to these Terms. If you do not agree, please do not use the Service.
            </p>

            <div className="border-t pt-4">
              <h3 className="font-bold">1. Eligibility & Geographic Scope</h3>
              <p>
                <strong>1.1 Eligibility.</strong> You must be at least 18 years old and capable of entering into a
                binding contract to use the Service.
              </p>
              <p>
                <strong>1.2 U.S. Only (MVP).</strong> For our minimum-viable-product launch, the Service is only
                available to users physically located within the United States. You represent and warrant you are
                accessing the Service from within the U.S. If you travel or relocate outside the U.S., you must stop
                using the Service until you return.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">2. Account Registration & Security</h3>
              <p>
                <strong>2.1 Account Creation.</strong> To access interview sessions, you must register for a VocaHire
                account. You agree to provide accurate, complete information.
              </p>
              <p>
                <strong>2.2 Password & Access.</strong> You are solely responsible for safeguarding your password and
                any credentials. Notify us immediately of any unauthorized use. We refuse any liability for losses you
                incur because of another party's access to your account.
              </p>
              <p>
                <strong>2.3 Termination.</strong> We reserve the right to suspend or terminate your account without
                notice if we suspect fraudulent activity or violation of these Terms.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">3. Service Description & Usage</h3>
              <p>
                <strong>3.1 AI Mock Interviews.</strong> VocaHire Coach conducts real-time, voice-based mock interviews
                using OpenAI's frontier models (currently GPT-4o-mini-realtime) and then generates text-based feedback.
              </p>
              <p>
                <strong>3.2 Credits & Payment.</strong> Each 10-minute interview session requires a credit. New users
                receive one (1) free credit; additional credits are purchased via Stripe. Credits expire twelve (12)
                months after purchase.
              </p>
              <p>
                <strong>3.3 Acceptable Use.</strong> You agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service for any unlawful purpose or in violation of export controls;</li>
                <li>Reverse-engineer, decompile, or otherwise attempt to extract source code;</li>
                <li>Upload content that is defamatory, infringing, obscene, or harassing.</li>
              </ul>
              <p>
                <strong>3.4 AI Limitations.</strong> While we strive for high-quality feedback, the Service is provided
                "as-is." The AI's responses depend on model performance, audio quality, and your input. Always exercise
                your own judgment when acting on AI feedback.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">4. Privacy & Data</h3>
              <p>
                <strong>4.1 Privacy Policy.</strong> Your privacy matters. Our Privacy Policy explains how we collect,
                use, and share your data. By using the Service, you agree to that policy.
              </p>
              <p>
                <strong>4.2 Data Retention.</strong> We store transcripts and feedback for up to 12 months to enable you
                to review past sessions and for system analytics. After 12 months, we purge your transcripts and session
                metadata.
              </p>
              <p>
                <strong>4.3 Security.</strong> We implement industry-standard measures (SSL/TLS, encrypted storage) to
                protect your data, but cannot guarantee absolute security. You accept the inherent risks of
                internet-based services.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">5. Intellectual Property</h3>
              <p>
                <strong>5.1 Our Content.</strong> All software, graphics, trademarks, and other materials provided by
                VocaHire Coach are owned or licensed by us. You may not copy, distribute, modify, or create derivative
                works without our express permission.
              </p>
              <p>
                <strong>5.2 Your Submissions.</strong> You retain ownership of your interview content. By uploading or
                speaking into the Service, you grant VocaHire Coach a non-exclusive, royalty-free, worldwide license to
                use, reproduce, and display your content for the purpose of providing and improving the Service.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">6. Disclaimers & Limitation of Liability</h3>
              <p>
                <strong>6.1 No Warranties.</strong> THE SERVICE IS PROVIDED "AS-IS" AND "AS AVAILABLE," WITHOUT WARRANTY
                OF ANY KIND, EXPRESS OR IMPLIED.
              </p>
              <p>
                <strong>6.2 Indirect Damages.</strong> IN NO EVENT WILL WE BE LIABLE FOR CONSEQUENTIAL, INCIDENTAL,
                SPECIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF (OR INABILITY TO USE) THE SERVICE, EVEN IF ADVISED
                OF THE POSSIBILITY. OUR TOTAL AGGREGATE LIABILITY IS LIMITED TO THE AMOUNTS YOU PAID US IN THE LAST SIX
                MONTHS (IF ANY).
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">7. Indemnification</h3>
              <p>
                You agree to indemnify and hold VocaHire Coach, its officers, employees, and affiliates harmless from
                any claims, damages, losses, or liabilities (including reasonable attorneys' fees) arising from your
                violation of these Terms or your misuse of the Service.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">8. Modifications to Service & Terms</h3>
              <p>
                <strong>8.1 Service Changes.</strong> We may modify, suspend, or discontinue any part of the Service at
                any time, with or without notice.
              </p>
              <p>
                <strong>8.2 Terms Updates.</strong> We may revise these Terms by posting an updated version at
                https://vocahire.com/terms. Your continued use after the "Last Updated" date constitutes acceptance of
                the new Terms. We encourage you to review the Terms periodically.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">9. Governing Law & Dispute Resolution</h3>
              <p>
                <strong>9.1 Governing Law.</strong> These Terms are governed by the laws of the State of Texas, without
                regard to its conflict-of-law principles.
              </p>
              <p>
                <strong>9.2 Venue.</strong> You agree that any legal action shall be brought exclusively in the state or
                federal courts located in Bexar County, Texas.
              </p>
              <p>
                <strong>9.3 Arbitration.</strong> Arbitration exists, is pending an update.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">10. Contact Information</h3>
              <p>
                If you have questions or concerns about these Terms, please contact us at:
                <br />
                VocaHire Coach, LLC
                <br />
                Email: support@vocahire.com
              </p>
            </div>

            <div className="border-t pt-4">
              <p>
                By creating an account or using VocaHire Coach, you acknowledge that you have read, understood, and
                agree to these Terms of Service.
              </p>
            </div>

            {/* This empty div helps ensure we can scroll all the way to the bottom */}
            <div className="h-8"></div>
          </div>
        </div>

        <DialogFooter className="pt-4 mt-4">
          <div className="w-full flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={onAgree}
              disabled={!hasScrolledToBottom}
              className={hasScrolledToBottom ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {hasScrolledToBottom ? "I Accept" : "Please scroll to the bottom"}
            </Button>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Please scroll through the entire Terms of Service to enable the accept button
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
