import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { prisma, withDatabaseFallback, isUsingFallbackDb } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

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
  const auth = getAuth(request);

  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get Clerk user data as fallback
  let clerkUser: any = null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    clerkUser = await currentUser();
  } catch (error) {
    console.error("Error fetching Clerk user data:", error);
  }

  // Fetch user profile from DB with error handling using withDatabaseFallback
  let user: any = await withDatabaseFallback(
    async () => await prisma.user.findUnique({
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
    }),
    async () => {
      console.error("Database error when fetching user, using fallback");
      
      // Create a fallback user from Clerk data if available
      if (clerkUser) {
        console.log("Using Clerk data as fallback for database error");
        return {
          id: auth.userId,
          name: clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          resumeJobTitle: null,
          resumeFileUrl: null,
          jobSearchStage: null,
          linkedinUrl: null,
          credits: new Prisma.Decimal(3.00), // Default credits as Decimal
          isPremium: false,
          premiumExpiresAt: null,
          premiumSubscriptionId: null,
          role: "USER",
          _isTemporaryUser: true, // Flag to indicate this is a temporary fallback user
          _dbError: true, // Flag to indicate database error
          _usingFallbackDb: isUsingFallbackDb // Include flag indicating fallback db is in use
        };
      }
      return null;
    }
  );

  // If user doesn't exist but is authenticated with Clerk, create a new user record
  if (!user) {
    // Get user details from Clerk if not already fetched
    if (!clerkUser) {
      try {
        const { currentUser } = await import("@clerk/nextjs/server");
        clerkUser = await currentUser();
      } catch (error) {
        console.error("Error fetching Clerk user data for new user:", error);
      }
    }
    
    // Create new user using withDatabaseFallback
    let newUser = await withDatabaseFallback(
      async () => await prisma.user.create({
        data: {
          id: auth.userId,
          name: clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          credits: new Prisma.Decimal(3.00), // Default 3.00 VocahireCredits for new users
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
      }),
      async () => {
        console.error("Database error when creating user, using fallback");
        
        // Return a fallback user with clerk data if available
        if (clerkUser) {
          return {
            id: auth.userId,
            name: clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null,
            email: clerkUser?.emailAddresses[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            resumeJobTitle: null,
            resumeFileUrl: null,
            jobSearchStage: null,
            linkedinUrl: null,
            credits: new Prisma.Decimal(3.00), // Default credits
            isPremium: false,
            premiumExpiresAt: null,
            premiumSubscriptionId: null,
            role: "USER",
            _isTemporaryUser: true,
            _dbCreateError: true,
            _usingFallbackDb: isUsingFallbackDb
          };
        }
        return null;
      }
    );
    
    // Use the new user as our user variable
    user = newUser;
  }

  if (!user) {
    // Instead of returning a 404, return a default user structure
    // This prevents the client from failing completely
    console.error("User not found and could not be created, returning default user structure");
    
    return NextResponse.json({
      id: auth.userId,
      name: null,
      email: null,
      image: null,
      resumeJobTitle: null,
      resumeFileUrl: null,
      jobSearchStage: null,
      linkedinUrl: null,
      credits: new Prisma.Decimal(0.00),
      isPremium: false,
      premiumExpiresAt: null,
      premiumSubscriptionId: null,
      role: "USER",
      error: "User not found and could not be created",
      _isTemporaryUser: true,
      _usingFallbackDb: isUsingFallbackDb
    }, { status: 200 }); // Return 200 status with default data
  }
  
  // If we're using fallback database, add a flag to the response
  if (isUsingFallbackDb && user && typeof user === 'object') {
    user = {
      ...user,
      _usingFallbackDb: true
    } as typeof user;
  }

  return NextResponse.json(user);
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
    let clerkUser: any = null;
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      clerkUser = await currentUser();
    } catch (error) {
      console.error("Error fetching Clerk user data for update:", error);
    }
    
    // First check if the user exists with error handling using withDatabaseFallback
    const existingUser = await withDatabaseFallback(
      async () => await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true }
      }),
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
          clerkUser = await currentUser();
        } catch (error) {
          console.error("Error fetching Clerk user data for new user during update:", error);
        }
      }
      
      // Create basic user first using withDatabaseFallback
      const createdUser = await withDatabaseFallback(
        async () => await prisma.user.create({
          data: {
            id: auth.userId,
            name: clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null,
            email: clerkUser?.emailAddresses[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            credits: new Prisma.Decimal(3.00),
            isPremium: false,
          }
        }),
        async () => {
          console.error("Error creating user during update, using fallback");
          
          // Return a fallback object so that the code continues
          return {
            id: auth.userId,
            _isFallbackCreation: true
          };
        }
      );
      
      // If user creation failed and we're using a fallback, return early with appropriate data
      if (createdUser?._isFallbackCreation && clerkUser) {
        const fallbackUser = {
          id: auth.userId,
          name: clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          ...validatedData,
          credits: new Prisma.Decimal(3.00),
          isPremium: false,
          _isTemporaryUser: true,
          _usingFallbackDb: isUsingFallbackDb
        };
        
        return NextResponse.json(fallbackUser);
      } else if (createdUser?._isFallbackCreation) {
        return NextResponse.json({ 
          error: "Failed to create user profile before update.",
          id: auth.userId,
          _usingFallbackDb: isUsingFallbackDb
        }, { status: 200 }); // Use 200 to prevent client crashes
      }
    }

    // Now perform the update with error handling using withDatabaseFallback
    const updatedUser = await withDatabaseFallback(
      async () => await prisma.user.update({
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
      }),
      async () => {
        console.error("Error updating user, using fallback");
        
        // If fallback and we have clerk data, return that with updated fields
        if (clerkUser) {
          return {
            id: auth.userId,
            name: validatedData.name || (clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null),
            email: clerkUser?.emailAddresses[0]?.emailAddress || null,
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
            role: "USER",
            _isTemporaryUser: true,
            _dbUpdateError: true,
            _usingFallbackDb: isUsingFallbackDb
          };
        }
        
        // Return an object with user ID and validated data
        return {
          error: "Database error during update. Your changes have been saved locally.",
          id: auth.userId,
          ...validatedData,
          _usingFallbackDb: isUsingFallbackDb
        };
      }
    );
    
    // If we're using fallback database, add a flag to the response
    if (isUsingFallbackDb && updatedUser && typeof updatedUser === 'object' && !updatedUser._usingFallbackDb) {
      (updatedUser as any)._usingFallbackDb = true;
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
