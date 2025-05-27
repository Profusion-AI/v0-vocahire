#!/bin/bash

# Cloud Run build script - simple and straightforward
echo "🚀 Starting Cloud Run build process..."

# Load environment variables from .env file if it exists (for local development)
if [ -f ".env" ]; then
  echo "📋 Loading environment variables from .env file..."
  set -a
  source .env
  set +a
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run migrations if DATABASE_URL or MIGRATE_DATABASE_URL is set
if [ -n "$MIGRATE_DATABASE_URL" ] || [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."
  
  # Use MIGRATE_DATABASE_URL if available, otherwise DATABASE_URL
  if [ -n "$MIGRATE_DATABASE_URL" ]; then
    echo "   Using MIGRATE_DATABASE_URL for migrations..."
    DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate deploy
  else
    echo "   Using DATABASE_URL for migrations..."
    npx prisma migrate deploy
  fi
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migration failed"
    echo "   Please ensure database is accessible from build environment"
    exit 1
  fi
else
  echo "⚠️  No database URL configured - skipping migrations"
  echo "   Ensure migrations are run separately before deployment"
fi

# Build Next.js application
echo "📦 Building Next.js application..."
npx next build

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
else
  echo "❌ Next.js build failed"
  exit 1
fi