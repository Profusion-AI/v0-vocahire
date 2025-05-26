# CLAUDE.md for VocaHire Coach (Google Cloud & Cloud Run Pivot)

This file provides critical guidance to AI Developers (Claude & Gemini) for VocaHire. Adherence is paramount for stability and production readiness as we pivot to Google Cloud AI services and Cloud Run deployment.

## 🤝 COLLABORATIVE DEVELOPMENT NOTICE (As of May 25, 2025)

Starting May 26, 2025, this repository will be developed collaboratively by:
- **Claude** (Anthropic) - AI Developer
- **Gemini** (Google) - AI Developer

### Critical Collaboration Requirements:
1. **ALWAYS fetch latest changes** before starting any new task: `git pull origin main --rebase` (prefer rebase for cleaner history)
2. **ALWAYS commit and push changes** after completing a logical unit of work
3. **Use descriptive, Conventional Commit messages** (e.g., `feat(gcp): implement STT streaming`)
4. **Document major decisions** and API choices in commit messages or code comments for cross-AI understanding
5. **Resolve conflicts locally** before pushing. Communicate with the other AI (via commit messages/comments) if blocked
6. **Leave clear TODO comments**: `// TODO: [Claude/Gemini] - [description]` for handoffs or incomplete work
7. **Prioritize tasks marked [PIVOT-CRITICAL]**

### Asynchronous Workflow Protocol:
```bash
# Before starting ANY new task:
git fetch origin
git pull origin main --rebase  # Ensure you're on the correct branch

# After completing ANY task:
git add .
git commit -m "type(scope): [clear description] - by Claude/Gemini - $(date +'%Y-%m-%d')"  # Add AI name and date
git push origin main  # Or feature branch
```

## 📅 Major Update Timeline (May 25, 2025)

### Strategic Pivot Initiated: May 25, 2025
- **Decision**: Pivot from OpenAI to Google Cloud AI services
- **Deployment Target**: Transition from Vercel to Google Cloud Run (via Docker)
- **Documentation**: This CLAUDE.md updated to reflect new architecture and deployment
- **Team Expansion**: Gemini AI assistant joins development team on May 26, 2025

## 📜 LEGACY / DEPRECATED: OpenAI MVP Configuration (Prior to May 25, 2025 Pivot)

The following configuration details pertain to the PREVIOUS OpenAI-based MVP. This setup WAS PROVEN TO WORK but is NOW DEPRECATED. This information is retained for historical reference ONLY and should NOT be used for new development. All new real-time AI development MUST use Google Cloud services.

<details>
<summary>Click to view DEPRECATED OpenAI MVP Configuration</summary>

### Essential Working Components (OpenAI - DEPRECATED):
1. **Model**: `gpt-4o-mini-realtime-preview` (exact string was required)
2. **API Headers**: `'OpenAI-Beta': 'realtime=v1'` (note the =v1 format)
3. **Session Creation**: NO `input_audio_transcription` parameter in the request body
4. **Credit Deduction**: MUST be synchronous (await the database update)
5. **Auto-Start Protection**: Use `hasAttemptedStart` ref to prevent loops
6. **WebRTC Exchange**: Use ephemeral token from session, NOT the API key

### Files Related to DEPRECATED OpenAI Implementation:
- `/app/api/realtime-session/route.ts` - (Old version) Session creation logic for OpenAI
- `/app/api/webrtc-exchange/route.ts` - (Old version) SDP exchange logic for OpenAI
- Parts of `/hooks/useRealtimeInterviewSession.ts` - (Old version) WebRTC management for OpenAI
- `/lib/openai-realtime.ts`, `/lib/realtime-websocket.ts` - OpenAI specific utilities

</details>

## 🚀 ACTIVE DEVELOPMENT: Google Cloud & Cloud Run MVP (Target - In Development as of May 25, 2025)

**[PIVOT-CRITICAL]** All new AI and deployment development MUST align with Google Cloud services and Dockerized Cloud Run deployment. Claude and Gemini, your collaborative efforts are essential here.

### 🏗️ Modular Architecture Strategy (May 25, 2025 - CTO Directive)

**Breaking the Monolith**: VocaHire is transitioning from a monolithic architecture to a modular, microservices-oriented design optimized for Cloud Run deployment. Each service will be independently scalable, maintainable, and testable.

**Key Architectural Components:**

1. **Client-Facing API Gateway/BFF** (Backend-for-Frontend)
   - Handles authentication, pre-flight checks, and session initiation
   - Simplifies client-side state management
   - Routes requests to appropriate backend services
   - Manages user credits and profile data

2. **AI Orchestration Service** (Core Service)
   - Dedicated Cloud Run service for the STT → LLM → TTS pipeline
   - Manages WebRTC connections with clients
   - Handles Google Cloud AI service interactions
   - Implements turn-taking and conversation management
   - Streams audio bidirectionally with clients

3. **WebRTC Signaling Service** (Optional)
   - May be integrated into the orchestrator or separate
   - Handles SDP exchange and ICE candidate negotiation
   - Manages peer connection lifecycle

**Benefits of This Approach:**
- **Scalability**: Each service scales independently based on load
- **Maintainability**: Smaller, focused codebases are easier to understand and modify
- **Team Collaboration**: Clear boundaries enable parallel development
- **Testing**: Isolated services are easier to test comprehensively
- **Deployment**: Independent deployment cycles for different components

### Target Google Cloud AI Components:

1. **Speech-to-Text (STT)**: Google Cloud Speech-to-Text API (streaming, Universal Speech Model)
   - **Critical**: Custom vocabulary, model adaptation for interview jargon
   - **Critical**: Robust handling of interim results and `enable_voice_activity_events`

2. **Text-to-Speech (TTS)**: Google Cloud Text-to-Speech API (WaveNet/Neural2 voices, Chirp HD for streaming)
   - **Critical**: Effective use of SSML for natural, expressive voice
   - **Critical**: Low-latency streaming playback

3. **Natural Language Understanding (NLU) & Conversational AI**: Google Vertex AI (Gemini models preferred, PaLM2 as fallback)
   - **Critical**: Managing conversation history and context for the LLM
   - **Critical**: Prompt engineering for interview coaching persona and question generation
   - Integrate Google Cloud Natural Language API for supplementary sentiment/entity analysis on transcripts

4. **Backend Orchestration**: A new or refactored VocaHire backend service to manage the STT → LLM → TTS pipeline and client-side WebRTC

5. **Client-Side WebRTC**: Continue using WebRTC for client-to-VocaHire-backend audio streaming. `hooks/useRealtimeInterviewSession.ts` will be refactored for this

6. **Turn-Taking & VAD**: Custom logic required, combining Google STT VAD events and potentially client-side VAD hints to manage interruptions and smooth conversational flow

### Files for Google Cloud & Dockerization (Focus Areas):

