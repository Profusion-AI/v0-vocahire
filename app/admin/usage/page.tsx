// Server-side imports
import { prisma } from "@/lib/prisma"; // Assuming path, adjust if necessary
import { redirect } from "next/navigation";

// Component imports
import { UsageDashboardClient, UsageData, UsageType } from "./UsageDashboardClient";

/**
 * Retrieves a user by ID and determines if they have admin privileges based on environment configuration.
 *
 * @param userId - The unique identifier of the user to check.
 * @returns An object containing the user (if found) and a boolean indicating admin status.
 *
 * @remark Admin status is determined by checking if the user's ID is included in the `ADMIN_USER_IDS` environment variable.
 */
async function getAdminUserServerSide(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }, // No email field in schema
  });
  // Prefer environment variables for admin user IDs or a proper role system
  const adminIdsEnv = process.env.ADMIN_USER_IDS?.split(",") || [];
  const isAdminById = user ? adminIdsEnv.includes(user.id) : false;
  return { user, isAdmin: isAdminById };
}

/**
 * Retrieves the top 10 users ranked by the number of interview sessions they have conducted.
 *
 * Each user object includes the user ID, a display name derived from their resume job title (or "Unknown" if unavailable), and their total interview session count.
 *
 * @returns An array of user objects with their ID, display name, and interview session count, ordered by session count descending.
 */
async function getTopUsersByInterviewsServerSide() {
  // Get top user IDs by interview session count
  const topSessions = await prisma.interviewSession.groupBy({
    by: ['userId'],
    _count: { _all: true },
    orderBy: { _count: { userId: 'desc' } },
    take: 10,
  });

  // Fetch user info for those IDs
  const userIds = topSessions.map((s: { userId: string }) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    // No 'name' field in User model, use 'resumeJobTitle' as display name fallback
    select: { id: true, resumeJobTitle: true },
  });

  // Merge counts into user objects
  // Ensure every returned object has id, name, and interviewSessionCount
  return userIds.map((userId) => {
    const user = users.find((u) => u.id === userId);
    const session = topSessions.find((s: { userId: string }) => s.userId === userId);
    return {
      id: userId,
      // Use resumeJobTitle as the display name, or fallback to "Unknown"
      name: user?.resumeJobTitle ?? "Unknown",
      interviewSessionCount: session?._count._all ?? 0,
    };
  });
}

// Exportable type for TopUser
export type TopUser = {
  id: string;
  name: string | null;
  interviewSessionCount: number;
};

// Helper function to fetch initial usage statistics for the cards
/**
 * Retrieves global usage statistics for the current day, including counts of interview sessions and feedback generations.
 *
 * @returns An array containing a single {@link UsageData} object with daily counts for interview sessions and feedback generations. Monthly counts are set to zero.
 *
 * @remark If an error occurs during data retrieval, returns a stats object with zeroed counts and a distinct error ID.
 */
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
          lt: tomorrowStart
        }
      }
    });

    // Count feedbacks created today (each feedback is linked to an interview session)
    const dailyFeedbackGenerationsCount = await prisma.feedback.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart
        }
      }
    });

    return [
      {
        userId: "global_summary_stats", // A unique ID for these global stats
        usage: {
          [UsageType.INTERVIEW_SESSION]: {
            daily: dailyInterviewsCount,
            monthly: 0 // Monthly stats can be implemented later if needed
          },
          [UsageType.FEEDBACK_GENERATION]: {
            daily: dailyFeedbackGenerationsCount,
            monthly: 0 // Monthly stats can be implemented later if needed
          }
        }
      }
    ];
  } catch (error) {
    console.error("Error fetching initial usage stats:", error);
    return [
      {
        userId: "global_summary_stats_error",
        usage: {
          [UsageType.INTERVIEW_SESSION]: { daily: 0, monthly: 0 },
          [UsageType.FEEDBACK_GENERATION]: { daily: 0, monthly: 0 }
        }
      }
    ];
  }
}

/**
 * Renders the admin usage dashboard page, displaying top users and usage statistics.
 *
 * Redirects to the homepage if the current user is not an admin.
 */
export default async function AdminUsagePage() {
  // For demonstration, we'll use a placeholder userId.
  const userId = process.env.ADMIN_USER_ID || "";
  const { isAdmin } = await getAdminUserServerSide(userId);
  if (!isAdmin) {
    redirect("/");
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
