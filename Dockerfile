# VocaHire Monolithic Dockerfile - Phase 1
# This containerizes the entire Next.js application for initial Cloud Run deployment
# Later phases will split into microservices

# Use specific version for reproducibility
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS deps

# Install build dependencies in one layer
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (cache mount disabled for Cloud Build compatibility)
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:${NODE_VERSION} AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ \
    && corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Generate Prisma Client for the target platform
RUN pnpm prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Accept Clerk publishable key as build argument (required for static page generation)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

# Build Next.js application with standalone output
RUN pnpm exec next build

# Stage 3: Runner
FROM node:${NODE_VERSION} AS runner

# Install runtime dependencies only
RUN apk add --no-cache libc6-compat

# Create non-root user first
ARG UID=1001
ARG GID=1001
RUN addgroup -g ${GID} -S nodejs \
    && adduser -S nextjs -u ${UID} -G nodejs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    if (res.statusCode === 200) process.exit(0); \
    else process.exit(1); \
  }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "server.js"]