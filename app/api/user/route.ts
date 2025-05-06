import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { userDb } from "@/lib/db"

// Force Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    const userId = cookies().get("auth-user-id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
      const user = await userDb.findById(userId)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
    } catch (error) {
      console.error("User fetch error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