- **Dockerfile** (Root directory - TO BE CREATED) **[PIVOT-CRITICAL]**
- **.dockerignore** (Root directory - TO BE CREATED) **[PIVOT-CRITICAL]**
- **API Contract Documentation**: `/docs/orchestrator-api-spec.md` (TO BE CREATED by Claude) - Defines client-backend interface **[PIVOT-CRITICAL]**
- **Backend Orchestration Service**: Standalone Cloud Run service (TO BE CREATED by Gemini) - Manages Google API interactions **[PIVOT-CRITICAL]**
- **Simplified API Gateway**: `/app/api/interview/start-google-session` (TO BE CREATED) - Client-facing session initiation
- `/hooks/useRealtimeInterviewSession.ts` - MAJOR REFACTOR REQUIRED for Google Cloud via our backend **[PIVOT-CRITICAL]**
- `/components/InterviewRoom.tsx` - UI adapts to new hook. Auto-start protection remains
- `/lib/google-cloud-utils.ts` (TO BE CREATED) - Google Cloud auth, API clients
- `/app/api/interviews/route.ts` & `/app/api/generate-feedback/route.ts` - Adapt for Google LLMs
- `/scripts/build-vercel-safe.sh` - May need renaming to `build-next-app.sh` or similar, as Vercel-specifics are removed

## Guidance for AI Developers (Claude & Gemini) - Google Cloud & Cloud Run Pivot

**Mission**: Collaboratively refactor VocaHire to use Google Cloud AI services and prepare it for Dockerized deployment on Cloud Run, maintaining production quality.

### 🔄 Collaboration Best Practices (Effective May 26, 2025)

When working on this codebase:
1. **Start every session** with `git pull origin main` to get latest changes
2. **Check recent commits** to understand what the other AI has been working on
3. **Communicate through code**: Use clear comments, commit messages, and documentation
4. **Flag handoffs**: Use `// TODO: [Claude/Gemini] - [description]` for work that needs the other AI's attention
5. **Maintain consistency**: Follow established patterns and conventions
6. **Test thoroughly**: Ensure changes don't break existing functionality
7. **Document decisions**: Major architectural decisions should be documented in commit messages or code comments

### 🎯 Task Allocation (May 25, 2025 - CTO Directive)

**Claude's Focus Areas:**
1. **API Contract Definition** [PIVOT-CRITICAL]
   - Create `/docs/orchestrator-api-spec.md` defining the interface between client and backend orchestrator
   - Document WebSocket/WebRTC message formats, events, and data schemas
   - Define HTTP endpoints for session initiation and management
   
2. **Client-Side Refactoring** [PIVOT-CRITICAL]
   - Refactor `InterviewPageClient.tsx` to simplify state management
   - Remove direct OpenAI integration logic
   - Implement connection to new backend orchestrator API
   
3. **Hook Modernization** [PIVOT-CRITICAL]
   - Major refactor of `useRealtimeInterviewSession.ts`
   - Remove all OpenAI-specific code
   - Implement WebRTC connection to VocaHire backend
   - Preserve existing UI contracts

**Gemini's Focus Areas (Starting May 26, 2025):**
1. **Backend Orchestration Service** [PIVOT-CRITICAL]
   - Implement the API contract defined by Claude
   - Build server-side WebRTC handling
   - Integrate Google Cloud STT, Vertex AI, and TTS
   - Implement conversation management and turn-taking logic
   
2. **Google Cloud Integration**
   - Create robust integration with Google Cloud services
   - Implement streaming pipelines for audio processing
   - Handle authentication and service management
   
3. **Dockerization & Deployment**
   - Create optimized Docker images for each service
   - Configure Cloud Run deployment settings
   - Implement health checks and monitoring

### General Approach & Workflow (Focus on Google Cloud Pivot & Dockerization):

1. **Understand Task & Plan**: For any task, especially related to Google Cloud services or Docker:
   - Clarify requirements with Kyle (CTO)
   - **YOU MUST outline a plan** before significant coding. For Docker, this means proposing Dockerfile stages. For GCP services, outline API usage and error handling

2. **Implement Incrementally**:
   - **Google Cloud Services**: Tackle one service at a time (e.g., STT, then TTS, then LLM). Create focused utility functions in `/lib/google-cloud-utils.ts`
   - **Dockerization**: Start with a basic Next.js Dockerfile, then iterate

3. **Test Locally**:
   - **Google Cloud**: Use service account keys for local testing (ensure `GOOGLE_APPLICATION_CREDENTIALS` is set)
   - **Docker**: Build and run the container locally to verify

4. **Adhere to CLAUDE.md**: This is your primary source of truth

### Key Tasks for the Pivot:

1. **[PIVOT-CRITICAL] Define API Contract** (`/docs/orchestrator-api-spec.md` - Claude):
   - Document all endpoints, request/response schemas
   - Define WebSocket/WebRTC message formats
   - Specify event types and data structures
   - Create clear interface for parallel development

2. **[PIVOT-CRITICAL] Client-Side Refactoring** (Claude):
   - Simplify `InterviewPageClient.tsx` state management
   - Remove OpenAI-specific loading stages
   - Update to work with new backend orchestrator API
   - Preserve existing user experience

3. **[PIVOT-CRITICAL] Refactor `hooks/useRealtimeInterviewSession.ts`** (Claude):
   - Remove ALL OpenAI-specific logic
   - Implement WebRTC connection to our backend orchestrator
   - Handle data channel messages for transcripts, AI responses, and control signals
   - Maintain compatibility with `InterviewRoom.tsx`

4. **[PIVOT-CRITICAL] Backend Orchestrator Service** (Gemini):
   - Implement as standalone Cloud Run service
   - Build based on API contract from Claude
   - Handle WebRTC, Google STT/TTS/Vertex AI integration
   - Implement conversation management logic

5. **[PIVOT-CRITICAL] Dockerize Services** (Claude initial, Gemini review):
   - Create `Dockerfile` for each service
   - Optimize for Cloud Run deployment
   - Handle environment variables correctly
   - Implement multi-stage builds

6. **Create `/lib/google-cloud-utils.ts`** (Gemini):
   - Functions for authenticating with Google Cloud
   - Client initialization for STT, TTS, Vertex AI
   - Error handling wrappers for Google API calls
   - Streaming utilities for audio processing

7. **Adapt Feedback Generation** (Either AI):
   - Modify `/app/api/generate-feedback/route.ts` to use Vertex AI (Gemini) instead of OpenAI
   - Maintain existing feedback structure

### Understanding the VocaHire Codebase (Post-Pivot Context):

**Core Logic (Shifting)**:
- `hooks/useRealtimeInterviewSession.ts` is undergoing a major refactor. It will now handle WebRTC to our backend, which then orchestrates Google Cloud services
- New files/services in `/lib` or `/app/api` will emerge for Google Cloud interactions

