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

export const InterviewQuestionsOutputSchema = z.object({
  systemPrompt: z.string(),
  interviewStructure: z.object({
    warmupQuestions: z.array(z.string()),
    technicalQuestions: z.array(z.string()),
    behavioralQuestions: z.array(z.string()),
    closingQuestions: z.array(z.string()),
  }),
});

// Note: Realtime communication is handled directly via WebSockets, not through Genkit flows

// Realtime Input Schema for WebSocket/SSE communication
export const RealtimeInputSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  jobRole: z.string(),
  interviewType: z.enum(['Behavioral', 'Technical', 'General', 'Leadership']),
  difficulty: z.enum(['entry', 'mid', 'senior']),
  systemInstruction: z.string(),
  audioChunk: z.string().optional(),
  text: z.string().optional(), // Added for direct text input
  timestamp: z.number().optional(), // For latency monitoring
  sequenceNumber: z.number().optional(), // For latency monitoring
  audioMetadata: z.boolean().optional(), // Flag to indicate this is metadata for binary audio
  controlMessage: z.object({
    type: z.enum(['start', 'stop', 'interrupt'])
  }).optional(),
});

// Realtime Output Schema for WebSocket/SSE responses
export const RealtimeOutputSchema = z.object({
  type: z.enum(['session_status', 'transcript', 'audio', 'error', 'control', 'thinking']),
  sessionStatus: z.object({
    sessionId: z.string(),
    status: z.enum(['active', 'completed', 'error']),
    startTime: z.string(),
    duration: z.number(),
    transcript: z.array(z.any()).optional(),
    feedback: z.any().optional(),
  }).optional(),
  transcript: z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    text: z.string(),
    timestamp: z.string(),
    confidence: z.number().optional(),
  }).optional(),
  audio: z.object({
    data: z.string(),
    format: z.string(),
    sampleRate: z.number(),
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
  control: z.object({
    type: z.enum(['ready', 'busy', 'end']),
  }).optional(),
  thinking: z.object({
    isThinking: z.boolean(),
    message: z.string().optional(),
  }).optional(),
  // Latency tracking fields at top level
  echoedTimestamp: z.number().optional(),
  echoedSequenceNumber: z.number().optional(),
});

// Session Config Schema
export const SessionConfigSchema = z.object({
  jobPosition: z.string(),
  jobDescription: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  userName: z.string(),
});

// Streaming Message Schema
export const StreamingMessageSchema = z.object({
  type: z.enum(['session_status', 'transcript', 'audio', 'error', 'control', 'thinking']),
  sessionStatus: z.object({
    sessionId: z.string(),
    status: z.enum(['active', 'completed', 'error']),
    startTime: z.string(),
    duration: z.number(),
    transcript: z.array(z.any()).optional(),
    feedback: z.any().optional(),
  }).optional(),
  transcript: z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    text: z.string(),
    timestamp: z.string(),
    confidence: z.number().optional(),
  }).optional(),
  audio: z.object({
    data: z.string(),
    format: z.string(),
    sampleRate: z.number(),
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string(),
  }).optional(),
  control: z.object({
    type: z.enum(['ready', 'busy', 'end', 'heartbeat']),
    message: z.string().optional(),
    timestamp: z.string().optional(),
  }).optional(),
  thinking: z.object({
    isThinking: z.boolean(),
    message: z.string().optional(),
  }).optional(),
});

// Transcript Schemas
export const TranscriptEntrySchema = z.object({
  id: z.string().optional(),
  speaker: z.enum(['user', 'ai']).optional(),
  role: z.enum(['user', 'assistant']).optional(),
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
  suggestions: z.array(z.string()).optional(),
});

export const FeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  categoryScores: z.object({
    technicalKnowledge: z.number().min(0).max(100),
    communicationSkills: z.number().min(0).max(100).optional(),
    communication: z.number().min(0).max(100).optional(),
    problemSolving: z.number().min(0).max(100),
    professionalPresence: z.number().min(0).max(100).optional(),
    adaptability: z.number().min(0).max(100).optional(),
    culturalFit: z.number().min(0).max(100).optional(),
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
  summary: z.string().optional(),
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
  feedback: FeedbackSchema.optional(),
  transcript: z.array(TranscriptEntrySchema).optional(),
});

// Type exports
export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type StreamingMessage = z.infer<typeof StreamingMessageSchema>;
export type TranscriptEntry = z.infer<typeof TranscriptEntrySchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type InterviewSessionInput = z.infer<typeof InterviewSessionInputSchema>;
export type InterviewQuestionsOutput = z.infer<typeof InterviewQuestionsOutputSchema>;
export type AudioMetrics = z.infer<typeof AudioMetricsSchema>;
export type ErrorSchema = z.infer<typeof ErrorSchema>;
export type RealtimeInput = z.infer<typeof RealtimeInputSchema>;
export type RealtimeOutput = z.infer<typeof RealtimeOutputSchema>;
