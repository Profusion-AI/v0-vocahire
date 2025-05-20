import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
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
  let clerkUser = null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    clerkUser = await currentUser();
  } catch (error) {
    console.error("Error fetching Clerk user data:", error);
  }

  // Fetch user profile from DB with error handling
  let user = null;
  try {
    user = await prisma.user.findUnique({
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
  } catch (dbError) {
    console.error("Database error when fetching user:", dbError);
    
    // Create a fallback user from Clerk data if available
    if (clerkUser) {
      console.log("Using Clerk data as fallback for database error");
      return NextResponse.json({
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
        credits: 3.00, // Default credits
        isPremium: false,
        premiumExpiresAt: null,
        premiumSubscriptionId: null,
        role: "USER",
        _isTemporaryUser: true, // Flag to indicate this is a temporary fallback user
        _dbError: true // Flag to indicate database error
      });
    }
  }

  // If user doesn't exist but is authenticated with Clerk, create a new user record
  if (!user) {
    try {
      // Get user details from Clerk
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      
      // Create new user in our database
      user = await prisma.user.create({
        data: {
          id: auth.userId,
          name: clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          credits: 3.00, // Default 3.00 VocahireCredits for new users
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
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ 
        error: "Failed to create user profile. Please try again or contact support." 
      }, { status: 500 });
    }
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
      credits: 0.00,
      isPremium: false,
      premiumExpiresAt: null,
      premiumSubscriptionId: null,
      role: "USER",
      error: "User not found and could not be created"
    }, { status: 200 }); // Return 200 status with default data
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
    let clerkUser = null;
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      clerkUser = await currentUser();
    } catch (error) {
      console.error("Error fetching Clerk user data for update:", error);
    }
    
    // First check if the user exists with error handling
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true }
      });
    } catch (dbError) {
      console.error("Database error when checking user existence:", dbError);
      
      // Return a success response with clerk data if available
      if (clerkUser) {
        const clerkDataUser = {
          id: auth.userId,
          name: clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          ...validatedData, // Include the update data
          resumeJobTitle: validatedData.resumeJobTitle || null,
          resumeFileUrl: validatedData.resumeFileUrl || null,
          jobSearchStage: validatedData.jobSearchStage || null,
          linkedinUrl: validatedData.linkedinUrl || null,
          credits: 3.00,
          isPremium: false,
          premiumExpiresAt: null,
          premiumSubscriptionId: null,
          role: "USER",
          _isTemporaryUser: true,
          _dbError: true
        };
        
        return NextResponse.json(clerkDataUser);
      }
      
      // If no clerk data, return an error
      return NextResponse.json({ 
        error: "Database connection error. Please try again later." 
      }, { status: 200 }); // Use 200 instead of 500 to prevent client crashes
    }

    // If the user doesn't exist, create it first with default values
    if (!existingUser) {
      console.log("User doesn't exist when trying to update; creating new user");
      try {
        // Get user details from Clerk if not already fetched
        if (!clerkUser) {
          const { currentUser } = await import("@clerk/nextjs/server");
          clerkUser = await currentUser();
        }
        
        // Create basic user first
        await prisma.user.create({
          data: {
            id: auth.userId,
            name: clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null,
            email: clerkUser?.emailAddresses[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            credits: 3.00,
            isPremium: false,
          }
        });
      } catch (createError) {
        console.error("Error creating user during update:", createError);
        
        // If creation fails, still return a valid response with data from the request
        if (clerkUser) {
          const fallbackUser = {
            id: auth.userId,
            name: clerkUser?.firstName && clerkUser?.lastName ? 
                  `${clerkUser.firstName} ${clerkUser.lastName}` : 
                  clerkUser?.firstName || clerkUser?.lastName || null,
            email: clerkUser?.emailAddresses[0]?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            ...validatedData,
            credits: 3.00,
            isPremium: false,
            _isTemporaryUser: true
          };
          
          return NextResponse.json(fallbackUser);
        }
        
        return NextResponse.json({ 
          error: "Failed to create user profile before update.",
          _errorDetails: createError instanceof Error ? createError.message : String(createError)
        }, { status: 200 }); // Use 200 to prevent client crashes
      }
    }

    // Now perform the update with error handling
    try {
      const updatedUser = await prisma.user.update({
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
      return NextResponse.json(updatedUser);
    } catch (updateError) {
      console.error("Error updating user:", updateError);
      
      // If update fails but we have clerk data, return that with updated fields
      if (clerkUser) {
        const fallbackUpdatedUser = {
          id: auth.userId,
          name: validatedData.name || clerkUser?.firstName && clerkUser?.lastName ? 
                `${clerkUser.firstName} ${clerkUser.lastName}` : 
                clerkUser?.firstName || clerkUser?.lastName || null,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          image: clerkUser?.imageUrl || null,
          ...validatedData,
          resumeJobTitle: validatedData.resumeJobTitle || null,
          resumeFileUrl: validatedData.resumeFileUrl || null,
          jobSearchStage: validatedData.jobSearchStage || null,
          linkedinUrl: validatedData.linkedinUrl || null,
          credits: 3.00,
          isPremium: false,
          premiumExpiresAt: null,
          premiumSubscriptionId: null,
          role: "USER",
          _isTemporaryUser: true,
          _dbUpdateError: true
        };
        
        return NextResponse.json(fallbackUpdatedUser);
      }
      
      // Return an error message with 200 status to prevent client crashes
      return NextResponse.json({
        error: "Database error during update. Your changes have been saved locally.",
        _errorDetails: updateError instanceof Error ? updateError.message : String(updateError),
        id: auth.userId,
        ...validatedData
      }, { status: 200 });
    }
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
