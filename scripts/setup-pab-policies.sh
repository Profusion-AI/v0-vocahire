#!/bin/bash
set -e

# Script to set up Principal Access Boundary policies for VocaHire

echo "🔒 Setting up Principal Access Boundary policies..."

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to create PAB policy
create_pab_policy() {
    local POLICY_NAME=$1
    local POLICY_FILE=$2
    local SERVICE_ACCOUNT=$3
    
    echo "📋 Creating PAB policy: ${POLICY_NAME}"
    
    # First, check if the user has PAB admin permissions
    echo "Checking PAB permissions..."
    if ! gcloud iam principal-access-boundary-policies describe \
        "principalAccessBoundaryPolicies/${POLICY_NAME}" \
        --location="global" \
        --project="${PROJECT_ID}" &> /dev/null; then
        
        echo "Creating new PAB policy..."
        
        # Create the policy
        gcloud iam principal-access-boundary-policies create "${POLICY_NAME}" \
            --location="global" \
            --project="${PROJECT_ID}" \
            --policy-file="${POLICY_FILE}"
        
        echo -e "${GREEN}✅ PAB policy created${NC}"
    else
        echo "Updating existing PAB policy..."
        
        # Update the policy
        gcloud iam principal-access-boundary-policies update "${POLICY_NAME}" \
            --location="global" \
            --project="${PROJECT_ID}" \
            --policy-file="${POLICY_FILE}"
        
        echo -e "${GREEN}✅ PAB policy updated${NC}"
    fi
    
    # Bind the policy to the service account
    echo "Binding PAB policy to service account: ${SERVICE_ACCOUNT}"
    
    gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT}" \
        --role="roles/iam.principalAccessBoundaryPolicyBinding" \
        --member="principal://iam.googleapis.com/projects/${PROJECT_ID}/locations/global/principalAccessBoundaryPolicies/${POLICY_NAME}" \
        --project="${PROJECT_ID}"
    
    echo -e "${GREEN}✅ PAB policy bound to service account${NC}"
}

# Function to create a simple PAB policy
create_simple_pab() {
    local ENV=$1  # staging or production
    
    echo "Creating simple PAB policy for ${ENV}..."
    
    # Create a simple policy file
    cat > "/tmp/pab-${ENV}-simple.json" << EOF
{
  "displayName": "VocaHire ${ENV} Simple PAB",
  "rules": [
    {
      "description": "Restrict to ${ENV} secrets only",
      "resources": [
        "//secretmanager.googleapis.com/projects/${PROJECT_ID}/secrets/*-${ENV}"
      ],
      "permissions": [
        "secretmanager.versions.access"
      ]
    },
    {
      "description": "Restrict to ${ENV} Cloud Run services",
      "resources": [
        "//run.googleapis.com/projects/${PROJECT_ID}/locations/${REGION}/services/*-${ENV}"
      ],
      "permissions": [
        "run.services.get",
        "run.routes.invoke"
      ]
    }
  ]
}
EOF
    
    # Create the policy
    create_pab_policy \
        "vocahire-${ENV}-boundary" \
        "/tmp/pab-${ENV}-simple.json" \
        "vocahire-${ENV}@${PROJECT_ID}.iam.gserviceaccount.com"
}

# Main execution
main() {
    echo "=====================================
Principal Access Boundary Setup
Project: ${PROJECT_ID}
====================================="
    
    # Check prerequisites
    echo "Checking prerequisites..."
    
    # Enable required APIs
    echo "Enabling required APIs..."
    gcloud services enable \
        iam.googleapis.com \
        iamcredentials.googleapis.com \
        --project="${PROJECT_ID}"
    
    # Check if user has PAB permissions
    echo -e "${YELLOW}Note: You need the following role to create PAB policies:${NC}"
    echo "  - roles/iam.principalAccessBoundaryAdmin"
    echo ""
    echo "To grant yourself this role, run:"
    echo "  gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
    echo "    --member='user:your-email@example.com' \\"
    echo "    --role='roles/iam.principalAccessBoundaryAdmin'"
    echo ""
    
    read -p "Do you have the required permissions? (y/n): " HAS_PERMS
    if [[ "$HAS_PERMS" != "y" ]]; then
        echo -e "${RED}Please get the required permissions first.${NC}"
        exit 1
    fi
    
    # Choose setup type
    echo "
Choose PAB setup type:
1) Simple boundary (recommended for getting started)
2) Advanced boundary (from policy files)
3) Both staging and production simple boundaries
"
    read -p "Selection (1-3): " CHOICE
    
    case $CHOICE in
        1)
            read -p "Environment (staging/production): " ENV
            create_simple_pab "$ENV"
            ;;
        2)
            if [ -f "iam/pab-policy-staging.json" ]; then
                create_pab_policy \
                    "vocahire-staging-advanced" \
                    "iam/pab-policy-staging.json" \
                    "vocahire-staging@${PROJECT_ID}.iam.gserviceaccount.com"
            else
                echo -e "${RED}Policy file not found: iam/pab-policy-staging.json${NC}"
                exit 1
            fi
            ;;
        3)
            create_simple_pab "staging"
            echo ""
            create_simple_pab "production"
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo "
=====================================
${GREEN}🎉 PAB setup complete!${NC}
=====================================

Your service accounts are now restricted by Principal Access Boundaries.

To verify the policies:
  gcloud iam principal-access-boundary-policies list \\
    --location=global \\
    --project=${PROJECT_ID}

To test the boundaries:
  # Try to access a production secret with staging SA (should fail)
  gcloud secrets versions access latest \\
    --secret=database-url-production \\
    --impersonate-service-account=vocahire-staging@${PROJECT_ID}.iam.gserviceaccount.com

Note: PAB policies may take a few minutes to fully propagate.
=====================================
"
}

# Run main
main "$@"