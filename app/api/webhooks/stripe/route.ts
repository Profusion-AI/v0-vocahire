import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSecrets } from '@/lib/secret-manager';

// Disable Next.js body parsing for this route (required for Stripe signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};

export const dynamic = 'force-dynamic';

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
    // Fetch secrets within the async handler
    const stripeSecrets = await getSecrets([
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ]);

    // Initialize Stripe after fetching secrets
    const stripe = new Stripe(stripeSecrets.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-04-30.basil",
    });

    // Get the raw body and Stripe signature header
    const rawBody = await buffer(req.body as any);
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = stripeSecrets.STRIPE_WEBHOOK_SECRET;

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

    // Import getPrismaClient once for all cases
    const { getPrismaClient } = await import("@/lib/prisma");

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
        const user = await (await getPrismaClient()).user.findUnique({
          where: { id: clientReferenceId },
        });

        if (!user) {
          console.error("User not found for client_reference_id:", clientReferenceId);
          break;
        }

        // Update stripeCustomerId if missing
        if (customerId && !user.stripeCustomerId) {
          await (await getPrismaClient()).user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
          });
        }

        // Use the itemId values from the create-checkout-session metadata
        if (itemId?.startsWith("CREDIT_PACK_")) {
          // Increment credits
          await (await getPrismaClient()).user.update({
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
            if ((subscription as any).current_period_end) {
              premiumExpiresAt = new Date((subscription as any).current_period_end * 1000);
            }
          } catch (err) {
            console.error("Failed to fetch Stripe subscription:", err);
          }
          await (await getPrismaClient()).user.update({
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
          if ((subscription as any).current_period_end) {
            premiumExpiresAt = new Date((subscription as any).current_period_end * 1000);
          }
        } catch (err) {
          console.error("Failed to fetch Stripe subscription:", err);
        }
        // Find user by subscription ID
        const user = await (await getPrismaClient()).user.findFirst({
          where: { premiumSubscriptionId: subscriptionId },
        });
        if (!user) {
          console.error("User not found for subscription ID:", subscriptionId);
          break;
        }
        await (await getPrismaClient()).user.update({
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
            (await (await getPrismaClient()).user.findFirst({
              where: { premiumSubscriptionId: subscriptionId },
            }))) ||
          (customerId &&
            (await (await getPrismaClient()).user.findFirst({
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

        await (await getPrismaClient()).user.update({
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

      case "checkout.session.expired": {
        // Handle expired checkout sessions
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          `[Stripe] Checkout session expired for client_reference_id: ${session.client_reference_id}`
        );
        // Could notify user or clean up any pending state
        break;
      }

      case "customer.subscription.created": {
        // Handle new subscription creation
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[Stripe] New subscription created: ${subscription.id} for customer: ${subscription.customer}`
        );
        // Initial setup is handled by checkout.session.completed
        // This is for logging/monitoring
        break;
      }

      case "customer.subscription.updated": {
        // Handle subscription updates (plan changes, quantity changes, etc.)
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const user = await (await getPrismaClient()).user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for customer ID:", customerId);
          break;
        }

        // Update subscription details
        let premiumExpiresAt: Date | null = null;
        if ((subscription as any).current_period_end) {
          premiumExpiresAt = new Date((subscription as any).current_period_end * 1000);
        }

        // Check if subscription is still active
        const isActive = ['active', 'trialing'].includes(subscription.status);

        await (await getPrismaClient()).user.update({
          where: { id: user.id },
          data: {
            isPremium: isActive,
            premiumSubscriptionId: isActive ? subscription.id : null,
            premiumExpiresAt: isActive ? premiumExpiresAt : null,
          },
        });

        console.log(
          `[Stripe] Subscription updated for user ${user.id}: ${subscription.id}, status: ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Handle trial ending notification (3 days before trial ends)
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const user = await (await getPrismaClient()).user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for customer ID:", customerId);
          break;
        }

        console.log(
          `[Stripe] Trial ending soon for user ${user.id}, subscription: ${subscription.id}`
        );
        
        // TODO: Send email notification to user about trial ending
        // You could trigger an email service here
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
