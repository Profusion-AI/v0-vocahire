"use client"; // InterviewPageContent remains a client component

import { useState, useEffect, useCallback } from "react";
import InterviewRoom from "@/components/InterviewRoom";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import type { ResumeData } from "@/components/resume-input";
import { Navbar } from "@/components/navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";
import { ProfileSettingsForm, type ProfileFormData } from "@/components/ProfileSettingsForm";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface InterviewPageContentProps {
  initialJobTitle: string;
  initialResumeData: ResumeData | null; // Will be loaded client-side from localStorage
  initialHasResumeData: boolean; // Will be determined client-side
  initialSkipResume: boolean;
  initialCredits: number | null;
  initialIsPremium: boolean;
  initialProfileFormData: ProfileFormData;
  stripePublishableKey: string;
  userId: string; // Pass userId for any client-side specific needs if any, though most data is server-fetched
}

function InterviewPageContent({
  initialJobTitle,
  // initialResumeData, // Loaded client-side
  // initialHasResumeData, // Determined client-side
  initialSkipResume,
  initialCredits,
  initialIsPremium,
  initialProfileFormData,
  stripePublishableKey,
  userId,
}: InterviewPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Keep for client-side URL param access if needed after initial load
  const { toast } = useToast();

  const [jobTitle, setJobTitle] = useState<string>(initialJobTitle);
  const [isLoadingResume, setIsLoadingResume] = useState(true); // For localStorage resume loading
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasResumeData, setHasResumeData] = useState<boolean>(false);
  const [skipResume, setSkipResume] = useState(initialSkipResume);
  const [currentView, setCurrentView] = useState<"interview" | "profile">("interview");

  const [credits, setCredits] = useState<number | null>(initialCredits);
  const [isPremium, setIsPremium] = useState<boolean>(initialIsPremium);
  const [isCreditsLoading, setIsCreditsLoading] = useState(false); // For refetches

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConfirmStartModalOpen, setIsConfirmStartModalOpen] = useState(false);
  
  const [profileDataForForm, setProfileDataForForm] = useState<ProfileFormData>(initialProfileFormData);

  // Client-side effect to load resume from localStorage
  useEffect(() => {
    setIsLoadingResume(true);
    try {
      const storedResumeData = localStorage.getItem("vocahire_resume_data");
      if (storedResumeData) {
        const parsedData = JSON.parse(storedResumeData) as ResumeData;
        setResumeData(parsedData);
        setHasResumeData(true);
        // If jobTitle wasn't in URL, but is in resume, update it
        if (initialJobTitle === "Software Engineer" && parsedData.jobTitle) {
             setJobTitle(parsedData.jobTitle);
        }
      } else {
        setHasResumeData(false);
      }
    } catch (err) {
      console.error("Error loading resume data from localStorage:", err);
      setHasResumeData(false);
    }
    setIsLoadingResume(false);
  }, [initialJobTitle]); // Rerun if initialJobTitle changes (e.g. from URL)

  // Effect to update states if initial props change (e.g., after server-side re-fetch if page reloads)
  useEffect(() => {
    setCredits(initialCredits);
    setIsPremium(initialIsPremium);
    setProfileDataForForm(initialProfileFormData);
    setSkipResume(initialSkipResume);
    if(initialJobTitle !== jobTitle && !resumeData?.jobTitle) { // Avoid overwriting if resume already set a title
        setJobTitle(initialJobTitle);
    }
  }, [initialCredits, initialIsPremium, initialProfileFormData, initialJobTitle, skipResume, resumeData?.jobTitle, jobTitle]);


  const refetchCreditsAndProfile = async () => {
    setIsCreditsLoading(true);
    try {
      const res = await fetch("/api/user"); 
      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        setCredits(typeof user.credits === "number" ? user.credits : 0);
        setIsPremium(!!user.isPremium);
        
        // Update profile form data based on the fetched user data
        // This assumes /api/user returns the necessary fields for ProfileFormData
        // or that we can reconstruct the 'name' field if it's not directly available.
        // For 'name', it's tricky if it's only from Clerk server-side.
        // We might need a separate client-side hook for Clerk's user name if it changes.
        setProfileDataForForm(prev => ({
            ...prev, // Keep existing name if not returned by /api/user
            name: user.name || prev.name, // Or fetch from useUser() from Clerk if needed client-side
            resumeJobTitle: user.resumeJobTitle || "",
            resumeFileUrl: user.resumeFileUrl || "",
            jobSearchStage: user.jobSearchStage || "",
            linkedinUrl: user.linkedinUrl || "",
        }));
      } else {
        toast({ title: "Error", description: "Failed to refresh user data." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not refresh user data." });
      console.error("Refetch error:", error);
    } finally {
      setIsCreditsLoading(false);
    }
  };
  
  const handleProfileSaveSuccess = (updatedFormData: ProfileFormData) => {
    setProfileDataForForm(updatedFormData); 
    toast({title: "Success", description: "Profile updated successfully!"});
    // If name changed, and it's displayed elsewhere, that part might need Clerk's useUser() for reactivity
  };

  const handleStripeAction = async (itemId: string) => {
    if (!stripePublishableKey) {
      toast({ title: "Configuration Error", description: "Stripe is not configured."});
      return;
    }
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
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
      toast({
        title: "Payment Error",
        description: err?.message || "Unable to start payment flow.",
        variant: "destructive",
      });
    }
  };
  
  const handlePurchaseCreditsClick = () => {
    setIsPurchaseModalOpen(true);
  };

  const handleUpgradeToPremium = () => {
    handleStripeAction("PREMIUM_MONTHLY_SUB"); 
  };

  const handleInterviewComplete = useCallback(
    (messages: any[]) => {
      localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages));
      router.push("/feedback");
    },
    [router]
  );
  
  const handleStartInterviewAttempt = () => {
    if (!isPremium && credits !== null && credits > 0) {
      setIsConfirmStartModalOpen(true);
    } else if (isPremium || (credits !== null && credits > 0)) {
      startInterview();
    }
    // If no credits and not premium, the UI should prevent this action.
  };

  const startInterview = () => {
    setIsConfirmStartModalOpen(false);
    // Logic to make InterviewRoom active/visible would go here
    // For now, assume InterviewRoom component itself handles starting the session when appropriate props are set
    // Potentially deduct credit via API call here if not handled by /api/realtime-session
    console.log("Attempting to start interview...");
    // The actual rendering of InterviewRoom is handled below based on conditions
  };

  if (isLoadingResume) { // Show loading skeleton only for resume part
    return (
      <>
        <Navbar />
        <SessionLayout>
          <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
        </SessionLayout>
      </>
    );
  }

  if (!hasResumeData && !skipResume && currentView === "interview") {
    return (
      <>
        <Navbar />
        <SessionLayout>
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">Mock Interview</h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl text-center">
            For a more personalized interview experience, please provide some details about your background
          </p>
          <Card className="max-w-md mx-auto shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Add Resume Details</CardTitle>
              <CardDescription className="text-gray-600">
                Adding details from your resume will help our AI interviewer ask more relevant questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700">The AI interviewer will use your resume information to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
                <li>Ask targeted questions about your experience</li>
                <li>Focus on skills relevant to the {jobTitle} position</li>
                <li>Provide more personalized feedback</li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">
                <Link href={`/prepare?jobTitle=${encodeURIComponent(jobTitle)}`}>Add Resume Details</Link>
              </Button>
              <Button variant="outline" asChild className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md">
                <Link href={`/interview?skipResume=true&jobTitle=${encodeURIComponent(jobTitle)}`}>Skip this step</Link>
              </Button>
            </CardFooter>
          </Card>
        </SessionLayout>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "interview" | "profile")} className="w-full">
        <div className="flex justify-center py-4 bg-gray-100 dark:bg-gray-800 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="interview" className="mt-0">
          <SessionLayout>
            <h1 className="text-3xl md:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white text-center mb-6">Interview Session</h1>
            <div className="mb-6 text-center text-gray-700 dark:text-gray-300">
              <p>Position: <strong>{jobTitle}</strong> {hasResumeData && " • Resume data loaded"}</p>
            </div>

            {isPremium ? (
              <div className="text-center my-6">
                <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white px-5 py-3 rounded-lg shadow-md font-semibold text-md mb-2">
                  Premium Access: Unlimited Interviews
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enjoy your premium benefits!</p>
              </div>
            ) : isCreditsLoading ? (
                <div className="text-center my-6"><Skeleton className="h-8 w-48 inline-block" /></div>
            ) : credits !== null && credits > 0 ? (
              <div className="text-center my-6">
                <p className="text-lg">
                  You have <span className="font-bold text-indigo-600 dark:text-indigo-400">{credits}</span> Interview Credit{credits === 1 ? "" : "s"} remaining.
                </p>
                <Button onClick={handlePurchaseCreditsClick} variant="link" className="text-indigo-600 dark:text-indigo-400 p-0 h-auto">
                  Buy More Credits
                </Button>
              </div>
            ) : ( 
              <Card className="max-w-lg mx-auto my-8 shadow-xl border-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Out of Interview Credits!</CardTitle>
                  <CardDescription className="text-red-500 dark:text-red-300 mt-1">
                    Purchase more credits or upgrade to premium for unlimited access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3 p-6">
                  <Button onClick={handlePurchaseCreditsClick} className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700">Buy More Credits</Button>
                  <Button onClick={handleUpgradeToPremium} className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700">Upgrade to Premium</Button>
                </CardContent>
                 <CardFooter className="text-xs text-gray-500 dark:text-gray-400 justify-center">
                    <Link href="/pricing" className="underline hover:text-indigo-500">View Pricing & Plans</Link>
                </CardFooter>
              </Card>
            )}

            { (isPremium || (credits !== null && credits > 0)) ? (
                <div className="mt-8">
                     <Button 
                        onClick={handleStartInterviewAttempt} 
                        className="w-full max-w-md mx-auto flex justify-center py-3 text-lg bg-green-500 hover:bg-green-600"
                        disabled={isCreditsLoading} // Disable if credits are currently being refetched
                    >
                        Start Mock Interview
                    </Button>
                     <InterviewRoom
                        jobTitle={jobTitle}
                        onComplete={handleInterviewComplete}
                        resumeData={resumeData}
                        credits={credits} 
                        isCreditsLoading={isCreditsLoading} // Pass this down
                        onBuyCredits={handlePurchaseCreditsClick} 
                        refetchCredits={refetchCreditsAndProfile} 
                     />
                </div>
            ) : !isCreditsLoading && credits === 0 && !isPremium ? (
                <div className="text-center text-gray-600 dark:text-gray-400 mt-6">
                    Please purchase credits or upgrade to premium to start an interview.
                </div>
            ) : null }
          </SessionLayout>
        </TabsContent>

        <TabsContent value="profile" className="mt-0">
          <SessionLayout> 
            <div className="max-w-2xl mx-auto py-8"> 
              <h2 className="text-3xl font-semibold text-center mb-6 dark:text-white">Profile Settings</h2>
              <ProfileSettingsForm 
                initialProfileData={profileDataForForm} 
                onProfileSaveSuccess={handleProfileSaveSuccess}
              />
            </div>
          </SessionLayout>
        </TabsContent>
      </Tabs>
      
      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        // onPurchaseSuccess is handled by Stripe redirect and webhook.
        // refetchCreditsAndProfile can be called when user returns to this page or modal closes.
      />

      {isConfirmStartModalOpen && (
        <Dialog open={isConfirmStartModalOpen} onOpenChange={setIsConfirmStartModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Start Interview</DialogTitle>
              <DialogDescription>
                Starting this interview will use 1 credit. You will have {credits !== null && credits > 0 ? credits - 1 : 0} credit(s) remaining. Do you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmStartModalOpen(false)}>Cancel</Button>
              <Button onClick={startInterview}>Proceed</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Server Component Wrapper for initial data fetching
export default async function InterviewPage() {
    const { userId } = await auth(); 
    const searchParams = useSearchParams(); 

    if (!userId) {
        return (
            <AuthGuard> 
                <SessionLayout>
                    <Navbar />
                    <div className="text-center py-10">Please log in to continue.</div>
                </SessionLayout>
            </AuthGuard>
        );
    }

    const clerkServerUser = await currentUser();
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });

    let initialName = "";
    if (clerkServerUser?.firstName && clerkServerUser?.lastName) initialName = `${clerkServerUser.firstName} ${clerkServerUser.lastName}`;
    else if (clerkServerUser?.firstName) initialName = clerkServerUser.firstName;
    else if (clerkServerUser?.lastName) initialName = clerkServerUser.lastName;
    else if (clerkServerUser?.emailAddresses[0]?.emailAddress) initialName = clerkServerUser.emailAddresses[0].emailAddress;

    const jobTitleFromParams = searchParams.get("jobTitle") || "Software Engineer";
    const skipResumeFromParams = searchParams.get("skipResume") === "true";

    return (
        <AuthGuard>
            <InterviewPageContent
                initialJobTitle={jobTitleFromParams}
                initialResumeData={null} 
                initialHasResumeData={false} 
                initialSkipResume={skipResumeFromParams}
                initialCredits={dbUser?.credits ?? 0}
                initialIsPremium={!!dbUser?.isPremium}
                initialProfileFormData={{
                    name: initialName,
                    resumeJobTitle: dbUser?.resumeJobTitle || "",
                    resumeFileUrl: dbUser?.resumeFileUrl || "",
                    jobSearchStage: dbUser?.jobSearchStage || "",
                    linkedinUrl: dbUser?.linkedinUrl || "",
                }}
                stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
                userId={userId}
            />
        </AuthGuard>
    );
}
