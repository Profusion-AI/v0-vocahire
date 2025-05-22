// No "use client"; directive - this is a Server Component by default
import { Suspense } from "react"; 
import { prisma, withDatabaseFallback, isUsingFallbackDb } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Navbar } from "@/components/navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";
import InterviewPageClient, { type InterviewPageClientProps } from "./InterviewPageClient";
import { type ProfileFormData } from "@/components/ProfileSettingsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from 'next/navigation';

// Force dynamic rendering for this route since it uses auth
export const dynamic = 'force-dynamic';

// Props for the Page Server Component, as provided by Next.js
interface PageProps {
  // Both params and searchParams are promises that resolve to the respective objects
  params: Promise<{ [key: string]: string | string[] | undefined }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// This component fetches data using the searchParams passed from the Page
async function InterviewPageDataFetcher({ searchParams: searchParamsPromise, params: paramsPromise }: { 
  searchParams: PageProps['searchParams'];
  params: PageProps['params']; // Added params promise here
}) {
  const { userId } = await auth();
  const resolvedSearchParams = await searchParamsPromise; 
  // const resolvedParams = await paramsPromise; // Await params if you need to use them

  if (!userId) {
    redirect('/login'); 
  }

  // Get Clerk user data (this is fast and doesn't involve database)
  const clerkServerUser = await currentUser();
  
  // Skip database query on server-side to prevent timeouts
  // Client-side useUserData hook will handle user data fetching
  const dbUser = null;

  let initialName = "";
  if (clerkServerUser) {
    if (clerkServerUser.firstName && clerkServerUser.lastName) initialName = `${clerkServerUser.firstName} ${clerkServerUser.lastName}`;
    else if (clerkServerUser.firstName) initialName = clerkServerUser.firstName;
    else if (clerkServerUser.lastName) initialName = clerkServerUser.lastName;
    else if (clerkServerUser.emailAddresses[0]?.emailAddress) initialName = clerkServerUser.emailAddresses[0].emailAddress;
  }

  const jobTitleFromParams = typeof resolvedSearchParams.jobTitle === 'string' ? resolvedSearchParams.jobTitle : "Software Engineer";
  const skipResumeFromParams = resolvedSearchParams.skipResume === "true";

  const clientProps: InterviewPageClientProps = {
    initialJobTitle: jobTitleFromParams,
    initialSkipResume: skipResumeFromParams,
    // initialCredits and initialIsPremium are no longer passed
    // as they are handled by the useUserData hook in InterviewPageClient
    initialProfileFormData: {
      name: initialName,
      resumeJobTitle: dbUser?.resumeJobTitle || "",
      resumeFileUrl: dbUser?.resumeFileUrl || "",
      jobSearchStage: dbUser?.jobSearchStage || "",
      linkedinUrl: dbUser?.linkedinUrl || "",
    },
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    userId: userId, // userId might still be useful for specific actions not covered by the hook immediately
  };

  // Add database fallback warning if needed
  const databaseStatusProps = {
    ...clientProps,
    // Pass a flag to the client component to show appropriate messages
    isUsingFallbackDb
  };
  
  return <InterviewPageClient {...databaseStatusProps} />;
}

// The Page component itself receives params and searchParams as promise props from Next.js
export default function InterviewPage({ params, searchParams }: PageProps) {
  return (
    <>
      <Navbar /> 
      <AuthGuard> 
        <Suspense fallback={
          <SessionLayout>
            <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
            <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
          </SessionLayout>
        }>
          <InterviewPageDataFetcher params={params} searchParams={searchParams} />
        </Suspense>
      </AuthGuard>
    </>
  );
}
