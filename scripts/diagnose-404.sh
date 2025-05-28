#!/bin/bash

echo "🔍 Diagnosing 404 Error After Login..."
echo "===================================="

# Check for any fetch calls that might be failing
echo -e "\n📡 Checking for potential failing network requests..."
cd /Users/kylegreenwell/Desktop/vocahire-prod/v0-vocahire

# Look for API calls in the auth flow
echo -e "\n1. Auth-related API calls:"
grep -r "fetch\|axios" --include="*.tsx" --include="*.ts" components/auth/ hooks/ | grep -v node_modules | head -10

# Check for prefetch or analytics calls
echo -e "\n2. Analytics or tracking calls:"
grep -r "analytics\|track\|prefetch" --include="*.tsx" --include="*.ts" app/ components/ | grep -v node_modules | grep -v "// track" | head -10

# Check for any absolute URLs that might be wrong
echo -e "\n3. Hardcoded URLs:"
grep -r "https://\|http://" --include="*.tsx" --include="*.ts" app/ components/ hooks/ | grep -v node_modules | grep -v "clerk\|stripe\|supabase" | head -10

# Check middleware for redirects
echo -e "\n4. Middleware redirects:"
grep -r "redirect\|rewrite" middleware.ts | head -10

echo -e "\n===================================="
echo "💡 Common causes of 404 after login:"
echo "1. Vercel Analytics (already removed)"
echo "2. Prefetch requests for missing resources"
echo "3. Old service worker or cached resources"
echo "4. Missing API routes"
echo "5. Incorrect redirect URLs in Clerk config"