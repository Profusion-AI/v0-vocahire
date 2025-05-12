import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getGlobalUsage } from "@/lib/usage-tracking"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    // This is a simple check - in production, you'd want a proper role system
    const adminEmails = ["admin@example.com"] // Replace with actual admin emails
    const isAdmin = user && adminEmails.includes(user.email || "")

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get global usage statistics
    const globalUsage = await getGlobalUsage()

    // Get user statistics
    const userStats = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            interviews: true,
          },
        },
      },
      orderBy: {
        interviews: {
          _count: "desc",
        },
      },
      take: 100,
    })

    // Get recent interviews
    const recentInterviews = await prisma.interview.findMany({
      select: {
        id: true,
        createdAt: true,
        duration: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })

    return NextResponse.json({
      globalUsage,
      userStats,
      recentInterviews,
    })
  } catch (error) {
    console.error("Error in admin usage route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
