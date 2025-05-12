import { NextResponse } from "next/server"
import { createApiClient } from "@/lib/supabase/server"
import { generateInterviewFeedback, parseFeedback } from "@/lib/openai"
import { checkRateLimit, incrementRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { trackUsage, checkUsageLimit, UsageType } from "@/lib/usage-tracking"

export async function POST(request: Request) {
  try {
    // Authenticate the user using Supabase
    const supabase = createApiClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIGS.GENERATE_FEEDBACK)
    if (rateLimitResult.isLimited) {
      console.log(`Rate limit exceeded for user ${userId}`)
      const resetDate = new Date(rateLimitResult.reset).toISOString()
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again later.`,
          reset: resetDate,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // Check usage limit
    const usageLimitResult = await checkUsageLimit(userId, UsageType.FEEDBACK_GENERATION)
    if (!usageLimitResult.allowed) {
      console.log(`Usage limit exceeded for user ${userId}`)
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          message: `You have reached your daily limit of ${usageLimitResult.limit} feedback generations. Please upgrade your plan for more.`,
          current: usageLimitResult.current,
          limit: usageLimitResult.limit,
        },
        { status: 403 },
      )
    }

    // Get the OpenAI API key
    // const apiKey = getOpenAIApiKey()
    // const keyValidation = validateApiKey(apiKey)
    // if (!keyValidation.isValid) {
    //   console.error(keyValidation.error)
    //   return NextResponse.json({ error: keyValidation.error }, { status: 500 })
    // }

    // Parse request body
    const body = await request.json()
    const { messages, fillerWordCounts, resumeData } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages data" }, { status: 400 })
    }

    // Format messages for the OpenAI API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add system message with resume data if available
    let systemPrompt = `You are an expert interview coach providing feedback on a mock interview. 
    Analyze the conversation and provide constructive feedback in the following categories:
    1. Communication Skills
    2. Technical Knowledge
    3. Problem-Solving Approach
    4. Areas for Improvement
    
    For each category, provide a rating (Excellent, Good, Satisfactory, Needs Improvement) and specific, actionable feedback.`

    // Add filler word analysis if available
    if (fillerWordCounts && Object.keys(fillerWordCounts).length > 0) {
      const totalCount = Object.values(fillerWordCounts).reduce((sum, count) => sum + count, 0)
      const topFillers = Object.entries(fillerWordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([word, count]) => `"${word}" (${count} times)`)
        .join(", ")

      systemPrompt += `\n\nThe candidate used filler words ${totalCount} times during the interview. 
      The most common filler words were: ${topFillers}. 
      Include this information in your feedback on Communication Skills.`
    }

    // Add resume data if available
    if (resumeData) {
      systemPrompt += `\n\nThe candidate is applying for a ${resumeData.jobTitle} position.`

      if (resumeData.skills) {
        systemPrompt += `\nTheir key skills include: ${resumeData.skills}`
      }

      if (resumeData.experience) {
        systemPrompt += `\nTheir work experience includes: ${resumeData.experience}`
      }

      systemPrompt += `\n\nTailor your feedback to be relevant for a ${resumeData.jobTitle} role.`
    }

    // Generate feedback using OpenAI
    console.log("Generating feedback with OpenAI...")
    const rawFeedback = await generateInterviewFeedback([
      { role: "system", content: systemPrompt },
      ...formattedMessages,
    ])

    // Parse the feedback into structured format
    const parsedFeedback = parseFeedback(rawFeedback)

    // Track usage
    await trackUsage(userId, UsageType.FEEDBACK_GENERATION)

    // Increment rate limit
    await incrementRateLimit(userId, RATE_LIMIT_CONFIGS.GENERATE_FEEDBACK)

    return NextResponse.json({
      success: true,
      rawFeedback,
      feedback: parsedFeedback,
    })
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json(
      {
        error: "Failed to generate feedback",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
