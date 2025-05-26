"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import InterviewRoom from "@/components/InterviewRoom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import type { ResumeData } from "@/components/resume-input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Mic, Settings, Bot, Zap } from "lucide-react";
import { InterviewLoadingScreen } from "@/components/InterviewLoadingScreen";
import type { LoadingStage } from "@/components/ui/InterviewLoadingIndicator";
import { motion, AnimatePresence } from "framer-motion";
import SessionLayout from "@/components/SessionLayout";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";
import { ProfileSettingsForm, type ProfileFormData } from "@/components/ProfileSettingsForm";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { useUserData } from "@/hooks/useUserData";
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
  initialProfileFormData: ProfileFormData;
  stripePublishableKey: string;
  userId: string;
  isUsingFallbackDb?: boolean;
}

export default function InterviewPageClient({
  initialJobTitle,
  initialSkipResume,
  initialProfileFormData,
  stripePublishableKey,
  isUsingFallbackDb = false,
}: InterviewPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    user,
    credits,
    isPremium,
    isLoading: isUserDataLoading,
    refetchUserData
  } = useUserData();

  const [jobTitle, setJobTitle] = useState<string>(initialJobTitle);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasResumeData, setHasResumeData] = useState<boolean>(false);
  const [skipResume, setSkipResume] = useState(initialSkipResume);
  const [currentView, setCurrentView] = useState<"interview" | "profile">("interview");
  
  // Simplified UI state management
  const [showInterview, setShowInterview] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  
  // Loading stages for UI feedback
  const [loadingStages] = useState<LoadingStage[]>([
    { id: 'mic_check', label: 'Checking microphone...', icon: Mic },
    { id: 'session_init', label: 'Initializing session...', icon: Settings },
    { id: 'ai_connect', label: 'Connecting to AI Coach...', icon: Bot },
    { id: 'finalizing', label: 'Finalizing setup...', icon: Zap }
  ]);
  const [currentLoadingStageId, setCurrentLoadingStageId] = useState<string | undefined>();
  const [completedLoadingStageIds, setCompletedLoadingStageIds] = useState<string[]>([]);
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConfirmStartModalOpen, setIsConfirmStartModalOpen] = useState(false);
  
  // Profile form data state
  const [profileDataForForm, setProfileDataForForm] = useState<ProfileFormData>(initialProfileFormData);

  // Load resume data from localStorage
  useEffect(() => {
    setIsLoadingResume(true);
    try {
      if (typeof window !== 'undefined') {
        const storedResumeData = localStorage.getItem("vocahire_resume_data");
        if (storedResumeData) {
          const parsedData = JSON.parse(storedResumeData) as ResumeData;
          setResumeData(parsedData);
          setHasResumeData(true);
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
  }, [initialJobTitle]);

  // Update profile data when user changes
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

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (stageTimeoutRef.current) {
        clearTimeout(stageTimeoutRef.current);
      }
    };
  }, []);
  
  // Display a notification when fallback database is being used
  useEffect(() => {
    if (isUsingFallbackDb) {
      toast({
        title: "Limited Functionality",
        description: "Database connection is currently unavailable. Some features may be limited.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [isUsingFallbackDb, toast]);

  const handleProfileSaveSuccess = (updatedFormData: ProfileFormData) => {
    setProfileDataForForm(updatedFormData);
    toast({title: "Success", description: "Profile updated successfully!"});
    refetchUserData();
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
      
      // Reset interview states
      setShowInterview(false);
      setShowLoadingScreen(false);
      router.push("/feedback");
    },
    [router]
  );
  
  const handleStartInterviewAttempt = () => {
    if (creatingSession) return;
    
    setCreatingSession(true);
    
    if (!isPremium && credits !== null && Number(credits) > 0) {
      setIsConfirmStartModalOpen(true);
      setCreatingSession(false);
    } else if (isPremium || (credits !== null && Number(credits) > 0)) {
      startInterview();
    } else {
      setCreatingSession(false);
    }
  };

  const startInterview = async () => {
    setIsConfirmStartModalOpen(false);
    setShowInterview(true);
    setShowLoadingScreen(true);
    
    // Set initial loading stage
    setCurrentLoadingStageId('mic_check');
    setCompletedLoadingStageIds([]);
  };

  const handleSessionStatus = (status: string, error?: string) => {
    console.log('[InterviewPageClient] Session status:', status, error);
    
    // Clear any existing timeout
    if (stageTimeoutRef.current) {
      clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = null;
    }
    
    if (error) {
      console.error("Session error:", error);
      
      // Handle different error types
      let toastTitle = "Interview Session Error";
      let toastDescription = "An unexpected error occurred. Please try again.";

      if (error.includes("Insufficient VocahireCredits")) {
        toastTitle = "Insufficient Credits";
        toastDescription = "You don't have enough VocahireCredits to start an interview.";
      } else if (error.includes("Authentication") || error.includes("Unauthorized")) {
        toastTitle = "Authentication Error";
        toastDescription = "Please log in again.";
      } else if (error.includes("Rate limit")) {
        toastTitle = "Rate Limit Exceeded";
        toastDescription = "Please wait a moment before trying again.";
      }

      toast({ 
        title: toastTitle, 
        description: toastDescription, 
        variant: "destructive",
      });
      
      // Reset states on error
      setShowInterview(false);
      setShowLoadingScreen(false);
      setCreatingSession(false);
      return;
    }
    
    // Map interview statuses to loading stages
    switch (status) {
      case 'requesting_mic':
        setCurrentLoadingStageId('mic_check');
        break;
      case 'creating_session':
        setCompletedLoadingStageIds(['mic_check']);
        setCurrentLoadingStageId('session_init');
        break;
      case 'connecting_websocket':
      case 'establishing_webrtc':
        setCompletedLoadingStageIds(['mic_check', 'session_init']);
        setCurrentLoadingStageId('ai_connect');
        break;
      case 'active':
        // Interview is active, complete all stages and hide loading
        setCompletedLoadingStageIds(['mic_check', 'session_init', 'ai_connect', 'finalizing']);
        setTimeout(() => {
          setShowLoadingScreen(false);
          setCreatingSession(false);
        }, 1000); // Show completion state briefly
        break;
      case 'ended':
        setShowInterview(false);
        setShowLoadingScreen(false);
        setCreatingSession(false);
        break;
    }
  };

  if (isLoadingResume || isUserDataLoading) {
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
    <>
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "interview" | "profile")} className="w-full">
        <div className="flex justify-center py-4 bg-gray-100 dark:bg-gray-800 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="interview" className="mt-0">
          <SessionLayout>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Mic className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-3xl md:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Interview Session</h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Practice with your AI-powered interview coach</p>
            </div>
            
            {/* Pre-flight check card */}
            <Card className="max-w-md mx-auto mb-8 shadow-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Interview Ready!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Position:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{jobTitle}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Context:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {hasResumeData ? "Resume data loaded" : "General interview"}
                    </span>
                  </div>
                </div>
                {isUsingFallbackDb && (
                  <div className="mt-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-xs">
                    <span className="font-medium">Limited Mode:</span> Database connection unavailable
                  </div>
                )}
                
                {/* Credits section */}
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  {isPremium ? (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                        Premium Access: Unlimited Interviews
                      </span>
                    </div>
                  ) : isUserDataLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : credits !== null && Number(credits) > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Credits:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {typeof credits === 'number' ? credits.toFixed(2) : Number(credits).toFixed(2)} remaining
                        </span>
                      </div>
                      <Button 
                        onClick={handlePurchaseCreditsClick} 
                        variant="ghost" 
                        size="sm"
                        className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      >
                        Purchase More VocahireCredits
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Show different UI based on state */}
            {showInterview ? (
              <>
                {/* Interview Room */}
                <motion.div 
                  className={showLoadingScreen ? "sr-only" : "mt-8"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showLoadingScreen ? 0 : 1 }}
                  transition={{ duration: 0.5, delay: showLoadingScreen ? 0 : 0.3 }}
                >
                  <InterviewRoom
                    jobTitle={jobTitle}
                    onComplete={handleInterviewComplete}
                    resumeData={resumeData}
                    autoStart={true}
                    onSessionStatus={handleSessionStatus}
                  />
                </motion.div>
                
                {/* Loading screen overlay */}
                <AnimatePresence>
                  {showLoadingScreen && (
                    <motion.div 
                      className="fixed inset-0 z-50 bg-background"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <InterviewLoadingScreen
                        stages={loadingStages}
                        currentStageId={currentLoadingStageId}
                        completedStageIds={completedLoadingStageIds}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              /* Show start button or credit warnings */
              <>
                {!isPremium && !isUserDataLoading && credits !== null && Number(credits) === 0 && (
                  <Card className="max-w-lg mx-auto my-8 shadow-xl border-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Premium Access Required</CardTitle>
                      <CardDescription className="text-red-500 dark:text-red-300 mt-1">
                        Upgrade to a premium subscription for unlimited AI interviews.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-3 p-6">
                      <Button onClick={handleUpgradeToPremium} className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700">Upgrade to Premium</Button>
                      <Button onClick={handlePurchaseCreditsClick} className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700">Top-up Credits (Premium Only)</Button>
                    </CardContent>
                  </Card>
                )}

                {(isPremium || (credits !== null && Number(credits) >= 0.50)) && (
                  <div className="mt-8 space-y-4">
                    <div className="text-center max-w-md mx-auto">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">~10 min session</span> • Real-time voice practice • AI-generated feedback
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleStartInterviewAttempt}
                      className="w-full max-w-md mx-auto flex justify-center items-center gap-3 py-4 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                      disabled={isUserDataLoading || creatingSession}
                    >
                      {creatingSession ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Starting Interview...
                        </>
                      ) : (
                        <>
                          <Mic className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          Start Mock Interview
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!isUserDataLoading && credits !== null && Number(credits) < 0.50 && !isPremium && (
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
                  </Card>
                )}
              </>
            )}
          </SessionLayout>
        </TabsContent>

        <TabsContent value="profile" className="mt-0">
          <SessionLayout> 
            <div className="max-w-2xl mx-auto py-8"> 
              <h2 className="text-3xl font-semibold text-center mb-6 dark:text-white">Profile Settings</h2>
              <ProfileSettingsForm 
                initialProfileData={profileDataForForm} 
                onProfileSaveSuccess={handleProfileSaveSuccess}
                onDataChanged={refetchUserData}
              />
            </div>
          </SessionLayout>
        </TabsContent>
      </Tabs>
      
      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
      />

      {isConfirmStartModalOpen && (
        <Dialog open={isConfirmStartModalOpen} onOpenChange={(open) => {
          setIsConfirmStartModalOpen(open);
          if (!open) {
            setCreatingSession(false);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Start Interview</DialogTitle>
              <DialogDescription>
                Starting this interview will use 1.00 VocahireCredits. You will have {credits !== null && credits > 0 ? (Number(credits) - 1).toFixed(2) : '0.00'} VocahireCredits remaining. Do you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsConfirmStartModalOpen(false);
                setCreatingSession(false);
              }}>Cancel</Button>
              <Button onClick={startInterview}>Proceed</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}