**Stable Components**: 
- `lib/prisma.ts`, `lib/payment-config.ts`
- Clerk auth (`middleware.ts`, `/app/api/webhooks/clerk`)
- Stripe webhooks
- Most UI components in `/components/ui` and `/components/landing`

**This File (CLAUDE.md)**: Your primary guide

### Making Changes:

- **Code Style**: Existing TypeScript, ESLint, Prettier standards apply
- **Testing**: Emphasize testing for the new Google Cloud pipeline components
- **Commits**: Conventional Commits
- **Error Handling**: Robust error handling for each step in the Google STT-LLM-TTS chain. Sentry integration remains vital

### Git & GitHub Workflow:

- **Standard**: `feature/...`, `fix/...`, `refactor/google-pivot/...` branches. `gh` CLI

### Debugging and Verification:

- Utilize existing diagnostic endpoints. We may need new ones for Google Cloud service checks
- Sentry for production

## Project Overview

VocaHire is an AI interview coaching platform that enables human users to practice job interviews with a real-time (full-duplex) voice assistant AI, receive personalized feedback, and improve their skills. The platform is built with Next.js 15 using the App Router pattern, and it includes various services for authentication, database storage, payments, and AI interactions.

## Architecture

### Core Technologies

- **Framework**: Next.js 15 (App Router) for full-stack development
- **Database**: PostgreSQL via Supabase (accessed through Prisma ORM)
- **Authentication**: Clerk for user management and session handling
- **Payments**: Stripe for handling one-time purchases and subscriptions
- **Frontend**: React 19, Shadcn/ui components, Tailwind CSS
- **AI Services**: Google Cloud Speech-to-Text, Text-to-Speech, and Vertex AI (Gemini/PaLM) for NLU/conversation, orchestrated by our backend via WebRTC with clients
- **Error Monitoring**: Sentry for comprehensive error tracking and performance monitoring  
- **Deployment**: Vercel with intelligent build system and optimized timeout handling
- **Performance**: Enhanced database performance monitoring with 503 Service Unavailable error targeting

### Key Components

1. **Auth System**: Clerk handles user authentication with middleware protecting routes
2. **Database Schema**: Prisma ORM defines models for Users, InterviewSessions, Transcripts, Feedback
3. **API Routes**: Next.js API routes for backend functionality
4. **Payment Processing**: Stripe integration for handling credits and premium subscriptions
5. **Real-time Voice**: Client-to-backend WebRTC, with backend orchestrating Google Cloud AI speech services

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting and type checking
pnpm lint

# Generate Prisma client
npx prisma generate

# Run database migrations (development)
npx prisma migrate dev

# Deploy database migrations (production - run before Docker deployment)
npx prisma migrate deploy

# Open Prisma database viewer
npx prisma studio

# Docker commands (NEW)
# Build Docker image
docker build -t vocahire-coach .

# Run Docker container locally
docker run -p 3000:3000 --env-file .env.local vocahire-coach

# Tag for Google Artifact Registry
docker tag vocahire-coach YOUR_REGION-docker.pkg.dev/YOUR_PROJECT/vocahire/vocahire-coach:latest

# Push to Google Artifact Registry
docker push YOUR_REGION-docker.pkg.dev/YOUR_PROJECT/vocahire/vocahire-coach:latest

# Deploy to Cloud Run
gcloud run deploy vocahire-coach-service \
  --image YOUR_REGION-docker.pkg.dev/YOUR_PROJECT/vocahire/vocahire-coach:latest \
  --platform managed \
  --region YOUR_REGION \
  --port 3000

