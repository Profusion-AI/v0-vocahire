"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getStripe } from "@/lib/stripe"
import { useAuth } from "@/contexts/auth-context"

interface PurchaseButtonProps extends ButtonProps {
  userId?: string
}

export function PurchaseButton({ userId, children, ...props }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const currentUserId = userId || user?.id

      if (!currentUserId) {
        throw new Error("User not authenticated")
      }

      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
        }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const session = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      const { error } = await stripe!.redirectToCheckout({
        sessionId: session.id,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} {...props}>
      {isLoading ? "Loading..." : children}
    </Button>
  )
}
