import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { trackUsage } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"

// Define the schema for the request body
const GenerateFeedbackSchema = z.object({
  interviewId: z.string().min(1, { message: "Interview ID is required" }),
  transcript: z.string().min(1, { message: "Transcript is required" }),
  // Add other expected fields from the transcript or feedback generation if needed
})

// Rate limit configuration: 5 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 5, // 5 requests per minute
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User is not authenticated." },
        },
        { status: 401 }
      )
    }

    const userId = session.user.email

    // Apply rate limiting
    try {
      await limiter.check(userId)
    } catch (rateLimitError) {
      console.warn("Rate limit exceeded for user:", userId, rateLimitError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded. Please try again later.",
            retryable: true,
          },
        },
        { status: 429 }
      )
    }

    // Process and validate the request body
    let parsedBody
    try {
      const body = await request.json()
      parsedBody = GenerateFeedbackSchema.parse(body)
    } catch (e: unknown) { // Rename to 'e' for clarity in this scope
      if (e instanceof z.ZodError) {
        // After this check, 'e' is narrowed to type ZodError
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_INPUT",
              message: "Invalid request body.",
              details: e.format(), // 'e' is now correctly typed here
            },
          },
          { status: 400 }
        )
      }
      // Handle cases where request.json() itself fails (e.g., not valid JSON)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid JSON format in request body.",
          },
        },
        { status: 400 }
      )
    }

    const { interviewId, transcript } = parsedBody

    // Check if the interview belongs to the user
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
        userId,
      },
    })

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Interview not found or user is not authorized to access it.",
          },
        },
        { status: 404 }
      )
    }

    // Placeholder for feedback generation logic
    // TODO: Implement actual feedback generation based on `transcript`
    // const generatedFeedback = await generateActualFeedback(transcript);
    const generatedFeedback = {
      summary: "This is a placeholder summary.",
      strengths: ["Good clarity."],
      areasForImprovement: ["Could provide more specific examples."],
      // Ensure this structure matches what you intend to store in Prisma `Json` type
    }

    // Track usage
    await trackUsage(userId, "generate_feedback")

    // Save feedback to the database
    // Ensure the 'feedback' field in your Prisma schema is of type Json
    // and can store the structure of `generatedFeedback`
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        // @ts-ignore - Prisma might need specific type for Json, ensure generatedFeedback matches
        feedback: generatedFeedback,
      },
    })

    // Return the success response
    return NextResponse.json({
      success: true,
      data: { message: "Feedback generated and saved successfully.", feedback: generatedFeedback },
    })
  } catch (error) {
    console.error("Error in generate-feedback route:", error)
    // Determine if the error is a known type to provide more specific code/message
    let errorCode = "INTERNAL_SERVER_ERROR"
    let errorMessage = "Something went wrong. Please try again."
    // Example: if (error instanceof CustomError) { errorCode = error.code; errorMessage = error.message; }

    return NextResponse.json(
      {
        success: false,
        error: { code: errorCode, message: errorMessage },
      },
      { status: 500 }
    )
  }
}
