#!/bin/sh
# Fix Prisma client model accessor errors

rm -rf node_modules .prisma
pnpm install
npx prisma generate

echo "Prisma client and node_modules have been fully reset. Restart your IDE/TypeScript server if errors persist."
