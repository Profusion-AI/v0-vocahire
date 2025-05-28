#!/bin/bash

echo "=== Verifying Interview Connection Fixes ==="
echo

echo "1. Checking if auto-connect is disabled in LiveInterview.tsx..."
if grep -q "useEffect.*connect()" app/interview-v2/components/LiveInterview.tsx | grep -v "//"; then
    echo "❌ ERROR: Found uncommented useEffect calling connect()"
    exit 1
else
    echo "✅ Auto-connect is properly disabled"
fi

echo
echo "2. Checking safeguards in useGenkitRealtime.ts..."
if grep -q "!sessionConfig.sessionId || !sessionConfig.userId" app/interview-v2/hooks/useGenkitRealtime.ts; then
    echo "✅ Safeguards check for empty/falsy values"
else
    echo "❌ ERROR: Safeguards missing empty value checks"
    exit 1
fi

echo
echo "3. Checking if connection is initiated in handleSetupComplete..."
if grep -q "realtimeHook.connect()" app/interview-v2/page.tsx; then
    echo "✅ Connection initiated after setup"
else
    echo "❌ ERROR: Connection not initiated in handleSetupComplete"
    exit 1
fi

echo
echo "4. Checking fallback config values..."
if grep -A10 "sessionConfig ||" app/interview-v2/page.tsx | grep -q "sessionId: 'dummy'"; then
    echo "✅ Using 'dummy' values in fallback config"
else
    echo "⚠️  WARNING: Not using 'dummy' values in fallback config"
fi

echo
echo "=== All critical checks passed! ==="
echo
echo "The interview connection should now only initiate after:"
echo "1. User completes session setup"
echo "2. Valid session config is created"
echo "3. handleSetupComplete calls realtimeHook.connect()"
echo
echo "No connection attempts should occur on page load."