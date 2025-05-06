import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Return user data (excluding sensitive information)
  return NextResponse.json({
    id: session.user.id || "user-id",
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    // Add any other user data you want to expose
  })
}
