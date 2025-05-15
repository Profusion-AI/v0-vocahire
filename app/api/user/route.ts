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
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      // No name, email, or image fields in User model
      resumeJobTitle: true,
      resumeFileUrl: true,
      credits: true,
      isPremium: true,
      // Add more fields as needed
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
        // No name, email, or image fields in User model
        resumeJobTitle: true,
        resumeFileUrl: true,
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
