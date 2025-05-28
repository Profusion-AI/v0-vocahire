#!/bin/bash

# Test Core VocaHire Flows
# Run this to quickly validate showstoppers

echo "🧪 Testing VocaHire Core Flows..."
echo "================================"

BASE_URL="https://www.vocahire.com"

# 1. Test Homepage
echo -e "\n✅ Testing Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ $STATUS -eq 200 ]; then
    echo "   ✓ Homepage loads successfully"
else
    echo "   ✗ Homepage failed with status: $STATUS"
fi

# 2. Test API Health
echo -e "\n✅ Testing API Health..."
HEALTH=$(curl -s $BASE_URL/api/health | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
    echo "   ✓ API is healthy"
else
    echo "   ✗ API health check failed"
fi

# 3. Test Auth Pages
echo -e "\n✅ Testing Auth Pages..."
for PAGE in "login" "register"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/$PAGE)
    if [ $STATUS -eq 200 ]; then
        echo "   ✓ /$PAGE loads successfully"
    else
        echo "   ✗ /$PAGE failed with status: $STATUS"
    fi
done

# 4. Test Interview Page (will redirect if not authenticated)
echo -e "\n✅ Testing Interview Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L $BASE_URL/interview-v2)
echo "   → Interview page status: $STATUS (redirect to login is expected)"

# 5. Test Payment Endpoints
echo -e "\n✅ Testing Payment Endpoints..."
# This will fail without auth, but we're checking if the route exists
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/payments/create-checkout-session \
    -H "Content-Type: application/json" \
    -d '{"priceId":"test"}')
echo "   → Payment endpoint status: $STATUS (401/403 expected without auth)"

# 6. Test Static Assets
echo -e "\n✅ Testing Static Assets..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/placeholder-logo.svg)
if [ $STATUS -eq 200 ]; then
    echo "   ✓ Static assets loading correctly"
else
    echo "   ✗ Static assets failed with status: $STATUS"
fi

echo -e "\n================================"
echo "📊 Core Flow Test Complete"
echo ""
echo "Next Steps:"
echo "1. Open $BASE_URL in an incognito browser"
echo "2. Create a new account"
echo "3. Try to start an interview"
echo "4. Document any errors or friction points"