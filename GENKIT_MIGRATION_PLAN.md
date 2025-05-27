# 🚀 VocaHire GenKit Migration Plan

**Created**: May 27, 2025  
**Target Completion**: May 31, 2025  
**Launch Date**: June 1, 2025

## 🎯 Executive Summary

We're completely revamping VocaHire's interview module using Google's GenKit framework and Live API. This migration will simplify our architecture, improve reliability, and leverage Google's production-tested AI infrastructure.

### Key Changes:
- **OUT**: Custom WebRTC orchestrator, OpenAI dependencies
- **IN**: GenKit flows, Google Live API, streamlined architecture

## 🏗️ Architecture Overview

### Current vs. New Architecture

**Current (Complex)**:
```
Browser → WebRTC → Custom Orchestrator → Google Cloud AI
                         ↓
                    Complex State Management
                         ↓
                    Database/Redis
```

**New (Simplified)**:
```
Browser → GenKit Service → Google Live API
              ↓
         Clean Flows
              ↓
         Database
```

### Technology Stack

1. **GenKit Framework**
   - AI workflow orchestration
   - Type-safe flows with Zod
   - Built-in debugging tools
   - Streaming support

2. **Google Live API**
   - Real-time audio streaming
   - Low-latency voice interactions
   - 30+ languages support
   - WebSocket-based

3. **Next.js Integration**
   - `@genkit-ai/next` plugin
   - Server actions
   - Streaming responses

## 📋 Implementation Phases

### Phase 1: GenKit Setup (Day 1 - May 27)

**Tasks**:
1. Install GenKit dependencies
   ```bash
   npm install genkit @genkit-ai/next @genkit-ai/googleai
   npm install -g genkit-cli
   ```

2. Create GenKit directory structure
   ```
   src/genkit/
   ├── flows/
   │   ├── interview.ts      # Interview session flows
   │   ├── feedback.ts       # Feedback generation
   │   └── credits.ts       # Credit management
   ├── prompts/
   │   └── interview.ts      # Interview prompts
   ├── schemas/
   │   └── types.ts          # Zod schemas
   └── index.ts              # Main config
   ```

3. Define core flows
   - `createInterviewSession`
   - `generateFeedback`
   - `processTranscript`
   - `manageCredits`

4. Set up Developer UI
   ```bash
   genkit start -- npm run dev
   ```

**Deliverables**:
- [ ] GenKit installed and configured
- [ ] Basic flow structure created
- [ ] Developer UI running
- [ ] Initial flow tests passing

### Phase 2: Live API Integration (Day 2 - May 28)

**Tasks**:
1. Configure Live API credentials
   - Set up Google AI Studio/Vertex AI
   - Configure authentication
   - Test WebSocket connections

2. Create Live API client
   ```typescript
   // src/lib/live-api-client.ts
   export class LiveAPIClient {
     // WebSocket management
     // Audio streaming
     // Session handling
   }
   ```

3. Integrate with GenKit flows
   - Session initialization flow
   - Audio format handling (16kHz → 24kHz)
   - Real-time transcription

4. Handle WebSocket lifecycle
   - Connection management
   - Reconnection logic
   - Error handling

**Deliverables**:
- [ ] Live API credentials configured
- [ ] WebSocket client implemented
- [ ] Audio streaming tested
- [ ] Transcription working

### Phase 3: Frontend Rework (Day 3 - May 29)

**Tasks**:
1. Remove old interview components
   - Delete WebRTC logic
   - Remove OpenAI dependencies
   - Clean up unused code

2. Create new interview flow
   ```
   app/interview-v2/
   ├── page.tsx              # Main interview page
   ├── components/
   │   ├── SessionSetup.tsx  # Job role selection
   │   ├── LiveInterview.tsx # Active interview
   │   └── FeedbackView.tsx  # Results display
   └── hooks/
       └── useLiveAPI.ts     # Live API hook
   ```

3. Implement UI components
   - Audio level indicators
   - Connection status
   - Real-time transcript
   - Streaming feedback

4. Update API routes
   ```
   app/api/genkit/
   ├── interview/route.ts
   ├── feedback/route.ts
   └── credits/route.ts
   ```

**Deliverables**:
- [ ] Old code removed
- [ ] New components created
- [ ] Live API integration working
- [ ] UI responsive and polished

### Phase 4: Database & State Management (Day 4 - May 30)

**Tasks**:
1. Update Prisma schema
   ```prisma
   model InterviewSession {
     id            String   @id
     userId        String
     status        String   // 'setup', 'active', 'completed'
     liveSessionId String?  // Live API session
     transcript    Json?
     feedback      Json?
     // ... other fields
   }
   ```

2. Migrate existing data
   - Preserve user interviews
   - Update feedback format
   - Handle credits properly

3. Implement session store
   - Remove Redis complexity
   - Use database for state
   - Simplify session management

