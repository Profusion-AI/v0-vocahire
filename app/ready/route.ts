import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const serviceStatuses: { [key: string]: string } = {};

  // Check Redis connection
  try {
    await redis.ping();
    serviceStatuses.redis = "connected";
  } catch (error) {
    console.error("Redis readiness check failed:", error);
    serviceStatuses.redis = "disconnected";
  }

  // Check Database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    serviceStatuses.database = "connected";
  } catch (error) {
    console.error("Database readiness check failed:", error);
    serviceStatuses.database = "disconnected";
  }

  // Check Google AI API key
  if (process.env.GOOGLE_AI_API_KEY) {
    serviceStatuses.google_ai = "configured";
  } else {
    serviceStatuses.google_ai = "not_configured";
  }

  const allReady = Object.values(serviceStatuses).every(
    status => status === "connected" || status === "configured"
  );

  const responseStatus = allReady ? 200 : 503;

  return NextResponse.json({
    status: allReady ? "ready" : "not_ready",
    services: serviceStatuses,
  }, { status: responseStatus });
}