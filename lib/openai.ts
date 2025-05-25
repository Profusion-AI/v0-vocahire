// Helper functions for OpenAI API calls
import { generateStructuredFeedback, structuredToLegacyFormat, parseStructuredFeedback } from './openai-structured'

/**
 * Generate feedback for an interview based on the conversation
 * Now uses structured JSON output for more reliable parsing
 */
export async function generateInterviewFeedback(messages: Array<{ role: string; content: string }>) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured")
  }
  
  // Validate and prepare messages
  if (!messages || messages.length === 0) {
    throw new Error("No interview transcript provided")
  }
  
  // Filter out system messages and ensure we have actual content
  const userMessages = messages.filter(m => m.role === "user" && m.content?.trim())
  const assistantMessages = messages.filter(m => m.role === "assistant" && m.content?.trim())
  
  // Edge case: Very short or incomplete interview
  const totalMessages = userMessages.length + assistantMessages.length
  const isIncompleteInterview = totalMessages < 4 || userMessages.length < 2
  
  // Calculate interview characteristics for context
  const avgUserMessageLength = userMessages.length > 0 
    ? userMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / userMessages.length
    : 0
  
  const hasOffTopicContent = userMessages.some(m => {
    const content = m.content?.toLowerCase() || ""
    return content.includes("test") || content.includes("hello") || content.length < 10
  })
  
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
            content: `You are an expert interview coach providing comprehensive feedback on a mock interview performance.

CONTEXT: 
- Total messages exchanged: ${totalMessages}
- User responses: ${userMessages.length}
- Average response length: ${Math.round(avgUserMessageLength)} characters
- Interview appears ${isIncompleteInterview ? "incomplete or very brief" : "complete"}
${hasOffTopicContent ? "- Some responses may be off-topic or testing-related" : ""}

IMPORTANT: Format your response EXACTLY as shown below, maintaining the structure and headings:

1. Communication Skills: [Rating: Excellent/Good/Satisfactory/Needs Improvement]
[Provide 2-3 sentences of specific feedback. For incomplete interviews, focus on what was observed and suggest how to better engage in future interviews.]

2. Technical Knowledge: [Rating: Excellent/Good/Satisfactory/Needs Improvement]
[Provide 2-3 sentences evaluating technical responses. If no technical questions were asked or answered, note this and provide general advice.]

3. Problem-Solving Approach: [Rating: Excellent/Good/Satisfactory/Needs Improvement]
[Provide 2-3 sentences about problem-solving. If no problems were presented, focus on analytical thinking shown in responses.]

4. Areas for Improvement: [Rating: Consider]
[Provide 3-4 specific recommendations. For incomplete interviews, include advice on interview preparation and engagement.]

EDGE CASE HANDLING:
- If the interview was cut short: Focus feedback on the importance of completing the full interview
- If responses were very brief: Emphasize the need for detailed, thoughtful answers
- If the candidate went off-topic: Address staying focused on the interviewer's questions
- If technical discussion was minimal: Suggest preparing technical examples
- Always provide constructive, actionable feedback regardless of interview quality`,
          },
          ...messages,
        ],
        temperature: 0.7,
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
    
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating feedback:", error)
    throw error
  }
}

/**
 * Generate feedback using structured JSON approach (recommended)
 * This is more reliable than the legacy text parsing approach
 */
export async function generateInterviewFeedbackV2(messages: Array<{ role: string; content: string }>) {
  try {
    // Use structured feedback generation
    const structured = await generateStructuredFeedback(messages)
    
    // Convert to legacy format for backward compatibility
    const legacyFormat = structuredToLegacyFormat(structured)
    
    return {
      raw: legacyFormat,
      structured,
      parsed: parseStructuredFeedback(structured)
    }
  } catch (error) {
    console.error("Structured feedback generation failed, falling back to legacy:", error)
    // Fall back to legacy approach if structured fails
    const legacyRaw = await generateInterviewFeedback(messages)
    return {
      raw: legacyRaw,
      structured: null,
      parsed: parseFeedback(legacyRaw)
    }
  }
}

/**
 * Parse structured feedback from the raw feedback text
 */
