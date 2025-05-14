import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Placeholder for Clerk's webhook secret (should be set in env)
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

// Utility: Verify Clerk webhook signature (implement as needed)
async function verifyClerkSignature(req: NextRequest): Promise<boolean> {
  // Clerk sends a signature in the 'svix-signature' header.
  // You should use the svix library or Clerk's recommended method to verify.
  // For now, this is a placeholder that always returns true.
  // See: https://clerk.com/docs/reference/webhooks#verifying-webhooks
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify signature
    const isValid = await verifyClerkSignature(req);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Parse body
    const body = await req.json();

    // 3. Check event type
    if (body.type !== "user.created") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    // 4. Extract Clerk user data
    const user = body.data;
    if (!user || !user.id) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    // Map Clerk fields to Prisma User model
    // Adjust these fields as needed to match your schema
    const clerkId = user.id;
    const email = user.email_addresses?.[0]?.email_address || null;
    // Combine first and last name if available
    let name = null;
    if (user.first_name && user.last_name) {
      name = `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      name = user.first_name;
    } else if (user.last_name) {
      name = user.last_name;
    }

    // Optionally, you can also set image if available
    const image = user.image_url || null;

    // 5. Create user in DB (handle duplicate gracefully)
    try {
      await prisma.user.create({
        data: {
          id: clerkId,
          email,
          name,
          image,
        },
      });
      return NextResponse.json({ message: "User created" }, { status: 200 });
    } catch (err: any) {
      // If user already exists, ignore
      if (err.code === "P2002") {
        return NextResponse.json({ message: "User already exists" }, { status: 200 });
      }
      // Other errors
      console.error("Error creating user:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}