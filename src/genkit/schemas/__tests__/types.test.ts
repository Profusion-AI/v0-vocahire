import { describe, it, expect } from 'vitest';
import {
  TranscriptEntrySchema,
  TranscriptSchema,
  FeedbackCategorySchema,
  FeedbackSchema,
  InterviewDifficultySchema,
  AudioMetricsSchema,
  ErrorSchema,
  SessionStatusSchema,
  InterviewSessionInputSchema,
  InterviewQuestionsOutputSchema,
} from '../types';

describe('InterviewDifficultySchema', () => {
  it('should validate valid difficulties', () => {
    expect(() => InterviewDifficultySchema.parse('entry')).not.toThrow();
    expect(() => InterviewDifficultySchema.parse('mid')).not.toThrow();
    expect(() => InterviewDifficultySchema.parse('senior')).not.toThrow();
  });

  it('should reject invalid difficulty', () => {
    expect(() => InterviewDifficultySchema.parse('expert')).toThrow();
    expect(() => InterviewDifficultySchema.parse('beginner')).toThrow();
  });
});

describe('InterviewSessionInputSchema', () => {
  it('should validate minimal valid input', () => {
    const input = {
      userId: 'user123',
      jobRole: 'Software Engineer',
      difficulty: 'mid',
    };
    expect(() => InterviewSessionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate complete input with optional fields', () => {
    const input = {
      userId: 'user123',
      jobRole: 'Software Engineer',
      difficulty: 'senior',
      jobDescription: 'Full-stack developer position',
      resume: 'Experience with React and Node.js...',
      focusAreas: ['React', 'System Design', 'Algorithms'],
    };
    expect(() => InterviewSessionInputSchema.parse(input)).not.toThrow();
  });
});

describe('InterviewQuestionsOutputSchema', () => {
  it('should validate valid interview questions output', () => {
    const output = {
      systemPrompt: 'You are a professional interviewer conducting a technical interview.',
      interviewStructure: {
        warmupQuestions: ['Tell me about yourself', 'Why are you interested in this role?'],
        technicalQuestions: ['Explain REST APIs', 'What is dependency injection?', 'Describe SOLID principles', 'How do you handle errors?'],
        behavioralQuestions: ['Tell me about a challenging project', 'How do you handle conflicts?', 'Describe a time you failed'],
        closingQuestions: ['Do you have any questions for me?'],
      },
    };
    expect(() => InterviewQuestionsOutputSchema.parse(output)).not.toThrow();
  });

  it('should validate empty question arrays', () => {
    const output = {
      systemPrompt: 'Brief interview',
      interviewStructure: {
        warmupQuestions: [],
        technicalQuestions: [],
        behavioralQuestions: [],
        closingQuestions: [],
      },
    };
    expect(() => InterviewQuestionsOutputSchema.parse(output)).not.toThrow();
  });

  it('should reject missing fields', () => {
    const invalidOutput = {
      systemPrompt: 'You are an interviewer',
      // Missing interviewStructure
    };
    expect(() => InterviewQuestionsOutputSchema.parse(invalidOutput)).toThrow();
  });
});

describe('TranscriptEntrySchema', () => {
  it('should validate a complete transcript entry', () => {
    const entry = {
      speaker: 'user',
      text: 'Hello there!',
      timestamp: new Date().toISOString(),
      confidence: 0.95,
      duration: 1500,
    };
    expect(() => TranscriptEntrySchema.parse(entry)).not.toThrow();
  });

  it('should validate confidence bounds', () => {
    const validEntry = {
      speaker: 'ai',
      text: 'Hi!',
      timestamp: new Date().toISOString(),
      confidence: 0.5,
    };
    expect(() => TranscriptEntrySchema.parse(validEntry)).not.toThrow();

    const invalidLow = { ...validEntry, confidence: -0.1 };
    expect(() => TranscriptEntrySchema.parse(invalidLow)).toThrow();

    const invalidHigh = { ...validEntry, confidence: 1.1 };
    expect(() => TranscriptEntrySchema.parse(invalidHigh)).toThrow();
  });
});

describe('AudioMetricsSchema', () => {
  it('should validate complete audio metrics', () => {
    const metrics = {
      speakingPace: 150,
      silenceDuration: 5.2,
      fillerWordCount: 3,
      averageVolume: 0.7,
      clarityScore: 85,
    };
    expect(() => AudioMetricsSchema.parse(metrics)).not.toThrow();
  });

  it('should validate minimal audio metrics', () => {
    const metrics = {
      speakingPace: 120,
      silenceDuration: 0,
      fillerWordCount: 0,
    };
    expect(() => AudioMetricsSchema.parse(metrics)).not.toThrow();
  });

  it('should validate volume and clarity bounds', () => {
    const baseMetrics = {
      speakingPace: 150,
      silenceDuration: 5,
      fillerWordCount: 2,
    };

    // Valid bounds
    expect(() => AudioMetricsSchema.parse({ ...baseMetrics, averageVolume: 0, clarityScore: 0 })).not.toThrow();
    expect(() => AudioMetricsSchema.parse({ ...baseMetrics, averageVolume: 1, clarityScore: 100 })).not.toThrow();

    // Invalid bounds
    expect(() => AudioMetricsSchema.parse({ ...baseMetrics, averageVolume: -0.1 })).toThrow();
    expect(() => AudioMetricsSchema.parse({ ...baseMetrics, averageVolume: 1.1 })).toThrow();
    expect(() => AudioMetricsSchema.parse({ ...baseMetrics, clarityScore: -1 })).toThrow();
    expect(() => AudioMetricsSchema.parse({ ...baseMetrics, clarityScore: 101 })).toThrow();
  });
});

describe('FeedbackSchema', () => {
  it('should validate a complete feedback object', () => {
    const feedback = {
      overallScore: 85,
      strengths: ['Clear communication', 'Good technical knowledge'],
      improvementAreas: ['Could provide more examples'],
      categoryScores: {
        technicalKnowledge: 90,
        communicationSkills: 80,
        problemSolving: 85,
        professionalPresence: 88,
      },
      detailedFeedback: [{
        question: 'Tell me about React hooks',
        response: 'React hooks are...',
        feedback: 'Good explanation',
        score: 85,
        strengths: ['Clear explanation'],
        improvements: ['Add more examples'],
      }],
      recommendedResources: [{
        title: 'React Documentation',
        url: 'https://react.dev',
        description: 'Official React docs',
        type: 'article',
      }],
      nextSteps: ['Practice system design', 'Review algorithms'],
      motivationalMessage: 'Great job! Keep practicing.',
    };
    expect(() => FeedbackSchema.parse(feedback)).not.toThrow();
  });

  it('should validate score bounds', () => {
    const baseFeedback = {
      strengths: ['Good'],
      improvementAreas: ['Practice'],
      categoryScores: {
        technicalKnowledge: 50,
        communicationSkills: 50,
        problemSolving: 50,
        professionalPresence: 50,
      },
      detailedFeedback: [],
      recommendedResources: [],
      nextSteps: ['Continue'],
    };

    // Valid bounds
    expect(() => FeedbackSchema.parse({ ...baseFeedback, overallScore: 0 })).not.toThrow();
    expect(() => FeedbackSchema.parse({ ...baseFeedback, overallScore: 100 })).not.toThrow();

    // Invalid bounds
    expect(() => FeedbackSchema.parse({ ...baseFeedback, overallScore: -1 })).toThrow();
    expect(() => FeedbackSchema.parse({ ...baseFeedback, overallScore: 101 })).toThrow();
  });

  it('should validate resource types', () => {
    const baseFeedback = {
      overallScore: 75,
      strengths: ['Good'],
      improvementAreas: ['Practice'],
      categoryScores: {
        technicalKnowledge: 75,
        communicationSkills: 75,
        problemSolving: 75,
        professionalPresence: 75,
      },
      detailedFeedback: [],
      nextSteps: ['Continue'],
    };

    const validTypes = ['article', 'video', 'course', 'book'];
    validTypes.forEach(type => {
      const feedback = {
        ...baseFeedback,
        recommendedResources: [{
          title: 'Resource',
          url: 'https://example.com',
          description: 'A resource',
          type,
        }],
      };
      expect(() => FeedbackSchema.parse(feedback)).not.toThrow();
    });

    const invalidResource = {
      ...baseFeedback,
      recommendedResources: [{
        title: 'Resource',
        url: 'https://example.com',
        description: 'A resource',
        type: 'podcast', // Invalid type
      }],
    };
    expect(() => FeedbackSchema.parse(invalidResource)).toThrow();
  });
});

describe('ErrorSchema', () => {
  it('should validate complete error object', () => {
    const error = {
      code: 'API_ERROR',
      message: 'Something went wrong',
      retryable: true,
      details: { statusCode: 500, endpoint: '/api/test' },
      timestamp: new Date().toISOString(),
    };
    expect(() => ErrorSchema.parse(error)).not.toThrow();
  });

  it('should validate minimal error object', () => {
    const error = {
      code: 'UNKNOWN',
      message: 'Error occurred',
      timestamp: new Date().toISOString(),
    };
    expect(() => ErrorSchema.parse(error)).not.toThrow();
  });
});

describe('SessionStatusSchema', () => {
  it('should validate all session statuses', () => {
    const statuses = ['creating', 'active', 'paused', 'ending', 'completed', 'error'];
    const baseSession = {
      sessionId: 'session123',
      startTime: new Date().toISOString(),
    };

    statuses.forEach(status => {
      const session = { ...baseSession, status };
      expect(() => SessionStatusSchema.parse(session)).not.toThrow();
    });
  });

  it('should validate complete session with optional fields', () => {
    const session = {
      sessionId: 'session123',
      status: 'completed',
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: 30 * 60 * 1000,
      transcriptLength: 150,
    };
    expect(() => SessionStatusSchema.parse(session)).not.toThrow();
  });

  it('should validate session with error', () => {
    const session = {
      sessionId: 'session123',
      status: 'error',
      startTime: new Date().toISOString(),
      error: {
        code: 'CONNECTION_LOST',
        message: 'WebSocket disconnected',
        retryable: true,
        timestamp: new Date().toISOString(),
      },
    };
    expect(() => SessionStatusSchema.parse(session)).not.toThrow();
  });
});