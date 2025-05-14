/**
 * Requires Stripe SDK: run `pnpm add stripe`
 */
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const ITEM_PRICE_ENV_MAP: Record<string, string> = {
  CREDIT_PACK_1: "STRIPE_PRICE_CREDIT_PACK_1",
  CREDIT_PACK_5: "STRIPE_PRICE_CREDIT_PACK_5",
  CREDIT_PACK_10: "STRIPE_PRICE_CREDIT_PACK_10",
  PREMIUM_MONTHLY_SUB: "STRIPE_PRICE_PREMIUM_MONTHLY",
  PREMIUM_ANNUAL_SUB: "STRIPE_PRICE_PREMIUM_ANNUAL",
  // Add more mappings as needed
};

const SUBSCRIPTION_ITEMS = new Set([
  "PREMIUM_MONTHLY_SUB",
  "PREMIUM_ANNUAL_SUB",
]);

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = auth.userId;

    // 2. Parse and validate input
    const body = await request.json();
    const { itemId, quantity } = body;

    if (typeof itemId !== "string" || !ITEM_PRICE_ENV_MAP[itemId]) {
      return NextResponse.json(
        { error: "Invalid or missing itemId" },
        { status: 400 }
      );
    }

    let qty = 1;
    if (typeof quantity !== "undefined") {
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { error: "Invalid quantity" },
          { status: 400 }
        );
      }
      qty = quantity;
    }

    // 3. Get Stripe Price ID from env
    const priceEnvVar = ITEM_PRICE_ENV_MAP[itemId];
    const priceId = process.env[priceEnvVar];
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe Price ID not configured for this item" },
        { status: 500 }
      );
    }

    // 4. Determine mode
    const isSubscription = SUBSCRIPTION_ITEMS.has(itemId);
    const mode = isSubscription ? "subscription" : "payment";

    // 5. Get user's Stripe customer ID if available
    let stripeCustomerId: string | undefined = undefined;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });
      if (dbUser?.stripeCustomerId) {
        stripeCustomerId = dbUser.stripeCustomerId;
      }
    } catch (e) {
      // Log but don't block purchase if DB fails
      console.error("Failed to fetch user from DB", e);
    }

    // 6. Build URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "App URL not configured" },
        { status: 500 }
      );
    }
    const success_url = `${appUrl}/payment-success?session_id=\${CHECKOUT_SESSION_ID}`;
    const cancel_url =
      isSubscription
        ? `${appUrl}/interview`
        : `${appUrl}/pricing`;

    // 7. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: qty,
        },
      ],
      mode,
      success_url,
      cancel_url,
      client_reference_id: userId,
      metadata: {
        userId,
        itemId,
        quantity: String(qty),
      },
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe Checkout error:", err);
    if (err?.type === "StripeCardError") {
      return NextResponse.json(
        { error: err.message },
        { status: 402 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}