// Server-side imports
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assuming path, adjust if necessary
import { prisma } from "@/lib/prisma"; // Assuming path, adjust if necessary
import { redirect } from "next/navigation";

// Component imports
import { UsageDashboardClient, UsageData, UsageType } from "./UsageDashboardClient"; // New client component, added UsageType

// Helper function to get admin user details and check authorization
async function getAdminUserServerSide(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }, // Removed 'role' from select
  });

  // Prefer environment variables for admin emails or a proper role system
  const adminEmailsEnv = process.env.ADMIN_EMAILS?.split(",") || [];
  const isAdminByEmail = user?.email ? adminEmailsEnv.includes(user.email) : false;
  // Removed isAdminByRole check

  return { user, isAdmin: isAdminByEmail }; // Return only isAdminByEmail
}

// Helper function to fetch top users by interview session count using groupBy
async function getTopUsersByInterviewsServerSide() {
  // Get top user IDs by interview session count
  const topSessions = await prisma.interviewSession.groupBy({
    by: ['userId'],
    _count: { _all: true },
    orderBy: { _count: { _all: 'desc' } },
    take: 10,
  });

  // Fetch user info for those IDs
  const userIds = topSessions.map((s: { userId: string }) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });

  // Merge counts into user objects
  return users.map((user) => {
    const session = topSessions.find((s: { userId: string }) => s.userId === user.id);
    return {
      ...user,
      interviewSessionCount: session?._count._all ?? 0,
    };
  });
}

// Exportable type for TopUser, derived from the prisma query result
export type TopUser = Awaited<ReturnType<typeof getTopUsersByInterviewsServerSide>>[0];

// Helper function to fetch initial usage statistics for the cards
// NOTE: You'll need to implement the actual data fetching logic here based on your database schema.
async function getInitialUsageStatsServerSide(): Promise<UsageData[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  try {
    const dailyInterviewsCount = await prisma.interviewSession.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    // Count feedbacks created today (each feedback is linked to an interview session)
    const dailyFeedbackGenerationsCount = await prisma.feedback.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    // This structure provides the raw daily counts.
    // The UsageDashboardClient will sum these up for the cards.
    // It will also calculate active users based on this data.
    return [
      {
        userId: "global_summary_stats", // A unique ID for these global stats
        email: null,
        usage: {
          [UsageType.INTERVIEW_SESSION]: {
            daily: dailyInterviewsCount,
            monthly: 0, // Monthly stats can be implemented later if needed
          },
          [UsageType.FEEDBACK_GENERATION]: {
            daily: dailyFeedbackGenerationsCount,
            monthly: 0, // Monthly stats can be implemented later if needed
          },
        },
      },
    ];
  } catch (error) {
    console.error("Error fetching initial usage stats:", error);
    // Return empty or default stats in case of an error to prevent page crash
    return [
      {
        userId: "global_summary_stats_error",
        email: null,
        usage: {
          [UsageType.INTERVIEW_SESSION]: { daily: 0, monthly: 0 },
          [UsageType.FEEDBACK_GENERATION]: { daily: 0, monthly: 0 },
        },
      },
    ];
  }
}

export default async function AdminUsagePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { isAdmin } = await getAdminUserServerSide(session.user.id);

  if (!isAdmin) {
    redirect("/"); // Redirect non-admins to the homepage or an unauthorized page
  }

  const topUsers = await getTopUsersByInterviewsServerSide();
  const initialStats = await getInitialUsageStatsServerSide();

  return (
    <UsageDashboardClient
      topUsersByInterviews={topUsers}
      initialUsageStats={initialStats}
    />
  );
}
