"use client";

import { useState, useEffect, useCallback } from "react";
import InterviewRoom from "@/components/InterviewRoom";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import type { ResumeData } from "@/components/resume-input";
// import { Navbar } from "@/components/navbar"; // Navbar is in parent server component
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import SessionLayout from "@/components/SessionLayout";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";
import * as Sentry from "@sentry/nextjs";
import { ProfileSettingsForm, type ProfileFormData } from "@/components/ProfileSettingsForm";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { useUserData } from "@/hooks/useUserData"; // Import the new hook
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface InterviewPageClientProps {
  initialJobTitle: string;
  initialSkipResume: boolean;
  // initialCredits, initialIsPremium are no longer needed as useUserData handles fetching
  initialProfileFormData: ProfileFormData;
  stripePublishableKey: string;
  userId: string; // Still needed for some operations or if useUserData doesn't expose it directly
  isUsingFallbackDb?: boolean; // Flag to indicate if we're using fallback database
}

export default function InterviewPageClient({
  initialJobTitle,
  initialSkipResume,
  initialProfileFormData,
  stripePublishableKey,
  // userId, // userId can be sourced from useUserData if available there
  isUsingFallbackDb = false,
}: InterviewPageClientProps) {
  const router = useRouter();
  // const searchParams = useSearchParams(); // Not used currently
  const { toast } = useToast();

  const {
    user,
    credits,
    isPremium,
    isLoading: isUserDataLoading, // Renamed to avoid conflict if another isLoading is used
    refetchUserData
  } = useUserData();

  const [jobTitle, setJobTitle] = useState<string>(initialJobTitle);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasResumeData, setHasResumeData] = useState<boolean>(false);
  const [skipResume, setSkipResume] = useState(initialSkipResume);
  const [currentView, setCurrentView] = useState<"interview" | "profile">("interview");
  const [interviewActive, setInterviewActive] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  // Local state for modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConfirmStartModalOpen, setIsConfirmStartModalOpen] = useState(false);
  
  // Profile form data state, initialized from props, potentially updated by useUserData
  const [profileDataForForm, setProfileDataForForm] = useState<ProfileFormData>(initialProfileFormData);

  useEffect(() => {
    setIsLoadingResume(true);
    try {
      // Protect localStorage access for SSR
      if (typeof window !== 'undefined') {
        const storedResumeData = localStorage.getItem("vocahire_resume_data");
        if (storedResumeData) {
          const parsedData = JSON.parse(storedResumeData) as ResumeData;
          setResumeData(parsedData);
          setHasResumeData(true);
          // Only set jobTitle from resume if initialJobTitle was the default placeholder
          if (initialJobTitle === "Software Engineer" && parsedData.jobTitle) {
               setJobTitle(parsedData.jobTitle);
          }
        } else {
          setHasResumeData(false);
        }
      }
    } catch (err) {
      console.error("Error loading resume data from localStorage:", err);
      setHasResumeData(false);
    }
    setIsLoadingResume(false);
  }, [initialJobTitle]); // Only re-run if initialJobTitle changes

  // Separate effect for profile data updates - only when user changes
  useEffect(() => {
    if (user) {
      setProfileDataForForm(prev => ({
        name: user.name || prev.name || "",
        resumeJobTitle: user.resumeJobTitle || prev.resumeJobTitle || "",
        resumeFileUrl: user.resumeFileUrl || prev.resumeFileUrl || "",
        jobSearchStage: user.jobSearchStage || prev.jobSearchStage || "",
        linkedinUrl: user.linkedinUrl || prev.linkedinUrl || "",
      }));
    }
  }, [user]);

  // Separate effect for skip resume setting
  useEffect(() => {
    setSkipResume(initialSkipResume);
  }, [initialSkipResume]);

  // Separate effect for job title synchronization
  useEffect(() => {
    if (initialJobTitle !== jobTitle && !resumeData?.jobTitle) {
      setJobTitle(initialJobTitle);
    }
  }, [initialJobTitle, resumeData?.jobTitle]);
  
  // Display a notification when fallback database is being used
  useEffect(() => {
    if (isUsingFallbackDb) {
      toast({
        title: "Limited Functionality",
        description: "Database connection is currently unavailable. Some features may be limited.",
        variant: "destructive",
        duration: 10000, // 10 seconds
      });
    }
  }, [isUsingFallbackDb, toast]);


  const handleProfileSaveSuccess = (updatedFormData: ProfileFormData) => {
    setProfileDataForForm(updatedFormData);
    toast({title: "Success", description: "Profile updated successfully!"});
    refetchUserData(); // Refetch user data to ensure consistency, e.g. if name changed
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
      if (typeof window !== 'undefined') {
        localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages));
      }
      setInterviewActive(false); // Reset the interview state
      router.push("/feedback");
    },
    [router]
  );
  
  const handleStartInterviewAttempt = () => {
    if (!isPremium && credits !== null && Number(credits) > 0) {
      setIsConfirmStartModalOpen(true);
    } else if (isPremium || (credits !== null && Number(credits) > 0)) {
      startInterview();
    }
  };

  const startInterview = async () => {
    setIsConfirmStartModalOpen(false);
    setCreatingSession(true);
    
    try {
      // This will trigger the InterviewRoom to initialize and connect
      setInterviewActive(true);
      console.log("Interview session starting...");
      await refetchUserData();
    } catch (error) {
      console.error("Error starting interview:", error);
      setInterviewActive(false);
    } finally {
      setCreatingSession(false);
    }
  };

  // Debug logging for loading states
  console.log('InterviewPageClient loading states:', {
    isLoadingResume,
    isUserDataLoading,
    hasResumeData,
    skipResume,
    currentView,
    user: !!user,
    credits
  })

  if (isLoadingResume || isUserDataLoading) { // Check both resume and user data loading
    console.log('InterviewPageClient showing loading skeleton')
    return (
        <SessionLayout>
          <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
        </SessionLayout>
    );
  }

  if (!hasResumeData && !skipResume && currentView === "interview") {
    return (
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
    );
  }

  return (
    <> {/* Navbar is now in the parent Server Component */}
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
              {isUsingFallbackDb && (
                <div className="mt-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md inline-block">
                  <span className="font-medium">Limited Mode:</span> Database connection unavailable
                </div>
              )}
            </div>

            {isPremium ? (
              <div className="text-center my-6">
                <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white px-5 py-3 rounded-lg shadow-md font-semibold text-md mb-2">
                  Premium Access: Unlimited Interviews
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enjoy your premium benefits!</p>
              </div>
            ) : isUserDataLoading ? ( // Use isUserDataLoading from the hook
                <div className="text-center my-6"><Skeleton className="h-8 w-48 inline-block" /></div>
            ) : credits !== null && Number(credits) > 0 ? (
              <div className="text-center my-6">
                <p className="text-lg">
                  You have <span className="font-bold text-indigo-600 dark:text-indigo-400">{typeof credits === 'number' ? credits.toFixed(2) : Number(credits).toFixed(2)}</span> VocahireCredits remaining.
                </p>
                <Button onClick={handlePurchaseCreditsClick} variant="link" className="text-indigo-600 dark:text-indigo-400 p-0 h-auto">
                  Purchase More VocahireCredits
                </Button>
              </div>
            ) : ( // This covers credits === 0 or credits === null (and not premium, not loading)
              <Card className="max-w-lg mx-auto my-8 shadow-xl border-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Premium Access Required</CardTitle>
                  <CardDescription className="text-red-500 dark:text-red-300 mt-1">
                    Upgrade to a premium subscription for unlimited AI interviews.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3 p-6">
                  <Button onClick={handleUpgradeToPremium} className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700">Upgrade to Premium</Button>
                  {credits !== null && Number(credits) === 0 && (
                    <Button onClick={handlePurchaseCreditsClick} className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700">Top-up Credits (Premium Only)</Button>
                  )}
                </CardContent>
                 <CardFooter className="text-xs text-gray-500 dark:text-gray-400 justify-center">
                    <Link href="/pricing" className="underline hover:text-indigo-500">View Pricing & Plans</Link>
                </CardFooter>
              </Card>
            )}

            {/* Interview interface - only show when active */}
            {interviewActive ? (
              <div className="mt-8">
                <InterviewRoom
                  jobTitle={jobTitle}
                  onComplete={handleInterviewComplete}
                  resumeData={resumeData}
                  credits={credits}
                  isCreditsLoading={isUserDataLoading}
                  onBuyCredits={handlePurchaseCreditsClick}
                  refetchCredits={refetchUserData}
                  autoStart={true}
                />
              </div>
            ) : (isPremium || (credits !== null && Number(credits) >= 0.50)) ? (
              <div className="mt-8">
                <Button
                  onClick={handleStartInterviewAttempt}
                  className="w-full max-w-md mx-auto flex justify-center py-3 text-lg bg-green-500 hover:bg-green-600"
                  disabled={isUserDataLoading || creatingSession}
                >
                  {creatingSession ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting Interview...
                    </>
                  ) : (
                    "Start Mock Interview"
                  )}
                </Button>
              </div>
            ) : !isUserDataLoading && credits !== null && Number(credits) < 0.50 && !isPremium ? (
              <Card className="max-w-lg mx-auto my-8 shadow-xl border-2 border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">Insufficient VocahireCredits</CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300 mt-1">
                    You need at least 0.50 VocahireCredits to start an interview.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center p-6">
                  <div className="mb-4">
                    <p className="text-lg">
                      Current Balance: <span className="font-bold text-amber-600 dark:text-amber-400">{credits !== null ? Number(credits).toFixed(2) : '0.00'}</span> VocahireCredits
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Minimum Required: 0.50 VocahireCredits
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handlePurchaseCreditsClick} className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700">
                      Purchase VocahireCredits
                    </Button>
                    <Button onClick={handleUpgradeToPremium} className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700">
                      Upgrade to Premium
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-gray-500 dark:text-gray-400 justify-center">
                  <Link href="/pricing" className="underline hover:text-indigo-500">View Pricing & Plans</Link>
                </CardFooter>
              </Card>
            ) : null}
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
        // onPurchaseSuccess is handled by Stripe redirect and webhook, then refetchCreditsAndProfile
      />

      {isConfirmStartModalOpen && (
        <Dialog open={isConfirmStartModalOpen} onOpenChange={setIsConfirmStartModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Start Interview</DialogTitle>
              <DialogDescription>
                Starting this interview will use 1.00 VocahireCredits. You will have {credits !== null && credits > 0 ? (Number(credits) - 1).toFixed(2) : '0.00'} VocahireCredits remaining. Do you want to proceed?
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