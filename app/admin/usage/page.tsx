// Server-side imports
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assuming path, adjust if necessary
import { prisma } from "@/lib/prisma"; // Assuming path, adjust if necessary
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

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

// Helper function to fetch top users by interview count
async function getTopUsersByInterviewsServerSide() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
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
    take: 10,
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
    const dailyInterviewsCount = await prisma.interview.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    // Count interviews created today that have a non-null 'feedback' field.
    // Adjust 'feedback: { not: null }' if your schema uses a different indicator
    // for generated feedback (e.g., a specific text field, or a boolean flag).
    const dailyFeedbackGenerationsCount = await prisma.interview.count({
      where: {
        createdAt: { // Assuming feedback is generated for interviews created today
          gte: todayStart,
          lt: tomorrowStart,
        },
        feedback: { // This is the crucial part - checking if feedback exists
          not: { equals: null }, // Works for both SQL NULL and JSON null in Prisma 6.x
        },
        // If you have a dedicated 'feedbackGeneratedAt' timestamp:
        // feedbackGeneratedAt: {
        //   gte: todayStart,
        //   lt: tomorrowStart,
        // },
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
