// Feedback type definitions

export interface FeedbackCategory {
  category: string
  rating: FeedbackRating
  feedback: string
}

export type FeedbackRating = 
  | "Excellent" 
  | "Good" 
  | "Satisfactory" 
  | "Needs Improvement" 
  | "Consider" 
  | "Not Evaluated"
  | "Info"
  | "Feedback"

export interface BasicFeedback {
  summary: string
  strengths: string
  areasForImprovement: string
  transcriptScore: number
  interviewMetrics?: {
    totalMessages: number
    userResponses: number
    assistantQuestions: number
    completeness: "complete" | "partial"
  }
}

export interface EnhancedFeedback extends BasicFeedback {
  // Industry benchmarking
  industryComparison: {
    percentile: number
    averageScore: number
    topPerformerScore: number
    industry: string
  }
  
  // Question-by-question analysis
  responseAnalysis: Array<{
    question: string
    response: string
    rating: FeedbackRating
    strengths: string[]
    improvements: string[]
    suggestedResponse?: string
  }>
  
  // Communication patterns
  communicationMetrics: {
    averageResponseTime: number
    wordCount: number
    vocabularyComplexity: "basic" | "intermediate" | "advanced"
    sentenceStructure: "simple" | "varied" | "complex"
    confidenceLevel: number // 0-100
    enthusiasm: number // 0-100
  }
  
  // Custom action plan
  actionPlan: {
    immediate: string[] // Things to work on right away
    shortTerm: string[] // 1-2 weeks
    longTerm: string[] // 30 days
    resources: Array<{
      title: string
      url: string
      type: "article" | "video" | "course" | "book"
    }>
  }
  
  // Advanced insights
  insights: {
    personalityTraits: string[]
    culturalFit: string
    leadershipPotential: number // 0-100
    technicalDepth: number // 0-100
    problemSolvingStyle: "analytical" | "creative" | "systematic" | "intuitive"
  }
}

export interface FeedbackResponse {
  success: boolean
  feedback?: BasicFeedback
  error?: string
  details?: string
}

export interface EnhancedFeedbackResponse {
  success: boolean
  feedback?: EnhancedFeedback
  creditsDeducted?: number
  error?: string
}