// This is a mock implementation of the feedback generator
// In a real application, this would call an AI service like OpenAI

interface FeedbackItem {
  id: string
  title: string
  content: string
  type: "positive" | "improvement" | "neutral"
}

interface FeedbackData {
  summary: string
  items: FeedbackItem[]
}

export async function generateFeedback(transcript: string): Promise<FeedbackData> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock feedback
  return {
    summary:
      "You demonstrated good technical knowledge and communication skills during the interview. There are some areas for improvement in structuring your responses and providing specific examples.",
    items: [
      {
        id: "1",
        title: "Strong Technical Knowledge",
        content:
          "You provided clear explanations of technical concepts and demonstrated a solid understanding of the technologies discussed.",
        type: "positive",
      },
      {
        id: "2",
        title: "Communication Skills",
        content: "Your communication was clear and professional. You maintained good energy throughout the interview.",
        type: "positive",
      },
      {
        id: "3",
        title: "Response Structure",
        content:
          "Your answers could benefit from a more structured approach. Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions.",
        type: "improvement",
      },
      {
        id: "4",
        title: "Specific Examples",
        content:
          "Try to include more specific metrics and outcomes when discussing your achievements. This helps interviewers understand the impact of your work.",
        type: "improvement",
      },
      {
        id: "5",
        title: "Question Handling",
        content:
          "You handled most questions well, though sometimes took too long to get to the main point. Practice being more concise while still being thorough.",
        type: "neutral",
      },
    ],
  }
}
