// No "use client"; here - this makes it a Server Component by default
import { withDatabaseFallback } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { type User as PrismaUser } from "../../prisma/generated/client"; // Alias Prisma User type
import ProfilePageClient from "./ProfilePageClient";
import { type ProfileFormData } from "@/components/ProfileSettingsForm"; // Correct import for the type
import { Navbar } from "@/components/navbar";
import SessionLayout from "@/components/SessionLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { redirect } from 'next/navigation';

// Force dynamic rendering for this route since it uses auth
export const dynamic = 'force-dynamic';

// This is now the main Server Component for the /profile route
export default async function ProfilePage() {
  console.log("[ProfilePage SERVER] Page rendering started.");
  
  // Get Clerk authentication with more robust error handling
  let currentAuthUserId = null;
  let clerkUser = null;
  
  try {
    const authResult = await auth();
    currentAuthUserId = authResult.userId;
    console.log("[ProfilePage SERVER] currentAuthUserId from Clerk auth():", currentAuthUserId);
  } catch (authError) {
    console.error("[ProfilePage SERVER] Error in Clerk auth():", authError);
    // Fall through to redirect if needed
  }
  
  // Wrap in try/catch to handle potential errors from Clerk
  try {
    clerkUser = await currentUser();
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

  // Use this flag to track if we had database connectivity issues
  let dbConnectionError = false;
  let dbConnectionErrorDetails: string | null = null;
  
  let initialDbUser: PrismaUser | null = null;
  if (currentAuthUserId) {
    console.log(`[ProfilePage SERVER] Fetching user from DB with id: ${currentAuthUserId}`);
    
    initialDbUser = await withDatabaseFallback<PrismaUser | null>(
      async (p) => {
        // First, test database connectivity before making a user query
        await p.$queryRaw`SELECT 1 as connection_test`;
        console.log("[ProfilePage SERVER] Database connection test successful");
        return p.user.findUnique({
          where: { id: currentAuthUserId },
        });
      },
      () => { // Removed error parameter
        dbConnectionError = true;
        dbConnectionErrorDetails = `Database connection test failed during initial fetch.`;
        console.error("[ProfilePage SERVER] Database connection test failed during initial fetch.");
        return Promise.resolve(null); // Return null user on fallback
      }
    );
    console.log("[ProfilePage SERVER] initialDbUser fetched from DB:", initialDbUser);

    // If user doesn't exist in our DB but is authenticated via Clerk, create a basic record
    if (!initialDbUser && !dbConnectionError) { // Only attempt creation if no prior connection error
      console.log("[ProfilePage SERVER] User not found in DB, attempting to create basic record");
      initialDbUser = await withDatabaseFallback<PrismaUser | null>(
        async (p) => {
          const newUser = await p.user.create({
            data: {
              id: currentAuthUserId,
              clerkId: currentAuthUserId,
              email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
              name: clerkUser?.firstName
                ? (clerkUser.lastName
                  ? `${clerkUser.firstName} ${clerkUser.lastName}`
                  : clerkUser.firstName)
                : null,
              credits: 3.00, // Default for new users (as Decimal)
            },
          });
          console.log("[ProfilePage SERVER] Created new user record:", newUser);
          return newUser as PrismaUser; // Explicitly cast to expected type
        },
        () => { // Removed error parameter
          dbConnectionError = true;
          dbConnectionErrorDetails = `Error creating user record.`;
          console.error("[ProfilePage SERVER] Error creating user record.");
          return Promise.resolve(null); // Return null user on fallback
        }
      );
    }
  } else {
    console.log("[ProfilePage SERVER] No currentAuthUserId, skipping DB fetch for initialDbUser.");
  }

  // If we have a database connection error, log detailed diagnostics
  if (dbConnectionError) {
    console.error("[ProfilePage SERVER] DATABASE CONNECTION ERROR DETECTED");
    console.error("[ProfilePage SERVER] Error details:", dbConnectionErrorDetails);
    console.error("[ProfilePage SERVER] DATABASE_URL format check:");
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      // Sanitize the URL to hide credentials
      const sanitizedUrl = dbUrl.replace(/\/\/[^@]*@/, "//****:****@");
      console.error("[ProfilePage SERVER] DATABASE_URL (sanitized):", sanitizedUrl);

      // Check for common issues
      if (dbUrl.includes("postgresql://https://")) {
        console.error("[ProfilePage SERVER] ERROR: DATABASE_URL contains nested protocols - postgresql://https://");
        console.error("[ProfilePage SERVER] Please fix this in your environment variables.");
      }

      if (dbUrl.includes("supabase.co") && !dbUrl.includes("db.") && !dbUrl.includes("pooler")) {
        console.error("[ProfilePage SERVER] ERROR: Supabase URL missing 'db.' prefix for direct connection");
      }

      // Parse URL to check components
      try {
        const url = new URL(dbUrl);
        console.error("[ProfilePage SERVER] URL components:", {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port || "(default)",
          pathname: url.pathname
        });

        if (url.hostname.includes("supabase.co")) {
          console.error("[ProfilePage SERVER] SUGGESTION: Please check Supabase IP allowlist settings");
          console.error("[ProfilePage SERVER] Make sure Vercel deployment IP ranges are allowed:");
          console.error("[ProfilePage SERVER] - 76.76.21.0/24");
          console.error("[ProfilePage SERVER] - 151.115.16.0/22");
          console.error("[ProfilePage SERVER] - 76.76.16.0/20");
        }
      } catch (_parseError) {
        console.error("[ProfilePage SERVER] ERROR: Cannot parse DATABASE_URL - malformed URL");
      }
    } catch (urlAnalysisError) {
      console.error("[ProfilePage SERVER] Error analyzing DATABASE_URL:", urlAnalysisError);
    }
  }

  // Get user name from Clerk or DB
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

  // If we have a database error, add a flag to pass to the client
  // to display an appropriate message
  const hasDatabaseConnectionError = dbConnectionError;

  const initialProfileData: ProfileFormData = {
    name: initialDbUser?.name || initialName, // Prefer DB name, fallback to Clerk name
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
    "stripePublishableKey exists:", !!stripePublishableKey,
    "hasDatabaseConnectionError:", hasDatabaseConnectionError
  );

  // If we have a database connection error, create a server-rendered warning component
  const DatabaseConnectionError = () => (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 mx-auto max-w-2xl">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm leading-5 text-amber-700">
            <strong>Database connection issue:</strong> We're experiencing technical difficulties connecting to our database.
            Your profile will be available in limited mode while we resolve this issue.
          </p>
          <p className="mt-2 text-xs text-amber-600">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      {/* Show database connection error warning if applicable */}
      {hasDatabaseConnectionError && <DatabaseConnectionError />}

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
