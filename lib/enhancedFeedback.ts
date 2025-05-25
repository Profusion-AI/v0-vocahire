import { z } from "zod"

// Enhanced feedback schema
const EnhancedFeedbackSchema = z.object({
  enhancedReport: z.object({
    detailedAnswerAnalysis: z.array(z.object({
      questionNumber: z.number(),
      question: z.string(),
      originalAnswer: z.string(),
      analysis: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        suggestedImprovement: z.string(),
        alternativePhrasings: z.array(z.string()).optional(),
        starMethodAdherence: z.number().min(0).max(100).optional() // For behavioral questions
      })
    })),
    
    overallPerformanceMetrics: z.object({
      communicationClarity: z.number().min(0).max(100),
      technicalAccuracy: z.number().min(0).max(100),
      responseStructure: z.number().min(0).max(100),
      confidence: z.number().min(0).max(100),
      enthusiasm: z.number().min(0).max(100)
    }),
    
    industryBenchmarking: z.object({
      percentile: z.number().min(0).max(100),
      comparisonToTopPerformers: z.string(),
      industrySpecificStrengths: z.array(z.string()),
      areasToMatchIndustryStandards: z.array(z.string())
    }),
    
    customActionPlan: z.object({
      immediate: z.array(z.object({
        action: z.string(),
        rationale: z.string(),
        expectedImpact: z.string()
      })),
      shortTerm: z.array(z.object({
        action: z.string(),
        timeline: z.string(),
        resources: z.array(z.string())
      })),
      longTerm: z.array(z.object({
        action: z.string(),
        timeline: z.string(),
        milestones: z.array(z.string())
      }))
    })
  }),
  
  toneAnalysis: z.object({
    overallTone: z.string(),
    emotionalProgression: z.array(z.object({
      segment: z.number(),
      dominantEmotion: z.string(),
      confidence: z.number().min(0).max(100),
      notes: z.string()
    })),
    communicationStyle: z.string(),
    perceivedEnergy: z.string()
  }),
  
  keywordRelevanceScore: z.number().min(0).max(100),
  
  sentimentProgression: z.array(z.object({
    timestamp: z.number(),
    sentiment: z.enum(["positive", "neutral", "negative"]),
    score: z.number().min(-1).max(1)
  })),
  
  starMethodScore: z.number().min(0).max(100).nullable()
})

export type EnhancedFeedbackData = z.infer<typeof EnhancedFeedbackSchema>

interface InterviewMessage {
  role: string
  content: string
  timestamp?: number
}

interface SessionContext {
  jobTitle?: string | null
  jdContext?: string | null
  resumeSnapshot?: any
  duration?: number | null
  completedAt?: Date | null
}