# Test endpoints
curl /api/diagnostic/connection-test
curl /api/diagnostic/db-performance
curl /api/sentry-example-api
```

## Important Files and Directories

- `/app`: Next.js application routes and components
  - `/app/api`: Backend API routes
  - `/app/api/google-realtime-orchestrator`: (TO BE CREATED) Google Cloud AI orchestration
  - `/app/api/interviews`: Interview session persistence endpoint
  - `/app/api/generate-feedback`: AI feedback generation endpoint (will use Google LLMs)
  - `/app/api/webhooks`: Webhook handlers for Clerk and Stripe
  - `/app/api/diagnostic`: Database and system health check endpoints
- `/prisma`: Database schema and migrations
- `/components`: Reusable UI components
- `/lib`: Utility functions and service integrations
  - `/lib/prisma.ts`: Production-safe database connection management with pooling
  - `/lib/prisma-types.ts`: Type consistency helpers for Decimal handling
  - `/lib/redis.ts`: Redis client configuration and connection management
  - `/lib/user-cache.ts`: User credential caching implementation with 30s TTL
  - `/lib/retry-utils.ts`: Retry mechanisms for database operations
  - `/lib/fallback-db.ts`: Fallback database implementation for resilience
  - `/lib/auth-utils.ts`: User management utilities including getOrCreatePrismaUser
  - `/lib/usage-tracking.ts`: Usage analytics and tracking utilities
  - `/lib/google-cloud-utils.ts`: (TO BE CREATED) Google Cloud authentication and API utilities
  - ~~`/lib/openai-realtime.ts`~~ (DEPRECATED)
  - ~~`/lib/realtime-websocket.ts`~~ (DEPRECATED)
- `/hooks`: Custom React hooks
  - `/hooks/useRealtimeInterviewSession.ts`: WebRTC session management (MAJOR REFACTOR for Google Cloud)
- `/scripts`: Build and deployment scripts
  - `/scripts/build-vercel-safe.sh`: Intelligent build script for Vercel deployment
- **Sentry Configuration**: Error monitoring setup
  - `sentry.client.config.ts`: Browser-side error tracking
  - `sentry.server.config.ts`: Server-side error tracking
  - `sentry.edge.config.ts`: Edge runtime monitoring
  - `instrumentation.ts`: Next.js 15 initialization hook

## Database Management

The application uses Prisma as an ORM with PostgreSQL (via Supabase). Key models include:

- `User`: User profiles and authentication data
- `InterviewSession`: Interview metadata with feedbackStatus tracking
- `Transcript`: Full text records of interview conversations
- `Feedback`: AI-generated interview feedback with analysis

### Supabase Connection Strategy

**Critical for Production**: Supabase provides both pooled and direct connection strings. The build process uses different connections for different purposes:

- **Runtime**: `DATABASE_URL` (pooled connection, port 6543) - Used by the application during runtime
- **Migrations**: `MIGRATE_DATABASE_URL` (direct connection, port 5432) - Used by `prisma migrate deploy` during builds to avoid pgbouncer issues

### Vercel Deployment Considerations

The application uses an intelligent build script (`/scripts/build-vercel-safe.sh`) that handles Vercel's network restrictions:

1. **Local Development**: Migrations must succeed or build fails
2. **Vercel Environment**: Attempts migrations but gracefully handles network connectivity issues
3. **IPv6 Connectivity**: Vercel cannot connect to Supabase's direct URL (port 5432) but can access pooled URL (port 6543)
4. **Database Schema Verification**: All required tables (User, InterviewSession, Transcript, Feedback) are verified at runtime

### Migration Status

All Prisma migrations have been successfully applied to the production database:
- `20250514194559_vocahire_alpha`
- `20250514204931_add_stripe_premium_fields` 
- `20250515022414_update_user_with_clerk_id`
- `20250515215903_add_email_name_image_to_user`
- `20250519143501_update_credits_to_decimal`
- `20250523204427_add_feedback_status_and_performance_indexes`

## Feedback System Enhancement (January 2025)

### Structured Feedback Generation
- **Implemented JSON-based feedback**: Moved from regex parsing to structured JSON output using AI's JSON mode for reliability
- **Created Zod schemas**: Type-safe validation for feedback data with comprehensive error handling
- **Backward compatibility**: Maintains fallback to legacy parsing to ensure system stability
- **Database schema updates**: Added structured fields for individual scores and enhanced feedback data

### Enhanced Feedback Feature (0.50 VocahireCredits)
Premium feedback tier implementation for users seeking deeper insights:

**Features Included:**
- Question-by-question breakdown with alternative phrasings
- Emotional tone analysis (text-inferred from language patterns)
- STAR method adherence scoring for behavioral questions
- Industry benchmarking with percentile ranking
- Personalized 30-day action plan with immediate/short/long-term goals
- Keyword relevance scoring against job description

**Technical Implementation:**
- **API Endpoint**: `/api/feedback/enhance` with synchronous credit deduction
- **Credit Management**: Following CLAUDE.md patterns for atomic credit operations
- **Duplicate Prevention**: `enhancedFeedbackGenerated` flag prevents double charges
- **Transaction Logging**: All credit operations logged for audit trail
- **Error Handling**: Comprehensive Sentry logging with request IDs

**UI Components:**
- `EnhancedFeedbackCTA.tsx`: Professional upsell component with clear value proposition
- `EnhancedFeedbackDisplay.tsx`: Three-tab interface for comprehensive analysis display
- Visual progress bars and performance metrics for engagement

### Database Schema Enhancements
```prisma
model Feedback {
  // Existing fields...
  
  // Structured feedback data
  structuredData           Json?            // Full structured feedback JSON
  clarityScore             Float?           // 0-4 scale
  concisenessScore         Float?           // 0-4 scale  
  technicalDepthScore      Float?           // 0-4 scale
  starMethodScore          Float?           // 0-4 scale
  overallScore             Float?           // 0-4 scale average
  
  // Enhanced feedback fields
  enhancedFeedbackGenerated Boolean         @default(false)
  enhancedReportData       Json?            // Enhanced feedback JSON
  toneAnalysis             Json?            // Emotional tone insights
  keywordRelevanceScore    Float?           // 0-100 scale
  sentimentProgression     Json?            // Sentiment over time
  enhancedGeneratedAt      DateTime?        // When enhanced was generated
}
```

### Database Performance Optimizations (January 2025 - May 2025)

**🚀 Connection Pool Optimization (early May 2025)**
- **Connection Pool Size**: Increased from 5 to 25 connections
- **Pool Timeout**: Increased from 10s to 20s for better resilience
- **PgBouncer Mode**: Enabled for optimal serverless connection handling
- **Statement Timeout**: 30s limit to prevent runaway queries
- **Real-time Monitoring**: `/lib/db-connection-monitor.ts` tracks pool health
- **Diagnostic Endpoint**: `/api/diagnostic/connection-pool` for admin monitoring

**✅ Completed Optimizations**

1. **Enhanced Error Handling & Timeout Management**
   - Database queries: 12s timeout (optimized for Vercel's 15s function limit)
   - Google Cloud API calls: Will require similar timeout management
   - WebRTC exchange: 15s timeout with AbortController
   - Systematic replacement of generic 500 errors with specific error codes

2. **Performance Monitoring & Diagnosis**
   - Request ID tracking for tracing specific requests through the system
   - Phase-by-phase timing logs to identify exact bottlenecks
   - `/api/diagnostic/db-performance`: Database query performance testing
   - `/api/diagnostic/vercel-db-test`: Vercel-Supabase connectivity analysis
   - Detailed error categorization (503 database, 504 timeout, 502 API errors)

3. **Redis Caching Implementation (January 2025)**
   - **User Credentials Caching**: 30-second TTL cache for frequently accessed user data
   - **Cache-First Pattern**: Reduces database load for repeated user credential checks
   - **Automatic Cache Invalidation**: Updates/deletes trigger cache refresh
   - **Fallback Mechanisms**: Graceful degradation when cache is unavailable
   - **Performance Gains**: ~90% reduction in database queries for cached operations

4. **Cold Start & Connection Optimization (January 2025)**
   - **Database Connection Pooling**: Reuse connections across function invocations
   - **Connection Warming**: Pre-establish database connections during initialization
   - **Retry Utilities**: Automatic retry with exponential backoff for transient failures
   - **Fallback Database**: Secondary database instance for critical operations
   - **Performance Logging**: Detailed timing metrics for all database operations

5. **Raw SQL Optimizations for Critical Paths (January 2025)**
   - **Direct SQL Queries**: Bypass Prisma ORM overhead for session creation
   - **Aggressive Timeouts**: 5-second database timeout (down from 12s)
   - **Non-blocking Operations**: Credit deductions happen asynchronously
   - **Optimized User Fetch**: Raw SQL with float8 casting for credits
   - **Fire-and-Forget Pattern**: Usage tracking doesn't block response

## Environment Variables

### Critical Production Environment Variables

**Database Configuration:**
- `DATABASE_URL`: PostgreSQL connection string (pooled, port 6543) for runtime operations
- `MIGRATE_DATABASE_URL`: PostgreSQL direct connection string (port 5432) for migrations

**Caching Infrastructure:**
- `REDIS_URL`: Redis connection string for user credential caching (format: `redis://user:password@host:port`)
- `REDIS_TOKEN`: Authentication token for Redis cloud services (if using Upstash or similar)

**Authentication & Services:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key for client-side auth
- `CLERK_SECRET_KEY`: Clerk secret key for server-side operations
- `CLERK_WEBHOOK_SECRET`: Secret for verifying Clerk webhook events

**Payment Processing:**
- `STRIPE_SECRET_KEY`: Stripe API key for server-side operations
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key for client-side
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events

