import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe-server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Retrieve the user from the metadata
    const userId = session.metadata?.userId

    if (userId) {
      // Update the user's credits or subscription status
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            increment: 5, // Add 5 interview credits
          },
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
