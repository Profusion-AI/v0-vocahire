#!/bin/bash
set -e

# Service Account Creation Script for VocaHire
PROJECT_ID="vocahire-prod"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔐 VocaHire Service Account Setup"
echo "================================="
echo "Project: ${PROJECT_ID}"
echo "================================="

# Set project
gcloud config set project ${PROJECT_ID}

# Function to create service account
create_service_account() {
    local SA_NAME=$1
    local SA_DISPLAY=$2
    
    echo -n "Creating service account ${SA_NAME}... "
    if gcloud iam service-accounts describe "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" &> /dev/null; then
        echo -e "${YELLOW}already exists${NC}"
    else
        gcloud iam service-accounts create ${SA_NAME} \
            --display-name="${SA_DISPLAY}" \
            --project=${PROJECT_ID}
        echo -e "${GREEN}created${NC}"
    fi
}

# Create service accounts
echo "📦 Creating service accounts..."
create_service_account "vocahire-staging" "VocaHire Staging Service Account"
create_service_account "vocahire-production" "VocaHire Production Service Account"
create_service_account "vocahire-ci-cd" "VocaHire CI/CD Service Account"

# Grant roles to staging
echo -e "\n🔧 Granting roles to staging service account..."
STAGING_SA="vocahire-staging@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in \
    "roles/run.admin" \
    "roles/cloudsql.client" \
    "roles/redis.editor" \
    "roles/storage.objectAdmin" \
    "roles/secretmanager.secretAccessor" \
    "roles/logging.logWriter" \
    "roles/cloudtrace.agent"
do
    echo -n "  Granting ${ROLE}... "
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${STAGING_SA}" \
        --role="${ROLE}" \
        --quiet
    echo -e "${GREEN}✓${NC}"
done

# Grant roles to CI/CD
echo -e "\n🔧 Granting roles to CI/CD service account..."
CICD_SA="vocahire-ci-cd@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in \
    "roles/run.admin" \
    "roles/storage.admin" \
    "roles/artifactregistry.admin" \
    "roles/cloudbuild.builds.editor" \
    "roles/serviceusage.serviceUsageConsumer" \
    "roles/iam.serviceAccountUser"
do
    echo -n "  Granting ${ROLE}... "
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${CICD_SA}" \
        --role="${ROLE}" \
        --quiet
    echo -e "${GREEN}✓${NC}"
done

# Create keys directory
echo -e "\n📁 Creating keys directory..."
mkdir -p ~/.gcp-keys
chmod 700 ~/.gcp-keys

# Generate keys
echo -e "\n🔑 Generating service account keys..."

generate_key() {
    local SA_NAME=$1
    local KEY_FILE=~/.gcp-keys/${SA_NAME}-sa.json
    
    echo -n "  Generating key for ${SA_NAME}... "
    if [ -f "${KEY_FILE}" ]; then
        echo -e "${YELLOW}already exists (skipping)${NC}"
    else
        gcloud iam service-accounts keys create "${KEY_FILE}" \
            --iam-account="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
            --quiet
        chmod 600 "${KEY_FILE}"
        echo -e "${GREEN}created${NC}"
    fi
}

generate_key "vocahire-staging"
generate_key "vocahire-ci-cd"

# Ask about production key
echo -e "\n${YELLOW}⚠️  Production service account key creation${NC}"
read -p "Do you want to create a production service account key? (y/n): " CREATE_PROD
if [[ "$CREATE_PROD" == "y" ]]; then
    generate_key "vocahire-production"
fi

# Display next steps
echo -e "\n${GREEN}✅ Service account setup complete!${NC}"
echo -e "\n📋 Next steps:"
echo "1. For local development:"
echo "   export GOOGLE_APPLICATION_CREDENTIALS=~/.gcp-keys/vocahire-staging-sa.json"
echo ""
echo "2. For GitHub Actions, encode the CI/CD key:"
echo "   cat ~/.gcp-keys/vocahire-ci-cd-sa.json | base64 | pbcopy"
echo "   Then add as GitHub secret: GCP_SA_KEY"
echo ""
echo "3. Your keys are stored in: ~/.gcp-keys/"
echo "   - vocahire-staging-sa.json"
echo "   - vocahire-ci-cd-sa.json"
if [[ "$CREATE_PROD" == "y" ]]; then
    echo "   - vocahire-production-sa.json"
fi
echo ""
echo "4. Add to your .env.local:"
echo "   GOOGLE_APPLICATION_CREDENTIALS=$HOME/.gcp-keys/vocahire-staging-sa.json"
echo "   GOOGLE_PROJECT_ID=vocahire-prod"
echo ""
echo -e "${YELLOW}🔒 Security reminder: Never commit these keys to git!${NC}"