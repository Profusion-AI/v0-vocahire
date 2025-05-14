import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const auth = getAuth(request)

  if (!auth.userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Return Clerk userId (additional user info would require Clerk API)
  return NextResponse.json({
    id: auth.userId,
    // name/email/image can be added here if fetched from Clerk API
  })
}
