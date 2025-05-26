# VocaHire Dockerization Strategy

**Document Version**: 1.0  
**Date**: May 25, 2025  
**Author**: Claude (AI Developer)  
**Purpose**: Comprehensive strategy for containerizing VocaHire for Google Cloud Run deployment

## 📋 Executive Summary

This document outlines the strategy for transitioning VocaHire from a Vercel-deployed monolith to a modular, containerized architecture optimized for Google Cloud Run. The approach emphasizes scalability, maintainability, and cost optimization while preserving all existing functionality.

## 🏗️ Architecture Overview

### Current State (Monolithic)
- Single Next.js application handling all functionality
- Deployed on Vercel with serverless functions
- Tight coupling between UI, API routes, and business logic

### Target State (Modular Microservices)
```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Client (React)    │────▶│  API Gateway (BFF)   │────▶│  AI Orchestrator    │
│                     │     │  (Cloud Run)         │     │  (Cloud Run)        │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                      │                             │
                                      ▼                             ▼
                            ┌──────────────────────┐     ┌─────────────────────┐
                            │  Background Jobs     │     │  Google Cloud APIs  │
                            │  (Cloud Run Jobs)    │     │  (STT, TTS, Vertex) │
                            └──────────────────────┘     └─────────────────────┘
```

## 🎯 Service Breakdown

### 1. Frontend Service
**Purpose**: Serve the Next.js client application  
**Technology**: Next.js 15 (App Router), React 19  
**Deployment**: Cloud Run (or potentially Cloud CDN for static assets)  

**Key Characteristics**:
- Stateless React application
- Server-side rendering for SEO
- API calls to backend services
- WebRTC client for real-time communication

### 2. API Gateway / Backend-for-Frontend (BFF)
**Purpose**: Handle authentication, session management, and route requests  
**Technology**: Next.js API routes or Express.js  
**Deployment**: Cloud Run  

**Responsibilities**:
- User authentication (Clerk integration)
- Credit management
- Session initialization
- Request routing to appropriate services
- Response aggregation

### 3. AI Orchestration Service
**Purpose**: Manage the real-time interview pipeline  
**Technology**: Node.js with WebRTC, Google Cloud SDK  
**Deployment**: Cloud Run with WebSocket support  

**Responsibilities**:
- WebRTC connection management
- Audio streaming to/from Google STT/TTS
- Conversation context management
- Integration with Vertex AI
- Turn-taking logic

### 4. Background Jobs Service
**Purpose**: Handle async operations like feedback generation  
**Technology**: Node.js with job queue (Bull/BullMQ)  
**Deployment**: Cloud Run Jobs or Cloud Tasks  

**Responsibilities**:
- Generate interview feedback
- Process usage analytics
- Send notification emails
- Database maintenance tasks

## 🐳 Dockerfile Strategies

### Base Image Selection
```dockerfile
# For Node.js services
FROM node:20-alpine AS base

# For production optimization
FROM gcr.io/distroless/nodejs20 AS runner
```

### Multi-Stage Build Pattern

#### Stage 1: Dependencies
```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

#### Stage 2: Builder
```dockerfile
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Remove dev dependencies
RUN pnpm prune --prod
```

#### Stage 3: Runner
```dockerfile
FROM gcr.io/distroless/nodejs20 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
ENV PORT 3000

CMD ["server.js"]
```

### Service-Specific Dockerfiles

#### Frontend Service Dockerfile
```dockerfile
# Optimized for Next.js with standalone output
FROM node:20-alpine AS deps
# ... (dependency installation)

FROM node:20-alpine AS builder
# ... (build process)
# Important: Configure for standalone output
RUN echo '{"output":"standalone"}' > next.config.json
RUN pnpm build

FROM gcr.io/distroless/nodejs20 AS runner
# ... (runtime configuration)
```

#### AI Orchestration Service Dockerfile
```dockerfile
FROM node:20-alpine AS deps
# ... (dependency installation)

FROM node:20-alpine AS builder
# ... (build process)
# Include Google Cloud SDK if needed
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --upgrade google-cloud-speech google-cloud-texttospeech

