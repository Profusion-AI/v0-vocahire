#!/bin/bash

# Fallback build script that uses pooled connection for migrations
# Use this if direct connection (port 5432) doesn't work from Vercel
echo "Starting build process with pooled migrations..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Try direct URL first, fall back to pooled URL for migrations
echo "Running database migrations..."
echo "Environment details:"
echo "  VERCEL: $VERCEL"
echo "  DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"
echo "  MIGRATE_DATABASE_URL set: $([ -n "$MIGRATE_DATABASE_URL" ] && echo "YES" || echo "NO")"

MIGRATION_SUCCESS=false

# First attempt: Use direct URL if available
if [ -n "$MIGRATE_DATABASE_URL" ]; then
  echo "Attempting migrations with direct database URL..."
  if DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate deploy; then
    echo "✅ Migrations successful with direct URL"
    MIGRATION_SUCCESS=true
  else
    echo "⚠️  Direct URL migration failed, trying pooled URL..."
  fi
fi

# Second attempt: Use pooled URL as fallback
if [ "$MIGRATION_SUCCESS" = false ] && [ -n "$DATABASE_URL" ]; then
  echo "Attempting migrations with pooled database URL (fallback)..."
  echo "NOTE: Using pooled connection for migrations may have limitations"
  
  if npx prisma migrate deploy; then
    echo "✅ Migrations successful with pooled URL"
    MIGRATION_SUCCESS=true
  else
    echo "❌ Pooled URL migration also failed"
  fi
fi

# Check if any migration method worked
if [ "$MIGRATION_SUCCESS" = false ]; then
  echo "ERROR: All migration attempts failed. Build cannot continue."
  echo ""
  echo "Both direct and pooled database connections failed for migrations."
  echo "This suggests a fundamental connectivity issue from Vercel to Supabase."
  echo ""
  echo "Debugging steps:"
  echo " 1. Verify database credentials in environment variables"
  echo " 2. Check Supabase project status and connectivity"
  echo " 3. Test connections via /api/diagnostic/connection-test"
  echo " 4. Consider IPv6/IPv4 connectivity issues"
  exit 1
fi

echo "Database migrations completed successfully."

# Build Next.js application
echo "Building Next.js application..."
next build

echo "Build process completed!"