import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { userDb } from "@/lib/db"

// Force Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`Attempting login for email: ${email}`)

    try {
      const user = await userDb.findByEmail(email)
      console.log(`User found: ${!!user}`)

      if (!user || !user.password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      console.log(`User password: ${user.password}`)
      console.log(`Input password: ${password}`)

      // For our simplified hashing, we expect the password to be "hashed_password123"
      const isPasswordValid = user.password === `hashed_${password}`
      console.log(`Password valid: ${isPasswordValid}`)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Set a simple cookie instead of JWT
      cookies().set({
        name: "auth-user-id",
        value: user.id,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
    } catch (dbError) {
      console.error("Database error during login:", dbError)
      return NextResponse.json({ error: "Database error during login" }, { status: 500 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
