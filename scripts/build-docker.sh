#!/bin/bash

# VocaHire Docker Build Script
# Handles building and deploying to Google Cloud Run

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    local required_vars=(
        "GOOGLE_PROJECT_ID"
        "GOOGLE_REGION"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "$var is not set. Please set it before running this script."
            exit 1
        fi
    done
}

# Set default values
GOOGLE_REGION=${GOOGLE_REGION:-us-central1}
REPO_NAME=${REPO_NAME:-vocahire}
SERVICE_NAME=${SERVICE_NAME:-vocahire-app}
IMAGE_TAG=${IMAGE_TAG:-latest}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --push-only)
            PUSH_ONLY=true
            shift
            ;;
        --deploy-only)
            DEPLOY_ONLY=true
            shift
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Construct image URL
IMAGE_URL="${GOOGLE_REGION}-docker.pkg.dev/${GOOGLE_PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:${IMAGE_TAG}"

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        exit 1
    fi
    
    # Build with progress output
    docker build \
        --platform linux/amd64 \
        --progress=plain \
        ${NO_CACHE} \
        -t ${IMAGE_URL} \
        -f Dockerfile \
        .
    
    if [ $? -eq 0 ]; then
        print_status "Docker image built successfully: ${IMAGE_URL}"
    else
        print_error "Docker build failed"
        exit 1
    fi
}

# Push image to Google Artifact Registry
push_image() {
    print_status "Pushing image to Google Artifact Registry..."
    
    # Configure Docker to use gcloud credentials
    gcloud auth configure-docker ${GOOGLE_REGION}-docker.pkg.dev --quiet
    
    # Create repository if it doesn't exist
    if ! gcloud artifacts repositories describe ${REPO_NAME} --location=${GOOGLE_REGION} &>/dev/null; then
        print_status "Creating Artifact Registry repository..."
        gcloud artifacts repositories create ${REPO_NAME} \
            --repository-format=docker \
            --location=${GOOGLE_REGION} \
            --description="VocaHire Docker images"
    fi
    
    # Push the image
    docker push ${IMAGE_URL}
    
    if [ $? -eq 0 ]; then
        print_status "Image pushed successfully: ${IMAGE_URL}"
    else
        print_error "Failed to push image"
        exit 1
    fi
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    print_status "Deploying to Cloud Run..."
    
    # Check if service exists
    if gcloud run services describe ${SERVICE_NAME} --region=${GOOGLE_REGION} &>/dev/null; then
        print_status "Updating existing Cloud Run service..."
    else
        print_status "Creating new Cloud Run service..."
    fi
    
    # Deploy the service
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_URL} \
        --platform managed \
        --region ${GOOGLE_REGION} \
        --port 3000 \
        --cpu 2 \
        --memory 2Gi \
        --min-instances 0 \
        --max-instances 100 \
        --concurrency 1000 \
        --timeout 300 \
        --allow-unauthenticated \
        --set-env-vars="NODE_ENV=production" \
        --cpu-boost
    
    if [ $? -eq 0 ]; then
        # Get service URL
        SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${GOOGLE_REGION} --format='value(status.url)')
        print_status "Deployment successful!"
        print_status "Service URL: ${SERVICE_URL}"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Main execution
main() {
    print_status "Starting VocaHire Docker deployment process..."
    
    # Check environment variables
    check_env_vars
    
    # Execute based on flags
    if [ "$DEPLOY_ONLY" = true ]; then
        deploy_to_cloud_run
    elif [ "$PUSH_ONLY" = true ]; then
        push_image
    elif [ "$BUILD_ONLY" = true ]; then
        build_image
    else
        # Default: build, push, and deploy
        build_image
        push_image
        deploy_to_cloud_run
    fi
    
    print_status "Process completed successfully!"
}

# Run main function
main