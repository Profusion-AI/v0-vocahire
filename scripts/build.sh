#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

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

# Build Next.js application
echo "Building Next.js application..."
next build

echo "Build process completed!"