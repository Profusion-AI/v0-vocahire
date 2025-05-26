import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0", // Assumes version from package.json
      uptime: process.uptime(), // Node.js process uptime in seconds
    }, { status: 200 });
  } catch (error) {
    console.error("Error in health check:", error);
    return NextResponse.json({ status: "unhealthy", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
