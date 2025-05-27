# Cloud Run Deployment Guide for VocaHire

## 🚨 Current Deployment Issues

### 1. Permission Error (Primary Blocker)
**Error**: `PERMISSION_DENIED: The caller does not have permission`
**Account**: `kyle@profusion.ai`
**Project**: `vocahire-prod`

### 2. Build Issues (Partially Resolved ⚠️)
- **Genkit Import Issue**: Fixed by updating imports from `@genkit-ai/core` to `genkit` ✅
- **Prisma Export Issue**: Fixed by adding deep proxy for async prisma client ✅
- **ESLint Warnings**: Mostly fixed, test files excluded via .eslintrc.json ✅
- **Next.js 15.3.2 Webpack Issue**: Build crashes with `TypeError: Cannot read properties of undefined (reading 'length')` ❌
  - This is a known issue with Next.js 15.3.2 and webpack optimization
  - Workaround: Consider downgrading to Next.js 15.2.x or waiting for 15.3.3

## 📋 Required IAM Permissions

The deploying user (`kyle@profusion.ai`) needs the following roles in the `vocahire-prod` project:

### Essential Roles:
1. **Cloud Run Admin** (`roles/run.admin`)
   - Deploy and manage Cloud Run services
   
2. **Service Account User** (`roles/iam.serviceAccountUser`)
   - Act as the service account for Cloud Run
   
3. **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
   - Submit and manage builds
   
4. **Artifact Registry Writer** (`roles/artifactregistry.writer`)
   - Push container images

### Grant Permissions (Run as Project Owner):
```bash
# Grant Cloud Run Admin
gcloud projects add-iam-policy-binding vocahire-prod \
    --member="user:kyle@profusion.ai" \
    --role="roles/run.admin"

# Grant Service Account User
gcloud projects add-iam-policy-binding vocahire-prod \
    --member="user:kyle@profusion.ai" \
    --role="roles/iam.serviceAccountUser"

# Grant Cloud Build Editor
gcloud projects add-iam-policy-binding vocahire-prod \
    --member="user:kyle@profusion.ai" \
    --role="roles/cloudbuild.builds.editor"

# Grant Artifact Registry Writer
gcloud projects add-iam-policy-binding vocahire-prod \
    --member="user:kyle@profusion.ai" \
    --role="roles/artifactregistry.writer"
```

## 🔧 Pre-Deployment Setup

### 1. Enable Required APIs (Already Done ✅)
- `artifactregistry.googleapis.com`
- `cloudbuild.googleapis.com`
- `run.googleapis.com`

### 2. Create Service Account
```bash
# Create a service account for Cloud Run
gcloud iam service-accounts create vocahire-cloud-run \
    --display-name="VocaHire Cloud Run Service Account" \
    --project=vocahire-prod

# Grant necessary permissions to the service account
gcloud projects add-iam-policy-binding vocahire-prod \
    --member="serviceAccount:vocahire-cloud-run@vocahire-prod.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding vocahire-prod \
    --member="serviceAccount:vocahire-cloud-run@vocahire-prod.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 3. Set Environment Variables in Cloud Run
```bash
# Deploy with environment variables
gcloud run deploy vocahire-app \
    --source . \
    --region us-east1 \
    --platform managed \
    --service-account vocahire-cloud-run@vocahire-prod.iam.gserviceaccount.com \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "NEXT_PUBLIC_APP_URL=vocahire.com" \
    --set-env-vars "NEXTAUTH_URL=https://vocahire.com" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
    --set-secrets "CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest" \
    --set-secrets "STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest" \
    --set-secrets "GOOGLE_LIVE_API_KEY=GOOGLE_LIVE_API_KEY:latest" \
    --allow-unauthenticated
```

## 📦 Deployment Commands

### Quick Deploy (After Permissions Fixed)
```bash
# Deploy from source
gcloud run deploy vocahire-app \
    --source . \
    --region us-east1 \
    --project vocahire-prod

# Or use the Makefile
make deploy-production
```

### Deploy with Specific Service Name
```bash
gcloud run deploy idx-vocahire-prod-20810233 \
    --source . \
    --region us-east1 \
    --project vocahire-prod \
    --no-allow-unauthenticated
```

## 🔍 Debugging Deployment Issues

### Check Current Permissions
```bash
# List your current roles
gcloud projects get-iam-policy vocahire-prod \
    --flatten="bindings[].members" \
    --filter="bindings.members:kyle@profusion.ai" \
    --format="table(bindings.role)"
```

### Check Build Logs
```bash
# View Cloud Build logs
gcloud builds list --limit=5 --project=vocahire-prod

# Get detailed logs for a specific build
gcloud builds log [BUILD_ID] --project=vocahire-prod
```

### Check Service Status
```bash
# List Cloud Run services
gcloud run services list --project=vocahire-prod --region=us-east1

# Describe a specific service
gcloud run services describe idx-vocahire-prod-20810233 \
    --project=vocahire-prod \
    --region=us-east1
```

## 🚀 Next Steps

1. **Get IAM permissions granted** by a project owner
2. **Create secrets** in Secret Manager for sensitive environment variables
3. **Test deployment** with a simple health check first
4. **Configure custom domain** mapping to vocahire.com
5. **Set up Cloud CDN** for static assets

## 📝 Important Notes

- The Dockerfile uses a multi-stage build for optimization
- Prisma client is generated during the build process
- Environment variables should use Secret Manager for sensitive data
- Cloud Run will auto-scale based on traffic
- Consider setting minimum instances to 1 for faster cold starts

## 🔐 Security Checklist

- [ ] Remove `--allow-unauthenticated` for internal services
- [ ] Use Secret Manager for all sensitive environment variables
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up Cloud IAP for admin endpoints
- [ ] Configure VPC connector for database access
- [ ] Enable audit logging for compliance