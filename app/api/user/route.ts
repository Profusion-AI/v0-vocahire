import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { withDatabaseFallback, isUsingFallbackDb } from "@/lib/prisma"
import { Prisma, UserRole } from "../../../prisma/generated/client"
import { z } from "zod"
import { getConsistentCreditValue, createPrismaDecimal } from "@/lib/prisma-types"
import { invalidateUserCache, prefetchUserCredentials } from "@/lib/user-cache"

export const dynamic = 'force-dynamic';

// Helper function to create consistent fallback user objects
interface ClerkUser {
  firstName?: string;
  lastName?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  imageUrl?: string;
}

function createFallbackUser(userId: string, clerkUser: ClerkUser | null, extraProps: Record<string, unknown> = {}) {
  return {
    id: userId,
    name: clerkUser?.firstName && clerkUser?.lastName ? 
          `${clerkUser.firstName} ${clerkUser.lastName}` : 
          clerkUser?.firstName || clerkUser?.lastName || null,
    email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
    image: clerkUser?.imageUrl || null,
    resumeJobTitle: null,
    resumeFileUrl: null,
    jobSearchStage: null,
    linkedinUrl: null,
    credits: createPrismaDecimal(3), // Use Prisma Decimal to match database response type
    isPremium: false,
    premiumExpiresAt: null,
    premiumSubscriptionId: null,
    role: UserRole.USER,
    _isTemporaryUser: true,
    _usingFallbackDb: isUsingFallbackDb,
    ...extraProps
  };
}

