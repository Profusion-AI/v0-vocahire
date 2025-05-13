// Server-side imports
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assuming path, adjust if necessary
import { prisma } from "@/lib/prisma"; // Assuming path, adjust if necessary
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

// Component imports
import { UsageDashboardClient, UsageData } from "./UsageDashboardClient"; // New client component

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
export type TopUser = Prisma.PromiseReturnType<typeof getTopUsersByInterviewsServerSide>[0];

// Helper function to fetch initial usage statistics for the cards
// NOTE: You'll need to implement the actual data fetching logic here based on your database schema.
async function getInitialUsageStatsServerSide(): Promise<UsageData[]> {
  // Placeholder: Implement actual logic to fetch and format usage stats.
  // This function should query your database for daily interview sessions,
  // feedback generations, active users, etc., and format it into UsageData[].
  // Example:
  // const dailyInterviews = await prisma.interview.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } });
  // const dailyFeedback = await prisma.feedback.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } });
  // ... and so on for other stats, then structure it.
  // For demonstration, returning an empty array.
  // Replace this with your actual data aggregation.
  return [
    // {
    //   userId: "summary", // Special ID for aggregated data or map from actual user data
    //   email: "summary@example.com",
    //   usage: {
    //     [UsageType.INTERVIEW_SESSION]: { daily: dailyInterviews || 0, monthly: 0 },
    //     [UsageType.FEEDBACK_GENERATION]: { daily: dailyFeedback || 0, monthly: 0 },
    //   },
    // },
  ];
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
