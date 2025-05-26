#!/bin/bash
set -e

# Script to set up Google Cloud secrets for VocaHire

echo "🔐 Setting up Google Cloud secrets for VocaHire..."

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to create or update a secret
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    local DESCRIPTION=$3
    
    echo -n "  Creating secret ${SECRET_NAME}... "
    
    # Check if secret exists
    if gcloud secrets describe ${SECRET_NAME} --project=${PROJECT_ID} &> /dev/null; then
        # Update existing secret
        echo -n "${SECRET_VALUE}" | gcloud secrets versions add ${SECRET_NAME} \
            --data-file=- \
            --project=${PROJECT_ID}
        echo -e "${GREEN}updated${NC}"
    else
        # Create new secret
        echo -n "${SECRET_VALUE}" | gcloud secrets create ${SECRET_NAME} \
            --data-file=- \
            --replication-policy="automatic" \
            --project=${PROJECT_ID}
        echo -e "${GREEN}created${NC}"
    fi
}

# Function to grant access to service account
grant_secret_access() {
    local SECRET_NAME=$1
    local SERVICE_ACCOUNT=$2
    
    gcloud secrets add-iam-policy-binding ${SECRET_NAME} \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/secretmanager.secretAccessor" \
        --project=${PROJECT_ID} \
        --quiet
}

# Main setup function
setup_secrets() {
    echo "📋 Setting up secrets for environment: $1"
    local ENV_SUFFIX=$1
    
    # Service account
    local SERVICE_ACCOUNT="vocahire-${ENV_SUFFIX}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    echo "🔑 Enter values for secrets (leave blank to skip):"
    
    # Database URL
    read -p "DATABASE_URL: " DATABASE_URL
    if [ ! -z "$DATABASE_URL" ]; then
        create_or_update_secret "database-url-${ENV_SUFFIX}" "$DATABASE_URL" "PostgreSQL connection string"
        grant_secret_access "database-url-${ENV_SUFFIX}" "$SERVICE_ACCOUNT"
    fi
    
    # Redis URL
    read -p "REDIS_URL: " REDIS_URL
    if [ ! -z "$REDIS_URL" ]; then
        create_or_update_secret "redis-url-${ENV_SUFFIX}" "$REDIS_URL" "Redis connection string"
        grant_secret_access "redis-url-${ENV_SUFFIX}" "$SERVICE_ACCOUNT"
    fi
    
    # Clerk Secret Key
    read -p "CLERK_SECRET_KEY: " CLERK_SECRET_KEY
    if [ ! -z "$CLERK_SECRET_KEY" ]; then
        create_or_update_secret "clerk-secret-key-${ENV_SUFFIX}" "$CLERK_SECRET_KEY" "Clerk authentication secret"
        grant_secret_access "clerk-secret-key-${ENV_SUFFIX}" "$SERVICE_ACCOUNT"
    fi
    
    # Stripe Secret Key
    read -p "STRIPE_SECRET_KEY: " STRIPE_SECRET_KEY
    if [ ! -z "$STRIPE_SECRET_KEY" ]; then
        create_or_update_secret "stripe-secret-key-${ENV_SUFFIX}" "$STRIPE_SECRET_KEY" "Stripe payment secret"
        grant_secret_access "stripe-secret-key-${ENV_SUFFIX}" "$SERVICE_ACCOUNT"
    fi
    
    # Google Application Credentials
    read -p "Path to Google service account JSON file: " GOOGLE_CREDS_PATH
    if [ ! -z "$GOOGLE_CREDS_PATH" ] && [ -f "$GOOGLE_CREDS_PATH" ]; then
        GOOGLE_CREDS=$(cat "$GOOGLE_CREDS_PATH")
        create_or_update_secret "google-creds-${ENV_SUFFIX}" "$GOOGLE_CREDS" "Google Cloud service account"
        grant_secret_access "google-creds-${ENV_SUFFIX}" "$SERVICE_ACCOUNT"
    fi
    
    echo -e "${GREEN}✅ Secrets setup complete for ${ENV_SUFFIX}${NC}"
}

# Create service accounts if they don't exist
create_service_accounts() {
    echo "👤 Creating service accounts..."
    
    # Staging service account
    if ! gcloud iam service-accounts describe "vocahire-staging@${PROJECT_ID}.iam.gserviceaccount.com" &> /dev/null; then
        gcloud iam service-accounts create vocahire-staging \
            --display-name="VocaHire Staging Service Account" \
            --project=${PROJECT_ID}
        echo -e "${GREEN}✅ Created staging service account${NC}"
    fi
    
    # Production service account
    if ! gcloud iam service-accounts describe "vocahire-production@${PROJECT_ID}.iam.gserviceaccount.com" &> /dev/null; then
        gcloud iam service-accounts create vocahire-production \
            --display-name="VocaHire Production Service Account" \
            --project=${PROJECT_ID}
        echo -e "${GREEN}✅ Created production service account${NC}"
    fi
    
    # Grant necessary roles
    echo "🔧 Granting roles to service accounts..."
    
    for SA in "vocahire-staging" "vocahire-production"; do
        for ROLE in "roles/run.invoker" "roles/cloudsql.client" "roles/redis.editor" "roles/storage.objectAdmin"; do
            gcloud projects add-iam-policy-binding ${PROJECT_ID} \
                --member="serviceAccount:${SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
                --role="${ROLE}" \
                --quiet
        done
    done
}

# Main execution
main() {
    echo "=====================================
Google Cloud Secrets Setup
Project: ${PROJECT_ID}
====================================="
    
    # Check if gcloud is configured
    if ! gcloud config get-value project &> /dev/null; then
        echo -e "${YELLOW}⚠️  Setting up gcloud project...${NC}"
        gcloud config set project ${PROJECT_ID}
    fi
    
    # Enable required APIs
    echo "🔌 Enabling required APIs..."
    gcloud services enable \
        secretmanager.googleapis.com \
        run.googleapis.com \
        artifactregistry.googleapis.com \
        cloudbuild.googleapis.com \
        --project=${PROJECT_ID}
    
    # Create service accounts
    create_service_accounts
    
    # Setup secrets
    echo "
Choose environment to set up:
1) Staging
2) Production
3) Both
"
    read -p "Selection (1-3): " CHOICE
    
    case $CHOICE in
        1)
            setup_secrets "staging"
            ;;
        2)
            setup_secrets "production"
            ;;
        3)
            setup_secrets "staging"
            echo ""
            setup_secrets "production"
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo "
=====================================
${GREEN}🎉 Setup complete!${NC}
=====================================

Next steps:
1. Run './scripts/deploy-staging.sh' to deploy to staging
2. Test the staging deployment
3. Use GitHub Actions for automated deployments
=====================================
"
}

# Run main
main "$@"