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

/****
 * Server component for the `/profile` route that handles authentication, retrieves user profile data, and renders the profile page layout.
 *
 * Redirects unauthenticated users to the login page. Fetches the authenticated user's profile from the database and Clerk, constructs initial profile data, and passes it to the client-side profile page component along with the Stripe publishable key.
 *
 * @remark If the Stripe publishable key is missing from environment variables, the page renders but Stripe functionality will be unavailable on the client.
 */
export default async function ProfilePage() {
  console.log("[ProfilePage SERVER] Page rendering started.");
  const { userId: currentAuthUserId } = await auth();
  const clerkUser = await currentUser();

  console.log("[ProfilePage SERVER] currentAuthUserId from Clerk auth():", currentAuthUserId);
  console.log("[ProfilePage SERVER] clerkUser object from currentUser():", clerkUser ? 'Exists' : 'null');

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
    console.log(`[ProfilePage SERVER] Fetching user from DB with id: ${currentAuthUserId}`);
    initialDbUser = await prisma.user.findUnique({
      where: { id: currentAuthUserId },
    });
    console.log("[ProfilePage SERVER] initialDbUser fetched from DB:", initialDbUser);
  } else {
    console.log("[ProfilePage SERVER] No currentAuthUserId, skipping DB fetch for initialDbUser.");
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

  // Log the exact value being passed as initialCredits just before returning the client component
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    console.error("[ProfilePage SERVER] CRITICAL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.");
    // Handle this error appropriately, maybe throw an error or return a specific error page/component
    // For now, we'll proceed but Stripe functionality will be broken on the client.
  }

  console.log(
    "[ProfilePage SERVER] Passing to ProfilePageClient - initialProfileData.name:", initialProfileData.name,
    "stripePublishableKey exists:", !!stripePublishableKey
    // initialCredits and initialIsPremium are no longer passed as they are handled by useUserData
  );

  return (
    <>
      <Navbar />
      {/* AuthGuard wraps the client component that needs client-side auth checks & interactivity */}
      <AuthGuard>
        <SessionLayout>
          <ProfilePageClient
            initialProfileData={initialProfileData}
            stripePublishableKey={stripePublishableKey || ""} // Pass empty string if undefined
          />
        </SessionLayout>
      </AuthGuard>
    </>
  );
}