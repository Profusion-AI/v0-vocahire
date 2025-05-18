"use client";

import { useEffect, useState, useCallback } from "react"; // Removed useCallback as refreshUserData is now from hook
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { useRouter } from "next/navigation";
import { ProfileSettingsForm, type ProfileFormData } from "@/components/ProfileSettingsForm";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { useUserData } from "@/hooks/useUserData"; // Import the new hook

interface ProfilePageClientProps {
  // initialCredits and initialIsPremium are no longer needed from props
  initialProfileData: ProfileFormData;
  stripePublishableKey: string;
}

export default function ProfilePageClient({
  initialProfileData,
  stripePublishableKey,
}: ProfilePageClientProps) {
  const {
    user,
    credits,
    isPremium,
    isLoading: isUserDataLoading, // Renamed to avoid conflict
    refetchUserData
  } = useUserData();
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const router = useRouter();
  const [currentProfileData, setCurrentProfileData] = useState<ProfileFormData>(initialProfileData);

  useEffect(() => {
    // Update currentProfileData if the user object from the hook has more recent data
    // or to set it initially from props if user from hook is not yet available.
    if (user) {
      setCurrentProfileData(prev => ({
        name: user.name || prev.name || "",
        resumeJobTitle: user.resumeJobTitle || prev.resumeJobTitle || "",
        resumeFileUrl: user.resumeFileUrl || prev.resumeFileUrl || "",
        jobSearchStage: user.jobSearchStage || prev.jobSearchStage || "",
        linkedinUrl: user.linkedinUrl || prev.linkedinUrl || "",
      }));
    } else {
        // If user from hook is null (e.g. initial load of hook), ensure currentProfileData is set from initialProfileData prop
        setCurrentProfileData(initialProfileData);
    }
  }, [user, initialProfileData]);


  const handleProfileSaveSuccess = (updatedData: ProfileFormData) => {
    setCurrentProfileData(updatedData);
    toast.success("Profile updated successfully!");
    refetchUserData(); // Refetch to ensure all user data is consistent after save
  };

  const handleStripeAction = async (itemId: string) => {
    if (!stripePublishableKey) {
      toast.error("Stripe is not configured.");
      return;
    }
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: 1 }), // Assuming quantity 1 for subscriptions/packs here
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session.");
      }
      const data = await res.json();
      if (!data.url || !data.sessionId) {
        throw new Error("Checkout session details not returned from server.");
      }
      const stripe = await loadStripe(stripePublishableKey);
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        console.error("Stripe redirect error:", error);
        throw new Error(error.message || "Failed to redirect to Stripe.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Unable to start payment flow.");
    }
  };

  const handlePurchaseCreditsClick = () => {
    setIsPurchaseModalOpen(true);
  };

  const handleUpgradeToPremium = () => {
    // Ensure you have a Stripe Price ID for premium mapped in your backend
    // For example, "PREMIUM_MONTHLY_SUB" or "PREMIUM_ANNUAL_SUB"
    handleStripeAction("PREMIUM_MONTHLY_SUB"); // Or allow selection
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/interview")}
          className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
        >
          Back to Interview
        </Button>
      </div>

      {/* Account / Subscription Section */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Account</CardTitle>
          <CardDescription className="text-gray-600">
            Manage your subscription and credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUserDataLoading ? ( // Use isUserDataLoading from the hook
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : isPremium ? (
            <div>
              <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white px-5 py-3 rounded-lg shadow-md font-semibold text-md mb-2">
                Premium Access: Unlimited Interviews
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enjoy your premium benefits!</p>
            </div>
          ) : credits !== null && credits > 0 ? (
            <div>
              <p className="text-lg">
                Available Interview Credits:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{credits}</span>
              </p>
              <Button onClick={handlePurchaseCreditsClick} variant="link" className="text-indigo-600 dark:text-indigo-400 p-0 h-auto mt-1">
                Buy More Credits
              </Button>
            </div>
          ) : ( // Not premium and (credits are 0 or credits are null)
            <div className="border-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">You're out of interview credits!</h3>
              <p className="text-red-500 dark:text-red-300 mt-1 mb-4">
                Purchase more credits or upgrade to premium for unlimited access.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handlePurchaseCreditsClick} className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700">Buy More Credits</Button>
                <Button onClick={handleUpgradeToPremium} className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700">Upgrade to Premium</Button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  <Link href="/pricing" className="underline hover:text-indigo-500">View Pricing & Plans</Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center mb-8">
        Manage Your VocaHire Profile
      </h1>
      
      <ProfileSettingsForm
        initialProfileData={currentProfileData}
        onProfileSaveSuccess={handleProfileSaveSuccess}
      />

      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        // onPurchaseSuccess is removed as per feedback
      />
    </div>
  );
}