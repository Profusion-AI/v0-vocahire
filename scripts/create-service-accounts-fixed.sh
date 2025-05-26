#!/bin/bash
set -e

# Service Account Creation Script for VocaHire (with retry logic)
PROJECT_ID="vocahire-prod"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔐 VocaHire Service Account Setup (Fixed)"
echo "========================================"
echo "Project: ${PROJECT_ID}"
echo "========================================"

# Set project
gcloud config set project ${PROJECT_ID}

# Function to wait for service account to be ready
wait_for_service_account() {
    local SA_EMAIL=$1
    local MAX_ATTEMPTS=10
    local ATTEMPT=1
    
    echo -n "Waiting for ${SA_EMAIL} to be ready"
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        if gcloud iam service-accounts describe "${SA_EMAIL}" &> /dev/null; then
            echo -e " ${GREEN}ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        ((ATTEMPT++))
    done
    
    echo -e " ${RED}timeout!${NC}"
    return 1
}

# Function to create service account
create_service_account() {
    local SA_NAME=$1
    local SA_DISPLAY=$2
    local SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    echo -n "Creating service account ${SA_NAME}... "
    if gcloud iam service-accounts describe "${SA_EMAIL}" &> /dev/null; then
        echo -e "${YELLOW}already exists${NC}"
    else
        gcloud iam service-accounts create ${SA_NAME} \
            --display-name="${SA_DISPLAY}" \
            --project=${PROJECT_ID}
        echo -e "${GREEN}created${NC}"
        
        # Wait for it to be ready
        wait_for_service_account "${SA_EMAIL}"
    fi
}

# Function to grant role with retry
grant_role_with_retry() {
    local SA_EMAIL=$1
    local ROLE=$2
    local MAX_ATTEMPTS=3
    local ATTEMPT=1
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        echo -n "  Granting ${ROLE} (attempt ${ATTEMPT})... "
        if gcloud projects add-iam-policy-binding ${PROJECT_ID} \
            --member="serviceAccount:${SA_EMAIL}" \
            --role="${ROLE}" \
            --quiet 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            return 0
        fi
        
        if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
            echo -e "${YELLOW}retrying...${NC}"
            sleep 3
        fi
        ((ATTEMPT++))
    done
    
    echo -e "${RED}failed${NC}"
    return 1
}

# Create service accounts
echo "📦 Creating service accounts..."
create_service_account "vocahire-staging" "VocaHire Staging Service Account"
create_service_account "vocahire-production" "VocaHire Production Service Account"
create_service_account "vocahire-ci-cd" "VocaHire CI/CD Service Account"

# Wait a bit more for eventual consistency
echo -e "\n⏳ Waiting for service accounts to fully propagate..."
sleep 5

# Grant roles to staging
echo -e "\n🔧 Granting roles to staging service account..."
STAGING_SA="vocahire-staging@${PROJECT_ID}.iam.gserviceaccount.com"

# Essential roles first
for ROLE in \
    "roles/run.invoker" \
    "roles/cloudsql.client" \
    "roles/secretmanager.secretAccessor" \
    "roles/logging.logWriter"
do
    grant_role_with_retry "${STAGING_SA}" "${ROLE}"
done

# Additional roles (less critical if they fail)
for ROLE in \
    "roles/storage.objectAdmin" \
    "roles/cloudtrace.agent"
do
    grant_role_with_retry "${STAGING_SA}" "${ROLE}" || true
done

# Grant roles to CI/CD
echo -e "\n🔧 Granting roles to CI/CD service account..."
CICD_SA="vocahire-ci-cd@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in \
    "roles/run.admin" \
    "roles/storage.admin" \
    "roles/artifactregistry.admin" \
    "roles/iam.serviceAccountUser"
do
    grant_role_with_retry "${CICD_SA}" "${ROLE}"
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
    local SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    echo -n "  Generating key for ${SA_NAME}... "
    if [ -f "${KEY_FILE}" ]; then
        echo -e "${YELLOW}already exists (skipping)${NC}"
    else
        if gcloud iam service-accounts keys create "${KEY_FILE}" \
            --iam-account="${SA_EMAIL}" \
            --quiet 2>/dev/null; then
            chmod 600 "${KEY_FILE}"
            echo -e "${GREEN}created${NC}"
        else
            echo -e "${RED}failed${NC}"
            return 1
        fi
    fi
}

generate_key "vocahire-staging"
generate_key "vocahire-ci-cd"

# Ask about production key
echo -e "\n${YELLOW}⚠️  Production service account key creation${NC}"
read -p "Do you want to create a production service account key? (y/n): " CREATE_PROD
if [[ "$CREATE_PROD" == "y" ]]; then
    # Grant minimal roles to production first
    echo "Granting roles to production service account..."
    PROD_SA="vocahire-production@${PROJECT_ID}.iam.gserviceaccount.com"
    for ROLE in \
        "roles/run.invoker" \
        "roles/secretmanager.secretAccessor"
    do
        grant_role_with_retry "${PROD_SA}" "${ROLE}"
    done
    
    generate_key "vocahire-production"
fi

# Test authentication
echo -e "\n🧪 Testing service account authentication..."
if [ -f ~/.gcp-keys/vocahire-staging-sa.json ]; then
    echo -n "  Testing staging service account... "
    if gcloud auth activate-service-account \
        --key-file=~/.gcp-keys/vocahire-staging-sa.json 2>/dev/null && \
        gcloud projects describe ${PROJECT_ID} --quiet &>/dev/null; then
        echo -e "${GREEN}✓ working${NC}"
    else
        echo -e "${RED}✗ failed${NC}"
    fi
    
    # Switch back to user account
    gcloud config set account kyle@profusion.ai --quiet
fi

# Display results
echo -e "\n=====================================
${GREEN}✅ Service account setup complete!${NC}
====================================="

echo -e "\n📋 Created service accounts:"
gcloud iam service-accounts list --project=${PROJECT_ID} --format="table(displayName,email)"

echo -e "\n📁 Generated keys in ~/.gcp-keys/:"
ls -la ~/.gcp-keys/*.json 2>/dev/null || echo "  No keys found"

echo -e "\n🔧 Next steps:"
echo "1. For local development, add to .env.local:"
echo "   GOOGLE_APPLICATION_CREDENTIALS=$HOME/.gcp-keys/vocahire-staging-sa.json"
echo "   GOOGLE_PROJECT_ID=vocahire-prod"
echo ""
echo "2. For GitHub Actions:"
echo "   cat ~/.gcp-keys/vocahire-ci-cd-sa.json | base64 | pbcopy"
echo "   Add as GitHub secret: GCP_SA_KEY"
echo ""
echo "3. Test your setup:"
echo "   export GOOGLE_APPLICATION_CREDENTIALS=~/.gcp-keys/vocahire-staging-sa.json"
echo "   gcloud auth application-default login"
echo ""
echo -e "${YELLOW}🔒 Security: Never commit these keys to git!${NC}"