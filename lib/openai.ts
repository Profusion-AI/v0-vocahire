import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function createRealtimeSession() {
  try {
    // This is a placeholder for the actual OpenAI Realtime API call
    // Will be implemented when the API is available
    const session = await openai.beta.audio.realtime.sessions.create()
    return session
  } catch (error) {
    console.error("Error creating realtime session:", error)
    throw error
  }
}

export async function generateFeedback(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview coach. Analyze the interview transcript and provide constructive feedback on the candidate's responses, communication style, and areas for improvement.",
        },
        {
          role: "user",
          content: `Here is the transcript of a mock interview: ${transcript}`,
        },
      ],
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error("Error generating feedback:", error)
    throw error
  }
}
