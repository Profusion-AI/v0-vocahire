#!/bin/bash
# Clean up old container images to save storage costs

set -e

# Configuration
PROJECT_ID="vocahire-prod"
REPOSITORY="us-central1-docker.pkg.dev/vocahire-prod/cloud-run-source-deploy"
KEEP_LAST_N=10  # Keep the last 10 images
DRY_RUN=${1:-false}  # Pass 'true' as first argument for dry run

echo "🧹 Cleaning up old container images..."
echo "Repository: $REPOSITORY"
echo "Keep last: $KEEP_LAST_N images"
echo "Dry run: $DRY_RUN"
echo ""

# Get all images sorted by create time (newest first)
IMAGES=$(gcloud artifacts docker images list $REPOSITORY \
  --include-tags \
  --format="csv[no-heading](DIGEST,CREATE_TIME,TAGS)" \
  --sort-by="~CREATE_TIME" \
  --project=$PROJECT_ID)

# Count total images
TOTAL_IMAGES=$(echo "$IMAGES" | wc -l)
echo "Total images found: $TOTAL_IMAGES"

if [ $TOTAL_IMAGES -le $KEEP_LAST_N ]; then
    echo "✅ No cleanup needed. Total images ($TOTAL_IMAGES) is less than or equal to keep limit ($KEEP_LAST_N)"
    exit 0
fi

# Calculate how many to delete
DELETE_COUNT=$((TOTAL_IMAGES - KEEP_LAST_N))
echo "Images to delete: $DELETE_COUNT"
echo ""

# Get images to delete (skip the first N)
IMAGES_TO_DELETE=$(echo "$IMAGES" | tail -n +$((KEEP_LAST_N + 1)))

# Delete old images
while IFS=',' read -r digest create_time tags; do
    if [ -z "$digest" ]; then
        continue
    fi
    
    echo "Deleting image:"
    echo "  Digest: $digest"
    echo "  Created: $create_time"
    echo "  Tags: ${tags:-<untagged>}"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo "  [DRY RUN] Would delete this image"
    else
        # Delete the image
        gcloud artifacts docker images delete \
          "$REPOSITORY@$digest" \
          --delete-tags \
          --quiet \
          --project=$PROJECT_ID \
          && echo "  ✅ Deleted" \
          || echo "  ❌ Failed to delete"
    fi
    echo ""
done <<< "$IMAGES_TO_DELETE"

echo "🎉 Cleanup complete!"

# Show current storage usage
echo ""
echo "Current storage usage:"
gcloud artifacts locations describe us-central1 \
  --project=$PROJECT_ID \
  --format="table(name,locationId,labels)"