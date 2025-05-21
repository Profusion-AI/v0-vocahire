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
- **Error Monitoring**: Sentry for comprehensive error tracking and performance monitoring
- **Deployment**: Vercel with intelligent build system for production readiness

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

# Build for production (uses intelligent Vercel-safe build script)
pnpm build

# Start production server
pnpm start

# Run linting and type checking
pnpm lint

# Generate Prisma client
npx prisma generate

# Run database migrations (development)
npx prisma migrate dev

# Deploy database migrations (production - handled automatically in build)
npx prisma migrate deploy

# Open Prisma database viewer
npx prisma studio

# Test database connectivity
curl /api/diagnostic/connection-test

# Check Sentry error monitoring
curl /api/sentry-example-api
```

## Important Files and Directories

- `/app`: Next.js application routes and components
  - `/app/api`: Backend API routes
  - `/app/api/webhooks`: Webhook handlers for Clerk and Stripe
  - `/app/api/diagnostic`: Database and system health check endpoints
- `/prisma`: Database schema and migrations
- `/components`: Reusable UI components
- `/lib`: Utility functions and service integrations
  - `/lib/prisma.ts`: Production-safe database connection management
  - `/lib/prisma-types.ts`: Type consistency helpers for Decimal handling
- `/hooks`: Custom React hooks
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
- `InterviewSession`: Interview metadata
- `Transcript`: Text records of interview conversations
- `Feedback`: AI-generated interview feedback

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

## Environment Variables

### Critical Production Environment Variables

**Database Configuration:**
- `DATABASE_URL`: PostgreSQL connection string (pooled, port 6543) for runtime operations
- `MIGRATE_DATABASE_URL`: PostgreSQL direct connection string (port 5432) for migrations

**Authentication & Services:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key for client-side auth
- `CLERK_SECRET_KEY`: Clerk secret key for server-side operations
- `CLERK_WEBHOOK_SECRET`: Secret for verifying Clerk webhook events

**Payment Processing:**
- `STRIPE_SECRET_KEY`: Stripe API key for server-side operations
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key for client-side
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events

**AI & Monitoring:**
- `OPENAI_API_KEY`: OpenAI API key for AI interview functionality
- `SENTRY_DSN`: Sentry Data Source Name for error monitoring
- `SENTRY_AUTH_TOKEN`: Sentry authentication token for source map uploads
- `SENTRY_ORG`: profusion-ai-ny
- `SENTRY_PROJECT`: sentry-indigo-zebra

**Deployment:**
- `VERCEL`: Automatically set to "1" in Vercel environment (used by build script)

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
- Default of 3 credits for new users
- Basic profile information synced from Clerk (name, email)
- A Stripe Customer ID for future payments

## Deployment & Production Infrastructure

### Vercel Deployment

The application is deployed on Vercel with automatic CI/CD from GitHub and production-grade infrastructure:

**Build Process:**
- Uses intelligent build script (`/scripts/build-vercel-safe.sh`) that handles network restrictions
- Automatically handles database migrations with fallback strategies
- Generates Prisma client and optimizes for serverless deployment
- Uploads source maps to Sentry for enhanced error tracking

**Production Readiness Features:**
- Real-time error monitoring via Sentry with session replay
- Database connection pooling optimized for serverless
- Comprehensive health check endpoints (`/api/diagnostic/connection-test`)
- Automated payment processing with Stripe webhooks
- Secure authentication with Clerk custom domain

### Post-Deployment Verification

After each deployment, verify these endpoints:
1. `/api/diagnostic/connection-test` - Database connectivity
2. `/api/user` - User authentication and data consistency
3. `/api/sentry-example-api` - Error monitoring functionality
4. Health checks for Stripe webhooks and Clerk integration

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
- OpenAI for advanced AI interview capabilities
- Sentry for comprehensive error tracking and performance monitoring

**Build & Deployment:**
- Vercel for optimized serverless deployment
- Custom build scripts for production reliability

## Payment System

VocaHire uses Stripe for payment processing with various product offerings:

### Credit Packages
- Three Credits (prod_SJPpjWE9zhJnEh): 3 top-up credits for existing users
- Five Credits (prod_SJQ8EwiLxPh62L): 5 bundled credits

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

2. **Error Testing**: `/api/sentry-example-api`
   - Triggers test errors to verify Sentry integration
   - Useful for validating error monitoring setup

3. **User API**: `/api/user`
   - Tests authentication flow with Clerk
   - Validates database user operations
   - Checks fallback logic for database failures

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
- Sentry integration: ✅ READY (API updated to v9.x)
- Admin functionality: ✅ READY (uses correct Prisma models)
- API routes: ✅ READY (all type errors resolved)