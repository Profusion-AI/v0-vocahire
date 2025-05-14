"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Separator } from "./ui/separator";

type PurchaseOption = {
  label: string;
  description?: string;
  price: string;
  cta: string;
  onClick: () => void;
  highlight?: boolean;
};

interface PurchaseCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaygPurchase?: (credits: number) => void;
  onUpgradePremium?: () => void;
}

export const PurchaseCreditsModal: React.FC<PurchaseCreditsModalProps> = ({
  open,
  onOpenChange,
  onPaygPurchase,
  onUpgradePremium,
}) => {
  // Placeholder handlers if not provided
  const handlePayg = (credits: number) => {
    if (onPaygPurchase) onPaygPurchase(credits);
    else alert(`Proceed to payment for ${credits} session credit(s)`);
  };
  const handleUpgrade = () => {
    if (onUpgradePremium) onUpgradePremium();
    else alert("Navigate to pricing/upgrade page (placeholder)");
  };

  const options: PurchaseOption[] = [
    {
      label: "1 Session Credit",
      price: "$[Standard_PAYG_Price]",
      cta: "Proceed to Payment",
      onClick: () => handlePayg(1),
    },
    {
      label: "3 Session Credits",
      price: "$[Slightly_Discounted_Bundle_Price] (Save Y%)",
      cta: "Proceed to Payment",
      onClick: () => handlePayg(3),
      description: "Best value for frequent practice",
      highlight: true,
    },
    {
      label: "Subscribe to Premium",
      price: "$[Monthly_Premium_Price]/month",
      cta: "Upgrade to Premium",
      onClick: handleUpgrade,
      description: "Unlimited interviews & full feedback",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Purchase More Interview Credits</DialogTitle>
          <DialogDescription>
            One credit = one full 10-minute mock interview with detailed AI feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          {options.map((opt, idx) => (
            <Card
              key={opt.label}
              className={`flex flex-col gap-2 border ${opt.highlight ? "border-primary shadow-lg" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{opt.label}</CardTitle>
                  <span className="text-primary font-bold">{opt.price}</span>
                </div>
                {opt.description && (
                  <CardDescription className="text-xs text-muted-foreground">{opt.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  className="w-full"
                  variant={opt.highlight ? "default" : "outline"}
                  onClick={opt.onClick}
                >
                  {opt.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="text-xs text-muted-foreground text-center">
          Credits unlock realistic, private mock interviews with instant AI-powered feedback. Upgrade to Premium for unlimited practice and advanced analytics.
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseCreditsModal;