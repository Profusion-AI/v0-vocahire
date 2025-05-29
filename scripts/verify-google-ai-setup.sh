#!/bin/bash

# Script to verify Google AI API key setup in production

set -e

echo "🔍 Google AI API Key Verification Script"
echo "========================================"
echo ""

# Check if user has gcloud configured
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found. Please install it first."
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
echo "📍 Current project: $PROJECT_ID"
echo ""

# Step 1: Check if secret exists
echo "1️⃣ Checking if GOOGLE_AI_API_KEY secret exists..."
if gcloud secrets describe GOOGLE_AI_API_KEY &> /dev/null; then
    echo "✅ Secret exists"
    
    # Try to access it
    echo ""
    echo "2️⃣ Checking if secret is accessible..."
    if KEY_VALUE=$(gcloud secrets versions access latest --secret="GOOGLE_AI_API_KEY" 2>/dev/null); then
        echo "✅ Secret is accessible"
        echo "   Key starts with: ${KEY_VALUE:0:10}..."
        echo "   Key length: ${#KEY_VALUE} characters"
        
        # Validate format
        if [[ $KEY_VALUE =~ ^AIza[a-zA-Z0-9_-]{35}$ ]]; then
            echo "✅ Key format is valid"
        else
            echo "⚠️  Key format doesn't match expected pattern"
        fi
    else
        echo "❌ Cannot access secret value"
    fi
else
    echo "❌ Secret does not exist"
    echo ""
    echo "To create it, run:"
    echo "  ./scripts/update-google-ai-secret.sh"
    exit 1
fi

# Step 2: Check Cloud Run service configuration
echo ""
echo "3️⃣ Checking Cloud Run service configuration..."
SERVICE_NAME="v0-vocahire"
REGION="us-central1"

if gcloud run services describe $SERVICE_NAME --region=$REGION &> /dev/null; then
    echo "✅ Cloud Run service found"
    
    # Check if secret is mounted
    echo ""
    echo "4️⃣ Checking if secret is mounted to Cloud Run..."
    if gcloud run services describe $SERVICE_NAME --region=$REGION --format=json | jq -r '.spec.template.spec.containers[0].env[]? | select(.name == "GOOGLE_AI_API_KEY")' | grep -q "GOOGLE_AI_API_KEY"; then
        echo "✅ GOOGLE_AI_API_KEY is configured as environment variable"
    else
        echo "⚠️  GOOGLE_AI_API_KEY not found in environment variables"
        echo ""
        echo "To add it, run:"
        echo "  gcloud run services update $SERVICE_NAME \\"
        echo "    --region=$REGION \\"
        echo "    --update-secrets=GOOGLE_AI_API_KEY=GOOGLE_AI_API_KEY:latest"
    fi
else
    echo "❌ Cloud Run service not found"
fi

# Step 3: Check service account permissions
echo ""
echo "5️⃣ Checking service account permissions..."
SERVICE_ACCOUNT="727828254616-compute@developer.gserviceaccount.com"

if gcloud secrets get-iam-policy GOOGLE_AI_API_KEY --format=json | jq -r '.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]' | grep -q "$SERVICE_ACCOUNT"; then
    echo "✅ Service account has secretAccessor role"
else
    echo "⚠️  Service account missing secretAccessor role"
    echo ""
    echo "To grant access, run:"
    echo "  gcloud secrets add-iam-policy-binding GOOGLE_AI_API_KEY \\"
    echo "    --member=\"serviceAccount:$SERVICE_ACCOUNT\" \\"
    echo "    --role=\"roles/secretmanager.secretAccessor\""
fi

# Step 4: Test the API key
echo ""
echo "6️⃣ Testing API key with Google AI..."
if [ -n "$KEY_VALUE" ]; then
    echo "Making test request to Google AI API..."
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Content-Type: application/json" \
        -H "x-goog-api-key: $KEY_VALUE" \
        -d '{
          "contents": [{
            "parts": [{
              "text": "Say hello"
            }]
          }]
        }' \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ API key is working!"
    else
        echo "❌ API key test failed"
        echo "   HTTP Status: $HTTP_CODE"
        echo "   Response: $BODY"
    fi
else
    echo "⚠️  Cannot test API key (not accessible)"
fi

echo ""
echo "📋 Summary"
echo "=========="
echo ""
echo "If all checks pass (✅), your Google AI setup is correct."
echo "If any checks fail (❌), follow the suggested commands to fix them."
echo ""
echo "🔗 Useful commands:"
echo "  - Update API key: ./scripts/update-google-ai-secret.sh"
echo "  - Check logs: gcloud logging read 'resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"v0-vocahire\"' --limit=20"
echo "  - Test interview: curl https://vocahire.com/api/interview-v2/health"
echo ""