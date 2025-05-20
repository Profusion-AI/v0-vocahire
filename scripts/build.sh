#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations using the direct database URL
echo "Running database migrations..."
if [ -n "$MIGRATE_DATABASE_URL" ]; then
  DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate deploy || {
    echo "WARNING: Database migration failed. This might be due to IP restrictions."
    echo "Make sure Vercel's IP ranges are added to Supabase's IP allowlist:"
    echo " - 76.76.21.0/24"
    echo " - 151.115.16.0/22"
    echo " - 76.76.16.0/20"
    echo "Continuing build process anyway..."
  }
else
  npx prisma migrate deploy || {
    echo "WARNING: Database migration failed. This might be due to IP restrictions."
    echo "Make sure Vercel's IP ranges are added to Supabase's IP allowlist."
    echo "Continuing build process anyway..."
  }
fi

# Build Next.js application
echo "Building Next.js application..."
next build

echo "Build process completed!"