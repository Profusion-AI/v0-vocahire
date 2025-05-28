# Cloud Run Maintenance Guide

**Service URL**: https://v0-vocahire-727828254616.us-central1.run.app  
**Last Updated**: May 28, 2025

## Quick Reference

- **Project ID**: vocahire-prod
- **Service Name**: v0-vocahire
- **Region**: us-central1
- **Container Registry**: us-central1-docker.pkg.dev/vocahire-prod/cloud-run-source-deploy/v0-vocahire/v0-vocahire

## 🚨 Emergency Rollback Process

### Method 1: Rollback to Previous Revision (Fastest)
```bash
# List recent revisions
gcloud run revisions list --service=v0-vocahire --region=us-central1 --project=vocahire-prod

# Rollback to a specific revision (replace REVISION_NAME)
gcloud run services update-traffic v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod \
  --to-revisions=REVISION_NAME=100
```

### Method 2: Deploy Previous Image
```bash
# List recent images with tags
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/vocahire-prod/cloud-run-source-deploy \
  --include-tags --limit=10 --project=vocahire-prod

# Deploy a specific image (replace COMMIT_SHA)
gcloud run deploy v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod \
  --image=us-central1-docker.pkg.dev/vocahire-prod/cloud-run-source-deploy/v0-vocahire/v0-vocahire:COMMIT_SHA
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
- **URL**: https://v0-vocahire-727828254616.us-central1.run.app/api/health
- **Expected Response**: 
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-05-28T12:00:00.000Z",
    "version": "1.0.0",
    "uptime": 123.456
  }
  ```

### Check Service Status
```bash
# Get service details
gcloud run services describe v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod

# View recent logs
gcloud logging read "resource.type=cloud_run_revision \
  AND resource.labels.service_name=v0-vocahire" \
  --limit=50 --project=vocahire-prod
```

## 🔧 Common Maintenance Tasks

### Update Environment Variables
```bash
gcloud run services update v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod \
  --update-env-vars KEY1=value1,KEY2=value2
```

### Scale Service
```bash
# Update scaling limits (current quota: max 5 instances)
gcloud run services update v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod \
  --min-instances=0 \
  --max-instances=5
```

### Force New Deployment
```bash
# Trigger a new build by pushing to main branch
git commit --allow-empty -m "chore: force deployment"
git push origin main
```

## 🔐 Security & Access

### View IAM Policies
```bash
gcloud run services get-iam-policy v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod
```

### Make Service Public (if needed)
```bash
gcloud run services add-iam-policy-binding v0-vocahire \
  --region=us-central1 \
  --project=vocahire-prod \
  --member="allUsers" \
  --role="roles/run.invoker"
```

## 📈 Performance Optimization

### Current Settings
- **CPU**: 2 vCPUs
- **Memory**: 2Gi
- **Min Instances**: 0 (cold starts possible)
- **Max Instances**: 5 (quota limit)
- **Concurrency**: 80 requests per instance

### Check Resource Usage
```bash
# View metrics in Cloud Console
echo "https://console.cloud.google.com/run/detail/us-central1/v0-vocahire/metrics?project=vocahire-prod"
```

## 🐛 Troubleshooting

### Build Failures
1. Check Cloud Build logs:
   ```bash
   gcloud builds list --limit=5 --project=vocahire-prod
   gcloud builds log BUILD_ID --project=vocahire-prod
   ```

2. Common issues:
   - Missing environment variables (check Dockerfile ARGs)
   - TypeScript compilation errors
   - Quota limits exceeded

### Runtime Errors
1. Check application logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision \
     AND resource.labels.service_name=v0-vocahire \
     AND severity>=ERROR" \
     --limit=50 --project=vocahire-prod
   ```

2. Check health endpoint:
   ```bash
   curl https://v0-vocahire-727828254616.us-central1.run.app/api/health
   ```

## 🚀 Staging Environment

### Deploy to Staging
```bash
# Use the staging deployment script
./scripts/deploy-staging.sh

# Or manually deploy to staging
gcloud builds submit --config=cloudbuild-staging.yaml --project=vocahire-prod
```

### Staging Service Details
- **Service Name**: v0-vocahire-staging
- **Lower Resources**: 1 CPU, 1Gi Memory, Max 2 instances
- **Same codebase**, different environment

## 🧹 Image Retention & Cleanup

### Automatic Cleanup Script
```bash
# Dry run (see what would be deleted)
./scripts/cleanup-old-images.sh true

# Actually delete old images (keeps last 10)
./scripts/cleanup-old-images.sh
```

### Manual Cleanup
```bash
# List all images
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/vocahire-prod/cloud-run-source-deploy \
  --include-tags --limit=20 --project=vocahire-prod

# Delete specific image
gcloud artifacts docker images delete \
  us-central1-docker.pkg.dev/vocahire-prod/cloud-run-source-deploy/v0-vocahire/v0-vocahire@sha256:DIGEST \
  --delete-tags --project=vocahire-prod
```

## 📅 Regular Maintenance Schedule

### Daily
- Monitor error rates and latency
- Check health endpoint
- Review any build failures

### Weekly
- Review container vulnerabilities in [Security Command Center](https://console.cloud.google.com/security/command-center/vulnerabilities)
- Check for dependency updates
- Run image cleanup script

### Monthly
- Update base Docker image (Node.js)
- Review and optimize costs
- Audit IAM permissions
- Test rollback procedures

## 🔗 Useful Links

- [Cloud Run Console](https://console.cloud.google.com/run/detail/us-central1/v0-vocahire/metrics?project=vocahire-prod)
- [Cloud Build History](https://console.cloud.google.com/cloud-build/builds?project=vocahire-prod)
- [Container Registry](https://console.cloud.google.com/artifacts/docker/vocahire-prod/us-central1/cloud-run-source-deploy?project=vocahire-prod)
- [Logs Explorer](https://console.cloud.google.com/logs/query?project=vocahire-prod)