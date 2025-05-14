"use client"

import { useState, useEffect, useCallback } from "react"
import InterviewRoom from "@/components/InterviewRoom";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import type { ResumeData } from "@/components/resume-input";
import { Navbar } from "@/components/navbar"; // Import Navbar
import ProfilePage from "@/app/profile/page"; // Import ProfilePage
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import Tabs for view switching

import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";

// Stripe and toast imports
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";

function InterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [jobTitle, setJobTitle] = useState<string>("Software Engineer");
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasResumeData, setHasResumeData] = useState<boolean>(false);
  const [skipResume, setSkipResume] = useState(false);
  const [currentView, setCurrentView] = useState<"interview" | "profile">("interview"); // State to manage view

  // Credits state
  const [credits, setCredits] = useState<number | null>(null);
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  // Stripe publishable key (from env)
  const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

  // Stripe Checkout handler for credits
  const handlePurchaseCredits = async () => {
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: "CREDIT_PACK_1" }),
      });
      if (!res.ok) {
        throw new Error("Failed to create checkout session.");
      }
      const data = await res.json();
      if (!data.sessionId) {
        throw new Error("No sessionId returned from server.");
      }
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err?.message || "Unable to start purchase flow. Please try again.",
      });
    }
  };

  // Stripe Checkout handler for premium upgrade
  const handleUpgradeToPremium = async () => {
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: "PREMIUM_MONTHLY_SUB" }),
      });
      if (!res.ok) {
        throw new Error("Failed to create checkout session.");
      }
      const data = await res.json();
      if (!data.sessionId) {
        throw new Error("No sessionId returned from server.");
      }
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err?.message || "Unable to start upgrade flow. Please try again.",
      });
    }
  };

  // Fetch credits (and user data) on mount
  useEffect(() => {
    // Get skipResume from URL once
    setSkipResume(searchParams.get("skipResume") === "true");

    const title = searchParams.get("jobTitle");
    if (title) {
      setJobTitle(title);
    }

    // Try to get resume data from localStorage
    try {
      const storedResumeData = localStorage.getItem("vocahire_resume_data");
      if (storedResumeData) {
        const parsedData = JSON.parse(storedResumeData);
        setResumeData(parsedData);
        setHasResumeData(true);

        // Use job title from resume data if not specified in URL
        if (!title && parsedData.jobTitle) {
          setJobTitle(parsedData.jobTitle);
        }
      } else {
        setHasResumeData(false);
      }
    } catch (err) {
      console.error("Error loading resume data:", err);
      setHasResumeData(false);
    }

    // Fetch credits from /api/user
    const fetchCredits = async () => {
      setIsCreditsLoading(true);
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setCredits(typeof data.credits === "number" ? data.credits : 0);
          setIsPremium(!!data.isPremium || !!data.premium); // Accept either isPremium or premium
        } else {
          setCredits(0);
          setIsPremium(false);
        }
      } catch {
        setCredits(0);
        setIsPremium(false);
      } finally {
        setIsCreditsLoading(false);
        setIsLoading(false);
      }
    };
    fetchCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optionally, refetch credits when user attempts to start interview (if needed)
  const refetchCredits = async () => {
    setIsCreditsLoading(true);
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setCredits(typeof data.credits === "number" ? data.credits : 0);
        setIsPremium(!!data.isPremium || !!data.premium);
      } else {
        setCredits(0);
        setIsPremium(false);
      }
    } catch {
      setCredits(0);
      setIsPremium(false);
    } finally {
      setIsCreditsLoading(false);
    }
  };

  // Use useCallback for the interview completion handler to prevent recreation on every render
  const handleInterviewComplete = useCallback(
    (messages: any[]) => {
      // Store messages in localStorage for the feedback page
      localStorage.setItem("vocahire_interview_messages", JSON.stringify(messages));

      // Navigate to feedback page
      router.push("/feedback");
    },
    [router]
  );

  if (isLoading) {
    return (
      <> {/* Use fragment to include Navbar */}
        <Navbar /> {/* Include Navbar */}
        <SessionLayout>
          <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
        </SessionLayout>
      </>
    );
  }

  // If no resume data and not skipping resume step, show resume prompt
  if (!hasResumeData && !skipResume && currentView === "interview") { // Conditionally render based on view
    return (
      <> {/* Use fragment to include Navbar */}
        <Navbar /> {/* Include Navbar */}
        <SessionLayout>
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">Mock Interview</h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl text-center">
            For a more personalized interview experience, please provide some details about your background
          </p>

          <Card className="max-w-md mx-auto shadow-lg">
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
    <> {/* Use fragment to include Navbar */}
      <Navbar /> {/* Include Navbar */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "interview" | "profile")} className="w-full">
        <div className="flex justify-center py-4 bg-gray-100 dark:bg-gray-800">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-md p-1">
            <TabsTrigger value="interview" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">Interview</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">Profile</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="interview" className="mt-0">
          <SessionLayout>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center mb-8">Interview Session</h1>
            <div className="mb-4 text-center text-base text-gray-700 flex flex-col items-center">
              <p>
                Position: <strong>{jobTitle}</strong>
                {hasResumeData && " • Resume data loaded"}
              </p>
            </div>
            {/* Premium user experience */}
            {isPremium ? (
              <div className="flex flex-col items-center justify-center my-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-4 rounded-lg shadow-lg mb-4 font-semibold text-lg">
                  Premium Access: Unlimited Interviews
                </div>
                {/* Optionally, add a subtle note about premium benefits */}
                <span className="text-sm text-gray-500 dark:text-gray-400">Enjoy unlimited mock interviews as a premium member.</span>
                {/* InterviewRoom for premium users */}
                <div className="w-full mt-8">
                  <InterviewRoom
                    jobTitle={jobTitle}
                    onComplete={handleInterviewComplete}
                    resumeData={resumeData}
                    credits={null}
                    isCreditsLoading={false}
                    onBuyCredits={undefined}
                    refetchCredits={refetchCredits}
                  />
                </div>
              </div>
            ) : credits === 0 && !isCreditsLoading ? (
              // Out of credits scenario for non-premium users
              <div className="flex flex-col items-center justify-center my-12">
                <Card className="max-w-md w-full shadow-lg border-2 border-red-400">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-red-600 text-center">You're out of interview credits!</CardTitle>
                    <CardDescription className="text-center text-gray-600 mt-2">
                      You need credits to start a new interview session.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg py-3 rounded-md shadow"
                        onClick={handlePurchaseCredits}
                      >
                        Buy More Credits
                      </Button>
                      <Button
                        asChild // Use asChild to render Link as a Button
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold text-lg py-3 rounded-md shadow"
                      >
                        <Link href="/faq-credits">
                          Upgrade to Premium (FAQ)
                        </Link>
                      </Button>
                      {/* If a "Free Basic Session" feature is added in the future, add a button here */}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <span className="text-xs text-gray-400 mx-auto">Questions? <Link href="/profile" className="underline">Visit your profile</Link></span>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              // Standard credits display and InterviewRoom for non-premium users with credits
              <>
                <div className="mb-4 text-center">
                  <button
                    type="button"
                    className="mt-4 text-lg font-semibold text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition px-0 py-0 bg-transparent"
                    style={{ cursor: "pointer" }}
                    onClick={handlePurchaseCredits}
                    disabled={isCreditsLoading}
                    aria-label="Purchase more credits"
                  >
                    {isCreditsLoading || credits === null ? (
                      <span className="text-gray-400">Loading credits...</span>
                    ) : (
                      <>
                        You have <span className="font-bold">{credits}</span> Interview Credit{credits === 1 ? "" : "s"} remaining.
                      </>
                    )}
                  </button>
                  <span className="text-xs text-gray-500 mt-1 block">Click to purchase more credits.</span>
                </div>
                <InterviewRoom
                  jobTitle={jobTitle}
                  onComplete={handleInterviewComplete}
                  resumeData={resumeData}
                  credits={credits}
                  isCreditsLoading={isCreditsLoading}
                  onBuyCredits={handlePurchaseCredits}
                  refetchCredits={refetchCredits}
                />
              </>
            )}
          </SessionLayout>
        </TabsContent>
        <TabsContent value="profile" className="mt-0">
           {/* ProfilePage is already wrapped in SessionLayout */}
           <ProfilePage />
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function InterviewPage() {
  return (
    <AuthGuard>
      <InterviewPageContent />
    </AuthGuard>
  );
}
