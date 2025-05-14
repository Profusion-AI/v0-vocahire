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

// Zod schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  resumeJobTitle: z.string().max(100).optional().or(z.literal("")),
  resumeFileUrl: z.string().url("Invalid resume file URL").optional().or(z.literal("")),
  jobSearchStage: z.string().max(100).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      resumeJobTitle: "",
      resumeFileUrl: "",
      jobSearchStage: "",
      linkedinUrl: "",
    },
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          form.reset({
            name: data.name || "",
            resumeJobTitle: data.resumeJobTitle || "",
            resumeFileUrl: data.resumeFileUrl || "",
            jobSearchStage: data.jobSearchStage || "",
            linkedinUrl: data.linkedinUrl || "",
          });
        } else {
          toast.error("Failed to load profile data.");
        }
      } catch {
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save handler
  const onSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const updated = await res.json();
        form.reset(updated); // Mark as not dirty
        toast.success("Profile saved!");
      } else {
        const error = await res.json();
        if (error.issues) {
          // Zod validation errors
          Object.entries(error.issues.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              form.setError(field as keyof ProfileFormData, { message: messages[0] as string });
            }
          });
        }
        toast.error(error.error || "Failed to save profile.");
      }
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const router = require("next/navigation").useRouter();

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
              <Input id="name" {...form.register("name")} disabled={isLoading || isSaving} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" {...form.register("linkedinUrl")} disabled={isLoading || isSaving} />
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
                disabled={isLoading || isSaving}
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
              <Input id="resumeJobTitle" {...form.register("resumeJobTitle")} disabled={isLoading || isSaving} />
              {form.formState.errors.resumeJobTitle && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.resumeJobTitle.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="resumeFileUrl">Resume File URL</Label>
              <Input id="resumeFileUrl" {...form.register("resumeFileUrl")} disabled={isLoading || isSaving} />
              {form.formState.errors.resumeFileUrl && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.resumeFileUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || isSaving || !form.formState.isDirty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md min-w-[120px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}