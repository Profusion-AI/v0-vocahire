import { z } from 'zod';
import { getGenkit } from '..';
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
  systemPrompt: z.string(),
  interviewStructure: z.object({
    warmupQuestions: z.array(z.string()),
    technicalQuestions: z.array(z.string()),
    behavioralQuestions: z.array(z.string()),
    closingQuestions: z.array(z.string()),
  }),
});

export const generateInterviewQuestions = (() => {
  const ai = getGenkit();
  if (!ai) {
    // Return a dummy flow that throws an error if called
    return {
      run: async () => {
        throw new Error('Genkit not initialized - GOOGLE_AI_API_KEY missing');
      }
    };
  }
  
  return ai.defineFlow(
    {
      name: 'generateInterviewQuestions',
      inputSchema: interviewSessionSchema,
      outputSchema: sessionResponseSchema,
    },
    async (input) => {
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

    if (!systemPromptRequest) {
      throw new Error('Failed to generate system prompt');
    }
    
    if (!questionStructureRequest) {
      throw new Error('Failed to generate interview questions');
    }

    const systemPrompt = systemPromptRequest.text;
    if (!systemPrompt) {
      throw new Error('System prompt is empty');
    }

    const interviewStructure = questionStructureRequest.output;
    if (!interviewStructure) {
      throw new Error('Interview structure is empty');
    }

      return {
        systemPrompt,
        interviewStructure,
      };
    }
  );
})();