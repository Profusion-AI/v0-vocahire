import { z } from 'zod';
import { getGenkit } from '..';
import { gemini15Pro } from '@genkit-ai/googleai';

const feedbackInputSchema = z.object({
  sessionId: z.string(),
  transcript: z.array(z.object({
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
    timestamp: z.number(),
  })),
  jobRole: z.string(),
  difficulty: z.enum(['entry', 'mid', 'senior']),
  audioMetrics: z.object({
    speakingPace: z.number(),
    silenceDuration: z.number(),
    fillerWordCount: z.number(),
  }).optional(),
});

const feedbackOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  categoryScores: z.object({
    technicalKnowledge: z.number().min(0).max(100),
    communicationSkills: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    professionalPresence: z.number().min(0).max(100),
  }),
  detailedFeedback: z.array(z.object({
    question: z.string(),
    response: z.string(),
    feedback: z.string(),
    score: z.number().min(0).max(100),
  })),
  recommendedResources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    description: z.string(),
  })),
  nextSteps: z.array(z.string()),
});

// Lazy flow definition
let generateInterviewFeedbackInstance: any = null;

export function generateInterviewFeedback() {
  if (!generateInterviewFeedbackInstance) {
    const ai = getGenkit();
    if (!ai) {
      // Return a dummy flow that throws an error if called
      return {
        run: async () => {
          throw new Error('Genkit not initialized - GOOGLE_AI_API_KEY missing');
        }
      };
    }
    
    generateInterviewFeedbackInstance = ai.defineFlow(
    {
      name: 'generateInterviewFeedback',
      inputSchema: feedbackInputSchema,
      outputSchema: feedbackOutputSchema,
    },
    async (input: z.infer<typeof feedbackInputSchema>) => {
    const feedbackPrompt = `Analyze this ${input.difficulty} level ${input.jobRole} interview transcript and provide comprehensive feedback.

Interview Transcript:
${input.transcript.map((t: any) => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Audio Metrics:
- Speaking Pace: ${input.audioMetrics?.speakingPace || 'N/A'} words per minute
- Total Silence: ${input.audioMetrics?.silenceDuration || 'N/A'} seconds
- Filler Words: ${input.audioMetrics?.fillerWordCount || 'N/A'}

Provide a detailed evaluation including:
1. Overall performance score (0-100)
2. Key strengths demonstrated
3. Areas for improvement
4. Scores for each category (technical, communication, problem-solving, professional presence)
5. Question-by-question feedback
6. Recommended learning resources
7. Actionable next steps

Be constructive, specific, and encouraging in your feedback.`;

      const feedbackResponse = await ai.generate({
        model: gemini15Pro,
        prompt: feedbackPrompt,
        output: {
          schema: feedbackOutputSchema,
        },
      });

      if (!feedbackResponse) {
        throw new Error('Failed to get response from AI');
      }
      
      const output = feedbackResponse.output;
      if (!output) {
        throw new Error('Failed to generate feedback');
      }
      return output;
    }
  );
  }
  return generateInterviewFeedbackInstance;
}

// Lazy flow definition for enhanced feedback
let generateEnhancedFeedbackInstance: any = null;

export function generateEnhancedFeedback() {
  if (!generateEnhancedFeedbackInstance) {
    const ai = getGenkit();
    if (!ai) {
      // Return a dummy flow that throws an error if called
      return {
        run: async () => {
          throw new Error('Genkit not initialized - GOOGLE_AI_API_KEY missing');
        }
      };
    }
    
    generateEnhancedFeedbackInstance = ai.defineFlow(
    {
      name: 'generateEnhancedFeedback',
    inputSchema: z.object({
      basicFeedback: feedbackOutputSchema,
      userGoals: z.string().optional(),
      previousInterviews: z.array(z.object({
        date: z.string(),
        score: z.number(),
        jobRole: z.string(),
      })).optional(),
    }),
    outputSchema: z.object({
      personalizedInsights: z.array(z.string()),
      progressAnalysis: z.object({
        trend: z.enum(['improving', 'stable', 'declining']),
        keyMetrics: z.array(z.object({
          metric: z.string(),
          current: z.number(),
          previous: z.number(),
          change: z.number(),
        })),
      }).optional(),
      customizedActionPlan: z.array(z.object({
        goal: z.string(),
        steps: z.array(z.string()),
        timeline: z.string(),
        resources: z.array(z.string()),
      })),
      motivationalMessage: z.string(),
    }),
  },
  async (input: any) => {
    const enhancementPrompt = `Based on the interview feedback and user context, provide enhanced, personalized insights.

Basic Feedback Summary:
- Overall Score: ${input.basicFeedback.overallScore}
- Strengths: ${input.basicFeedback.strengths.join(', ')}
- Improvement Areas: ${input.basicFeedback.improvementAreas.join(', ')}

User Goals: ${input.userGoals || 'Not specified'}

Previous Interview History:
${input.previousInterviews?.map((i: any) => `- ${i.date}: ${i.jobRole} (Score: ${i.score})`).join('\n') || 'No previous interviews'}

Generate:
1. Personalized insights based on their specific situation
2. Progress analysis if they have previous interviews
3. A customized action plan with concrete steps
4. An encouraging, motivational message

Focus on actionable advice and positive reinforcement.`;

    const enhancedResponse = await ai.generate({
      model: gemini15Pro,
      prompt: enhancementPrompt,
      output: {
        schema: z.object({
          personalizedInsights: z.array(z.string()),
          progressAnalysis: z.object({
            trend: z.enum(['improving', 'stable', 'declining']),
            keyMetrics: z.array(z.object({
              metric: z.string(),
              current: z.number(),
              previous: z.number(),
              change: z.number(),
            })),
          }).optional(),
          customizedActionPlan: z.array(z.object({
            goal: z.string(),
            steps: z.array(z.string()),
            timeline: z.string(),
            resources: z.array(z.string()),
          })),
          motivationalMessage: z.string(),
        }),
      },
    });

    if (!enhancedResponse) {
      throw new Error('Failed to get enhanced response from AI');
    }
    
    const enhancedOutput = enhancedResponse.output;
    if (!enhancedOutput) {
      throw new Error('Failed to generate enhanced feedback');
    }
      return enhancedOutput;
    }
  );
  }
  return generateInterviewFeedbackInstance;
}