"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma"; // For server-side fetch in ProfilePageServerData
import { auth, currentUser } from "@clerk/nextjs/server"; // For server-side auth
import { type User as PrismaUser } from "@prisma/client"; // Alias Prisma User type
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { useRouter } from "next/navigation";

const jobStages = [
  "Exploring Options",
  "Applying to Jobs",
  "Interviewing",
  "Negotiating Offers",
  "Recently Hired",
  "Other",
];

// Zod schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  resumeJobTitle: z.string().max(100).optional().or(z.literal("")),
  resumeFileUrl: z.string().url("Invalid resume file URL").optional().or(z.literal("")),
  jobSearchStage: z.string().max(100).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

// Server Component to fetch initial data
export default async function ProfilePageServerData() {
  const { userId: currentAuthUserId } = await auth(); // Renamed to avoid conflict in client component scope
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
    initialName = clerkUser.emailAddresses[0].emailAddress; // Fallback to email if name parts are missing
  }


  // Pass initial data to a client component
  return (
    <ProfilePageClient
      initialCredits={initialDbUser?.credits ?? 0}
      initialProfileData={{
        name: initialName,
        resumeJobTitle: initialDbUser?.resumeJobTitle || "",
        resumeFileUrl: initialDbUser?.resumeFileUrl || "",
        jobSearchStage: initialDbUser?.jobSearchStage || "",
        linkedinUrl: initialDbUser?.linkedinUrl || "",
      }}
    />
  );
}

interface ProfilePageClientProps {
  initialCredits: number;
  initialProfileData: ProfileFormData;
}

function ProfilePageClient({ initialCredits, initialProfileData }: ProfilePageClientProps) {
  const [credits, setCredits] = useState<number>(initialCredits);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialProfileData,
  });

  useEffect(() => {
    form.reset(initialProfileData);
  }, [initialProfileData, form]);

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
          console.error("Unexpected data structure from /api/user for credits:", data);
        }
      } else {
        toast.error("Failed to refresh credits.");
      }
    } catch (error) {
      toast.error("Error refreshing credits.");
      console.error("Refresh credits error:", error);
    }
  };

  const onSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const updatedData = await res.json();
        // Assuming the API returns the updated profile data that matches ProfileFormData
        // and potentially the updated user object with credits
        const updatedProfile = updatedData.user || updatedData;

        form.reset({
            name: updatedProfile.name || initialProfileData.name, // Fallback to initial if not returned
            resumeJobTitle: updatedProfile.resumeJobTitle || initialProfileData.resumeJobTitle,
            resumeFileUrl: updatedProfile.resumeFileUrl || initialProfileData.resumeFileUrl,
            jobSearchStage: updatedProfile.jobSearchStage || initialProfileData.jobSearchStage,
            linkedinUrl: updatedProfile.linkedinUrl || initialProfileData.linkedinUrl,
        });
        toast.success("Profile saved!");
        if (typeof updatedProfile.credits === 'number') {
            setCredits(updatedProfile.credits);
        }
      } else {
        const error = await res.json();
        if (error.issues && error.issues.fieldErrors) {
          Object.entries(error.issues.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              form.setError(field as keyof ProfileFormData, { message: messages[0] as string });
            }
          });
        } else {
            toast.error(error.error || "Failed to save profile.");
        }
      }
    } catch (error) {
      toast.error("Failed to save profile.");
      console.error("Save profile error:", error);
    } finally {
      setIsSaving(false);
    }
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
              disabled={isSaving}
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile Details</CardTitle>
            <CardDescription className="text-gray-600">Update your personal and professional info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} disabled={isSaving} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" {...form.register("linkedinUrl")} disabled={isSaving} />
              {form.formState.errors.linkedinUrl && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.linkedinUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Job Search Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobSearchStage">Current Stage</Label>
              <select
                id="jobSearchStage"
                {...form.register("jobSearchStage")}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md w-full h-10 px-3 py-2"
                disabled={isSaving}
              >
                <option value="">Select your current stage</option>
                {jobStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              {form.formState.errors.jobSearchStage && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.jobSearchStage.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Resume & Role Context</CardTitle>
            <CardDescription className="text-gray-600">
              Upload your resume and optionally specify your target job title.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resumeJobTitle">Target Job Title</Label>
              <Input id="resumeJobTitle" {...form.register("resumeJobTitle")} disabled={isSaving} />
              {form.formState.errors.resumeJobTitle && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.resumeJobTitle.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="resumeFileUrl">Resume File URL</Label>
              <Input id="resumeFileUrl" {...form.register("resumeFileUrl")} disabled={isSaving} />
              {form.formState.errors.resumeFileUrl && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.resumeFileUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving || !form.formState.isDirty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md min-w-[120px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        onPurchaseSuccess={refreshCredits}
      />
    </div>
  );
}