**AI & Monitoring:**
- ~~`OPENAI_API_KEY`~~ (DEPRECATED): OpenAI API key (no longer used)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to Google Cloud service account JSON key file (primarily for local/non-Cloud Run environments)
- `GOOGLE_PROJECT_ID`: Your Google Cloud Project ID
- `CLOUD_RUN_SERVICE_URL`: (Once deployed) The URL of your Cloud Run service
- `SENTRY_DSN`: Sentry Data Source Name for error monitoring
- `SENTRY_AUTH_TOKEN`: Sentry authentication token for source map uploads
- `SENTRY_ORG`: profusion-ai-ny
- `SENTRY_PROJECT`: sentry-indigo-zebra

**Deployment:**
- ~~`VERCEL`~~ (DEPRECATED): Previously used for Vercel deployment detection

## Webhook Integrations

- Clerk webhooks for user data synchronization
- Stripe webhooks for payment event handling

## Authentication with Clerk

VocaHire uses Clerk.com for user authentication with a custom domain setup:

### Authentication URLs
- Sign In: https://accounts.vocahire.com/sign-in
- Sign Up: https://accounts.vocahire.com/sign-up
- User Profile: https://accounts.vocahire.com/user

### Clerk Configuration
Key props used in the ClerkProvider:
```jsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  signInUrl="https://accounts.vocahire.com/sign-in"
  signUpUrl="https://accounts.vocahire.com/sign-up"
  signInFallbackRedirectUrl="/interview"
  signUpFallbackRedirectUrl="/interview"
>
```

### Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key for client-side Clerk interactions
- `CLERK_SECRET_KEY`: Secret key for server-side Clerk operations
- `CLERK_WEBHOOK_SECRET`: Secret for verifying webhook events from Clerk

### User Record Creation
When a user authenticates via Clerk, a corresponding user record is created in the database with:
- Default of 3.00 VocahireCredits for new users
- Basic profile information synced from Clerk (name, email)
- A Stripe Customer ID for future payments

## Deployment & Production Infrastructure

### 🚨 MIGRATION IN PROGRESS: Vercel → Google Cloud Run (May 25, 2025)

The application is transitioning from Vercel to Google Cloud Run deployment.

### Legacy: Vercel Deployment (DEPRECATED)

<details>
<summary>Click to view deprecated Vercel deployment information</summary>

The application was previously deployed on Vercel with automatic CI/CD from GitHub:

**Build Process:**
- Used intelligent build script (`/scripts/build-vercel-safe.sh`) that handled network restrictions
- Automatically handled database migrations with fallback strategies
- Generated Prisma client and optimized for serverless deployment
- Uploaded source maps to Sentry for enhanced error tracking

</details>

### NEW: Google Cloud Run Deployment

The application will be deployed as a Docker container on Google Cloud Run:

**Build Process:**
- Multi-stage Docker build for optimized image size
- Prisma client generation during build
- Environment variables injected at runtime
- Migrations run as separate CI/CD step before deployment

**Production Readiness Features:**
- Real-time error monitoring via Sentry with session replay
- Database connection pooling optimized for containerized deployment
- Comprehensive health check endpoints (`/api/diagnostic/connection-test`)
- Automated payment processing with Stripe webhooks
- Secure authentication with Clerk custom domain
- Auto-scaling based on request volume
- Regional deployment for low latency

### Post-Deployment Verification

After each deployment, verify these endpoints:
1. `/api/diagnostic/connection-test` - Database connectivity
2. `/api/user` - User authentication and data consistency
3. `/api/sentry-example-api` - Error monitoring functionality
4. Health checks for Stripe webhooks and Clerk integration
5. Cloud Run service health check endpoint

## Key Dependencies

**Core Framework & Database:**
- Next.js 15 (App Router) for full-stack development
- Prisma ORM for type-safe database operations
- PostgreSQL via Supabase for reliable data storage

**Authentication & Payments:**
- Clerk for enterprise-grade user authentication
- Stripe for secure payment processing and subscription management

**Frontend & UI:**
- React 19 with modern concurrent features
- Shadcn/ui component library for consistent design
- Tailwind CSS for utility-first styling

**AI & Monitoring:**
- Google Cloud Speech-to-Text, Text-to-Speech, and Vertex AI for conversational AI
- Sentry for comprehensive error tracking and performance monitoring

**Build & Deployment:**
- Vercel for optimized serverless deployment
- Custom build scripts for production reliability

## Payment System

VocaHire uses Stripe for payment processing with various product offerings:

### Credit Packages
- Three VocahireCredits (prod_SJPpjWE9zhJnEh): 3 top-up VocahireCredits for existing users
- Five VocahireCredits (prod_SJQ8EwiLxPh62L): 5 bundled VocahireCredits

### Subscription Plans
- Monthly Coach (prod_SLHl7Tl1LX1NMH): Monthly subscription with unlimited AI interviews
- Quarterly Coach (prod_SLHvbICsIUy3oZ): Quarterly subscription with 16% discount
- Annual Coach (prod_SJPmP9GnMNDso0): Annual subscription with 25% discount

### Environment Variables

For Stripe integration, the following environment variables are needed:
- `STRIPE_SECRET_KEY`: Secret API key for Stripe operations
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public key for client-side Stripe interactions
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying webhook events from Stripe

When setting up product IDs in Vercel, use comma separation for multiple values:
```
STRIPE_PRICE_ID=prod_SJPpjWE9zhJnEh,prod_SJQ8EwiLxPh62L,prod_SLHl7Tl1LX1NMH,prod_SLHvbICsIUy3oZ,prod_SJPmP9GnMNDso0
```

Or use separate environment variables for each product:
```
STRIPE_PRICE_ID_3_CREDITS=prod_SJPpjWE9zhJnEh
STRIPE_PRICE_ID_5_CREDITS=prod_SJQ8EwiLxPh62L
STRIPE_PRICE_ID_MONTHLY=prod_SLHl7Tl1LX1NMH
STRIPE_PRICE_ID_QUARTERLY=prod_SLHvbICsIUy3oZ
STRIPE_PRICE_ID_ANNUAL=prod_SJPmP9GnMNDso0
```

## Production Readiness

**IMPORTANT**: VocaHire is being deployed to production with real, paying customers. All code MUST be production-ready.

### Code Standards

- **NO MOCK FUNCTIONALITY**: All features must connect to real databases, APIs, and services
- **Exception**: The only "mock" aspect should be clearly communicated to users - they are participating in a mock interview with an AI agent, not a real human interviewer
- **All data operations must be real**: User management, payments, analytics, and monitoring must use actual production data
- **Error handling**: Implement proper error handling and logging for all operations
- **Security**: Follow best practices for authentication, authorization, and data protection

### Payment Integration

- All Stripe integrations must handle real credit card transactions
- Implement proper webhook handling for payment events
- Ensure VocahireCredits system is accurately tracked and debited
- Handle subscription management and one-time purchases

### User Experience

- Users should clearly understand they are:
  - Paying for AI-powered mock interview practice
  - Receiving AI-generated feedback
  - Interacting with an AI interviewer, not a human
- The service value proposition is practice and improvement, not actual job interviews

### Code Review Guidelines

