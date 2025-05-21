import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// A faulty API route to test Sentry's error monitoring
export function GET(request: NextRequest) {
  throw new Error("Sentry Example API Route Error - This is a test!");
  
  // This line will never be reached, but needed for TypeScript
  return NextResponse.json({ data: "Testing Sentry Error..." });
}