4. Error handling & recovery
   - Connection failures
   - Credit refunds
   - Partial sessions

**Deliverables**:
- [ ] Database schema updated
- [ ] Migration scripts ready
- [ ] Session management simplified
- [ ] Error handling robust

### Phase 5: Testing & Launch Prep (Day 5 - May 31)

**Tasks**:
1. End-to-end testing
   - Complete interview flow
   - Credit deduction
   - Feedback generation
   - Error scenarios

2. Performance optimization
   - Audio latency < 1.5s
   - Page load times
   - Bundle size

3. Production deployment
   - Update Cloud Run configs
   - Environment variables
   - Remove dev flags
   - **CRITICAL**: Remove all DEV_SKIP_AUTH

4. Launch checklist
   - [ ] All flows tested
   - [ ] Live API stable
   - [ ] Credits working
   - [ ] Error handling complete
   - [ ] Monitoring in place

**Deliverables**:
- [ ] All tests passing
- [ ] Production deployed
- [ ] Performance verified
- [ ] Ready for launch

## 🛠️ Technical Implementation Details

### GenKit Flow Examples

**Interview Session Flow**:
```typescript
export const createInterviewSession = defineFlow({
  name: 'createInterviewSession',
  inputSchema: z.object({
    userId: z.string(),
    jobRole: z.string(),
    difficulty: z.enum(['entry', 'mid', 'senior']),
    resume: z.string().optional()
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    liveApiEndpoint: z.string(),
    wsToken: z.string(),
    systemPrompt: z.string()
  })
}, async (input) => {
  // 1. Check user credits
  // 2. Create DB session
  // 3. Initialize Live API
  // 4. Return connection details
});
```

**Feedback Generation Flow**:
```typescript
export const generateFeedback = defineFlow({
  name: 'generateFeedback',
  inputSchema: z.object({
    sessionId: z.string(),
    transcript: TranscriptSchema
  }),
  outputSchema: FeedbackSchema,
  streamSchema: z.object({
    category: z.string(),
    content: z.string()
  })
}, async (input, streamingCallback) => {
  // Stream feedback as it's generated
});
```

### Live API WebSocket Handler

```typescript
class InterviewWebSocket {
  private ws: WebSocket;
  private audioContext: AudioContext;
  
  async connect(endpoint: string, token: string) {
    this.ws = new WebSocket(endpoint);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'audio':
          this.playAudio(message.data);
          break;
        case 'transcript':
          this.updateTranscript(message.data);
          break;
        case 'end':
          this.handleEnd();
          break;
      }
    };
  }
  
  sendAudio(audioData: ArrayBuffer) {
    this.ws.send(JSON.stringify({
      type: 'audio',
      data: audioData
    }));
  }
}
```

## 🚨 Critical Considerations

### What We're NOT Doing
1. **No MCP Server** - Using GenKit Developer Tools instead
2. **No custom WebRTC** - Live API handles media
3. **No Redis sessions** - Database is sufficient
4. **No complex orchestration** - GenKit flows simplify

### Risk Mitigation
1. **Rollback Plan**: Keep current system running at `/interview-legacy`
2. **Feature Flags**: Deploy behind feature flag initially
3. **Gradual Rollout**: Test with internal users first
4. **Credit Protection**: Refund on technical failures

### Performance Targets
- **Audio Latency**: < 1.5 seconds
- **Session Start**: < 3 seconds
- **Feedback Generation**: < 10 seconds
- **Page Load**: < 2 seconds

## 📊 Success Metrics

1. **Technical Metrics**
   - Latency reduction: 30%
   - Error rate: < 0.1%
   - Session completion: > 95%

2. **User Metrics**
   - Interview satisfaction: > 4.5/5
   - Feedback quality: Improved
   - Support tickets: Reduced

3. **Business Metrics**
   - Infrastructure cost: -40%
   - Development velocity: +50%
   - Time to market: Met deadline

## 🎯 Go/No-Go Decision Points

**May 28 EOD**: Live API working?
- ✅ Proceed with frontend
- ❌ Pivot to fallback plan

**May 30 EOD**: E2E tests passing?
- ✅ Deploy to production
- ❌ Delay launch 1 week

**May 31 EOD**: Production stable?
- ✅ Launch June 1
- ❌ Rollback and reassess

## 🚀 Launch Day Checklist

- [ ] Remove all DEV_SKIP_AUTH flags
- [ ] Enable Clerk authentication
- [ ] Verify credit system
- [ ] Test payment flow
- [ ] Monitor error rates
- [ ] Prepare rollback command
- [ ] Team on standby
- [ ] Celebrate! 🎉

---

**Remember**: This is an aggressive timeline, but the simplification GenKit provides makes it achievable. Focus on core functionality, ship fast, and iterate based on user feedback.

**Mantra**: "Simpler is better. Ship it and iterate."