When reviewing PRs or implementing features:
1. Remove any placeholder or mock data
2. Ensure all database queries are optimized for production load
3. Verify payment flows are tested with real Stripe test keys
4. Confirm error messages are user-friendly and don't expose sensitive data
5. Check that all admin features work with real production data

### Monitoring and Analytics

- **Sentry Integration**: Real-time error monitoring with session replay and performance tracking
- **Admin dashboards**: Show real user activity via `/admin/usage` and `/admin/users`
- **Usage metrics**: Accurately reflect API calls and resource consumption
- **Payment tracking**: Must align with Stripe dashboard data
- **Error tracking**: Captures and alerts on production issues via Sentry
- **Database monitoring**: Health checks via `/api/diagnostic/connection-test`

## Error Monitoring & Debugging

### Sentry Configuration

VocaHire uses Sentry for comprehensive error monitoring in production:

**Monitoring Features:**
- **Error Tracking**: Automatic capture of JavaScript errors, API failures, and database issues
- **Performance Monitoring**: Track API response times and database query performance  
- **Session Replay**: Visual reproduction of user sessions when errors occur
- **Release Tracking**: Correlate errors with specific deployments
- **Source Maps**: Detailed stack traces with original source code

**Sentry Organization**: profusion-ai-ny  
**Project**: sentry-indigo-zebra

### Diagnostic Endpoints

For troubleshooting production issues:

1. **Database Connectivity**: `/api/diagnostic/connection-test`
   - Tests both pooled and direct database connections
   - Verifies table existence and query execution
   - Returns detailed connection status

2. **Database Performance**: `/api/diagnostic/db-performance`
   - Comprehensive database query performance testing
   - Connection timing analysis and bottleneck identification
   - User query execution with performance metrics
   - Connection health monitoring for production optimization

3. **Vercel-Database Analysis**: `/api/diagnostic/vercel-db-test`
   - Vercel-Supabase connectivity pattern analysis
   - Network latency and connection pool behavior testing
   - Serverless function cold start impact assessment
   - Regional connectivity performance evaluation

4. **Error Testing**: `/api/sentry-example-api`
   - Triggers test errors to verify Sentry integration
   - Useful for validating error monitoring setup

5. **User API**: `/api/user`
   - Tests authentication flow with Clerk
   - Validates database user operations with enhanced timeout handling
   - Checks fallback logic for database failures
   - Returns specific error codes (503/504/502) instead of generic 500s

### Production Issue Resolution

When production issues occur:

1. **Check Sentry Dashboard**: Monitor for new errors and performance issues
2. **Verify Database**: Use diagnostic endpoints to test connectivity
3. **Review Vercel Logs**: Check build and runtime logs for deployment issues
4. **Validate Webhooks**: Ensure Clerk and Stripe webhooks are functioning
5. **Monitor User Impact**: Use admin dashboard to assess affected users

## Build System & Deployment Strategy

### Intelligent Build Process

The application uses a sophisticated build strategy optimized for Vercel's serverless environment:

**Build Script Features** (`/scripts/build-vercel-safe.sh`):
- **Environment Detection**: Automatically detects Vercel vs local environments
- **Migration Handling**: Attempts database migrations with graceful fallbacks
- **Network Resilience**: Handles Vercel's IPv6 connectivity restrictions with Supabase
- **Error Recovery**: Continues builds even when migration connections fail
- **Verification**: Confirms database schema is properly applied

**Migration Strategy**:
1. **Preferred**: Direct database connection (port 5432) for complete migration support
2. **Fallback**: Pooled connection (port 6543) with limited migration capabilities
3. **Safety**: Skip migrations in Vercel if connections fail (schema already applied)

**Build Verification**:
- ✅ Prisma client generation 
- ✅ TypeScript compilation (all errors resolved)
- ✅ Database schema validation (matches migration structure)
- ✅ Sentry source map upload configured

**Production Build Status**:
- TypeScript compilation: ✅ READY
- Prisma schema: ✅ READY (matches database migrations)
- Sentry integration: ✅ READY (duplicate Session Replay instances resolved)
- Admin functionality: ✅ READY (uses correct Prisma models)
- API routes: ✅ READY (all type errors resolved)
- Interview system: 🔄 REFACTORING for Google Cloud pivot

## 🐳 Dockerization & Cloud Run Deployment Guidance

**Objective**: Containerize VocaHire using Docker for deployment on Google Cloud Run. This ensures a consistent environment and leverages Cloud Run's scalability.

### AI Developers (Claude & Gemini), your tasks:

#### 1. Create Dockerfile (in project root):

Use a multi-stage build for optimized image size.

**builder Stage:**
- Start from an official Node.js image (e.g., `node:20-alpine` or `node:20-slim`)
- Set `WORKDIR /app`
- Copy `package.json`, `pnpm-lock.yaml` (and `pnpm-workspace.yaml` if still relevant)
- Install pnpm: `npm install -g pnpm`
- Install dependencies: `pnpm install --frozen-lockfile`
- Copy the entire codebase: `COPY . .`
- **Crucially**, run `pnpm prisma generate` to ensure Prisma Client is built for the target architecture
- Build the Next.js application: `pnpm build` (this should use our existing build script)

**runner Stage:**
- Start from a lean Node.js image (e.g., `node:20-alpine`)
- Set `WORKDIR /app`
- Set `NODE_ENV=production`
- Copy `package.json` and `pnpm-lock.yaml`
- Install only production dependencies: `pnpm install --prod --frozen-lockfile`
- Copy build artifacts from the builder stage:
  - `.next/standalone` (for Next.js Output File Tracing output)
  - `public` directory
  - `.next/static` directory
  - **Prisma Client**: Ensure the generated Prisma Client from the builder stage is correctly copied. The path is typically `node_modules/.prisma/client`
- Expose the port Next.js runs on (default 3000): `EXPOSE 3000`
- Set the command to start the application: `CMD ["node", "server.js"]` (assuming standalone output)
- **User**: Consider running as a non-root user for security: `USER node`

#### 2. Create .dockerignore (in project root):

```
node_modules
.next
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
*.tsbuildinfo
# Add any other local development files/folders
.git
.DS_Store
# Local environment files (should be passed as env vars to Cloud Run)
.env
.env*.local 
# Docker specific
Dockerfile
.dockerignore
# Prisma generated files (will be generated during build)
prisma/generated
```

### Local Docker Testing Workflow:

