import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { generateFeedback } from "@/lib/feedback-generator"
import { z } from "zod"
import { config } from "@/lib/config"

// Define schema for validation
const feedbackRequestSchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
  interviewId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    // Create a Supabase client using cookies
    const cookieStore = cookies()
    const supabaseUrl = config.supabase.url
    const supabaseAnonKey = config.supabase.anonKey

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        },
      },
    })

    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = feedbackRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { transcript, interviewId } = result.data

    // Generate feedback
    const feedback = await generateFeedback(transcript)

    // Save to database
    let interview

    if (interviewId) {
      // Update existing interview
      const { data, error: updateError } = await supabase
        .from("interviews")
        .update({
          feedback,
          updated_at: new Date().toISOString(),
        })
        .eq("id", interviewId)
        .select()
        .single()

      if (updateError) {
        console.error("Database error:", updateError)
        return NextResponse.json({ error: "Failed to update interview" }, { status: 500 })
      }

      interview = data
    } else {
      // Create new interview record
      const { data, error: insertError } = await supabase
        .from("interviews")
        .insert({
          user_id: session.user.id,
          transcript,
          feedback,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Database error:", insertError)
        return NextResponse.json({ error: "Failed to create interview" }, { status: 500 })
      }

      interview = data
    }

    return NextResponse.json({ ...feedback, id: interview.id })
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
