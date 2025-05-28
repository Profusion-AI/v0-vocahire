#!/bin/bash
# Check domain mapping and DNS status

echo "🔍 Checking domain status for vocahire.com..."
echo "=========================================="

# Check DNS resolution
echo -e "\n📡 DNS Resolution:"
DNS_RESULT=$(dig +short vocahire.com 2>/dev/null | head -1)
if [ -n "$DNS_RESULT" ]; then
    echo "✅ DNS is resolving to: $DNS_RESULT"
    dig +short vocahire.com
else
    echo "⏳ DNS not yet propagated (this can take 5-30 minutes)"
fi

# Check www subdomain
echo -e "\n📡 WWW Subdomain:"
WWW_RESULT=$(dig +short www.vocahire.com 2>/dev/null | head -1)
if [ -n "$WWW_RESULT" ]; then
    echo "✅ www.vocahire.com is resolving"
else
    echo "⏳ www.vocahire.com not yet propagated"
fi

# Check certificate status
echo -e "\n🔐 Certificate Status:"
CERT_STATUS=$(gcloud beta run domain-mappings describe \
    --domain=vocahire.com \
    --region=us-central1 \
    --project=vocahire-prod \
    --format="value(status.conditions[0].message)" 2>/dev/null)
echo "$CERT_STATUS"

# Try to access the domain
echo -e "\n🌐 HTTP Status:"
if [ -n "$DNS_RESULT" ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://vocahire.com --max-time 5 2>/dev/null || echo "Connection failed")
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vocahire.com --max-time 5 2>/dev/null || echo "Connection failed")
    echo "HTTP: $HTTP_STATUS"
    echo "HTTPS: $HTTPS_STATUS"
else
    echo "Waiting for DNS propagation..."
fi

echo -e "\n=========================================="
echo "Run this script again in a few minutes to check progress."
echo "Full SSL setup can take up to 60 minutes after DNS propagation."