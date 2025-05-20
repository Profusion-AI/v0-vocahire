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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PREMIUM_SUBSCRIPTIONS } from "@/lib/payment-config";

interface SubscriptionSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubscriptionSelect: (subscriptionId: string) => void;
}

export function SubscriptionSelectionModal({
  isOpen,
  onOpenChange,
  onSubscriptionSelect,
}: SubscriptionSelectionModalProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<string>("PREMIUM_MONTHLY_SUB");

  const handleSubscribeClick = () => {
    onSubscriptionSelect(selectedSubscription);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Your VocaHire Coach Plan</DialogTitle>
          <DialogDescription>
            Select a subscription plan to unlock unlimited interviews and premium features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 pt-6 md:grid-cols-3">
          {PREMIUM_SUBSCRIPTIONS.map((subscription) => (
            <Card
              key={subscription.itemId}
              className={`cursor-pointer transition-all ${
                selectedSubscription === subscription.itemId
                  ? "ring-2 ring-blue-500 shadow-lg transform scale-[1.02]"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedSubscription(subscription.itemId)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{subscription.name}</span>
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${subscription.price}</span>
                  <span className="text-sm text-gray-500">{subscription.frequency}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{subscription.description}</p>
                <ul className="space-y-2">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={selectedSubscription === subscription.itemId ? "default" : "outline"}
                  onClick={() => setSelectedSubscription(subscription.itemId)}
                >
                  {selectedSubscription === subscription.itemId ? "Selected" : "Select"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <DialogFooter className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubscribeClick}>Subscribe Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}