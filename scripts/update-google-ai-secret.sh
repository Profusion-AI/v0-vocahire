#!/bin/bash

# Script to update GOOGLE_AI_API_KEY in Google Secret Manager for production use

set -e

echo "🔐 Google AI API Key Update for Production"
echo "=========================================="
echo ""
echo "This will update the GOOGLE_AI_API_KEY in Secret Manager"
echo "that your production Cloud Run service uses."
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

# Function to validate API key format
validate_api_key() {
    if [[ $1 =~ ^AIza[a-zA-Z0-9_-]{35}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Check if we can read the current secret value
echo "🔍 Checking current secret status..."
if gcloud secrets describe GOOGLE_AI_API_KEY &> /dev/null; then
    echo "✅ Secret exists in Secret Manager"
    CURRENT_KEY=$(gcloud secrets versions access latest --secret="GOOGLE_AI_API_KEY" 2>/dev/null || echo "")
    if [ -n "$CURRENT_KEY" ]; then
        echo "📝 Current key starts with: ${CURRENT_KEY:0:20}..."
    fi
else
    echo "⚠️  Secret doesn't exist yet, will create it"
fi

echo ""
echo "🔑 Enter your Google AI Studio API Key"
echo "   (Get one from: https://aistudio.google.com/apikey)"
echo ""
read -p "API Key: " NEW_API_KEY

# Validate the API key
if ! validate_api_key "$NEW_API_KEY"; then
    echo "❌ Invalid API key format. Google AI keys start with 'AIza' and are 39 characters long."
    exit 1
fi

echo ""
echo "📋 Summary:"
echo "   - Project: $PROJECT_ID"
echo "   - New API Key: ${NEW_API_KEY:0:20}..."
echo ""
read -p "🚀 Update the production secret? (y/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🔄 Updating secret..."

# Create or update the secret
if gcloud secrets describe GOOGLE_AI_API_KEY &> /dev/null; then
    # Secret exists, create new version
    echo "$NEW_API_KEY" | gcloud secrets versions add GOOGLE_AI_API_KEY --data-file=-
    echo "✅ Secret updated with new version"
else
    # Create new secret
    echo "$NEW_API_KEY" | gcloud secrets create GOOGLE_AI_API_KEY --data-file=- --replication-policy="automatic"
    echo "✅ Secret created"
fi

# Ensure Cloud Run service account has access
SERVICE_ACCOUNT="727828254616-compute@developer.gserviceaccount.com"
echo ""
echo "🔧 Granting access to Cloud Run service account..."
gcloud secrets add-iam-policy-binding GOOGLE_AI_API_KEY \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

echo ""
echo "✅ Done! The secret has been updated in Secret Manager."
echo ""
echo "📝 Next steps:"
echo "   1. The change is immediate - no redeployment needed"
echo "   2. Try starting an interview at https://vocahire.com"
echo "   3. If you still see errors, check Cloud Run logs:"
echo "      gcloud run logs read v0-vocahire --region=us-central1"
echo ""
echo "🔍 To verify the secret is accessible:"
echo "   gcloud secrets versions access latest --secret=GOOGLE_AI_API_KEY | head -c 20"
echo ""