FROM node:20-alpine AS runner
# Need full Alpine for native dependencies
# ... (runtime configuration)
```

## 🔧 Local Development Setup

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: ./docker/frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://api-gateway:4000
    volumes:
      - ./app:/app/app
      - ./components:/app/components
      - ./lib:/app/lib
      - ./hooks:/app/hooks
    depends_on:
      - api-gateway

  api-gateway:
    build:
      context: .
      dockerfile: ./docker/api-gateway/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  ai-orchestrator:
    build:
      context: .
      dockerfile: ./docker/ai-orchestrator/Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account.json
    volumes:
      - ./credentials:/app/credentials:ro

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=vocahire_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Development Workflow
```bash
# Start all services
docker-compose up

# Rebuild specific service
docker-compose build api-gateway

# Run database migrations
docker-compose exec api-gateway pnpm prisma migrate dev

# View logs for specific service
docker-compose logs -f ai-orchestrator

# Shell into container
docker-compose exec frontend sh
```

## ☁️ Cloud Run Deployment

### Build and Push Strategy
```bash
# Set project variables
export PROJECT_ID=your-gcp-project
export REGION=us-central1
export REPO_NAME=vocahire

# Configure Docker for Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and tag images
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/frontend:latest -f docker/frontend/Dockerfile .
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/api-gateway:latest -f docker/api-gateway/Dockerfile .
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/ai-orchestrator:latest -f docker/ai-orchestrator/Dockerfile .

# Push to Artifact Registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/frontend:latest
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/api-gateway:latest
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/ai-orchestrator:latest
```

### Cloud Run Service Configuration

#### Frontend Service
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: vocahire-frontend
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
    spec:
      containers:
      - image: us-central1-docker.pkg.dev/PROJECT_ID/vocahire/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: https://api-gateway-xxxxx-uc.a.run.app
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
```

#### AI Orchestrator Service
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: vocahire-ai-orchestrator
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
        # Enable WebSocket support
        run.googleapis.com/cpu-throttling: "false"
    spec:
      serviceAccountName: ai-orchestrator-sa
      containers:
      - image: us-central1-docker.pkg.dev/PROJECT_ID/vocahire/ai-orchestrator:latest
        ports:
        - containerPort: 5000
        resources:
          limits:
            cpu: "4"
            memory: "8Gi"
        # Long timeout for WebSocket connections
        livenessProbe:
          httpGet:
            path: /health
          initialDelaySeconds: 30
          timeoutSeconds: 10
```

## 🔐 Environment Variable Management

### Secret Management Strategy
```bash
# Create secrets in Secret Manager
echo -n "$DATABASE_URL" | gcloud secrets create database-url --data-file=-
echo -n "$STRIPE_SECRET_KEY" | gcloud secrets create stripe-secret-key --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:api-gateway-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Cloud Run Environment Configuration
```bash
# Deploy with secrets
gcloud run deploy api-gateway \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/api-gateway:latest \
  --set-secrets="DATABASE_URL=database-url:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest" \
  --service-account=api-gateway-sa
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Build and Deploy to Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT }}
  REGION: us-central1
  REPO_NAME: vocahire

jobs:
  setup-build-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT }}

    - name: Configure Docker
      run: gcloud auth configure-docker ${REGION}-docker.pkg.dev

    - name: Run Database Migrations
      run: |
        export DATABASE_URL=${{ secrets.MIGRATE_DATABASE_URL }}
        npx prisma migrate deploy

    - name: Build and Push Frontend
      run: |
        docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/frontend:$GITHUB_SHA -f docker/frontend/Dockerfile .
        docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/frontend:$GITHUB_SHA

    - name: Deploy Frontend to Cloud Run
      run: |
        gcloud run deploy vocahire-frontend \
          --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/frontend:$GITHUB_SHA \
          --region ${REGION} \
          --platform managed \
          --allow-unauthenticated
```

## 🛡️ Security Best Practices

