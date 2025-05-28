# CLAUDE.md - VocaHire Development Guide

**Last Updated**: May 28, 2025 4:00 PM CST  
**Target Launch**: June 1, 2025 (Public Beta) 🎯

## 🎯 MVP Focus: Real-Time AI Conversations

**Core Value Proposition**: VocaHire introduces users to full-duplex, natural conversations with AI - a completely new experience beyond text-based chatbots. The magic is in the real-time voice interaction, not in recording playback.

## 🎉 Current Status

**Overall Status**: ✅ SUCCESSFULLY DEPLOYED TO CLOUD RUN! 🚀

### Production URLs
- **Cloud Run**: https://v0-vocahire-727828254616.us-central1.run.app/
- **Custom Domain**: https://vocahire.com (DNS propagating, SSL pending)

### What's Working
1. **✅ Authentication** - Clerk integration fully functional
2. **✅ Real-time AI Conversations** - Google AI Live API integrated
3. **✅ Payment System** - Stripe ready for credit purchases
4. **✅ Database** - Transcripts and feedback stored reliably
5. **✅ Deployment** - Cloud Run with automated CI/CD

### MVP Decisions
- **No Audio Recording Storage** - Focus on live conversation experience
- **No WebRTC Peer-to-Peer** - Using Server-Sent Events (SSE) with Google AI
- **No Complex Features** - Just amazing conversations and feedback

## 💡 Key Principles

- **Conversation Magic First**: The "wow" moment is talking naturally with AI
- **Bootstrap-Friendly**: Minimal infrastructure, maximum user value
- **Security & Privacy**: No audio recordings stored, just transcripts
- **Robust Error Handling**: Graceful degradation for all failures
- **Ship Fast, Learn Fast**: MVP by June 1, iterate based on feedback

## 🏗️ Current Architecture

### Simplified Architecture (What Actually Exists)

```
Browser → HTTP/SSE → Next.js API → Google AI Live API
                         ↓
                    Database (Transcripts & Feedback)
```

### Technology Stack
- **Frontend**: Next.js 15.2.3 (App Router)
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: Google AI Live API (Gemini 2.5)
- **Database**: PostgreSQL via Prisma
- **Deployment**: Google Cloud Run
- **CI/CD**: Cloud Build (GitHub trigger)

## 📋 Recent Progress

### May 28, 2025 - Recentering on MVP (4:00 PM CST)

#### Key Decisions Made
1. **Removed Google Cloud Storage** - Not needed for MVP
2. **Removed WebRTC Components** - Using SSE instead
3. **Simplified Architecture** - Focus on what matters
4. **Fixed ESLint Issues** - Pragmatic approach to warnings

#### What We Learned
- ESLint strict mode was blocking builds unnecessarily
- File storage adds complexity without MVP value
- The magic is in the conversation, not the infrastructure

### May 28, 2025 - Morning Deployment Success (8:00 AM CST)

#### Critical Fixes That Enabled Deployment
1. **TypeScript Compilation** - Fixed all strict mode errors
2. **Build Configuration** - Proper environment variable handling
3. **Authentication** - Fixed redirect URLs for Cloud Run
4. **Dependencies** - Removed Vercel-specific code

## 💻 Development Commands

```bash
# Local Development
make dev        # Start development server
make shell      # Container shell
make migrate    # Run database migrations
make studio     # Open Prisma Studio

# Production Build
npm run build   # Build for Cloud Run
git push origin main  # Triggers Cloud Build
```

## 🔑 Environment Variables

### Required for MVP
```env
# Database
DATABASE_URL=
MIGRATE_DATABASE_URL=

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Payments (Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Google AI
GOOGLE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=

# Redis (for session management)
REDIS_URL=
```

### Not Needed for MVP
- ~~GCS_BUCKET_NAME~~ (No file storage)
- ~~TURN_USERNAME/CREDENTIAL~~ (No WebRTC)
- ~~XIRSYS_*~~ (No WebRTC)

## 📁 Key Files

### Core Interview Flow
- `/app/interview-v2/page.tsx` - Interview interface
- `/app/interview-v2/hooks/useGenkitRealtime.ts` - SSE connection to AI
- `/app/api/interview-v2/session/route.ts` - Session management

### Supporting Systems
- `/app/api/credits/purchase/route.ts` - Credit purchases
- `/app/api/feedback/enhance/route.ts` - Feedback generation
- `/lib/google-live-api.ts` - Google AI integration

## 🎯 Success Metrics

- **User Experience**: "Wow, I'm actually talking to an AI!"
- **Latency**: < 1.5s speech-to-speech response
- **Reliability**: Graceful handling of all errors
- **Conversion**: Free users → Paid subscribers

## 📝 Quick Reference

### Credit System
- New users: 3.00 VocahireCredits (3 free interviews)
- Interview cost: 1.00 credit
- Premium: Unlimited interviews

### User Journey
1. Sign up → Get 3 free credits
2. Start interview → Natural AI conversation
3. End interview → See transcript & feedback
4. Want more? → Purchase credits or subscribe

## 🚦 Path to Launch (3 Days)

### May 29 - Testing Day
- [ ] Full user journey testing
- [ ] Payment flow verification
- [ ] Load testing core API

### May 30 - Polish Day
- [ ] UI/UX refinements
- [ ] Error message improvements
- [ ] Performance optimization

### May 31 - Launch Prep
- [ ] Final deployment
- [ ] Monitoring setup
- [ ] Launch materials ready

### June 1 - Launch! 🚀
- [ ] Announce on social media
- [ ] Monitor for issues
- [ ] Gather early feedback

## ⚠️ Important Notes

### What This Is NOT
- Not a WebRTC application
- Not a recording platform
- Not feature-complete
- Not perfect

### What This IS
- A magical first experience with conversational AI
- A bootstrap-friendly business model
- A foundation to build upon
- A way to help job seekers prepare

## 🤝 Team Notes

**Current Focus**: Getting to a stable, delightful MVP that showcases the core value - natural AI conversations for interview practice.

**Philosophy**: Ship fast, learn from users, iterate quickly. The infrastructure can grow with the business.

**Remember**: We succeeded at 8 AM this morning. Everything since then has been optimization. Don't let perfect be the enemy of good.