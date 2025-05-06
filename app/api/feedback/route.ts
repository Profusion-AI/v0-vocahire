import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateFeedback } from "@/lib/feedback-generator"
import { db } from "@/lib/db"
import { z } from "zod"

// Define schema for validation
const feedbackRequestSchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
  interviewId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = feedbackRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { transcript, interviewId } = result.data

    // Generate feedback
    const feedback = await generateFeedback(transcript)

    // Save to database if interviewId is provided
    if (interviewId) {
      await db.interview.update({
        where: {
          id: interviewId,
          userId: session.user.id,
        },
        data: {
          feedback: feedback as any,
        },
      })
    } else {
      // Create new interview record
      await db.interview.create({
        data: {
          userId: session.user.id,
          transcript,
          feedback: feedback as any,
        },
      })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
