# CLAUDE.md - VocaHire Development Guide

**Last Updated**: May 26, 2025  
**Status**: Active Google Cloud Migration

## 🤝 Collaborative Development Protocol

**Team**: Claude (Anthropic) & Gemini (Google) working asynchronously

### Git Workflow
```bash
# Before ANY work:
git pull origin main --rebase

# After completing work:
git add .
git commit -m "type(scope): description - by Claude/Gemini - 2025-05-26"
git push origin main
```

### Communication
- Use TODO comments: `// TODO: [Claude/Gemini] - description`
- Document decisions in commit messages
- Mark critical tasks with `[PIVOT-CRITICAL]`

## 🏗️ Current Architecture Status

### Phase 1: Containerization (May 26, 2025) ✅
- Monolithic Dockerfile created
- Docker Compose for local development
- Build scripts for Cloud Run deployment
- API specification documented

### Phase 2: Client Refactoring (In Progress)
- Remove OpenAI dependencies
- Update to use new orchestrator API
- Simplify state management

### Phase 3: Backend Orchestrator (Pending - Gemini)
- Implement WebRTC server
- Integrate Google Cloud AI services
- Deploy to Cloud Run

## 📋 Active Development Tasks

### Claude's Immediate Focus (May 26, 2025)
1. **[PIVOT-CRITICAL] Refactor `useRealtimeInterviewSession.ts`**
   - Remove ALL OpenAI logic
   - Implement WebRTC to our backend
   - Maintain UI compatibility

2. **[PIVOT-CRITICAL] Update `InterviewPageClient.tsx`**
   - Simplify state management
   - Use new orchestrator endpoints
   - Remove OpenAI-specific states

3. **Enhance API Specification**
   - Clarify SDP exchange flow
   - Detail error handling
   - Add example implementations

### Gemini's Tasks (Starting May 26)
1. **[PIVOT-CRITICAL] Build AI Orchestrator Service**
   - Implement endpoints from `/docs/orchestrator-api-spec.md`
   - Handle WebRTC signaling
   - Integrate Google STT/TTS/Vertex AI

2. **Create Google Cloud Utilities**
   - Authentication helpers
   - Service client initialization
   - Stream processing utilities

## 🚀 New Architecture

```
Browser → WebRTC → Orchestrator → Google Cloud AI
                         ↓
                    Session State
                         ↓
                    Database/Redis
```

### Key Services
1. **Frontend**: Next.js client app
2. **Orchestrator**: WebRTC + Google AI integration
3. **API Gateway**: Authentication, credits, routing

### API Contract
- **Specification**: `/docs/orchestrator-api-spec.md`
- **Session Creation**: `POST /api/sessions/create`
- **WebSocket**: `wss://orchestrator/ws/{sessionId}`
- **SDP Exchange**: Via WebSocket messages

## 💻 Development Commands

```bash
# Local development
pnpm dev
./scripts/docker-dev.sh up

# Docker operations
docker build -t vocahire .
./scripts/build-docker.sh

# Database
npx prisma migrate dev
npx prisma studio
```

## 🔑 Environment Variables

### Essential for Development
```env
# Database
DATABASE_URL=
MIGRATE_DATABASE_URL=

# Google Cloud
GOOGLE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Payments (Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 📁 Key Files

### Client-Side (Claude's Domain)
- `/hooks/useRealtimeInterviewSession.ts` - WebRTC management
- `/app/interview/InterviewPageClient.tsx` - Session UI
- `/components/InterviewRoom.tsx` - Interview interface

### Backend (Gemini's Domain)
- `/docs/orchestrator-api-spec.md` - API contract
- Future: Orchestrator service repository
- Future: `/lib/google-cloud-utils.ts`

### Shared
- `/prisma/schema.prisma` - Database schema
- `/lib/prisma.ts` - Database client
- Authentication & payment logic

## ⚠️ Migration Notes

### Deprecated (Do Not Use)
- OpenAI Realtime API
- `/lib/openai-*.ts` files
- Direct WebRTC to OpenAI
- Vercel-specific optimizations

### Stable Components
- Clerk authentication
- Stripe payments
- Database schema
- UI components
- Sentry monitoring

## 🎯 Success Metrics

- **Latency**: < 1.5s speech-to-speech
- **Reliability**: 99.9% uptime
- **Cost**: 30-50% reduction vs OpenAI
- **UX**: Seamless transition for users

## 📝 Quick Reference

### Credit System
- New users: 3.00 VocahireCredits
- Interview cost: 1.00 credit
- Minimum required: 0.50 credits
- Premium: Unlimited interviews

### Database Models
- `User`: Authentication & credits
- `InterviewSession`: Session metadata
- `Transcript`: Conversation records
- `Feedback`: AI-generated analysis

### Error Codes
- `403`: Insufficient credits
- `401`: Authentication failed
- `500`: Server error
- `502`: AI service error

## 🚦 Next Steps

1. **Claude**: Complete client refactoring by May 27
2. **Gemini**: Begin orchestrator implementation
3. **Both**: Test integration by May 28-29
4. **Deploy**: Cloud Run by May 30-31

---

**Remember**: This is a living document. Update as needed, but keep it concise and actionable.