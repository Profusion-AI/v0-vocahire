# VocaHire Docker Deployment Guide

## Overview

This guide covers the Docker-based deployment strategy for VocaHire as we transition from Vercel to Google Cloud Run.

## Current Status (May 26, 2025)

- **Phase 1 (Current)**: Monolithic containerization - entire Next.js app in single container
- **Phase 2 (Planned)**: API Gateway extraction
- **Phase 3 (Planned)**: AI Orchestrator microservice for Google Cloud integration

## Quick Start

### Local Development

```bash
# Start all services
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Run Prisma migrations
./scripts/docker-dev.sh prisma migrate dev

# Access shell
./scripts/docker-dev.sh shell
```

### Production Deployment

```bash
# Set required environment variables
export GOOGLE_PROJECT_ID=your-project-id
export GOOGLE_REGION=us-central1

# Build, push, and deploy
./scripts/build-docker.sh

# Or individual steps
./scripts/build-docker.sh --build-only
./scripts/build-docker.sh --push-only
./scripts/build-docker.sh --deploy-only
```

## Architecture

### Phase 1: Monolithic Container (Current)
```
┌─────────────────────────┐
│   VocaHire App          │
│   - Next.js Frontend    │
│   - API Routes          │
│   - All Services        │
└─────────────────────────┘
```

### Phase 2-3: Microservices (Future)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Frontend   │  │ API Gateway  │  │AI Orchestrator│
│              │──│              │──│              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=your-supabase-pooled-url
MIGRATE_DATABASE_URL=your-supabase-direct-url

# Redis
REDIS_URL=redis://...
REDIS_TOKEN=...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...

# Payments (Stripe)
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Google Cloud
GOOGLE_PROJECT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account.json

# Monitoring (Sentry)
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=profusion-ai-ny
SENTRY_PROJECT=sentry-indigo-zebra
```

## Docker Commands

### Build locally
```bash
docker build -t vocahire-app .
```

### Run locally
```bash
docker run -p 3000:3000 --env-file .env.local vocahire-app
```

### Multi-platform build (for M1 Macs deploying to Cloud Run)
```bash
docker buildx build --platform linux/amd64 -t vocahire-app .
```

## Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check Docker daemon is running
- Verify sufficient disk space

### Runtime Issues
- Check logs: `docker logs <container-id>`
- Verify database connectivity
- Ensure all required services are running

### Performance
- Monitor memory usage
- Check CPU utilization
- Review Cloud Run metrics

## Next Steps

1. Complete Phase 1 deployment
2. Monitor performance and costs
3. Begin Phase 2 API Gateway extraction
4. Implement AI Orchestrator service

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)