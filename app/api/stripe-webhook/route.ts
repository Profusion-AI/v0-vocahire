import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe-server"
import { userDb } from "@/lib/db"

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
      // Get the current user
      const user = await userDb.findById(userId)

      if (user) {
        // Update the user's credits
        await userDb.updateCredits(userId, user.credits + 5) // Add 5 interview credits
      }
    }
  }

  return NextResponse.json({ received: true })
}
