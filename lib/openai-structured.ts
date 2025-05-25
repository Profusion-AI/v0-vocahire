// Structured feedback generation using OpenAI's JSON mode
import { z } from "zod"

// Define the exact structure we want from OpenAI
export const FeedbackCategorySchema = z.object({
  category: z.enum([
    "Communication Skills",
    "Technical Knowledge", 
    "Problem-Solving Approach",
    "Areas for Improvement"
  ]),
  rating: z.enum([
    "Excellent",
    "Good", 
    "Satisfactory",
    "Needs Improvement",
    "Consider",
    "Not Evaluated"
  ]),
  feedback: z.string().min(20, "Feedback must be at least 20 characters"),
  keyPoints: z.array(z.string()).optional() // Additional structured data
})

export const StructuredFeedbackSchema = z.object({
  categories: z.array(FeedbackCategorySchema).length(4),
  overallSummary: z.string(),
  interviewQuality: z.object({
    completeness: z.enum(["complete", "partial", "insufficient"]),
    engagementLevel: z.enum(["high", "moderate", "low"]),
    responseDepth: z.enum(["detailed", "adequate", "brief"])
  }),
  actionableAdvice: z.array(z.string()).min(3).max(5),
  strengths: z.array(z.string()).min(1).max(3),
  improvementAreas: z.array(z.string()).min(1).max(3)
})

export type StructuredFeedback = z.infer<typeof StructuredFeedbackSchema>

/**
 * Generate structured feedback using OpenAI's JSON mode
 */
export async function generateStructuredFeedback(
  messages: Array<{ role: string; content: string }>
): Promise<StructuredFeedback> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured")
  }
  
  // Validate and prepare messages
  if (!messages || messages.length === 0) {
    throw new Error("No interview transcript provided")
  }
  
  // Filter and analyze messages
  const userMessages = messages.filter(m => m.role === "user" && m.content?.trim())
  const assistantMessages = messages.filter(m => m.role === "assistant" && m.content?.trim())
  
  // Interview metadata for context
  const totalMessages = userMessages.length + assistantMessages.length
  const isIncompleteInterview = totalMessages < 4 || userMessages.length < 2
  const avgUserMessageLength = userMessages.length > 0 
    ? userMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / userMessages.length
    : 0

  const systemPrompt = `You are an expert interview coach providing structured feedback in JSON format.

INTERVIEW CONTEXT:
- Total messages: ${totalMessages}
- User responses: ${userMessages.length}
- Average response length: ${Math.round(avgUserMessageLength)} characters
- Interview completeness: ${isIncompleteInterview ? "incomplete/brief" : "complete"}

You must return a JSON object that EXACTLY matches this structure:
{
  "categories": [
    {
      "category": "Communication Skills",
      "rating": "Excellent" | "Good" | "Satisfactory" | "Needs Improvement",
      "feedback": "Detailed feedback about communication skills (minimum 20 characters)",
      "keyPoints": ["specific point 1", "specific point 2"] // optional
    },
    {
      "category": "Technical Knowledge",
      "rating": "Excellent" | "Good" | "Satisfactory" | "Needs Improvement" | "Not Evaluated",
      "feedback": "Detailed feedback about technical knowledge (minimum 20 characters)",
      "keyPoints": ["specific point 1", "specific point 2"] // optional
    },
    {
      "category": "Problem-Solving Approach", 
      "rating": "Excellent" | "Good" | "Satisfactory" | "Needs Improvement" | "Not Evaluated",
      "feedback": "Detailed feedback about problem-solving (minimum 20 characters)",
      "keyPoints": ["specific point 1", "specific point 2"] // optional
    },
    {
      "category": "Areas for Improvement",
      "rating": "Consider",
      "feedback": "Specific recommendations for improvement (minimum 20 characters)",
      "keyPoints": ["improvement 1", "improvement 2", "improvement 3"] // optional
    }
  ],
  "overallSummary": "A comprehensive summary of the interview performance",
  "interviewQuality": {
    "completeness": "complete" | "partial" | "insufficient",
    "engagementLevel": "high" | "moderate" | "low", 
    "responseDepth": "detailed" | "adequate" | "brief"
  },
  "actionableAdvice": [
    "Specific action item 1",
    "Specific action item 2",
    "Specific action item 3"
  ],
  "strengths": [
    "Key strength 1",
    "Key strength 2"
  ],
  "improvementAreas": [
    "Area to improve 1",
    "Area to improve 2"
  ]
}

IMPORTANT RULES:
1. All categories must be included, even if marked as "Not Evaluated"
2. Feedback must be constructive and specific, not generic
3. For incomplete interviews, focus on the importance of full participation
4. Ratings should reflect actual performance observed
5. Return ONLY valid JSON, no additional text or formatting`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages,
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON
        response_format: { type: "json_object" }, // Enable JSON mode
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API error:", response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || "Failed to generate feedback"}`)
    }

    const data = await response.json()
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API")
    }
    
    // Parse and validate the JSON response
    const jsonContent = JSON.parse(data.choices[0].message.content)
    const validatedFeedback = StructuredFeedbackSchema.parse(jsonContent)
    
    return validatedFeedback
  } catch (error) {
    console.error("Error generating structured feedback:", error)
    
    // If JSON parsing or validation fails, return a default structure
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      console.error("JSON validation error, returning default feedback")
      return getDefaultStructuredFeedback(messages)
    }
    
    throw error
  }
}

