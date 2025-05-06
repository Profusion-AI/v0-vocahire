import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { interviewDb } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const interviews = await interviewDb.findByUserId(session.user.id)

    return NextResponse.json(interviews)
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 })
  }
}
