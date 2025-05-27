# CLAUDE.md - VocaHire Development Guide

**Last Updated**: May 27, 2025 11:00 AM CST  
**Status**: MVP Docker Setup Complete ✅  
**Target Launch**: June 1, 2025 (Public Beta) 🎯

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
- Latest changes in progress of dockerizing the project

### Phase 2: Client Refactoring ✅ (Completed May 26, 2025)
- ✅ Removed ALL OpenAI dependencies
- ✅ Updated to use new orchestrator API
- ✅ Simplified state management
- ✅ WebRTC client implementation ready

### Phase 3: Backend Orchestrator (In Progress - Gemini)
- Implement WebRTC server
- Integrate Google Cloud AI services
- Deploy to Cloud Run

### Phase 4: MVP Optimization ✅ (Completed May 27, 2025)
- ✅ Simplified Docker setup for rapid iteration
- ✅ Single-stage Dockerfile.dev for hot reload
- ✅ Streamlined docker-compose.dev.yml
- ✅ Quick commands via Makefile
- ✅ Updated Next.js to 15.3.2
- ✅ Development auth bypass for faster iteration

## 📋 Recent Accomplishments

### May 27, 2025 - Native Audio Model Integration (2:00 PM CST)
1. **✅ Upgraded to Gemini 2.5 Flash Native Audio Model**
   - Primary model: `gemini-2.5-flash-preview-native-audio-dialog`
   - Fallback model: `gemini-2.0-flash-live-001`
   - Automatic fallback on connection errors
   - Native conversational abilities for better interview flow
   - Improved voice naturalness, pacing, and mood

2. **✅ Simplified System Instructions**
   - Removed complex prompt engineering
   - Model handles conversational nuances natively
   - Focus on capturing interactions vs. contextual priming

### May 27, 2025 - MVP Docker Optimization & Cleanup
1. **✅ Created MVP-focused Docker setup**
   - `Dockerfile.dev` - Single stage for fast rebuilds
   - `docker-compose.dev.yml` - Minimal services with hot reload
   - `Makefile` - Quick commands for common tasks
   - Bind-mount strategy for instant code changes
   - Fixed port conflicts: Web (3001), DB (5433), Redis (6380)

2. **✅ Simplified development workflow**
   - `make dev` - Start with hot reload
   - `make dev-build` - Rebuild when deps change
   - No rebuild needed for code changes
   - Full environment (DB + Redis) included
   - Updated Next.js to 15.3.2

3. **✅ Development Auth Bypass**
   - Added `DEV_SKIP_AUTH=true` flag for instant access
   - Updated `AuthGuard` to skip auth in dev mode
   - Created `useQuickAuth` hook for mock users
   - Documented in `DEVELOPMENT_AUTH.md`
   - Shows yellow "DEV MODE" indicator when active

4. **✅ Removed Sentry Monitoring**
   - Eliminated all Sentry dependencies to simplify MVP
   - Removed monitoring 404 errors
   - Cleaned up error handling code
   - Reduced bundle size and complexity

5. **⚠️ Clerk Authentication Setup**
   - Added development Clerk keys (pk_test/sk_test)
   - Updated login/register pages to use Clerk components
   - **Known Issue**: Clerk redirect loop trying to reach vocahire.com
   - **Workaround**: DEV_SKIP_AUTH enabled for development
   - TODO: Configure Clerk dev instance redirect URLs properly

6. **✅ Fixed Prisma Binary Target Issue** (11:30 AM CST)
   - Added Linux binary target to schema.prisma for Docker compatibility
   - Fixed PrismaClientInitializationError for linux-musl-arm64-openssl-3.0.x
   - Updated middleware.ts to respect DEV_SKIP_AUTH flag
   - Modified profile page to use mock user in dev mode
   - Profile page now loads successfully with dev auth bypass

7. **✅ Terms Modal Dev Mode Bypass** (11:35 AM CST)
   - Updated `useTermsAgreement` hook to skip modal in dev mode
   - Modified `middleware.ts` to check `DEV_SKIP_AUTH` environment variable
   - Updated `interview/page.tsx` and `profile/page.tsx` to use mock user data
   - **⚠️ IMPORTANT**: These changes MUST be reverted before May 31 launch:
     - Remove DEV_SKIP_AUTH checks from production code
     - Ensure terms modal works properly for real users
     - Test authentication flow without dev bypass

### May 26, 2025 - Client Refactoring
#### Claude's Completed Tasks
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

#### Gemini's Completed Tasks (from first-tasks.md)
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

### 🚀 MVP Quick Start (Recommended)
```bash
# First time or deps changed
make dev-build

# Daily development (hot reload on http://localhost:3001)
make dev

# Common tasks
make shell      # Container shell
make migrate    # Run migrations
make studio     # Prisma Studio
make test       # Run tests

# If you see Sentry errors after removing it:
docker-compose -f docker-compose.dev.yml restart web
```

### Alternative Commands
```bash
# NPM scripts
npm run docker:dev      # Same as make dev
npm run docker:build    # Force rebuild
npm run docker:shell    # Container shell

# Direct Docker
./scripts/docker-dev.sh up     # Start services
./scripts/docker-dev.sh build  # Rebuild
./scripts/docker-dev.sh down   # Stop services
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

# Development Auth Bypass (REMOVE BEFORE MAY 31!)
DEV_SKIP_AUTH=true
NEXT_PUBLIC_DEV_SKIP_AUTH=true
NEXT_PUBLIC_DEV_AUTO_LOGIN=true
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
- Sentry monitoring (removed May 27)

### Stable Components
- Clerk authentication (dev keys configured)
- Stripe payments
- Database schema
- UI components

### Known Issues
1. **Clerk Redirect Loop** (May 27, 11am CST)
   - After sign-in, redirects to non-existent vocahire.com
   - Using `forceRedirectUrl` in SignIn/SignUp components
   - Workaround: Enable DEV_SKIP_AUTH for development
   - TODO: Configure Clerk dev instance properly

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

## 🚦 Critical Path to June 1 Launch

### Timeline (5 days remaining)
- **May 27-28**: Backend WebRTC implementation (Gemini)
- **May 29**: Integration testing
- **May 30**: Deploy to staging, fix critical bugs
- **May 31**: Final testing, prepare launch
- **June 1**: Public Beta launch! 🚀

### Launch Checklist
- [ ] Backend orchestrator deployed (Gemini)
- [ ] WebRTC connection stable
- [ ] Google AI integration working
- [ ] Credits/payments flowing
- [ ] Basic monitoring in place
- [ ] Landing page updated for beta
- [ ] **⚠️ REMOVE DEV AUTH BYPASS BY MAY 31** - Critical for production!
  - Remove all `DEV_SKIP_AUTH` checks from:
    - `middleware.ts`
    - `hooks/use-terms-agreement.ts`
    - `app/interview/page.tsx`
    - `app/profile/page.tsx`
    - `components/auth/AuthGuard.tsx`
  - Remove DEV_SKIP_AUTH from environment variables
  - Test full authentication flow with real Clerk login
  - Verify terms modal appears for new users

### MVP Philosophy
- **Ship fast**: Better to launch with 80% than perfect never
- **Hot reload everything**: Code changes = instant feedback
- **Fix forward**: Bugs in prod? Fix and deploy immediately
- **User feedback > assumptions**: Launch and learn

---

**Remember**: This is a living document. Update as needed, but keep it concise and actionable. We're in sprint mode to June 1! 🏃‍♂️