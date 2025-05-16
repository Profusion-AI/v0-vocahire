// Refactored to ensure only Stripe webhook manages isPremium, premiumExpiresAt, premiumSubscriptionId.
// Clerk webhook only manages stripeCustomerId (on creation) and clears non-Stripe fields on deletion.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Webhook } from "svix";
import Stripe from "stripe"; // Import Stripe

// Get the Clerk webhook secret from environment variables
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Stripe initialization (needed for cancelling subscriptions)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
  });

  // 1. Get the headers and body
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const svixBody = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET!);

  let event: any;

  // Verify the payload with the headers
  try {
    event = wh.verify(svixBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id, type } = event.data;
  const eventType = type;

  console.log(`Clerk Webhook received: ${eventType}`);

  // Handle the event
  switch (eventType) {
    case "user.created": {
      const user = event.data;
      if (!user || !user.id) {
        return NextResponse.json({ error: "Missing user data" }, { status: 400 });
      }

      const clerkId = user.id;
      const email = user.email_addresses?.[0]?.email_address || null;
      let name = null;
      if (user.first_name && user.last_name) {
        name = `${user.first_name} ${user.last_name}`;
      } else if (user.first_name) {
        name = user.first_name;
      } else if (user.last_name) {
        name = user.last_name;
      }
      const image = user.image_url || null;

      try {
        // Create user in DB first
        const dbUser = await prisma.user.create({
          data: {
            id: clerkId,
            email: email,
            name: name,
            image: image,
            credits: 3, // Explicitly set default credits
          },
        });
        console.log(`[Clerk Webhook] User created in DB: ${clerkId} with 3 credits.`);

        // Then, create Stripe Customer
        try {
          const customer = await stripe.customers.create({
            email: email || undefined, // Stripe expects undefined, not null for optional fields
            name: name || undefined,
            metadata: {
              clerkId: clerkId,
            },
          });
          console.log(`[Clerk Webhook] Stripe Customer created: ${customer.id} for Clerk ID: ${clerkId}`);

          // Update user in DB with Stripe Customer ID
          await prisma.user.update({
            where: { id: clerkId },
            data: { stripeCustomerId: customer.id },
          });
          console.log(`[Clerk Webhook] stripeCustomerId set for user: ${clerkId}`);
        } catch (stripeErr: any) {
          console.error(`[Clerk Webhook] Error creating Stripe customer for ${clerkId}:`, stripeErr);
          // If Stripe customer creation fails, the user is already created in our DB.
          // Decide on error handling:
          // - Log and continue (user exists, but no Stripe ID yet)
          // - Attempt to delete the user from DB to maintain consistency (more complex)
          // For now, log and return success as user is in DB.
        }

        return NextResponse.json({ message: "User created and Stripe customer initiated" }, { status: 200 });

      } catch (err: any) {
        if (err.code === "P2002") { // Prisma unique constraint violation
          console.log(`[Clerk Webhook] User already exists: ${clerkId}. Attempting to ensure Stripe customer exists.`);
          // User already exists, check if they have a stripeCustomerId
          const existingUser = await prisma.user.findUnique({
            where: { id: clerkId },
            select: { stripeCustomerId: true }
          });

          if (existingUser && !existingUser.stripeCustomerId) {
            try {
              const customer = await stripe.customers.create({
                email: email || undefined,
                name: name || undefined,
                metadata: {
                  clerkId: clerkId,
                },
              });
              console.log(`[Clerk Webhook] Stripe Customer created for existing user: ${customer.id} for Clerk ID: ${clerkId}`);
              await prisma.user.update({
                where: { id: clerkId },
                data: { stripeCustomerId: customer.id },
              });
              console.log(`[Clerk Webhook] stripeCustomerId set for existing user: ${clerkId}`);
            } catch (stripeErr: any) {
              console.error(`[Clerk Webhook] Error creating Stripe customer for existing user ${clerkId}:`, stripeErr);
            }
          }
          return NextResponse.json({ message: "User already exists, Stripe customer checked/created." }, { status: 200 });
        }
        console.error("[Clerk Webhook] Error creating user:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    case "user.updated": {
      const updatedUser = event.data;
      if (!updatedUser || !updatedUser.id) {
        return NextResponse.json({ error: "Missing user data" }, { status: 400 });
      }

      const updatedClerkId = updatedUser.id;
      const updatedEmail = updatedUser.email_addresses?.[0]?.email_address || null;
      let updatedName = null;
      if (updatedUser.first_name && updatedUser.last_name) {
        updatedName = `${updatedUser.first_name} ${updatedUser.last_name}`;
      } else if (updatedUser.first_name) {
        updatedName = updatedUser.first_name;
      } else if (updatedUser.last_name) {
        updatedName = updatedUser.last_name;
      }
      const updatedImage = updatedUser.image_url || null;

      try {
        await prisma.user.update({
          where: { id: updatedClerkId },
          data: {
            email: updatedEmail,
            name: updatedName,
            image: updatedImage,
          },
        });
        console.log(`[Clerk Webhook] User updated: ${updatedClerkId}`);
        return NextResponse.json({ message: "User updated" }, { status: 200 });
      } catch (err) {
        console.error("[Clerk Webhook] Error updating user:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    case "user.deleted": {
      const deletedUser = event.data;
      if (!deletedUser || !deletedUser.id) {
        return NextResponse.json({ error: "Missing user data" }, { status: 400 });
      }

      const deletedClerkId = deletedUser.id;

      try {
        // Find the user in your DB to get their Stripe Subscription ID
        const dbUser = await prisma.user.findUnique({
          where: { id: deletedClerkId },
          select: { premiumSubscriptionId: true },
        });

        if (dbUser?.premiumSubscriptionId) {
          // Cancel the Stripe subscription
          try {
            await stripe.subscriptions.cancel(dbUser.premiumSubscriptionId);
            console.log(`[Clerk Webhook] Cancelled Stripe subscription ${dbUser.premiumSubscriptionId} for user ${deletedClerkId}`);
          } catch (stripeErr: any) {
            console.error(`[Clerk Webhook] Failed to cancel Stripe subscription ${dbUser.premiumSubscriptionId} for user ${deletedClerkId}:`, stripeErr);
            // Decide how to handle this error - maybe alert for manual cancellation?
            // For now, we'll log and continue with soft delete in DB
          }
        }

        // Soft-delete/anonymize the user in your DB
        await prisma.user.update({
          where: { id: deletedClerkId },
          data: {
            email: null,
            name: null,
            image: null,
            stripeCustomerId: null,
            // DO NOT touch isPremium, premiumExpiresAt, premiumSubscriptionId here!
            // Let the Stripe webhook handle those fields.
            // Optionally add a deletedAt timestamp field to schema.prisma
            // deletedAt: new Date(),
          },
        });
        console.log(`[Clerk Webhook] User soft-deleted/anonymized: ${deletedClerkId}`);
        return NextResponse.json({ message: "User deleted" }, { status: 200 });
      } catch (err) {
        console.error("[Clerk Webhook] Error handling user deletion:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    default:
      console.log(`[Clerk Webhook] Unhandled event type: ${eventType}`);
      return new NextResponse("Event ignored", { status: 200 });
  }
}