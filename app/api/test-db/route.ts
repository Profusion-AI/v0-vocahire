import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Force Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    // Simple query to test database connection
    const result = await sql`SELECT NOW()`
    return NextResponse.json({ status: "ok", result })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}
