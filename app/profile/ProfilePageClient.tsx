"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { useRouter } from "next/navigation";
import { ProfileSettingsForm, type ProfileFormData } from "@/components/ProfileSettingsForm";

const jobStages = [ // This can be kept here or moved to a shared constants file if used elsewhere
  "Exploring Options",
  "Applying to Jobs",
  "Interviewing",
  "Negotiating Offers",
  "Recently Hired",
  "Other",
];

// Zod schema for profile form (can be defined here or imported if shared)
// This is already defined in ProfileSettingsForm, so we just need the type.
// const profileFormSchema = z.object({
//   name: z.string().min(1, "Name is required").max(100),
//   resumeJobTitle: z.string().max(100).optional().or(z.literal("")),
//   resumeFileUrl: z.string().url("Invalid resume file URL").optional().or(z.literal("")),
//   jobSearchStage: z.string().max(100).optional().or(z.literal("")),
//   linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
// });
// type ProfileFormData = z.infer<typeof profileFormSchema>;


interface ProfilePageClientProps {
  initialCredits: number;
  initialProfileData: ProfileFormData; // This type is now imported from ProfileSettingsForm
}

export default function ProfilePageClient({ initialCredits, initialProfileData }: ProfilePageClientProps) {
  const [credits, setCredits] = useState<number>(initialCredits);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const router = useRouter();
  
  const [currentProfileData, setCurrentProfileData] = useState<ProfileFormData>(initialProfileData);

  useEffect(() => {
    setCredits(initialCredits);
    setCurrentProfileData(initialProfileData);
  }, [initialCredits, initialProfileData]);


  const refreshCredits = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        const newCredits = data.user?.credits ?? data.credits;
        if (typeof newCredits === 'number') {
          setCredits(newCredits);
        } else {
          toast.error("Could not retrieve updated credit count.");
        }
      } else {
        toast.error("Failed to refresh credits.");
      }
    } catch (error) {
      toast.error("Error refreshing credits.");
      console.error("Refresh credits error:", error);
    }
  };

  const handleProfileSaveSuccess = (updatedData: ProfileFormData) => {
    setCurrentProfileData(updatedData); 
    // If /api/user PATCH also returns updated credits, you could call refreshCredits here
    // For now, we assume credits are refreshed separately or after Stripe flow.
    // We might also want to refresh the 'name' if it's displayed directly from Clerk user data
    // on the parent server component, which would require a page reload or more complex state sharing.
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
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-lg font-semibold text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition px-0 py-0 bg-transparent"
              style={{ cursor: "pointer" }}
              onClick={() => setIsPurchaseModalOpen(true)}
              aria-label="Purchase more credits"
            >
              Available Interview Credits:{" "}
              <span className="font-bold">{credits}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click to purchase more credits.
          </p>
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
        onPurchaseSuccess={refreshCredits} // This will be called after Stripe redirect is initiated
      />
    </div>
  );
}