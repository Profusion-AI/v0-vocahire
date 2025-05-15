// No "use client"; directive - this is a Server Component by default
import { Suspense } from "react"; // For useSearchParams with Server Components
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { useSearchParams as useSearchParamsServer } from 'next/navigation'; // For server-side use
import { Navbar } from "@/components/navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import SessionLayout from "@/components/SessionLayout";
import InterviewPageClient, { type InterviewPageClientProps } from "./InterviewPageClient"; // Corrected import path
import { type ProfileFormData } from "@/components/ProfileSettingsForm"; // Type for profile form data
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Helper to use searchParams in a Server Component context
function SearchParamsReader() {
  const searchParams = useSearchParamsServer();
  return <InterviewPageDataFetcher searchParams={searchParams} />;
}

async function InterviewPageDataFetcher({ searchParams }: { searchParams: ReturnType<typeof useSearchParamsServer> }) {
  const { userId } = await auth();
  
  if (!userId) {
      // This case should ideally be handled by AuthGuard on the client,
      // or middleware. If reached, it means auth state is not yet resolved client-side
      // or user is genuinely not logged in.
      // AuthGuard will likely redirect or show a login prompt.
      // Returning a loading or minimal state here is fine.
      return (
          <SessionLayout>
              <Navbar /> {/* Navbar should be visible even if content is loading/auth pending */}
              <div className="text-center py-10">Loading user session...</div>
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

  const jobTitleFromParams = searchParams.get("jobTitle") || "Software Engineer";
  const skipResumeFromParams = searchParams.get("skipResume") === "true";

  const clientProps: InterviewPageClientProps = {
    initialJobTitle: jobTitleFromParams,
    // initialResumeData and initialHasResumeData are handled client-side by InterviewPageClient
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


export default function InterviewPage() {
  return (
    <AuthGuard> {/* AuthGuard handles client-side auth protection and Clerk context */}
      <Navbar /> {/* Navbar is part of the server layout */}
      {/* Suspense is needed because useSearchParams is a client hook, 
          but we are using a server-compatible version via a helper.
          Alternatively, pass searchParams directly if page itself is async.
          For App Router, pages are Server Components by default.
      */}
      <Suspense fallback={
        <SessionLayout>
          <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-[500px] w-full max-w-3xl mx-auto" />
        </SessionLayout>
      }>
        <SearchParamsReader />
      </Suspense>
    </AuthGuard>
  );
}
