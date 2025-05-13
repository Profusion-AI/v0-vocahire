import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { trackUsage } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"

// Define the schema for the request body
const CreateRealtimeSessionSchema = z.object({
  model: z.string().optional().default("gpt-4o-mini-realtime"), // Or your specific model
  voice: z.string().optional().default("echo"), // Or your preferred voice
  instructions: z.string().optional().default("You are a helpful interview assistant."),
  modalities: z.array(z.enum(["audio_input", "audio_output"])).optional().default(["audio_input", "audio_output"]),
  turn_detection: z.object({
    strategy: z.enum(["silence", "end_of_speech_marker"]).optional().default("silence"),
    silence_duration_ms: z.number().optional().default(1000),
  }).optional(),
  // Add any other parameters your client might send for session creation
})

// Rate limit configuration: 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 10, // 10 requests per minute per user
})

// It's better to augment NextAuth.js types globally,
// but for a quick fix, we'll assume the session user object has an 'id' property.
// Ensure your next-auth.d.ts correctly augments the Session['user'] type.
// Example next-auth.d.ts:
// import NextAuth, { DefaultSession } from "next-auth"
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//     } & DefaultSession["user"]
//   }
// }


export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    // Assuming session.user.id is populated by your NextAuth config
    // For a robust solution, ensure next-auth.d.ts correctly augments Session['user']
    const userIdFromSession = (session?.user as { id?: string })?.id;

    if (!userIdFromSession) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User is not authenticated or user ID is missing." } },
        { status: 401 }
      )
    }

    const userId = userIdFromSession // userId is now guaranteed to be a string here

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

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user || user.credits <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: "Insufficient credits. Please purchase more credits.",
          },
        },
        { status: 403 }
      )
    }

    // Process and validate the request body
    let parsedBody
    try {
      const body = await request.json()
      parsedBody = CreateRealtimeSessionSchema.parse(body)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_INPUT",
              message: "Invalid request body.",
              details: e.format(),
            },
          },
          { status: 400 }
        )
      }
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

    // Create OpenAI Realtime Session
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is not set.")
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Server configuration error. Please contact support.",
          },
        },
        { status: 500 }
      )
    }

    let openAIResponse: Response; // Will be assigned in the try block
    try {
      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(parsedBody),
      });
      openAIResponse = response; // Assign here

      if (!openAIResponse.ok) {
        const errorBody = await openAIResponse.json().catch(() => ({ // Catch if errorBody itself is not JSON
          message: "OpenAI API request failed with status " + openAIResponse.status,
        }));
        console.error("OpenAI API Error:", openAIResponse.status, errorBody);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "OPENAI_API_ERROR",
              message: `Failed to create OpenAI session: ${errorBody.error?.message || errorBody.message || "Unknown error"}`,
              details: errorBody,
            },
          },
          { status: openAIResponse.status } // Propagate OpenAI's error status
        );
      }
    } catch (fetchError: any) {
      console.error("Error fetching OpenAI API:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Failed to connect to OpenAI API. Please check your network or try again later.",
            details: fetchError.message,
          },
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    // If we reach here, openAIResponse must have been successfully assigned and Response.ok was true.
    // Or, an error occurred and the function returned earlier.
    // The explicit check for !openAIResponse is technically redundant if the catch block for fetch always returns,
    // but it can remain as a safeguard if needed. The main change is assigning to openAIResponse within the try.
    
    // The previous check `if (!openAIResponse)` should now be unnecessary if the logic flow is correct,
    // as an error in fetch would have been caught and returned.
    // If openAIResponse was not assigned due to fetch error, the catch block would have handled it.
    // If openAIResponse.ok was false, it would have returned.
    // Thus, openAIResponse here should be a valid, ok Response.
    const openAIData = await openAIResponse.json();

    // TODO: Consider creating the Interview record in Prisma here, storing openAIData.session_id
    // For now, we'll assume the client handles this or it's done in a subsequent step.

    // Track usage
    await trackUsage(userId, "realtime_session")

    // Deduct a credit
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    })

    // Return the OpenAI session details to the client
    return NextResponse.json({
      success: true,
      data: {
        sessionId: openAIData.session_id,
        ephemeralToken: openAIData.client_secret?.value, // client_secret.value is the ephemeral token
        // You might want to return other relevant data from openAIData if needed
      },
    })
  } catch (error: any) { // Catch any other unexpected errors
    console.error("Error in realtime-session route:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong. Please try again.",
        },
      },
      { status: 500 }
    )
  }
}
