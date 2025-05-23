import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Stripe initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// Disable Next.js body parsing for this route (required for Stripe signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    // Get the raw body and Stripe signature header
    const rawBody = await buffer(req.body as any);
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return new NextResponse("Webhook signature or secret missing", { status: 400 });
    }

    // Verify the event
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle event types
    switch (event.type) {
      case "checkout.session.completed": {
        // IDEMPOTENCY CHECK:
        // Before processing, check if event.id has already been processed.
        // If yes, return NextResponse.json({ message: "Event already processed" }, { status: 200 });
        // Example: if (await hasEventBeenProcessed(event.id)) { return ... }
        // After successful processing, mark event.id as processed.
        // Example: await markEventAsProcessed(event.id);

        const session = event.data.object as Stripe.Checkout.Session;
        const clientReferenceId = session.client_reference_id;
        const metadata = session.metadata || {};
        const itemId = metadata.itemId;
        const quantity = Number(metadata.quantity) || 1;
        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (!clientReferenceId) {
          console.error("No client_reference_id in session");
          break;
        }

        // Find user by client_reference_id
        const user = await prisma.user.findUnique({
          where: { id: clientReferenceId },
        });

        if (!user) {
          console.error("User not found for client_reference_id:", clientReferenceId);
          break;
        }

        // Update stripeCustomerId if missing
        if (customerId && !user.stripeCustomerId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
          });
        }

        // Use the itemId values from the create-checkout-session metadata
        if (itemId?.startsWith("CREDIT_PACK_")) {
          // Increment credits
          await prisma.user.update({
            where: { id: user.id },
            data: {
              credits: { increment: quantity },
            },
          });
          console.log(
            `[Stripe] User ${user.id} purchased ${itemId}: +${quantity} VocahireCredits`
          );
        } else if (itemId?.startsWith("PREMIUM_")) {
          // Fetch subscription to get expiry
          if (!subscriptionId) {
            console.error(`No subscription ID in session for ${itemId}`);
            break;
          }
          let premiumExpiresAt: Date | null = null;
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
            if (subscription.current_period_end) {
              premiumExpiresAt = new Date(subscription.current_period_end * 1000);
            }
          } catch (err) {
            console.error("Failed to fetch Stripe subscription:", err);
          }
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: true,
              premiumSubscriptionId: subscriptionId,
              premiumExpiresAt,
            },
          });
          console.log(
            `[Stripe] User ${user.id} started premium subscription: ${subscriptionId}, expires at ${premiumExpiresAt}`
          );
        } else {
          console.log(
            `[Stripe] checkout.session.completed for user ${user.id} with unknown itemId: ${itemId}`
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // IDEMPOTENCY CHECK:
        // Before processing, check if event.id has already been processed.
        // If yes, return NextResponse.json({ message: "Event already processed" }, { status: 200 });
        // After successful processing, mark event.id as processed.

        const invoice = event.data.object as Stripe.Invoice;

        // Log the full invoice object to inspect its structure
        // console.log("Full Stripe Invoice Object for debugging:", JSON.stringify(invoice, null, 2)); // Keep this commented out unless debugging
 
         let subscriptionId: string | undefined;
 
         // Iterate through line items to find the subscription ID
         if (invoice.lines && invoice.lines.data) {
           for (const lineItem of invoice.lines.data) {
             if (lineItem.subscription) {
               // lineItem.subscription is the ID string
               subscriptionId = lineItem.subscription as string;
               break;
             }
           }
         }
        
        console.log(`[Stripe Webhook] invoice.payment_succeeded: Extracted subscriptionId: ${subscriptionId} from invoice ${invoice.id} via line items.`);

        if (!subscriptionId) {
          console.error(`[Stripe Webhook] CRITICAL: No subscription ID found in invoice.lines.data or directly on invoice object for invoice.payment_succeeded, invoice ID: ${invoice.id}. Cannot update premium status.`);
          // Return 200 to Stripe to acknowledge receipt and prevent retries for this specific event,
          // but log this as a critical issue for manual investigation.
          return new NextResponse("OK - but subscription ID missing in invoice", { status: 200 });
        }
        
        // Fetch subscription to get new expiry
        let premiumExpiresAt: Date | null = null;
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          if (subscription.current_period_end) {
            premiumExpiresAt = new Date(subscription.current_period_end * 1000);
          }
        } catch (err) {
          console.error("Failed to fetch Stripe subscription:", err);
        }
        // Find user by subscription ID
        const user = await prisma.user.findFirst({
          where: { premiumSubscriptionId: subscriptionId },
        });
        if (!user) {
          console.error("User not found for subscription ID:", subscriptionId);
          break;
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { premiumExpiresAt },
        });
        console.log(
          `[Stripe] Recurring payment succeeded for user ${user.id}, subscription ${subscriptionId}, new expiry: ${premiumExpiresAt}`
        );
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        // IDEMPOTENCY CHECK:
        // Before processing, check if event.id has already been processed.
        // If yes, return NextResponse.json({ message: "Event already processed" }, { status: 200 });
        // After successful processing, mark event.id as processed.

        let subscriptionId: string | undefined;
        let customerId: string | undefined;

        if (event.type === "customer.subscription.deleted") {
          const subscription = event.data.object as Stripe.Subscription;
          subscriptionId = subscription.id;
          customerId = subscription.customer as string | undefined;
        } else {
          const invoice = event.data.object as Stripe.Invoice;
          customerId = invoice.customer as string | undefined;

          // Find the subscription ID within the invoice line items for payment_failed
          for (const lineItem of invoice.lines.data) {
            if (lineItem.subscription) {
              subscriptionId = lineItem.subscription as string;
              break;
            }
          }
        }

        // Find user by subscription or customer ID
        const user =
          (subscriptionId &&
            (await prisma.user.findFirst({
              where: { premiumSubscriptionId: subscriptionId },
            }))) ||
          (customerId &&
            (await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
            })));

        if (!user) {
          console.error(
            "User not found for subscription/customer in event:",
            subscriptionId,
            customerId
          );
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: false,
            premiumSubscriptionId: null,
            premiumExpiresAt: null,
          },
        });
        console.log(
          `[Stripe] Premium revoked for user ${user.id} due to event: ${event.type}`
        );
        break;
      }

      default: {
        // Optionally log unhandled events
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
      }
    }

    // Always return 200 to acknowledge receipt
    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}