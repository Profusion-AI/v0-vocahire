# CLAUDE.md - VocaHire Development Guide

**Last Updated**: May 26, 2025  
**Status**: Client Refactoring Complete ✅

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
- Create summary files (e.g., `first-tasks.md`, `next-steps1.md`)

## 🏗️ Current Architecture Status

### Phase 1: Containerization ✅
- Monolithic Dockerfile created
- Docker Compose for local development
- Build scripts for Cloud Run deployment
- API specification documented

### Phase 2: Client Refactoring ✅ (Completed May 26, 2025)
- ✅ Removed ALL OpenAI dependencies
- ✅ Updated to use new orchestrator API
- ✅ Simplified state management
- ✅ WebRTC client implementation ready

### Phase 3: Backend Orchestrator (In Progress - Gemini)
- Implement WebRTC server
- Integrate Google Cloud AI services
- Deploy to Cloud Run

## 📋 Recent Accomplishments (May 26, 2025)

### Claude's Completed Tasks
1. **✅ Refactored `useRealtimeInterviewSession.ts`**
   - Removed all OpenAI logic
   - Implemented WebRTC connection to backend
   - Added WebSocket authentication
   - Set up data channel for heartbeat

2. **✅ Updated `InterviewPageClient.tsx`**
   - Simplified state management
   - Clean integration with new hook
   - Better error handling

3. **✅ Updated `InterviewRoom.tsx`**
   - Works with new hook API
   - Simplified prop interface
   - Proper status tracking

### Gemini's Completed Tasks (from first-tasks.md)
1. **✅ Created all API endpoints**
   - `/api/v1/sessions/create`
   - `/api/v1/sessions/:sessionId`
   - `/api/v1/sessions/:sessionId/end`
   - `/health` and `/ready`

2. **✅ Redis session store implementation**
3. **✅ Initial WebSocket endpoint setup**

## 🚀 New Architecture

```
Browser → WebRTC → Orchestrator → Google Cloud AI
                         ↓
                    Session State
                         ↓
                    Database/Redis
```

### Key Services
1. **Frontend**: Next.js client app (Ready ✅)
2. **Orchestrator**: WebRTC + Google AI integration (Pending)
3. **API Gateway**: Authentication, credits, routing (Ready ✅)

### API Contract
- **Specification**: `/docs/orchestrator-api-spec.md`
- **Session Creation**: `POST /api/v1/sessions/create`
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

# Testing
pnpm test
pnpm test:watch
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

# Redis (for session store)
REDIS_URL=
```

## 📁 Key Files

### Client-Side (Claude's Domain) ✅
- `/hooks/useRealtimeInterviewSession.ts` - WebRTC management
- `/app/interview/InterviewPageClient.tsx` - Session UI
- `/components/InterviewRoom.tsx` - Interview interface

### Backend (Gemini's Domain) 🚧
- `/docs/orchestrator-api-spec.md` - API contract
- `/app/api/v1/sessions/*` - Session endpoints
- `/app/api/webrtc-exchange/[sessionId]/route.ts` - WebSocket handler
- `/lib/redis.ts` - Session store
- `/lib/google-cloud-utils.ts` - Google AI integration (TODO)

### Shared
- `/prisma/schema.prisma` - Database schema
- `/lib/prisma.ts` - Database client
- Authentication & payment logic

## ⚠️ Migration Notes

### Deprecated (Do Not Use)
- OpenAI Realtime API
- `/lib/openai-*.ts` files
- Direct WebRTC to OpenAI
- `interview-session-manager.ts` (removed)

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

### WebSocket Message Types
**Client → Server**:
- `webrtc.offer`
- `webrtc.ice_candidate`
- `control.start_interview`
- `control.end`

**Server → Client**:
- `session.status`
- `webrtc.answer`
- `webrtc.ice_candidate`
- `transcript.user`
- `transcript.ai`
- `ai.thinking`
- `error`

### Error Codes
- `403`: Insufficient credits
- `401`: Authentication failed
- `429`: Rate limit exceeded
- `500`: Server error
- `502`: AI service error

## 🚦 Next Steps

1. **Gemini**: Implement WebRTC server logic (see `next-steps1.md`)
2. **Both**: Integration testing once backend is ready
3. **Deploy**: Cloud Run by May 30-31

---

**Remember**: This is a living document. Update as needed, but keep it concise and actionable.