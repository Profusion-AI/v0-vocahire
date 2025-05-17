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

const jobStages = [
  "Exploring Options",
  "Applying to Jobs",
  "Interviewing",
  "Negotiating Offers",
  "Recently Hired",
  "Other",
];

// Zod schema for profile form - matches the one in app/profile/page.tsx
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  resumeJobTitle: z.string().max(100).optional().or(z.literal("")),
  resumeFileUrl: z.string().url("Invalid resume file URL").optional().or(z.literal("")),
  jobSearchStage: z.string().max(100).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileSettingsFormProps {
  initialProfileData: ProfileFormData;
  onProfileSaveSuccess?: (updatedData: ProfileFormData) => void; // Optional callback
}

/**
 * Renders a user profile settings form with validation, allowing users to update their personal information, job search stage, and resume details.
 *
 * The form initializes with provided profile data, validates input fields, and submits updates to the server. On successful save, it resets the form state, displays a success message, and optionally invokes a callback with the updated profile data. Field-specific and general errors are displayed inline or as toast notifications.
 *
 * @param initialProfileData - The initial values to populate the form fields.
 * @param onProfileSaveSuccess - Optional callback invoked with updated profile data after a successful save.
 */
export function ProfileSettingsForm({ initialProfileData, onProfileSaveSuccess }: ProfileSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialProfileData,
  });

  useEffect(() => {
    form.reset(initialProfileData);
  }, [initialProfileData, form]);

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
        const updatedProfile = updatedData.user || updatedData; // Adapt based on API response structure

        // Reset form with potentially updated data from API to mark as not dirty
        form.reset({
            name: updatedProfile.name || values.name,
            resumeJobTitle: updatedProfile.resumeJobTitle || values.resumeJobTitle,
            resumeFileUrl: updatedProfile.resumeFileUrl || values.resumeFileUrl,
            jobSearchStage: updatedProfile.jobSearchStage || values.jobSearchStage,
            linkedinUrl: updatedProfile.linkedinUrl || values.linkedinUrl,
        });
        toast.success("Profile saved!");
        if (onProfileSaveSuccess) {
          // Pass only ProfileFormData compatible fields
          onProfileSaveSuccess({
            name: updatedProfile.name || values.name,
            resumeJobTitle: updatedProfile.resumeJobTitle || values.resumeJobTitle,
            resumeFileUrl: updatedProfile.resumeFileUrl || values.resumeFileUrl,
            jobSearchStage: updatedProfile.jobSearchStage || values.jobSearchStage,
            linkedinUrl: updatedProfile.linkedinUrl || values.linkedinUrl,
          });
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
            Provide your resume URL and optionally specify your target job title.
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
            <Input id="resumeFileUrl" {...form.register("resumeFileUrl")} placeholder="https://example.com/resume.pdf" disabled={isSaving} />
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
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  );
}