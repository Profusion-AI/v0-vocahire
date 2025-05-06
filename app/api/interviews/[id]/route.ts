import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { interviewDb } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id

    const interview = await interviewDb.findById(interviewId)

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Check if the interview belongs to the user
    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(interview)
  } catch (error) {
    console.error("Error fetching interview:", error)
    return NextResponse.json({ error: "Failed to fetch interview" }, { status: 500 })
  }
}