1. **Build**: `docker build -t vocahire-coach .`
2. **Run**: 
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your_local_or_dev_db_url" \
     -e GOOGLE_APPLICATION_CREDENTIALS="/path/to/keyfile.json" \
     -e GOOGLE_PROJECT_ID="your-gcp-project" \
     ... (other env vars) \
     vocahire-coach
   ```
   **Note**: For `GOOGLE_APPLICATION_CREDENTIALS`, you'll need to mount the keyfile into the container or use other secure methods for local Docker runs.

### Cloud Run Deployment (via gcloud CLI - for CI/CD automation):

1. **Push image to Google Artifact Registry**:
   ```bash
   gcloud auth configure-docker YOUR_REGION-docker.pkg.dev
   docker tag vocahire-coach YOUR_REGION-docker.pkg.dev/YOUR_GCP_PROJECT_ID/vocahire/vocahire-coach:latest
   docker push YOUR_REGION-docker.pkg.dev/YOUR_GCP_PROJECT_ID/vocahire/vocahire-coach:latest
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy vocahire-coach-service \
     --image YOUR_REGION-docker.pkg.dev/YOUR_GCP_PROJECT_ID/vocahire/vocahire-coach:latest \
     --platform managed \
     --region YOUR_GCP_REGION \
     --allow-unauthenticated \ # Or configure IAM for authentication
     --set-env-vars="DATABASE_URL=your_prod_db_url,GOOGLE_PROJECT_ID=your_gcp_project,..." \
     --port 3000 \
     --cpu=1 \
     --memory=512Mi \  # Adjust as needed
     --concurrency=80  # Adjust based on performance testing
   ```

**IMPORTANT for DATABASE_URL on Cloud Run**: Use the Cloud SQL Proxy connection string format if Supabase/Postgres is running in Cloud SQL, or the standard connection string if it's an external Supabase instance (ensure Cloud Run outbound IP is whitelisted in Supabase).

**GOOGLE_APPLICATION_CREDENTIALS on Cloud Run**: Not needed if the Cloud Run service account has the necessary IAM permissions for Google Cloud AI services. Best practice is to grant specific roles (e.g., "Cloud AI Service User", "Speech-to-Text User", "Text-to-Speech User", "Vertex AI User") to the Cloud Run service's runtime service account.

### Build Script Adaptation:

The existing build script focuses on `next build` and Prisma migrations. For CI/CD:
1. `pnpm install`
2. `pnpm prisma generate`
3. `pnpm build` (runs Next.js build)
4. `docker build ...` (uses artifacts from step 3)
5. `docker push ...`
6. `gcloud run deploy ...`

Database migrations (`npx prisma migrate deploy` using `MIGRATE_DATABASE_URL`) should run as a separate, earlier step in CI/CD, or carefully managed if part of the container deployment.

### Guidance for AI Developers on this task:

**Claude**: Please generate an initial `Dockerfile` and `.dockerignore` based on the structure outlined above. Focus on the multi-stage build and ensuring `prisma generate` and `pnpm build` are correctly placed.

**Gemini**: Once Claude provides the initial Docker setup, please review it for Google Cloud best practices, especially regarding environment variable handling for Cloud Run, and optimization for image size and build speed. Also, advise on the best way to manage `GOOGLE_APPLICATION_CREDENTIALS` for local Docker runs versus Cloud Run deployment (service accounts).

**Both**: Update our Development Commands section to include Docker build/run commands and common `gcloud run` commands.

This Dockerization effort is **[PIVOT-CRITICAL]** and should be prioritized.

## Interview System Architecture (Google Cloud STT-LLM-TTS Pipeline)

### 🚀 NEW ARCHITECTURE: Google Cloud Integration (Pivot initiated May 25, 2025)

VocaHire is transitioning from a direct OpenAI WebRTC integration to a modular Google Cloud-based architecture:

**New Architecture Overview:**
```
Client (Browser) 
  ↓ WebRTC Audio Stream
VocaHire Backend Orchestrator
  ↓ Audio chunks
Google Speech-to-Text (streaming)
  ↓ Transcript + VAD events
VocaHire Logic Layer (turn-taking, context management)
  ↓ Text prompt
Google Vertex AI (Gemini/PaLM)
  ↓ Response text
SSML Generation
  ↓ SSML markup
Google Text-to-Speech
  ↓ Audio stream
VocaHire Backend
  ↓ WebRTC Audio Stream
Client (Browser)
```

### Key Implementation Areas

#### 1. API Contract Documentation (`/docs/orchestrator-api-spec.md`)
```markdown
// TO BE CREATED by Claude - Target: May 26, 2025
// This document will define:
// - HTTP endpoints for session management
// - WebSocket message formats and events
// - Data schemas for all client-backend communication
// - Error codes and handling patterns
// - State transition diagrams
```

#### 2. Backend Orchestration Service (Standalone Cloud Run Service)
```typescript
// TO BE IMPLEMENTED by Gemini - Target: May 26-30, 2025
// Based on API contract from Claude
// Responsibilities:
// - Expose API endpoints defined in orchestrator-api-spec.md
// - Manage WebRTC connection with client
// - Stream audio to Google STT
// - Handle turn-taking logic
// - Manage conversation context
// - Call Vertex AI for responses
// - Generate SSML and call TTS
// - Stream audio back to client
// - Be fully Dockerized for Cloud Run
```

#### 2. Google Cloud Utils (`/lib/google-cloud-utils.ts`)
```typescript
// TO BE IMPLEMENTED - Target: May 26-27, 2025
// TODO: Initial setup by Claude, enhanced by Gemini
// - Google Cloud authentication
// - Speech-to-Text client setup
// - Text-to-Speech client setup
// - Vertex AI client setup
// - SSML generation utilities
// - Stream handling utilities
```

#### 3. Refactored Hook (`/hooks/useRealtimeInterviewSession.ts`)
```typescript
// MAJOR REFACTOR REQUIRED - Target: May 28-31, 2025
// TODO: Coordinate between Claude and Gemini for smooth transition
// Changes needed:
// - Remove OpenAI-specific logic
// - Connect to our backend orchestrator
// - Handle new event structure
// - Maintain existing UI contract
```

### Google Cloud API Compliance

**Speech-to-Text Configuration:**
- Model: Universal Speech Model (latest_long)
- Streaming recognition with interim results
- Voice Activity Detection (VAD) events enabled
- Custom vocabulary for interview terms
- Language: en-US with automatic punctuation

**Text-to-Speech Configuration:**
- Voice: WaveNet or Neural2 voices for natural speech
- SSML support for prosody control
- Streaming synthesis for low latency
- Audio encoding: MP3 or OGG_OPUS for WebRTC

**Vertex AI Configuration:**
- Model: Gemini 1.5 Pro (preferred) or PaLM 2
- Context window management for conversation history
- System prompt for interview coach persona
- Response streaming for reduced latency
- Temperature and top-p tuning for consistent responses

### Critical Implementation Considerations

1. **Latency Management**:
   - Each service adds latency: STT (100-300ms) + LLM (500-2000ms) + TTS (100-300ms)
   - Implement streaming wherever possible
   - Consider response prefetching for common questions

2. **Turn-Taking & Interruptions**:
   - Use STT VAD events to detect when user stops speaking
   - Implement barge-in detection to handle interruptions
   - Buffer management for smooth conversation flow

3. **Context Management**:
   - Maintain conversation history for LLM context
   - Implement sliding window for long conversations
   - Track interview progress and adapt questions

4. **Error Handling**:
   - Graceful degradation if any service fails
   - Fallback responses for common scenarios
   - Comprehensive error logging to Sentry

5. **Cost Optimization**:
   - Monitor usage of each Google Cloud service
   - Implement caching for common TTS responses
   - Use appropriate models for cost/quality balance

### Interview Data Persistence Architecture

**Data Flow (Unchanged from OpenAI version):**
1. **Real-time Collection**: Transcripts captured from Google STT
2. **Session Storage**: Full conversation stored in messages array
3. **Primary Persistence**: POST to `/api/interviews` on completion
4. **Fallback Storage**: localStorage backup if database fails
5. **Async Feedback**: Background job using Vertex AI

**Key Differences:**
- Transcript format may differ (Google STT vs OpenAI)
- Feedback generation will use Vertex AI instead of OpenAI
- Additional metadata about STT confidence scores
- SSML used for responses can be stored for analysis

## VocahireCredits System

VocaHire uses a branded credit system called "VocahireCredits" for consistent user experience:

### Credit Economy
- **Initial Grant**: New users receive 3.00 VocahireCredits upon account creation
- **Minimum Required**: 0.50 VocahireCredits required to access interview functionality
- **Interview Cost**: 1.00 VocahireCredits per interview session (non-premium users)
- **Premium Users**: Unlimited interviews with active subscription

### Credit Validation Logic
```typescript
const MINIMUM_CREDITS_REQUIRED = 0.50;
const INTERVIEW_COST = 1.00;

