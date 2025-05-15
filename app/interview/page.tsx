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
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

// This component fetches data using the searchParams passed from the Page
async function InterviewPageDataFetcher({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const { userId } = await auth(); 
  
  // If userId is not available here, it means the user is not authenticated server-side.
  // AuthGuard will handle client-side redirection if the session is invalid or missing.
  // We might still want to redirect server-side if no userId is found to avoid rendering further.
  if (!userId) {
    // This redirect will happen during server rendering if user is not authenticated.
    // Ensure your /login path is correct.
    redirect('/login'); 
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

  const jobTitleFromParams = typeof searchParams.jobTitle === 'string' ? searchParams.jobTitle : "Software Engineer";
  const skipResumeFromParams = searchParams.skipResume === "true";

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

  // InterviewPageClient is a Client Component and will be wrapped by AuthGuard in the Page export
  return <InterviewPageClient {...clientProps} />;
}

// The Page component itself receives searchParams as a prop from Next.js
export default function InterviewPage({ searchParams }: PageProps) {
  return (
    <>
      <Navbar /> 
      {/* AuthGuard wraps the part of the tree that needs client-side auth context and renders client components */}
      <AuthGuard> 
        <Suspense fallback={
          <SessionLayout>
            <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
            <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
          </SessionLayout>
        }>
          {/* InterviewPageDataFetcher is a Server Component, its result (InterviewPageClient) is what AuthGuard protects */}
          <InterviewPageDataFetcher searchParams={searchParams} />
        </Suspense>
      </AuthGuard>
    </>
  );
}
