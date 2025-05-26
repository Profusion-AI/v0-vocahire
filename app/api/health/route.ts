// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0", // Placeholder version
    uptime: process.uptime() // Node.js uptime in seconds
  });
}
