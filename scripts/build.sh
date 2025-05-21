#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations using the direct database URL
echo "Running database migrations..."
echo "Environment details:"
echo "  VERCEL: $VERCEL"
echo "  DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"
echo "  MIGRATE_DATABASE_URL set: $([ -n "$MIGRATE_DATABASE_URL" ] && echo "YES" || echo "NO")"

# Try to check migration status first
echo "Checking migration status..."
if [ -n "$MIGRATE_DATABASE_URL" ]; then
  DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate status || {
    echo "Migration status check failed with direct URL"
  }
else
  npx prisma migrate status || {
    echo "Migration status check failed with default URL"
  }
fi

echo "Attempting to deploy migrations..."
if [ -n "$MIGRATE_DATABASE_URL" ]; then
  DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate deploy
else
  npx prisma migrate deploy
fi

# Check the exit code of the last command
if [ $? -ne 0 ]; then
  echo "ERROR: Database migration failed. Build cannot continue."
  echo "This error means Vercel build environment cannot connect to Supabase direct URL."
  echo ""
  echo "Likely causes in order of probability:"
  echo " 1. IPv6 connectivity issue between Vercel and Supabase direct connection"
  echo " 2. Supabase direct URL (port 5432) not accessible from Vercel build environment"
  echo " 3. MIGRATE_DATABASE_URL credentials or format issue"
  echo " 4. Migration conflicts in _prisma_migrations table"
  echo ""
  echo "Connection URLs being used:"
  echo "  Direct (migrations): $(echo $MIGRATE_DATABASE_URL | sed 's/:[^:@]*@/:***@/')"
  echo "  Pooled (runtime): $(echo $DATABASE_URL | sed 's/:[^:@]*@/:***@/')"
  echo ""
  echo "Next steps:"
  echo " 1. Deploy and test /api/diagnostic/connection-test to verify runtime connectivity"
  echo " 2. Consider using pooled URL for migrations as fallback"
  echo " 3. Check if Vercel build environment has different network restrictions"
  exit 1 # Exit with error code to fail the Vercel build
fi

echo "Database migrations completed successfully."

# Build Next.js application
echo "Building Next.js application..."
next build

echo "Build process completed!"