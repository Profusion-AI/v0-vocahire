// No "use client"; here - this makes it a Server Component by default
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { type User as PrismaUser } from "@prisma/client"; // Alias Prisma User type
import ProfilePageClient from "./ProfilePageClient";
import { type ProfileFormData } from "@/components/ProfileSettingsForm"; // Correct import for the type
import { Navbar } from "@/components/navbar";
import SessionLayout from "@/components/SessionLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { redirect } from 'next/navigation';

// This is now the main Server Component for the /profile route
export default async function ProfilePage() {
  const { userId: currentAuthUserId } = await auth(); // This is fine in a Server Component
  const clerkUser = await currentUser(); // This is fine in a Server Component

  if (!currentAuthUserId) {
    // If AuthGuard is meant to handle client-side redirection,
    // this server-side check might be redundant or could redirect earlier.
    // For robust protection, Clerk's middleware is often preferred.
    // If AuthGuard handles it, this redirect might not be strictly necessary here.
    // However, for direct server rendering, this ensures no unauth access.
    redirect('/login'); // Or your Clerk sign-in path
  }

  let initialDbUser: PrismaUser | null = null;
  if (currentAuthUserId) {
    initialDbUser = await prisma.user.findUnique({
      where: { id: currentAuthUserId },
    });
  }

  // If the user is authenticated via Clerk but doesn't exist in your DB yet,
  // this could happen if the Clerk webhook for user creation hasn't run or failed.
  // You might want to handle this case, e.g., by creating the user here or redirecting.
  // For now, we'll pass potentially null initialDbUser and let ProfilePageClient handle defaults.

  let initialName = "";
  if (clerkUser) { // Check if clerkUser exists
    if (clerkUser.firstName && clerkUser.lastName) {
      initialName = `${clerkUser.firstName} ${clerkUser.lastName}`;
    } else if (clerkUser.firstName) {
      initialName = clerkUser.firstName;
    } else if (clerkUser.lastName) {
      initialName = clerkUser.lastName;
    } else if (clerkUser.emailAddresses?.[0]?.emailAddress) {
      // Fallback to primary email if name parts are missing
      initialName = clerkUser.emailAddresses[0].emailAddress;
    }
  }


  const initialProfileData: ProfileFormData = {
    name: initialName, // This will be the name from Clerk
    resumeJobTitle: initialDbUser?.resumeJobTitle || "",
    resumeFileUrl: initialDbUser?.resumeFileUrl || "",
    jobSearchStage: initialDbUser?.jobSearchStage || "",
    linkedinUrl: initialDbUser?.linkedinUrl || "",
  };

  return (
    <>
      <Navbar />
      {/* AuthGuard wraps the client component that needs client-side auth checks & interactivity */}
      <AuthGuard>
        <SessionLayout>
          <ProfilePageClient
            initialCredits={initialDbUser?.credits ?? 0} // Pass default 0 if no DB user yet
            initialProfileData={initialProfileData}
          />
        </SessionLayout>
      </AuthGuard>
    </>
  );
}