export function parseFeedback(rawFeedback: string) {
  // Handle edge case: empty or invalid feedback
  if (!rawFeedback || typeof rawFeedback !== 'string') {
    console.error("Invalid feedback received:", rawFeedback)
    return getDefaultFeedback("The feedback generation encountered an error. Please try again.")
  }
  
  const categories = [
    "Communication Skills",
    "Technical Knowledge",
    "Problem-Solving Approach",
    "Areas for Improvement",
  ]

  const parsedFeedback = categories.map((category, index) => {
    // Primary regex for numbered format
    const numberedRegex = new RegExp(
      `${index + 1}\\.\\s*${category}:\\s*\\[Rating:\\s*(Excellent|Good|Satisfactory|Needs Improvement|Consider)\\]\\s*([\\s\\S]*?)(?=\\d+\\.|$)`,
      "i"
    )
    
    // Secondary regex for format variations
    const alternateRegex = new RegExp(
      `${category}[:\\s]*\\[?Rating[:\\s]*(Excellent|Good|Satisfactory|Needs Improvement|Consider)\\]?[:\\s]*([\\s\\S]*?)(?=(?:\\d+\\.)|(?:[A-Z][a-z]+ [A-Z][a-z]+:)|$)`,
      "i"
    )
    
    // Try multiple regex patterns
    let match = rawFeedback.match(numberedRegex)
    if (!match) {
      match = rawFeedback.match(alternateRegex)
    }
    
    if (match) {
      const feedbackText = match[2].trim().replace(/^\n+|\n+$/g, '')
      
      // Ensure we have meaningful feedback
      if (feedbackText.length < 20) {
        return {
          category,
          rating: match[1].trim(),
          feedback: getDefaultFeedbackForCategory(category, match[1].trim())
        }
      }
      
      return {
        category,
        rating: match[1].trim(),
        feedback: feedbackText
      }
    }

    // If no match found, return category-specific default
    return {
      category,
      rating: "Needs Improvement",
      feedback: getDefaultFeedbackForCategory(category, "Needs Improvement")
    }
  })

  // Validate that we got at least some meaningful feedback
  const hasValidFeedback = parsedFeedback.some(f => 
    f.feedback && f.feedback !== "No specific feedback provided for this category."
  )
  
  if (!hasValidFeedback) {
    console.error("Parsing failed for all categories, using defaults")
    return getDefaultFeedback("Unable to generate specific feedback. Please ensure you completed the interview with substantive responses.")
  }

  return parsedFeedback
}

// Helper function for category-specific default feedback
function getDefaultFeedbackForCategory(category: string, rating: string): string {
  const defaults: Record<string, string> = {
    "Communication Skills": "Focus on providing clear, structured responses. Practice articulating your thoughts with specific examples from your experience.",
    "Technical Knowledge": "Prepare technical examples from your past work. Be ready to explain concepts in detail and demonstrate your expertise.",
    "Problem-Solving Approach": "When presented with problems, verbalize your thought process. Break down complex issues into manageable steps.",
    "Areas for Improvement": "Complete the full interview to receive comprehensive feedback. Engage fully with each question and provide detailed responses."
  }
  
  return defaults[category] || "Continue practicing to improve in this area."
}

// Helper function for complete default feedback
function getDefaultFeedback(reason: string): Array<{category: string, rating: string, feedback: string}> {
  return [
    {
      category: "Communication Skills",
      rating: "Needs Improvement",
      feedback: `${reason} For better results, provide clear and detailed responses to all interview questions.`
    },
    {
      category: "Technical Knowledge",
      rating: "Not Evaluated",
      feedback: "Unable to assess technical knowledge. In future interviews, be prepared to discuss technical concepts relevant to your field."
    },
    {
      category: "Problem-Solving Approach",
      rating: "Not Evaluated",
      feedback: "Problem-solving skills could not be evaluated. Ensure you complete the full interview to demonstrate your analytical abilities."
    },
    {
      category: "Areas for Improvement",
      rating: "Consider",
      feedback: "1) Complete the entire interview without interruption. 2) Provide substantive responses to each question. 3) Stay focused on the interviewer's questions. 4) Practice with mock interviews to build confidence."
    }
  ]
}
