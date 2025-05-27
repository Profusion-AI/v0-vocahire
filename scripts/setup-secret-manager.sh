#!/bin/bash

# VocaHire Secret Manager Setup Script
# Date: May 27, 2025

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="vocahire-prod-20810233"
SERVICE_ACCOUNT_NAME="vocahire-secrets"
REGION="us-central1"

echo -e "${GREEN}🔐 VocaHire Secret Manager Setup${NC}"
echo "=================================="
echo "Project: $PROJECT_ID"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with gcloud${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting project...${NC}"
gcloud config set project $PROJECT_ID

# Enable Secret Manager API
echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# Create service account
echo -e "${YELLOW}Creating service account...${NC}"
if gcloud iam service-accounts describe ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com --project=$PROJECT_ID &> /dev/null; then
    echo "Service account already exists, skipping creation"
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="VocaHire Secret Manager Access" \
        --project=$PROJECT_ID
fi

# Grant Secret Manager accessor role to service account
echo -e "${YELLOW}Granting Secret Manager access to service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None

# Get project number for default compute service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant Secret Manager accessor role to Cloud Run default service account
echo -e "${YELLOW}Granting Secret Manager access to Cloud Run service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None

# Function to create or update a secret
create_or_update_secret() {
    local secret_name=$1
    local prompt_text=$2
    
    # Check if secret exists
    if gcloud secrets describe $secret_name --project=$PROJECT_ID &> /dev/null; then
        echo -e "${YELLOW}Secret '$secret_name' already exists.${NC}"
        read -p "Do you want to update it? (y/N): " update_choice
        if [[ $update_choice =~ ^[Yy]$ ]]; then
            read -s -p "$prompt_text: " secret_value
            echo ""
            echo -n "$secret_value" | gcloud secrets versions add $secret_name \
                --data-file=- \
                --project=$PROJECT_ID
            echo -e "${GREEN}✓ Secret '$secret_name' updated${NC}"
        else
            echo "Skipping '$secret_name'"
        fi
    else
        read -s -p "$prompt_text: " secret_value
        echo ""
        echo -n "$secret_value" | gcloud secrets create $secret_name \
            --data-file=- \
            --replication-policy="automatic" \
            --project=$PROJECT_ID
        echo -e "${GREEN}✓ Secret '$secret_name' created${NC}"
    fi
}

# Create secrets
echo -e "\n${YELLOW}Creating secrets...${NC}"
echo "Please enter the values for each secret (input will be hidden):"
echo ""

# Database
create_or_update_secret "DATABASE_URL" "Enter DATABASE_URL (e.g., postgresql://user:pass@host:5432/db)"

# Clerk
create_or_update_secret "CLERK_SECRET_KEY" "Enter CLERK_SECRET_KEY (starts with sk_)"

# Stripe
create_or_update_secret "STRIPE_SECRET_KEY" "Enter STRIPE_SECRET_KEY (starts with sk_)"
create_or_update_secret "STRIPE_WEBHOOK_SECRET" "Enter STRIPE_WEBHOOK_SECRET (starts with whsec_)"

# Redis
create_or_update_secret "REDIS_URL" "Enter REDIS_URL (e.g., redis://host:6379)"

# Optional: Supabase
read -p "Do you use Supabase? (y/N): " use_supabase
if [[ $use_supabase =~ ^[Yy]$ ]]; then
    create_or_update_secret "SUPABASE_SERVICE_ROLE_KEY" "Enter SUPABASE_SERVICE_ROLE_KEY"
fi

# Check if Cloud Run service exists
echo -e "\n${YELLOW}Checking Cloud Run service...${NC}"
if gcloud run services describe vocahire-web --region=$REGION --project=$PROJECT_ID &> /dev/null; then
    echo -e "${GREEN}✓ Cloud Run service 'vocahire-web' found${NC}"
    
    read -p "Do you want to update the Cloud Run service with these secrets? (y/N): " update_service
    if [[ $update_service =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Updating Cloud Run service...${NC}"
        
        SECRET_FLAGS="--update-secrets=DATABASE_URL=DATABASE_URL:latest"
        SECRET_FLAGS="$SECRET_FLAGS --update-secrets=CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest"
        SECRET_FLAGS="$SECRET_FLAGS --update-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest"
        SECRET_FLAGS="$SECRET_FLAGS --update-secrets=STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest"
        SECRET_FLAGS="$SECRET_FLAGS --update-secrets=REDIS_URL=REDIS_URL:latest"
        
        if [[ $use_supabase =~ ^[Yy]$ ]]; then
            SECRET_FLAGS="$SECRET_FLAGS --update-secrets=SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest"
        fi
        
        gcloud run services update vocahire-web \
            $SECRET_FLAGS \
            --region=$REGION \
            --project=$PROJECT_ID
        
        echo -e "${GREEN}✓ Cloud Run service updated with secrets${NC}"
    fi
else
    echo -e "${YELLOW}Cloud Run service 'vocahire-web' not found. You'll need to set up secrets when deploying.${NC}"
fi

# Create local development key
echo -e "\n${YELLOW}Local development setup...${NC}"
read -p "Do you want to create a service account key for local development? (y/N): " create_key
if [[ $create_key =~ ^[Yy]$ ]]; then
    KEY_FILE="vocahire-secrets-local.json"
    
    if [ -f "$KEY_FILE" ]; then
        echo -e "${YELLOW}Key file already exists. Skipping creation.${NC}"
    else
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
            --project=$PROJECT_ID
        
        echo -e "${GREEN}✓ Service account key created: $KEY_FILE${NC}"
        echo -e "${RED}⚠️  IMPORTANT: Add this file to .gitignore and never commit it!${NC}"
        
        # Check if .gitignore exists and add the key file
        if [ -f ".gitignore" ]; then
            if ! grep -q "$KEY_FILE" .gitignore; then
                echo "$KEY_FILE" >> .gitignore
                echo -e "${GREEN}✓ Added $KEY_FILE to .gitignore${NC}"
            fi
        fi
    fi
    
    echo -e "\n${YELLOW}To use in local development:${NC}"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=\"./$KEY_FILE\""
fi

# Summary
echo -e "\n${GREEN}✅ Secret Manager setup complete!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update your application code to use Secret Manager"
echo "2. Test secret access locally and in Cloud Run"
echo "3. Delete any .env files with sensitive data"
echo "4. Set up secret rotation reminders (every 90 days)"
echo ""
echo "View your secrets:"
echo "  gcloud secrets list --project=$PROJECT_ID"
echo ""
echo "Access a secret value:"
echo "  gcloud secrets versions access latest --secret=SECRET_NAME --project=$PROJECT_ID"