// Automatic credit grant for new users (0 credits → 3.00 credits)
if (Number(user.credits) === 0) {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: 3.00 }
  });
}

// Credit requirement validation
if (!user.isPremium && Number(user.credits) < MINIMUM_CREDITS_REQUIRED) {
  return NextResponse.json({ 
    error: `Insufficient VocahireCredits. You need at least ${MINIMUM_CREDITS_REQUIRED} VocahireCredits to start an interview.`,
    currentCredits: Number(user.credits),
    minimumRequired: MINIMUM_CREDITS_REQUIRED
  }, { status: 403 });
}

// Credit deduction after successful session creation
await prisma.user.update({
  where: { id: userId },
  data: { credits: { decrement: INTERVIEW_COST } }
});
```

### Brand Consistency
- **UI Components**: All user-facing text uses "VocahireCredits" terminology
- **API Responses**: Error messages and success responses reference VocahireCredits
- **Console Logging**: Debug logs consistently use VocahireCredits terminology
- **Database Operations**: Internal operations reference credits but user communication uses VocahireCredits

### Credit Purchase Flow
- Credit packages available via Stripe integration
- Subscription plans provide unlimited access
- Clear messaging about VocahireCredits vs subscription benefits
- User-friendly error messages with current balance display

## Architecture Benefits & Expected Results (Google Cloud Pivot)

### Google Cloud Architecture Advantages

**🎯 Greater Control & Customization**
- Fine-tune each component independently (STT, LLM, TTS)
- Custom vocabulary and model adaptation for interviews
- SSML for nuanced, expressive AI speech
- Complete control over turn-taking logic

**💰 Cost Optimization Potential**
- Pay-per-use pricing for each service
- Ability to cache common responses
- Choose appropriate models for different parts of conversation
- Better visibility into cost drivers

**🔧 Ecosystem Integration**
- Leverage Google's ML ecosystem (AutoML, custom models)
- Integration with Google Analytics and BigQuery
- Enterprise-grade security and compliance
- Global infrastructure with regional deployment options

**📊 Enhanced Analytics**
- STT confidence scores and word-level timing
- Sentiment analysis via Natural Language API
- Custom metrics and logging
- A/B testing different voices and responses

### Implementation Challenges & Mitigations

**⏱️ Latency Management**
- **Challenge**: Multi-service pipeline adds latency
- **Mitigation**: Aggressive streaming, response prefetching, edge deployment

**🔄 Complex Orchestration**
- **Challenge**: Managing state across multiple services
- **Mitigation**: Robust backend orchestrator with clear state management

**🎤 Natural Conversation Flow**
- **Challenge**: Achieving OpenAI-like naturalness with separate services
- **Mitigation**: Advanced SSML, careful prompt engineering, VAD tuning

**💸 Cost Predictability**
- **Challenge**: Multiple services with different pricing models
- **Mitigation**: Usage monitoring, quotas, cost alerts

### Expected Production Results

**Target Metrics:**
- End-to-end latency: < 1.5 seconds (speech-to-speech)
- Conversation naturalness: 4.5/5 user rating
- System reliability: 99.9% uptime
- Cost per interview: 30-50% reduction vs OpenAI

**Key Success Indicators:**
- Smooth turn-taking without awkward pauses
- Natural, expressive AI voice via SSML
- Accurate transcription of interview terminology
- Consistent interview coach persona
- Scalable architecture supporting growth

This architecture positions VocaHire for long-term success with full control over the AI interview experience, cost optimization opportunities, and integration with Google's comprehensive cloud ecosystem.

## 📝 Change Log

### May 25, 2025
- **Major Pivot Decision**: Transitioned from OpenAI/Vercel to Google Cloud architecture
- **Deployment Pivot**: Moving from Vercel to Google Cloud Run via Docker containerization
- **Architecture Evolution**: Shifted from monolithic to modular microservices design
- **Documentation Update**: Updated CLAUDE.md to reflect new strategic direction and deployment approach
- **Collaboration Setup**: Prepared for Gemini AI assistant joining development team
- **Task Allocation**: Defined clear responsibilities - Claude (client-side) and Gemini (backend)
- **Deprecated**: Marked OpenAI implementation as legacy/reference only
- **Deprecated**: Marked Vercel deployment as legacy, transitioning to Cloud Run
- **New Architecture**: Defined Google Cloud STT-LLM-TTS pipeline with modular services
- **New Deployment**: Added comprehensive Dockerization guidance for Cloud Run
- **Timeline**: Set implementation targets for May 26-31, 2025
- **[PIVOT-CRITICAL]** tasks identified: API Contract, Client Refactor, Backend Orchestrator, Dockerization

### Upcoming (May 26, 2025)
- Gemini AI assistant joins development team
- Claude: Create `/docs/orchestrator-api-spec.md` defining client-backend interface
- Claude: Begin refactoring `InterviewPageClient.tsx` and `useRealtimeInterviewSession.ts`
- Gemini: Review API contract and begin backend orchestration service implementation
- Gemini: Create `/lib/google-cloud-utils.ts` for Google Cloud service integration
- Both: Collaborate on Dockerfile creation for modular services