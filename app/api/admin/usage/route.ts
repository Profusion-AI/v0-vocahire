import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserUsageStats, UsageType } from "@/lib/usage-tracking"

// Mock user data for development - in production, this would come from your database
const MOCK_USERS = [
  { id: "user_1", email: "user1@example.com", name: "User One" },
  { id: "user_2", email: "user2@example.com", name: "User Two" },
  { id: "user_3", email: "user3@example.com", name: "User Three" },
]

export async function GET() {
  try {
    // Authenticate the admin user
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin (in production, check against a database)
    const isAdmin = session.user.email.endsWith("@vocahire.com") || process.env.NODE_ENV === "development"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // In production, fetch real users from your database
    // For now, use mock data
    const users = MOCK_USERS

    // Get usage stats for each user
    const usagePromises = users.map(async (user) => {
      const usage = await getUserUsageStats(user.id)
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        usage,
      }
    })

    const usageData = await Promise.all(usagePromises)

    // Calculate totals
    const totals = {
      [UsageType.INTERVIEW_SESSION]: {
        daily: usageData.reduce((sum, user) => sum + (user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0), 0),
        monthly: usageData.reduce((sum, user) => sum + (user.usage[UsageType.INTERVIEW_SESSION]?.monthly || 0), 0),
      },
      [UsageType.FEEDBACK_GENERATION]: {
        daily: usageData.reduce((sum, user) => sum + (user.usage[UsageType.FEEDBACK_GENERATION]?.daily || 0), 0),
        monthly: usageData.reduce((sum, user) => sum + (user.usage[UsageType.FEEDBACK_GENERATION]?.monthly || 0), 0),
      },
    }

    return NextResponse.json({
      users: usageData,
      totals,
    })
  } catch (error) {
    console.error("Error fetching usage data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch usage data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
