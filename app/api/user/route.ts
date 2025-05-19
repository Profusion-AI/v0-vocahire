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

  // Fetch user profile from DB
  let user = await prisma.user.findUnique({
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

  // If user doesn't exist but is authenticated with Clerk, create a new user record
  if (!user) {
    try {
      // Get user details from Clerk
      const clerkUser = auth.user;
      
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
    return NextResponse.json({ error: "User not found and could not be created" }, { status: 404 });
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
        // Add more fields as needed
      },
    });
    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update user", details: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}
