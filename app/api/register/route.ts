import { NextResponse } from "next/server"
import { hash } from "@/lib/password"
import { userDb } from "@/lib/db"
import { z } from "zod"

// Define schema for validation
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const result = userSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await userDb.findByEmail(email)

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password)

    // Create user
    const user = await userDb.create({
      name,
      email,
      password: hashedPassword,
      credits: 1, // Give one free credit
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ message: "User created successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
