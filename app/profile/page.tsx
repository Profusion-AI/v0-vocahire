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
  console.log("[ProfilePage SERVER] Page rendering started.");
  const { userId: currentAuthUserId } = await auth();
  // Wrap in try/catch to handle potential errors from Clerk
  let clerkUser = null;
  try {
    clerkUser = await currentUser();
    console.log("[ProfilePage SERVER] currentAuthUserId from Clerk auth():", currentAuthUserId);
    console.log("[ProfilePage SERVER] clerkUser object from currentUser():", clerkUser ? 'Exists' : 'null');
  } catch (error) {
    console.error("[ProfilePage SERVER] Error fetching Clerk user:", error);
    // Continue with null clerkUser - we'll handle this case gracefully
  }

  // For server components, add more defensive coding
  if (!currentAuthUserId) {
    console.log("[ProfilePage SERVER] No authenticated user found, redirecting to login");
    return redirect('/login');
  }

  let initialDbUser: PrismaUser | null = null;
  if (currentAuthUserId) {
    console.log(`[ProfilePage SERVER] Fetching user from DB with id: ${currentAuthUserId}`);
    try {
      initialDbUser = await prisma.user.findUnique({
        where: { id: currentAuthUserId },
      });
      console.log("[ProfilePage SERVER] initialDbUser fetched from DB:", initialDbUser);
      
      // If user doesn't exist in our DB but is authenticated via Clerk, create a basic record
      if (!initialDbUser) {
        console.log("[ProfilePage SERVER] User not found in DB, creating basic record");
        try {
          initialDbUser = await prisma.user.create({
            data: {
              id: currentAuthUserId,
              email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
              name: clerkUser?.firstName 
                ? (clerkUser.lastName 
                  ? `${clerkUser.firstName} ${clerkUser.lastName}` 
                  : clerkUser.firstName)
                : null,
              credits: 3, // Default for new users
            },
          });
          console.log("[ProfilePage SERVER] Created new user record:", initialDbUser);
        } catch (createError) {
          console.error("[ProfilePage SERVER] Error creating user record:", createError);
          // Continue with null initialDbUser
        }
      }
    } catch (dbError) {
      console.error("[ProfilePage SERVER] Error fetching user from DB:", dbError);
      // Continue with null initialDbUser and handle gracefully in UI
    }
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