export async function generateEnhancedInterviewFeedback(
  transcript: InterviewMessage[],
  sessionContext: SessionContext,
  existingStructuredFeedback?: any
): Promise<EnhancedFeedbackData> {
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  // Extract Q&A pairs from transcript
  const qaPairs = extractQuestionAnswerPairs(transcript)
  
  // Construct enhanced prompt
  const systemPrompt = `You are an expert interview coach providing PREMIUM, in-depth analysis of a mock interview.

CONTEXT:
- Job Title: ${sessionContext.jobTitle || "Not specified"}
- Job Description Keywords: ${extractKeywords(sessionContext.jdContext)}
- Interview Duration: ${sessionContext.duration ? Math.round(sessionContext.duration / 60) + " minutes" : "Unknown"}
- Total Q&A Exchanges: ${qaPairs.length}

Your task is to provide an ENHANCED, comprehensive analysis that goes beyond basic feedback. This is a PREMIUM service.

REQUIRED OUTPUT FORMAT (JSON):
{
  "enhancedReport": {
    "detailedAnswerAnalysis": [
      // For each Q&A pair, provide deep analysis
      {
        "questionNumber": 1,
        "question": "Tell me about yourself",
        "originalAnswer": "User's actual response",
        "analysis": {
          "strengths": ["Specific strong points"],
          "weaknesses": ["Areas that need work"],
          "suggestedImprovement": "Detailed suggestion for better response",
          "alternativePhrasings": ["Example 1 of better phrasing", "Example 2"],
          "starMethodAdherence": 85 // Only for behavioral questions, 0-100
        }
      }
    ],
    
    "overallPerformanceMetrics": {
      "communicationClarity": 75, // 0-100 score
      "technicalAccuracy": 80,
      "responseStructure": 70,
      "confidence": 65, // Inferred from language patterns
      "enthusiasm": 72
    },
    
    "industryBenchmarking": {
      "percentile": 75, // Where they rank vs typical candidates
      "comparisonToTopPerformers": "Detailed comparison text",
      "industrySpecificStrengths": ["Strength 1", "Strength 2"],
      "areasToMatchIndustryStandards": ["Area 1", "Area 2"]
    },
    
    "customActionPlan": {
      "immediate": [
        {
          "action": "Practice STAR method responses",
          "rationale": "Your behavioral answers lack structure",
          "expectedImpact": "20% improvement in response clarity"
        }
      ],
      "shortTerm": [
        {
          "action": "Research company-specific examples",
          "timeline": "Next 1-2 weeks",
          "resources": ["Company blog", "Recent news articles"]
        }
      ],
      "longTerm": [
        {
          "action": "Build portfolio of 10 STAR stories",
          "timeline": "Next 30 days",
          "milestones": ["Week 1: 3 stories", "Week 2: 6 stories", "Week 4: 10 stories"]
        }
      ]
    }
  },
  
  "toneAnalysis": {
    "overallTone": "Professional but slightly nervous",
    "emotionalProgression": [
      {
        "segment": 1,
        "dominantEmotion": "anxious",
        "confidence": 60,
        "notes": "Started hesitant but improved"
      }
    ],
    "communicationStyle": "Analytical with good examples",
    "perceivedEnergy": "Moderate - could show more enthusiasm"
  },
  
  "keywordRelevanceScore": 72, // How well they incorporated JD keywords
  
  "sentimentProgression": [
    {"timestamp": 0, "sentiment": "neutral", "score": 0.1},
    {"timestamp": 120000, "sentiment": "positive", "score": 0.6}
  ],
  
  "starMethodScore": 65 // Overall STAR method usage score
}

IMPORTANT INSTRUCTIONS:
1. Base emotional tone analysis on word choice, sentence structure, and phrasing patterns
2. Be specific and actionable in all suggestions
3. Reference actual phrases from the interview
4. Provide industry-specific insights based on the job title
5. Give concrete examples for improvements
6. Make the feedback feel PREMIUM - detailed, insightful, and valuable
7. If the interview is incomplete or brief, still provide valuable insights based on what's available`

  const userPrompt = `Analyze this interview transcript and provide enhanced feedback:

${qaPairs.map((qa, i) => `
Q${i + 1}: ${qa.question}
A${i + 1}: ${qa.answer}
`).join('\n')}

Remember to:
- Analyze each answer in detail
- Infer emotional tone from language patterns
- Provide specific alternative phrasings
- Create a personalized 30-day action plan
- Compare performance to industry standards`

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API error for enhanced feedback:", response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const rawOutput = data.choices[0].message.content

    // Parse and validate with Zod
    const parsed = JSON.parse(rawOutput)
    const validated = EnhancedFeedbackSchema.parse(parsed)
    
    return validated
    
  } catch (error) {
    console.error("Error generating enhanced feedback:", error)
    
    // Return a structured default if generation fails
    // This ensures we can still provide some value even if AI fails
    return {
      enhancedReport: {
        detailedAnswerAnalysis: qaPairs.map((qa, i) => ({
          questionNumber: i + 1,
          question: qa.question,
          originalAnswer: qa.answer,
          analysis: {
            strengths: ["Unable to generate detailed analysis"],
            weaknesses: ["Please try regenerating feedback"],
            suggestedImprovement: "Enhanced analysis temporarily unavailable",
            alternativePhrasings: []
          }
        })),
        overallPerformanceMetrics: {
          communicationClarity: 0,
          technicalAccuracy: 0,
          responseStructure: 0,
          confidence: 0,
          enthusiasm: 0
        },
        industryBenchmarking: {
          percentile: 0,
          comparisonToTopPerformers: "Analysis unavailable",
          industrySpecificStrengths: [],
          areasToMatchIndustryStandards: []
        },
        customActionPlan: {
          immediate: [],
          shortTerm: [],
          longTerm: []
        }
      },
      toneAnalysis: {
        overallTone: "Unable to analyze",
        emotionalProgression: [],
        communicationStyle: "Analysis unavailable",
        perceivedEnergy: "Analysis unavailable"
      },
      keywordRelevanceScore: 0,
      sentimentProgression: [],
      starMethodScore: null
    }
  }
}

// Helper function to extract Q&A pairs
function extractQuestionAnswerPairs(transcript: InterviewMessage[]): Array<{question: string, answer: string}> {
  const pairs: Array<{question: string, answer: string}> = []
  
  for (let i = 0; i < transcript.length - 1; i++) {
    if (transcript[i].role === "assistant" && transcript[i + 1].role === "user") {
      pairs.push({
        question: transcript[i].content,
        answer: transcript[i + 1].content
      })
    }
  }
  
  return pairs
}

// Helper function to extract keywords from job description
function extractKeywords(jdContext: string | null | undefined): string {
  if (!jdContext) return "Not provided"
  
  // Simple keyword extraction - in production, use NLP library
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'as', 'by', 'from', 'will', 'be', 'are', 'is', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did'])
  
  const words = jdContext.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
  
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
    .join(", ")
}