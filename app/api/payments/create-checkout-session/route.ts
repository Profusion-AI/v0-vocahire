/**
 * Requires Stripe SDK: run `pnpm add stripe`
 */
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { getPrismaClient } from "@/lib/prisma";
import { ITEM_PRICE_MAP, SUBSCRIPTION_ITEMS } from "@/lib/payment-config";
import { transactionLogger, TransactionOperations } from "@/lib/transaction-logger";
import { getSecrets } from '@/lib/secret-manager';

export async function POST(request: NextRequest) {
  try {
    // Fetch secrets within the async handler
    const paymentSecrets = await getSecrets([
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_APP_URL',
    ]);

    // Initialize Stripe after fetching secrets
    const stripe = new Stripe(paymentSecrets.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-04-30.basil",
    });

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
      const dbUser = await (await getPrismaClient()).user.findUnique({
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
    const appUrl = paymentSecrets.NEXT_PUBLIC_APP_URL;
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
    transactionLogger.info(userId, TransactionOperations.CHECKOUT_SESSION_CREATED, {
      metadata: { itemId, quantity: qty, mode, priceId }
    });
    
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

    transactionLogger.info(userId, TransactionOperations.CHECKOUT_SESSION_CREATED, {
      metadata: { sessionId: session.id, itemId, quantity: qty, mode }
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    const userId = getAuth(request).userId || 'anonymous';
    transactionLogger.error(userId, TransactionOperations.CHECKOUT_SESSION_FAILED, {
      error: err.message || 'Unknown error',
      metadata: { errorType: err?.type, errorCode: err?.code }
    });
    
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
