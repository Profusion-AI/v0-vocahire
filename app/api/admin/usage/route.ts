import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UsageData, UsageType } from "@/app/admin/usage/UsageDashboardClient"; // Import from client component path
import { Prisma } from "@prisma/client";

async function getAdminUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const adminEmailsEnv = process.env.ADMIN_EMAILS?.split(",") || ["help@vocahire.com"]; // Default to provided admin email
  const isAdmin = user?.email ? adminEmailsEnv.includes(user.email) : false;
  return isAdmin;
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await getAdminUser(auth.userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        // Optionally include name if you want to display it, though UsageData only has email
      },
    });

    const usageDataPromises = users.map(async (user) => {
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
        email: user.email,
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
