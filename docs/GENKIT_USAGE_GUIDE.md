# Genkit Usage Guide for VocaHire

## Overview

This document clarifies the proper use of Genkit within VocaHire's architecture. Genkit is a powerful AI orchestration framework, but it's designed for specific use cases that complement, not replace, VocaHire's real-time audio streaming capabilities.

## Architecture Principle

```
┌─────────────────────────────────────────────────────────────┐
│                     VocaHire Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRE-INTERVIEW (Genkit ✅)      INTERVIEW (Direct API ✅)   │
│  ┌─────────────────────┐       ┌──────────────────────┐   │
│  │ Generate Questions  │       │  Google Live API     │   │
│  │ Prepare System     │       │  WebSocket Direct    │   │
│  │ Analyze Resume     │       │  Real-time Audio     │   │
│  └─────────────────────┘       └──────────────────────┘   │
│                                                             │
│  POST-INTERVIEW (Genkit ✅)                                 │
│  ┌─────────────────────┐                                   │
│  │ Generate Feedback  │                                    │
│  │ Analyze Performance│                                    │
│  │ Create Action Plan │                                    │
│  └─────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

## When to Use Genkit

### ✅ GOOD Use Cases

1. **Pre-Interview Preparation**
   - Generating tailored interview questions
   - Creating system prompts for the interviewer
   - Analyzing resumes and job descriptions
   - Personalizing interview structure

2. **Post-Interview Analysis**
   - Generating comprehensive feedback
   - Analyzing transcript for insights
   - Creating improvement recommendations
   - Generating performance metrics

3. **Non-Real-Time AI Features**
   - Resume parsing and analysis
   - Job matching algorithms
   - Learning path generation
   - Email content generation

### ❌ BAD Use Cases

1. **Real-Time Audio Streaming**
   - Genkit cannot handle WebSocket connections
   - No support for continuous audio streams
   - Adds unnecessary latency

2. **Low-Latency Requirements**
   - Direct API calls are faster
   - Genkit adds abstraction overhead

3. **Custom Protocol Handling**
   - Google Live API has specific message formats
   - Genkit's flow pattern doesn't fit

## Current Genkit Flows

### 1. Generate Interview Questions (`generateInterviewQuestions`)

**Purpose**: Create personalized interview questions based on job role and difficulty

```typescript
const questions = await generateInterviewQuestions({
  userId: 'user123',
  jobRole: 'Senior React Developer',
  difficulty: 'senior',
  jobDescription: '...',
  resume: '...',
  focusAreas: ['React Hooks', 'Performance', 'Testing']
});
```

**Output**:
- System prompt for AI interviewer
- Structured question sets (warmup, technical, behavioral, closing)

### 2. Generate Interview Feedback (`generateInterviewFeedback`)

**Purpose**: Analyze interview transcript and provide comprehensive feedback

```typescript
const feedback = await generateInterviewFeedback({
  sessionId: 'session123',
  transcript: transcriptArray,
  jobRole: 'Senior React Developer',
  difficulty: 'senior',
  audioMetrics: {
    speakingPace: 140,
    silenceDuration: 45,
    fillerWordCount: 12
  }
});
```

**Output**:
- Overall performance score
- Category-specific scores
- Detailed question-by-question feedback
- Recommended resources
- Action items

### 3. Generate Enhanced Feedback (`generateEnhancedFeedback`)

**Purpose**: Provide personalized insights based on user history

```typescript
const enhanced = await generateEnhancedFeedback({
  basicFeedback: feedbackObject,
  userGoals: 'Become a tech lead',
  previousInterviews: [...]
});
```

**Output**:
- Progress tracking
- Personalized action plan
- Motivational messaging

## Integration Points

### Pre-Interview Flow

```typescript
// 1. User schedules interview
const userId = getCurrentUserId();

// 2. Generate questions using Genkit
const { systemPrompt, interviewStructure } = await generateInterviewQuestions({
  userId,
  jobRole: selectedRole,
  difficulty: selectedDifficulty,
  resume: uploadedResume
});

// 3. Pass system prompt to Live API (NOT through Genkit)
const liveClient = new GoogleLiveAPIClient({
  apiKey: GOOGLE_AI_API_KEY,
  systemInstruction: { parts: [{ text: systemPrompt }] }
});
```

### During Interview

```typescript
// Direct WebSocket connection - NO GENKIT
liveClient.on('audioData', handleAudioStream);
liveClient.on('transcript', saveTranscript);
liveClient.connect();
```

### Post-Interview Flow

```typescript
// 1. Interview ends, transcript saved
const transcript = await getInterviewTranscript(sessionId);

// 2. Generate feedback using Genkit
const feedback = await generateInterviewFeedback({
  sessionId,
  transcript,
  jobRole,
  difficulty
});

// 3. Save and display feedback
await saveFeedback(userId, sessionId, feedback);
```

## Best Practices

1. **Keep Flows Focused**
   - Each flow should have a single, clear purpose
   - Don't mix real-time and batch processing

2. **Use Proper Schemas**
   - Define Zod schemas for all inputs/outputs
   - Validate data at flow boundaries

3. **Handle Errors Gracefully**
   - Check for null responses from AI
   - Provide meaningful error messages

4. **Optimize for UX**
   - Pre-generate content where possible
   - Cache frequently used prompts
   - Show loading states during generation

## Future Enhancements

### Potential New Flows

1. **Resume Analysis Flow**
   ```typescript
   generateResumeInsights(resume: string): ResumeAnalysis
   ```

2. **Interview Preparation Flow**
   ```typescript
   generatePreparationPlan(jobRole: string, userProfile: UserProfile): PreparationPlan
   ```

3. **Progress Tracking Flow**
   ```typescript
   analyzeUserProgress(userId: string): ProgressReport
   ```

### Integration Opportunities

1. **Batch Processing**
   - Nightly feedback enhancement
   - Weekly progress reports
   - Monthly skill assessments

2. **Webhook Triggers**
   - Post-interview feedback generation
   - Achievement notifications
   - Recommendation updates

## Common Mistakes to Avoid

1. **Don't Use Genkit for WebSockets**
   ```typescript
   // ❌ WRONG
   const flow = ai.defineFlow({...}, async (input, sideChannel) => {
     const ws = new WebSocket(...); // This won't work properly
   });
   
   // ✅ RIGHT
   const liveClient = new GoogleLiveAPIClient({...});
   ```

2. **Don't Mix Concerns**
   ```typescript
   // ❌ WRONG - Trying to return WebSocket tokens from Genkit
   return { wsToken, liveApiEndpoint, feedback };
   
   // ✅ RIGHT - Keep flows focused
   return { feedback, recommendations };
   ```

3. **Don't Ignore Type Safety**
   ```typescript
   // ❌ WRONG
   const output = response.output(); // Might be null
   
   // ✅ RIGHT
   const output = response.output;
   if (!output) throw new Error('No output generated');
   ```

## Monitoring and Debugging

1. **Use Genkit's Built-in Tools**
   - Developer UI for flow testing
   - Trace viewing for debugging
   - Metrics for performance monitoring

2. **Log Strategic Points**
   - Flow inputs/outputs
   - Generation times
   - Error states

3. **Test Flows Independently**
   - Unit test schemas
   - Integration test with mock AI responses
   - E2E test complete flows

## Conclusion

Genkit is a powerful tool for VocaHire's AI-powered features, but it must be used appropriately. By following this guide, you can leverage Genkit's strengths while maintaining the performance and real-time capabilities that make VocaHire exceptional.

Remember: **Genkit for orchestration, Direct APIs for real-time.**