### 1. Use Distroless Images
```dockerfile
# Minimize attack surface
FROM gcr.io/distroless/nodejs20
```

### 2. Run as Non-Root User
```dockerfile
# Create and use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 3. Scan for Vulnerabilities
```bash
# Use Google Container Analysis
gcloud container images scan IMAGE_URL
```

### 4. Network Policies
```yaml
# Restrict inter-service communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ai-orchestrator-ingress
spec:
  podSelector:
    matchLabels:
      app: ai-orchestrator
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
```

## 📊 Performance Optimization

### 1. Image Size Optimization
- Use multi-stage builds
- Remove unnecessary files
- Use `.dockerignore` effectively
- Leverage layer caching

### 2. Build Cache Strategy
```dockerfile
# Copy package files first for better caching
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Then copy source code
COPY . .
```

### 3. Cloud Run Configuration
```bash
# Optimize concurrency and scaling
gcloud run deploy SERVICE_NAME \
  --concurrency=1000 \
  --min-instances=1 \
  --max-instances=100 \
  --cpu-boost
```

## 📈 Monitoring and Logging

### 1. Structured Logging
```javascript
// Use structured logging for Cloud Logging
const log = {
  severity: 'INFO',
  message: 'Session started',
  labels: {
    userId: user.id,
    sessionId: session.id
  },
  httpRequest: {
    requestMethod: req.method,
    requestUrl: req.url,
    status: res.statusCode
  }
};
console.log(JSON.stringify(log));
```

### 2. Health Checks
```javascript
// Implement health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

### 3. Metrics and Tracing
```javascript
// OpenTelemetry setup for Cloud Trace
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

const provider = new NodeTracerProvider();
provider.addSpanProcessor(
  new BatchSpanProcessor(new TraceExporter())
);
provider.register();
```

## 🔄 Migration Strategy

### Phase 1: Containerize Monolith (Week 1)
1. Create single Dockerfile for entire Next.js app
2. Test locally with Docker Compose
3. Deploy to Cloud Run as single service
4. Verify all functionality works

### Phase 2: Extract API Gateway (Week 2)
1. Create separate API Gateway service
2. Move authentication logic
3. Implement request routing
4. Update frontend to use new gateway

### Phase 3: Extract AI Orchestrator (Week 3-4)
1. Create standalone orchestrator service
2. Implement WebRTC handling
3. Integrate Google Cloud services
4. Update client to connect to new service

### Phase 4: Optimize and Scale (Week 5)
1. Fine-tune resource allocation
2. Implement auto-scaling policies
3. Add comprehensive monitoring
4. Performance testing and optimization

## 📝 Implementation Checklist

### For Claude (Client-Side Focus):
- [ ] Create `/docs/orchestrator-api-spec.md`
- [ ] Draft initial Dockerfile for frontend service
- [ ] Update `InterviewPageClient.tsx` for new architecture
- [ ] Refactor `useRealtimeInterviewSession.ts` hook
- [ ] Create integration tests for new API
- [ ] Document WebSocket/WebRTC protocols

### For Gemini (Backend Focus):
- [ ] Review and enhance Dockerfiles
- [ ] Implement AI orchestration service
- [ ] Create Google Cloud integration utilities
- [ ] Set up Cloud Run deployment configs
- [ ] Implement health check endpoints
- [ ] Create performance benchmarks

### Joint Tasks:
- [ ] Finalize service boundaries
- [ ] Agree on API contracts
- [ ] Coordinate deployment strategy
- [ ] Plan rollback procedures
- [ ] Document operational runbooks

## 🎯 Success Criteria

1. **Performance**: < 100ms added latency vs monolith
2. **Scalability**: Handle 10x current load
3. **Reliability**: 99.9% uptime SLA
4. **Cost**: 30% reduction in operational costs
5. **Development**: 50% faster feature deployment

## 📚 References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)
- [WebRTC on Cloud Run](https://cloud.google.com/run/docs/triggering/websockets)

---

*This document is a living guide and will be updated as the implementation progresses. Both Claude and Gemini should contribute improvements based on their implementation experiences.*