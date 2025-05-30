import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { UsageData, UsageType } from "@/app/admin/usage/UsageDashboardClient"; // Import from client component path
import { isAdminUser } from "@/lib/admin-config";
import { User } from "@/prisma/generated/client";

// Force dynamic rendering to prevent database connection during build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminUser(auth.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Lazy import prisma to prevent connection during build
    const { prisma } = await import("@/lib/prisma");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        // No email field in User model
        // Optionally include resumeJobTitle if you want to display it
        resumeJobTitle: true,
      },
    });

    const usageDataPromises = users.map(async (user: User) => {
      const dailyInterviews = await prisma.interviewSession.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      });

      const dailyFeedbackGenerations = await prisma.feedback.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      });

      return {
        userId: user.id,
        // No email field, optionally use resumeJobTitle as a display name
        name: user.resumeJobTitle ?? "Unknown",
        usage: {
          [UsageType.INTERVIEW_SESSION]: { daily: dailyInterviews, monthly: 0 }, // Monthly can be added later
          [UsageType.FEEDBACK_GENERATION]: { daily: dailyFeedbackGenerations, monthly: 0 },
        },
      };
    });

    const allUsageData: UsageData[] = await Promise.all(usageDataPromises);

    return NextResponse.json(allUsageData);
  } catch (error) {
    console.error("Error in /api/admin/usage:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}