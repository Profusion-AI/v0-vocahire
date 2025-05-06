import { openai } from "@/lib/openai"

interface FeedbackItem {
  id: string
  title: string
  content: string
  type: "positive" | "improvement" | "neutral"
}

interface FeedbackResult {
  summary: string
  items: FeedbackItem[]
}

export async function generateFeedback(transcript: string): Promise<FeedbackResult> {
  try {
    // Define the system prompt for structured feedback
    const systemPrompt = `
      You are an expert interview coach analyzing a job interview transcript.
      Provide detailed, constructive feedback on the candidate's performance.
      
      Your feedback should be structured as follows:
      1. A brief summary of overall performance (2-3 sentences)
      2. 5-7 specific feedback points, each with:
         - A clear title (3-5 words)
         - Detailed explanation (2-3 sentences)
         - Type: "positive" for strengths, "improvement" for areas to improve, or "neutral" for observations
      
      Focus on communication style, content of answers, structure, relevance, and professionalism.
      Be specific, actionable, and constructive.
    `

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Here is the transcript of a mock interview: ${transcript}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    // Parse the response
    const responseContent = completion.choices[0].message.content
    if (!responseContent) {
      throw new Error("Empty response from OpenAI")
    }

    const parsedResponse = JSON.parse(responseContent)

    // Validate and format the response
    const feedbackResult: FeedbackResult = {
      summary: parsedResponse.summary || "Interview feedback summary not available.",
      items: (parsedResponse.items || []).map((item: any, index: number) => ({
        id: item.id || `feedback-${index + 1}`,
        title: item.title || `Feedback Point ${index + 1}`,
        content: item.content || "No details provided.",
        type: ["positive", "improvement", "neutral"].includes(item.type) ? item.type : "neutral",
      })),
    }

    return feedbackResult
  } catch (error) {
    console.error("Error generating feedback:", error)

    // Return fallback feedback if API fails
    return {
      summary: "We encountered an issue generating your feedback. Here are some general points to consider.",
      items: [
        {
          id: "fallback-1",
          title: "Communication Skills",
          content: "Focus on clear and concise communication. Avoid filler words and practice structured responses.",
          type: "neutral",
        },
        {
          id: "fallback-2",
          title: "STAR Method",
          content: "Use the Situation, Task, Action, Result method to structure your answers to behavioral questions.",
          type: "improvement",
        },
        {
          id: "fallback-3",
          title: "Interview Preparation",
          content:
            "Research the company and role thoroughly before interviews. Prepare specific examples from your experience.",
          type: "neutral",
        },
      ],
    }
  }
}
