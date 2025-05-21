#!/bin/bash

# Production build script for Vercel deployment
# Use this temporarily if IP allowlist isn't working yet
echo "Starting production build process..."

# Check if we're in a Vercel environment
if [ "$VERCEL" = "1" ]; then
  echo "Detected Vercel environment - skipping migrations (assuming schema is up to date)"
  
  # Generate Prisma client
  echo "Generating Prisma client..."
  npx prisma generate
  
  # Skip migrations in production build
  echo "Skipping database migrations in Vercel build (schema assumed up-to-date from manual deployment)"
else
  echo "Local environment - running full build with migrations"
  
  # Generate Prisma client
  echo "Generating Prisma client..."
  npx prisma generate
  
  # Run migrations using the direct database URL
  echo "Running database migrations..."
  if [ -n "$MIGRATE_DATABASE_URL" ]; then
    DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate deploy
  else
    npx prisma migrate deploy
  fi
  
  # Check the exit code of the last command
  if [ $? -ne 0 ]; then
    echo "ERROR: Database migration failed. Build cannot continue."
    echo "This error means the database schema is not in sync with your code."
    echo "Common causes:"
    echo " - Supabase IP allowlist missing Vercel egress IPs"
    echo " - MIGRATE_DATABASE_URL incorrect or inaccessible"
    echo " - Database permissions issue"
    echo " - Migration conflicts in _prisma_migrations table"
    echo ""
    echo "Required Vercel egress IPs for Supabase allowlist:"
    echo " - 76.76.21.0/24"
    echo " - 151.115.16.0/22" 
    echo " - 76.76.16.0/20"
    echo ""
    echo "To debug: run 'npx prisma migrate status' locally with MIGRATE_DATABASE_URL set"
    exit 1 # Exit with error code to fail the build
  fi
  
  echo "Database migrations completed successfully."
fi

# Build Next.js application
echo "Building Next.js application..."
next build

echo "Build process completed!"