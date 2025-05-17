/**
 * Requires Stripe SDK: run `pnpm add stripe`
 */
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

const ITEM_PRICE_MAP: Record<string, string> = {
  CREDIT_PACK_1: "price_1ROmztKk6VyljA3pVmGKszKi",
  CREDIT_PACK_3: "price_1ROnHpKk6VyljA3pMbcYg4rw",
  PREMIUM_MONTHLY_SUB: "price_1ROmvcKk6VyljA3pjJ5emu6R",
  PREMIUM_ANNUAL_SUB: "price_1ROmxEKk6VyljA3pQzqtZgWo",
};

const SUBSCRIPTION_ITEMS = new Set([
  "PREMIUM_MONTHLY_SUB",
  "PREMIUM_ANNUAL_SUB",
]);

/**
 * Handles POST requests to create a Stripe Checkout session for authenticated users.
 *
 * Authenticates the user, validates the requested item and quantity, determines whether the purchase is a subscription or one-time payment, and creates a Stripe Checkout session accordingly. Returns the session ID and URL on success.
 *
 * @returns A JSON response containing the Stripe Checkout session ID and URL, or an error message with the appropriate HTTP status code.
 *
 * @throws {Error} If the app URL is not configured, the item ID is invalid, the quantity is invalid, or the Stripe Price ID is missing.
 * @throws {StripeCardError} If a Stripe card error occurs during session creation.
 *
 * @remark Returns 401 if the user is not authenticated, 400 for invalid input, 500 for server errors, and 402 for Stripe card errors.
 */
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

    if (typeof itemId !== "string" || !ITEM_PRICE_MAP[itemId]) {
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

    // 3. Get Stripe Price ID
    const priceId = ITEM_PRICE_MAP[itemId];
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

    return NextResponse.json({ sessionId: session.id, url: session.url });
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