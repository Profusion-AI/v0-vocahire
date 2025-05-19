# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VocaHire is an AI interview coaching platform that enables users to practice interviews with a real-time voice AI, receive personalized feedback, and improve their skills. The platform is built with Next.js 15 using the App Router pattern, and it includes various services for authentication, database storage, payments, and AI interactions.

## Architecture

### Core Technologies

- **Framework**: Next.js 15 (App Router) for full-stack development
- **Database**: PostgreSQL via Supabase (accessed through Prisma ORM)
- **Authentication**: Clerk for user management and session handling
- **Payments**: Stripe for handling one-time purchases and subscriptions
- **Frontend**: React 19, Shadcn/ui components, Tailwind CSS
- **AI Services**: Integration with OpenAI and Vapi.ai for real-time voice interactions

### Key Components

1. **Auth System**: Clerk handles user authentication with middleware protecting routes
2. **Database Schema**: Prisma ORM defines models for Users, InterviewSessions, Transcripts, Feedback
3. **API Routes**: Next.js API routes for backend functionality
4. **Payment Processing**: Stripe integration for handling credits and premium subscriptions
5. **Real-time Voice**: WebRTC and Vapi.ai for real-time AI interviews

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

# Run linting
pnpm lint

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Deploy database migrations (used in build process)
npx prisma migrate deploy

# Open Prisma database viewer
npx prisma studio
```

## Important Files and Directories

- `/app`: Next.js application routes and components
  - `/app/api`: Backend API routes
  - `/app/api/webhooks`: Webhook handlers for Clerk and Stripe
- `/prisma`: Database schema and migrations
- `/components`: Reusable UI components
- `/lib`: Utility functions and service integrations
- `/hooks`: Custom React hooks

## Database Management

The application uses Prisma as an ORM with PostgreSQL (via Supabase). Key models include:

- `User`: User profiles and authentication data
- `InterviewSession`: Interview metadata
- `Transcript`: Text records of interview conversations
- `Feedback`: AI-generated interview feedback

### Supabase Connection Strategy

**Important**: Supabase provides both pooled and direct connection strings. The build process uses different connections for different purposes:

- **Runtime**: `DATABASE_URL` (pooled connection) - Used by the application during runtime
- **Migrations**: `MIGRATE_DATABASE_URL` (direct connection) - Used by `prisma migrate deploy` during builds to avoid pgbouncer issues

## Environment Variables

Important environment variables include:

- `DATABASE_URL`: PostgreSQL connection string (pooled)
- `MIGRATE_DATABASE_URL`: PostgreSQL direct connection string (non-pooled) for migrations
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `STRIPE_SECRET_KEY`: Stripe API key
- `OPENAI_API_KEY`: OpenAI API key

## Webhook Integrations

- Clerk webhooks for user data synchronization
- Stripe webhooks for payment event handling

## Deployment

The application is deployed on Vercel with automatic CI/CD from GitHub.

## Key Dependencies

- Next.js for the framework
- Clerk for authentication
- Prisma for database access
- Stripe for payments
- Shadcn/ui and Tailwind for UI
- OpenAI for AI capabilities

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
- Ensure credit system is accurately tracked and debited
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

- Admin dashboards must show real user activity
- Usage metrics must accurately reflect API calls and resource consumption
- Payment tracking must align with Stripe dashboard
- Error tracking should capture and alert on production issues