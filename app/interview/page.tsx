// No "use client"; directive - this is a Server Component by default
import { Suspense } from "react"; 
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Navbar } from "@/components/navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";
import InterviewPageClient, { type InterviewPageClientProps } from "./InterviewPageClient";
import { type ProfileFormData } from "@/components/ProfileSettingsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from 'next/navigation';

// Props for the Page Server Component, as provided by Next.js
interface PageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>; // Or a more specific type for route params
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// This component fetches data using the searchParams passed from the Page
async function InterviewPageDataFetcher({ searchParams: searchParamsPromise }: { searchParams: PageProps['searchParams'] }) {
  const { userId } = await auth();
  const resolvedSearchParams = await searchParamsPromise; // Await the promise here
  
  if (!userId) {
    return (
        <SessionLayout>
            <Navbar />
            <div className="text-center py-10">Authenticating user...</div>
        </SessionLayout>
    );
  }

  const clerkServerUser = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });

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
    initialCredits: dbUser?.credits ?? 0,
    initialIsPremium: !!dbUser?.isPremium,
    initialProfileFormData: {
      name: initialName,
      resumeJobTitle: dbUser?.resumeJobTitle || "",
      resumeFileUrl: dbUser?.resumeFileUrl || "",
      jobSearchStage: dbUser?.jobSearchStage || "",
      linkedinUrl: dbUser?.linkedinUrl || "",
    },
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    userId: userId, 
  };

  return <InterviewPageClient {...clientProps} />;
}

// The Page component itself receives searchParams as a promise prop from Next.js
export default function InterviewPage({ params, searchParams }: PageProps) {
  return (
    <AuthGuard> 
      <Navbar /> 
      <Suspense fallback={
        <SessionLayout>
          <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
        </SessionLayout>
      }>
        {/* Pass searchParams promise to the data fetching component */}
        <InterviewPageDataFetcher searchParams={searchParams} />
      </Suspense>
    </AuthGuard>
  );
}
