import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
    databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
  })
}
