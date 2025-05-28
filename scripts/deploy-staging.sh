#!/bin/bash
# Deploy to staging environment

set -e

echo "🚀 Deploying to staging environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Set project
PROJECT_ID="vocahire-prod"
REGION="us-central1"
SERVICE_NAME="v0-vocahire-staging"

echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo -e "${YELLOW}Service: $SERVICE_NAME${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"

# Get current git commit
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

echo -e "\n${GREEN}Building and deploying commit: $SHORT_SHA${NC}"

# Submit build using staging configuration
gcloud builds submit \
  --config=cloudbuild-staging.yaml \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA \
  --project=$PROJECT_ID

# Get the service URL
echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Getting service URL...${NC}"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

echo -e "\n${GREEN}Staging URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}Health check: $SERVICE_URL/api/health${NC}"

# Test the health endpoint
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/api/health" | grep -q "200"; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo -e "${YELLOW}Check logs with:${NC}"
    echo "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50 --project=$PROJECT_ID"
fi