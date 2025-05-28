import { z } from 'zod';
import { ai } from '..';
import { gemini15Flash } from '@genkit-ai/googleai';

const interviewSessionSchema = z.object({
  userId: z.string(),
  jobRole: z.string(),
  difficulty: z.enum(['entry', 'mid', 'senior']),
  jobDescription: z.string().optional(),
  resume: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

const sessionResponseSchema = z.object({
  sessionId: z.string(),
  liveApiEndpoint: z.string(),
  wsToken: z.string(),
  systemPrompt: z.string(),
  interviewStructure: z.object({
    warmupQuestions: z.array(z.string()),
    technicalQuestions: z.array(z.string()),
    behavioralQuestions: z.array(z.string()),
    closingQuestions: z.array(z.string()),
  }),
});

export const createInterviewSession = ai.defineFlow(
  {
    name: 'createInterviewSession',
    inputSchema: interviewSessionSchema,
    outputSchema: sessionResponseSchema,
  },
  async (input) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const systemPromptRequest = await ai.generate({
      model: gemini15Flash,
      prompt: `Create a system prompt for an AI interviewer conducting a ${input.difficulty} level interview for a ${input.jobRole} position.

Job Description: ${input.jobDescription || 'Not provided'}
Resume: ${input.resume || 'Not provided'}
Focus Areas: ${input.focusAreas?.join(', ') || 'General interview'}

The system prompt should:
1. Define the interviewer's personality (professional, friendly, encouraging)
2. Set the interview structure and flow
3. Include instructions for asking follow-up questions
4. Specify how to evaluate responses
5. Include guidelines for providing feedback

Return a comprehensive system prompt that will guide the AI interviewer.`,
    });

    const questionStructureRequest = await ai.generate({
      model: gemini15Flash,
      prompt: `Generate interview questions for a ${input.difficulty} level ${input.jobRole} position.

Create a structured set of questions:
- 2 warmup questions (icebreakers)
- 4 technical questions (role-specific)
- 3 behavioral questions (STAR format)
- 1 closing question

Return as JSON with arrays for each category.`,
      output: {
        schema: z.object({
          warmupQuestions: z.array(z.string()),
          technicalQuestions: z.array(z.string()),
          behavioralQuestions: z.array(z.string()),
          closingQuestions: z.array(z.string()),
        }),
      },
    });

    const liveApiEndpoint = process.env.GOOGLE_LIVE_API_ENDPOINT || 'wss://generativelanguage.googleapis.com/v1/models/gemini-live:streamGenerateContent';
    const wsToken = await generateLiveApiToken(input.userId, sessionId);

    return {
      sessionId,
      liveApiEndpoint,
      wsToken,
      systemPrompt: systemPromptRequest.text(),
      interviewStructure: questionStructureRequest.output(),
    };
  }
);

async function generateLiveApiToken(userId: string, sessionId: string): Promise<string> {
  return Buffer.from(JSON.stringify({ userId, sessionId, timestamp: Date.now() })).toString('base64');
}