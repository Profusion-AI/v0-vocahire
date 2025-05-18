"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CREDIT_PACKAGES, type CreditPackage } from "@/lib/payment-config";

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onPurchaseSuccess?: () => void; // Removed as per feedback
}

export function PurchaseCreditsModal({
  isOpen,
  onOpenChange,
  // onPurchaseSuccess, // Removed as per feedback
}: PurchaseCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error("Please select a credit package.");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: selectedPackage.itemId, quantity: 1 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session.");
      }

      const { url } = await response.json(); // Expecting `url` for redirect

      if (url) {
        router.push(url); // Redirect to Stripe Checkout
        // if (onPurchaseSuccess) { // Removed as per feedback
        //   onPurchaseSuccess();
        // }
      } else {
        // This case implies the backend did not return the Stripe session URL.
        toast.error("Could not initiate purchase. Checkout URL not provided by server.");
        console.error("Checkout URL not received from /api/payments/create-checkout-session. Backend might need adjustment to return session.url.");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "An error occurred during purchase.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Purchase Credits</DialogTitle>
          <DialogDescription>
            Select a credit package below to continue practicing your interview skills.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.itemId}
              className={`cursor-pointer transition-all ${
                selectedPackage?.itemId === pkg.itemId
                  ? "ring-2 ring-indigo-500 border-indigo-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{pkg.credits} Credits</p>
                <p className="text-sm text-gray-600">${pkg.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Purchase ${selectedPackage ? selectedPackage.name : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}