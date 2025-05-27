import { z } from 'zod';

// Interview Session Schemas
export const InterviewDifficultySchema = z.enum(['entry', 'mid', 'senior']);

export const InterviewSessionInputSchema = z.object({
  userId: z.string(),
  jobRole: z.string(),
  difficulty: InterviewDifficultySchema,
  jobDescription: z.string().optional(),
  resume: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

export const InterviewSessionOutputSchema = z.object({
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

// Realtime Communication Schemas
export const RealtimeInputSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  jobRole: z.string(),
  difficulty: InterviewDifficultySchema,
  systemInstruction: z.string(),
  audioChunk: z.string().optional(), // Base64 encoded audio
  textInput: z.string().optional(),
  controlMessage: z.object({ 
    type: z.enum(['start', 'stop', 'interrupt', 'ping']) 
  }).optional(),
});

export const RealtimeOutputSchema = z.object({
  type: z.enum(['audio', 'transcript', 'control', 'error', 'thinking']),
  data: z.any(),
  timestamp: z.string().datetime().optional(),
});

// Transcript Schemas
export const TranscriptEntrySchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
  timestamp: z.string().datetime(),
  confidence: z.number().min(0).max(1).optional(),
  duration: z.number().optional(), // in milliseconds
});

export const TranscriptSchema = z.array(TranscriptEntrySchema);

// Audio Metrics Schema
export const AudioMetricsSchema = z.object({
  speakingPace: z.number(), // words per minute
  silenceDuration: z.number(), // total silence in seconds
  fillerWordCount: z.number(),
  averageVolume: z.number().min(0).max(1).optional(),
  clarityScore: z.number().min(0).max(100).optional(),
});

// Feedback Schemas
export const FeedbackCategorySchema = z.object({
  category: z.string(),
  score: z.number().min(0).max(100),
  details: z.string(),
  suggestions: z.array(z.string()),
  examples: z.array(z.string()).optional(),
});

export const DetailedQuestionFeedbackSchema = z.object({
  question: z.string(),
  response: z.string(),
  feedback: z.string(),
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

export const FeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  categoryScores: z.object({
    technicalKnowledge: z.number().min(0).max(100),
    communicationSkills: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    professionalPresence: z.number().min(0).max(100),
  }),
  detailedFeedback: z.array(DetailedQuestionFeedbackSchema),
  recommendedResources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
    type: z.enum(['article', 'video', 'course', 'book']),
  })),
  nextSteps: z.array(z.string()),
  motivationalMessage: z.string().optional(),
});

// Enhanced Feedback Schema
export const EnhancedFeedbackInputSchema = z.object({
  basicFeedback: FeedbackSchema,
  userGoals: z.string().optional(),
  previousInterviews: z.array(z.object({
    date: z.string().datetime(),
    score: z.number(),
    jobRole: z.string(),
  })).optional(),
});

export const ProgressMetricSchema = z.object({
  metric: z.string(),
  current: z.number(),
  previous: z.number(),
  change: z.number(),
  trend: z.enum(['improving', 'stable', 'declining']),
});

export const ActionPlanSchema = z.object({
  goal: z.string(),
  steps: z.array(z.string()),
  timeline: z.string(),
  resources: z.array(z.string()),
  priority: z.enum(['high', 'medium', 'low']),
});

export const EnhancedFeedbackSchema = z.object({
  personalizedInsights: z.array(z.string()),
  progressAnalysis: z.object({
    trend: z.enum(['improving', 'stable', 'declining']),
    keyMetrics: z.array(ProgressMetricSchema),
    summary: z.string(),
  }).optional(),
  customizedActionPlan: z.array(ActionPlanSchema),
  motivationalMessage: z.string(),
  estimatedTimeToGoal: z.string().optional(),
});

// Credit Management Schemas
export const CreditTransactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.enum(['debit', 'credit', 'refund']),
  reason: z.string(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const CreditBalanceSchema = z.object({
  userId: z.string(),
  balance: z.number(),
  lastUpdated: z.string().datetime(),
  pendingCharges: z.number().optional(),
});

// Error Schema
export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean().optional(),
  details: z.any().optional(),
  timestamp: z.string().datetime(),
});

// Session Status Schema
export const SessionStatusSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['creating', 'active', 'paused', 'ending', 'completed', 'error']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().optional(), // in milliseconds
  transcriptLength: z.number().optional(),
  error: ErrorSchema.optional(),
});