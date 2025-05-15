"use client"; // This top-level page will still need to be a client component due to hooks like useState for modal

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { useRouter } from "next/navigation";
import { ProfileSettingsForm, type ProfileFormData } from "@/components/ProfileSettingsForm"; // Import the new form

// This server component fetches data and passes it to the client component part
export default async function ProfilePageServerDataWrapper() {
  const { userId: currentAuthUserId } = await auth();
  const clerkUser = await currentUser();

  if (!currentAuthUserId || !clerkUser) {
    return <div className="text-center py-10">Please log in to view your profile.</div>;
  }

  const initialDbUser = await prisma.user.findUnique({
    where: { id: currentAuthUserId },
  });

  let initialName = "";
  if (clerkUser.firstName && clerkUser.lastName) {
    initialName = `${clerkUser.firstName} ${clerkUser.lastName}`;
  } else if (clerkUser.firstName) {
    initialName = clerkUser.firstName;
  } else if (clerkUser.lastName) {
    initialName = clerkUser.lastName;
  } else if (clerkUser.emailAddresses[0]?.emailAddress) {
    initialName = clerkUser.emailAddresses[0].emailAddress;
  }

  const initialProfileData: ProfileFormData = {
    name: initialName,
    resumeJobTitle: initialDbUser?.resumeJobTitle || "",
    resumeFileUrl: initialDbUser?.resumeFileUrl || "",
    jobSearchStage: initialDbUser?.jobSearchStage || "",
    linkedinUrl: initialDbUser?.linkedinUrl || "",
  };

  return (
    <ProfilePageClient
      initialCredits={initialDbUser?.credits ?? 0}
      initialProfileData={initialProfileData}
    />
  );
}

interface ProfilePageClientProps {
  initialCredits: number;
  initialProfileData: ProfileFormData;
}

function ProfilePageClient({ initialCredits, initialProfileData }: ProfilePageClientProps) {
  const [credits, setCredits] = useState<number>(initialCredits);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const router = useRouter();
  
  // Local state for profile data to update form if needed, though form handles its own state
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
        // Assuming /api/user returns an object like { user: { credits: number } } or { credits: number }
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
    // Optionally update local state if needed, or rely on form's own reset
    setCurrentProfileData(updatedData); 
    // If /api/user PATCH also returns updated credits, you could call refreshCredits or parse from response
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
              // disabled={isSaving} // isSaving is now part of ProfileSettingsForm
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
        onPurchaseSuccess={refreshCredits}
      />
    </div>
  );
}