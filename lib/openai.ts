// Helper functions for OpenAI API calls

/**
 * Generate feedback for an interview based on the conversation
 */
export async function generateInterviewFeedback(messages: Array<{ role: string; content: string }>) {
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
            content: `You are an expert interview coach providing feedback on a mock interview. 
            Analyze the conversation and provide constructive feedback in the following categories:
            1. Communication Skills
            2. Technical Knowledge
            3. Problem-Solving Approach
            4. Areas for Improvement
            
            For each category, provide a rating (Excellent, Good, Satisfactory, Needs Improvement) and specific, actionable feedback.`,
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate feedback")
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating feedback:", error)
    throw error
  }
}

/**
 * Parse structured feedback from the raw feedback text
 */
export function parseFeedback(rawFeedback: string) {
  // This is a simple implementation - in a real app, you might want to use a more robust parsing method
  const categories = [
    "Communication Skills",
    "Technical Knowledge",
    "Problem-Solving Approach",
    "Areas for Improvement",
  ]

  const feedback = categories.map((category) => {
    const regex = new RegExp(
      `${category}[:\\s]+(Excellent|Good|Satisfactory|Needs Improvement)[:\\s]+([\\s\\S]*?)(?=\\d+\\.|$|\\n\\n\\d+\\.)`,
      "i",
    )
    const match = rawFeedback.match(regex)

    if (match) {
      return {
        category,
        rating: match[1].trim(),
        feedback: match[2].trim(),
      }
    }

    return {
      category,
      rating: "Not Evaluated",
      feedback: "No specific feedback provided for this category.",
    }
  })

  return feedback
}
