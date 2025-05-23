import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Development endpoint for adding credits
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get amount from request body (default to 10 credits)
    const body = await request.json().catch(() => ({}))
    const creditsToAdd = body.credits || 10

    // Update user credits
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        credits: { increment: creditsToAdd }
      },
      select: {
        id: true,
        credits: true
      }
    })

    return NextResponse.json({
      success: true,
      userId: updatedUser.id,
      newBalance: Number(updatedUser.credits),
      added: creditsToAdd
    })
  } catch (error) {
    console.error("Error adding credits:", error)
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    )
  }
}