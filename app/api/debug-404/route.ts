import { NextResponse } from 'next/server';

// Debug endpoint to check what's causing 404s
export async function GET() {
  return NextResponse.json({
    message: "Debug endpoint active",
    timestamp: new Date().toISOString(),
    routes: {
      health: "/api/health",
      user: "/api/user", 
      prefetchCredentials: "/api/prefetch-credentials",
      interviewSession: "/api/interview-v2/session"
    }
  });
}