/**
 * Convert structured feedback to the legacy format for backward compatibility
 */
export function structuredToLegacyFormat(structured: StructuredFeedback): string {
  return structured.categories
    .map((cat, index) => {
      const points = cat.keyPoints?.length ? `\n${cat.keyPoints.join('. ')}` : ''
      return `${index + 1}. ${cat.category}: [Rating: ${cat.rating}]\n${cat.feedback}${points}`
    })
    .join('\n\n')
}

/**
 * Parse structured feedback into the expected array format
 */
export function parseStructuredFeedback(structured: StructuredFeedback) {
  return structured.categories.map(cat => ({
    category: cat.category,
    rating: cat.rating,
    feedback: cat.feedback
  }))
}

/**
 * Get default structured feedback for error cases
 */
function getDefaultStructuredFeedback(messages: Array<{ role: string; content: string }>): StructuredFeedback {
  const userMessages = messages.filter(m => m.role === "user")
  const isIncomplete = userMessages.length < 2
  
  return {
    categories: [
      {
        category: "Communication Skills",
        rating: "Needs Improvement",
        feedback: isIncomplete 
          ? "Unable to fully assess communication skills due to limited responses. Focus on providing clear, detailed answers in future interviews."
          : "Work on structuring your responses more clearly. Practice the STAR method for behavioral questions.",
        keyPoints: ["Provide more detailed responses", "Use specific examples"]
      },
      {
        category: "Technical Knowledge",
        rating: "Not Evaluated",
        feedback: "Technical knowledge could not be assessed in this interview. Be prepared to discuss technical concepts relevant to your field.",
        keyPoints: ["Prepare technical examples", "Review fundamentals"]
      },
      {
        category: "Problem-Solving Approach",
        rating: "Not Evaluated",
        feedback: "Problem-solving skills require demonstration through complete responses. Practice explaining your thought process clearly.",
        keyPoints: ["Verbalize your thinking", "Break down complex problems"]
      },
      {
        category: "Areas for Improvement",
        rating: "Consider",
        feedback: "Focus on completing the full interview and providing substantive responses to receive comprehensive feedback.",
        keyPoints: [
          "Complete all interview questions",
          "Provide detailed responses", 
          "Stay engaged throughout"
        ]
      }
    ],
    overallSummary: isIncomplete 
      ? "This interview appears incomplete. To receive valuable feedback, please complete a full interview session with detailed responses to all questions."
      : "Continue practicing to improve your interview performance. Focus on providing specific examples and maintaining engagement throughout the interview.",
    interviewQuality: {
      completeness: isIncomplete ? "insufficient" : "partial",
      engagementLevel: "low",
      responseDepth: "brief"
    },
    actionableAdvice: [
      "Complete a full mock interview without interruption",
      "Prepare 5-7 STAR stories from your experience",
      "Practice speaking for 1-2 minutes per response"
    ],
    strengths: [
      "Initiated the interview process"
    ],
    improvementAreas: [
      "Interview completion",
      "Response depth and detail"
    ]
  }
}

/**
 * Migration helper: Use structured feedback but maintain backward compatibility
 */
export async function generateInterviewFeedbackStructured(
  messages: Array<{ role: string; content: string }>
): Promise<{ raw: string; structured: StructuredFeedback }> {
  const structured = await generateStructuredFeedback(messages)
  const raw = structuredToLegacyFormat(structured)
  
  return { raw, structured }
}