// Define which fields are editable via PATCH
const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  resumeJobTitle: z.string().max(100).optional(),
  resumeFileUrl: z.string().url("Invalid resume file URL").optional().or(z.literal("")),
  jobSearchStage: z.string().max(100).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  // Add more fields as needed, matching the Prisma User model
}).partial();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `user_req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Enhanced performance tracking
  const perfLog = (phase: string, additionalData?: unknown) => {
    const elapsed = Date.now() - startTime;
    console.log(`[${requestId}] ${phase} - ${elapsed}ms elapsed${additionalData ? ` | ${JSON.stringify(additionalData)}` : ''}`);
  };
  
  perfLog("REQUEST_START", { timestamp: new Date().toISOString() });
  
  const auth = getAuth(request);
  perfLog("AUTH_CHECK_COMPLETE", { userId: !!auth.userId });

  if (!auth.userId) {
    perfLog("UNAUTHORIZED_ACCESS");
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get Clerk user data as fallback
  perfLog("CLERK_USER_FETCH_START");
  let clerkUser: ClerkUser | null = null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (user) {
      clerkUser = {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        emailAddresses: user.emailAddresses?.map(e => ({ emailAddress: e.emailAddress })) || [],
        imageUrl: user.imageUrl || undefined
      };
    }
    perfLog("CLERK_USER_FETCH_COMPLETE", { hasClerkUser: !!clerkUser });
  } catch (error) {
    perfLog("CLERK_USER_FETCH_ERROR", { error: error instanceof Error ? error.message : String(error) });
    console.error("Error fetching Clerk user data:", error);
  }

  // Fetch user profile from DB with timeout to prevent 504 errors
  perfLog("DATABASE_QUERY_START");
  const user = await Promise.race([
    withDatabaseFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        return await prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          resumeJobTitle: true,
          resumeFileUrl: true,
          jobSearchStage: true,
          linkedinUrl: true,
          credits: true,
          isPremium: true,
          premiumExpiresAt: true,
          premiumSubscriptionId: true,
          role: true,
          // Add more fields as needed
        },
      });
      },
      async () => {
        console.error("Database error when fetching user, using fallback");
        
        // Create a fallback user from Clerk data if available
        if (clerkUser) {
          console.log("Using Clerk data as fallback for database error");
          // Use helper function to create a consistent fallback user
          return createFallbackUser(auth.userId, clerkUser, { _dbError: true });
        }
        return null;
      }
    ),
    // 12s timeout to stay under Vercel's 15s function limit
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 12000)
    )
  ]).catch(error => {
    perfLog("DATABASE_QUERY_ERROR", { error: error.message });
    console.error('Database query failed or timed out in /api/user:', error);
    
    // Return fallback user from Clerk data if available
    if (clerkUser) {
      console.log("Using Clerk data as fallback after timeout");
      return createFallbackUser(auth.userId, clerkUser, { 
        _dbTimeout: true,
        error: error.message 
      });
    }
    
    // If no Clerk data, return minimal fallback
    return createFallbackUser(auth.userId, null, { 
      _dbTimeout: true,
      error: error.message 
    });
  });
  
  perfLog("DATABASE_QUERY_COMPLETE", { userFound: !!user, hasClerkFallback: !!clerkUser });

  // If user doesn't exist but is authenticated with Clerk, create a new user record
  if (!user) {
    perfLog("USER_CREATION_START");
    // Get user details from Clerk if not already fetched
    if (!clerkUser) {
      try {
        const { currentUser } = await import("@clerk/nextjs/server");
        const user = await currentUser();
        if (user) {
          clerkUser = {
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            emailAddresses: user.emailAddresses?.map(e => ({ emailAddress: e.emailAddress })) || [],
            imageUrl: user.imageUrl || undefined
          };
        }
      } catch (error) {
        console.error("Error fetching Clerk user data for new user:", error);
      }
    }
    
    // Create new user using withDatabaseFallback
    const newUser = await withDatabaseFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        return await prisma.user.create({
        data: {
          id: auth.userId,
          clerkId: auth.userId,
          name: clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          credits: createPrismaDecimal(3), // Default 3.00 VocahireCredits for new users - use Prisma.Decimal for database operations
          isPremium: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          resumeJobTitle: true,
          resumeFileUrl: true,
          jobSearchStage: true,
          linkedinUrl: true,
          credits: true,
          isPremium: true,
          premiumExpiresAt: true,
          premiumSubscriptionId: true,
          role: true,
        },
      });
      },
      async () => {
        console.error("Database error when creating user, using fallback");
        
        // Return a fallback user with clerk data if available
        if (clerkUser) {
          return createFallbackUser(auth.userId, clerkUser, { _dbCreateError: true });
        }
        return null;
      }
    );
    
    perfLog("USER_CREATION_COMPLETE", { created: !!newUser });
    
    if (!newUser) {
    // Instead of returning a 404, return a default user structure
    // This prevents the client from failing completely
    console.error("User not found and could not be created, returning default user structure");
    
    // Use null for clerkUser but include an error message
    const defaultUser = createFallbackUser(auth.userId, null, {
      credits: createPrismaDecimal(0), // Override credits to 0 for this error case
      error: "User not found and could not be created"
    });
    
    // Create a new object with converted credits for JSON response
    const responseUser = {
      ...defaultUser,
      credits: defaultUser.credits ? getConsistentCreditValue(defaultUser.credits) : 0
    };
    
    return NextResponse.json(responseUser, { status: 200 }); // Return 200 status with default data
  }
    
    return NextResponse.json(newUser);
  }
  
  // If we're using fallback database, add a flag to the response
  let responseUser = user;
  if (isUsingFallbackDb && user && typeof user === 'object') {
    responseUser = {
      ...user,
      _usingFallbackDb: true
    };
  }

  // Convert credits to consistent format for JSON response
  if (responseUser && typeof responseUser === 'object' && 'credits' in responseUser) {
    responseUser = {
      ...responseUser,
      credits: getConsistentCreditValue((responseUser as any).credits)
    };
  }

  perfLog("REQUEST_COMPLETE", { totalTime: Date.now() - startTime });
  return NextResponse.json(responseUser);
}

export async function PATCH(request: NextRequest) {
  const auth = getAuth(request);

  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = profileUpdateSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 400 }
    );
  }

  const validatedData = result.data;

  try {
    // Get Clerk user data as fallback
    let clerkUser: ClerkUser | null = null;
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      if (user) {
        clerkUser = {
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          emailAddresses: user.emailAddresses?.map(e => ({ emailAddress: e.emailAddress })) || [],
          imageUrl: user.imageUrl || undefined
        };
      }
    } catch (error) {
      console.error("Error fetching Clerk user data for update:", error);
    }
    
    // First check if the user exists with error handling using withDatabaseFallback
    const existingUser = await withDatabaseFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        return await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true }
      });
      },
      async () => {
        console.error("Database error when checking user existence, using fallback");
        
        // Return null to indicate the user doesn't exist and should be created
        return null;
      }
    );

    // If the user doesn't exist, create it first with default values
    if (!existingUser) {
      console.log("User doesn't exist when trying to update; creating new user");
      
      // Get user details from Clerk if not already fetched
      if (!clerkUser) {
        try {
          const { currentUser } = await import("@clerk/nextjs/server");
          const user = await currentUser();
          if (user) {
            clerkUser = {
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              emailAddresses: user.emailAddresses?.map(e => ({ emailAddress: e.emailAddress })) || [],
              imageUrl: user.imageUrl || undefined
            };
          }
        } catch (error) {
          console.error("Error fetching Clerk user data for new user during update:", error);
        }
      }
      
      // Create basic user first using withDatabaseFallback
      const createdUser = await withDatabaseFallback(
        async () => {
          const { prisma } = await import("@/lib/prisma");
          return await prisma.user.create({
          data: {
            id: auth.userId,
            clerkId: auth.userId,
            name: clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null,
            email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            credits: new Prisma.Decimal(3.00),
            isPremium: false,
          }
        });
        },
        async () => {
          console.error("Error creating user during update, using fallback");
          
          // Return a fallback object with all required User fields
          const fallbackCreationUser = {
            id: auth.userId,
            clerkId: auth.userId,
            name: clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null,
            email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            role: UserRole.USER,
            credits: new Prisma.Decimal(3.00),
            resumeJobTitle: null,
            resumeSkills: null,
            resumeExperience: null,
            resumeEducation: null,
            resumeAchievements: null,
            resumeFileUrl: null,
            jobSearchStage: null,
            linkedinUrl: null,
            stripeCustomerId: null,
            premiumSubscriptionId: null,
            premiumExpiresAt: null,
            isPremium: false,
            acceptedTermsAt: null,
            acceptedPrivacyAt: null,
            dataRetentionOverride: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            _isFallbackCreation: true
          };
          
          return fallbackCreationUser;
        }
      );
      
      // If user creation failed and we're using a fallback, return early with appropriate data
      const fallbackCreation = createdUser as { _isFallbackCreation?: boolean };
      if (fallbackCreation?._isFallbackCreation && clerkUser) {
        // Create fallback user with the validated data and extra flags
        const fallbackUser = createFallbackUser(auth.userId, clerkUser, {
          ...validatedData,
        });
        
        // Convert credits to consistent format for JSON response
        const responseData = {
          ...fallbackUser,
          credits: getConsistentCreditValue(fallbackUser.credits)
        };
        return NextResponse.json(responseData);
      } else if (fallbackCreation?._isFallbackCreation) {
        return NextResponse.json({ 
          error: "Failed to create user profile before update.",
          id: auth.userId,
          _usingFallbackDb: isUsingFallbackDb
        }, { status: 200 }); // Use 200 to prevent client crashes
      }
    }

    // Now perform the update with error handling using withDatabaseFallback
    const updatedUser = await withDatabaseFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        return await prisma.user.update({
        where: { id: auth.userId },
        data: validatedData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          resumeJobTitle: true,
          resumeFileUrl: true,
          jobSearchStage: true,
          linkedinUrl: true,
          credits: true,
          isPremium: true,
          premiumExpiresAt: true,
          premiumSubscriptionId: true,
          role: true,
          // Add more fields as needed
        },
      });
      },
      async () => {
        console.error("Error updating user, using fallback");
        
        // If fallback and we have clerk data, return that with updated fields
        if (clerkUser) {
          const fallbackUser = {
            id: auth.userId,
            name: validatedData.name || (clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null),
            email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            ...validatedData,
            resumeJobTitle: validatedData.resumeJobTitle || null,
            resumeFileUrl: validatedData.resumeFileUrl || null,
            jobSearchStage: validatedData.jobSearchStage || null,
            linkedinUrl: validatedData.linkedinUrl || null,
            credits: new Prisma.Decimal(3.00),
            isPremium: false,
            premiumExpiresAt: null,
            premiumSubscriptionId: null,
            role: UserRole.USER,
            _isTemporaryUser: true,
            _dbUpdateError: true,
            _usingFallbackDb: isUsingFallbackDb
          };
          return fallbackUser;
        }
        
        // Return a complete user object with error flag
        const errorObject = {
          id: auth.userId,
          name: validatedData.name || null,
          email: null,
          image: null,
          resumeJobTitle: validatedData.resumeJobTitle || null,
          resumeFileUrl: validatedData.resumeFileUrl || null,
          jobSearchStage: validatedData.jobSearchStage || null,
          linkedinUrl: validatedData.linkedinUrl || null,
          credits: new Prisma.Decimal(0),
          isPremium: false,
          premiumExpiresAt: null,
          premiumSubscriptionId: null,
          role: UserRole.USER,
          error: "Database error during update. Your changes have been saved locally.",
          _usingFallbackDb: isUsingFallbackDb
        };
        return errorObject;
      }
    );
    
    // If we're using fallback database, add a flag to the response
    if (isUsingFallbackDb && updatedUser && typeof updatedUser === 'object' && !('_usingFallbackDb' in updatedUser)) {
      const userWithFlag = updatedUser as Record<string, unknown>;
      userWithFlag._usingFallbackDb = true;
    }
    
    // Convert credits to consistent format for JSON response
    if (updatedUser && typeof updatedUser === 'object' && 'credits' in updatedUser) {
      const userWithCredits = updatedUser as any;
      const responseUser = {
        ...updatedUser,
        credits: getConsistentCreditValue(userWithCredits.credits)
      };
      
      // Invalidate and refresh cache after successful update
      try {
        await invalidateUserCache(auth.userId);
        console.log(`[UserUpdate] Cache invalidated for user ${auth.userId}`);
        
        // Pre-fetch updated credentials to warm cache
        await prefetchUserCredentials(auth.userId);
        console.log(`[UserUpdate] Credentials pre-fetched for user ${auth.userId}`);
      } catch (cacheError) {
        console.error('[UserUpdate] Cache operation failed:', cacheError);
        // Don't fail the request if cache operations fail
      }
      
      return NextResponse.json(responseUser);
    }
    
    // Handle case where updatedUser doesn't have credits field
    if (updatedUser && typeof updatedUser === 'object') {
      // Still invalidate and refresh cache for successful updates without credits
      try {
        await invalidateUserCache(auth.userId);
        console.log(`[UserUpdate] Cache invalidated for user ${auth.userId}`);
        
        // Pre-fetch updated credentials to warm cache
        await prefetchUserCredentials(auth.userId);
        console.log(`[UserUpdate] Credentials pre-fetched for user ${auth.userId}`);
      } catch (cacheError) {
        console.error('[UserUpdate] Cache operation failed:', cacheError);
        // Don't fail the request if cache operations fail
      }
    }
    
    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Error in overall update process:", err);
    
    // Always return 200 status with error details to prevent client crashes
    return NextResponse.json({
      error: "Failed to update user profile.",
      _errorDetails: err instanceof Error ? err.message : String(err),
      id: auth.userId
    }, { status: 200 });
  }
}
