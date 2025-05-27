# Secret Manager Setup for VocaHire

**Date**: May 27, 2025  
**Project**: vocahire-prod-20810233

## 🔐 Overview

This guide sets up Google Secret Manager for VocaHire to securely store and manage sensitive configuration values.

## 📋 Prerequisites

1. Google Cloud CLI (`gcloud`) installed and authenticated
2. Project ID: `vocahire-prod-20810233`
3. Appropriate IAM permissions (Project Editor or Owner)
4. Install the Secret Manager client library:
   ```bash
   npm install @google-cloud/secret-manager
   # or
   pnpm add @google-cloud/secret-manager
   ```

## 🚀 Quick Setup

Run the automated setup script:

```bash
./scripts/setup-secret-manager.sh
```

## 📝 Manual Setup Steps

### 1. Enable Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com \
  --project=vocahire-prod-20810233
```

### 2. Create Service Account for Secret Access

```bash
# Create service account
gcloud iam service-accounts create vocahire-secrets \
  --display-name="VocaHire Secret Manager Access" \
  --project=vocahire-prod-20810233

# Grant Secret Manager accessor role
gcloud projects add-iam-policy-binding vocahire-prod-20810233 \
  --member="serviceAccount:vocahire-secrets@vocahire-prod-20810233.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Grant Cloud Run Service Account Access

```bash
# Get the default Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe vocahire-prod-20810233 --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant Secret Manager accessor role
gcloud projects add-iam-policy-binding vocahire-prod-20810233 \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Create Secrets

Create each secret individually:

```bash
# Database URL
echo -n "postgresql://user:pass@host:5432/dbname" | \
  gcloud secrets create DATABASE_URL \
  --data-file=- \
  --replication-policy="automatic" \
  --project=vocahire-prod-20810233

# Clerk Secret Key
echo -n "sk_test_your_clerk_secret" | \
  gcloud secrets create CLERK_SECRET_KEY \
  --data-file=- \
  --replication-policy="automatic" \
  --project=vocahire-prod-20810233

# Stripe Secret Key
echo -n "sk_test_your_stripe_secret" | \
  gcloud secrets create STRIPE_SECRET_KEY \
  --data-file=- \
  --replication-policy="automatic" \
  --project=vocahire-prod-20810233

# Stripe Webhook Secret
echo -n "whsec_your_webhook_secret" | \
  gcloud secrets create STRIPE_WEBHOOK_SECRET \
  --data-file=- \
  --replication-policy="automatic" \
  --project=vocahire-prod-20810233

# Redis URL
echo -n "redis://host:6379" | \
  gcloud secrets create REDIS_URL \
  --data-file=- \
  --replication-policy="automatic" \
  --project=vocahire-prod-20810233

# Supabase Service Role Key (if using)
echo -n "your_supabase_service_role_key" | \
  gcloud secrets create SUPABASE_SERVICE_ROLE_KEY \
  --data-file=- \
  --replication-policy="automatic" \
  --project=vocahire-prod-20810233
```

### 5. Update Cloud Run Service

Update your Cloud Run service to use secrets:

```yaml
# cloud-run-config.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: vocahire-web
spec:
  template:
    spec:
      containers:
      - image: gcr.io/vocahire-prod-20810233/vocahire-web
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: DATABASE_URL
              key: latest
        - name: CLERK_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: CLERK_SECRET_KEY
              key: latest
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: STRIPE_SECRET_KEY
              key: latest
        - name: STRIPE_WEBHOOK_SECRET
          valueFrom:
            secretKeyRef:
              name: STRIPE_WEBHOOK_SECRET
              key: latest
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: REDIS_URL
              key: latest
```

Or use gcloud command:

```bash
gcloud run services update vocahire-web \
  --update-secrets=DATABASE_URL=DATABASE_URL:latest \
  --update-secrets=CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest \
  --update-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
  --update-secrets=STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest \
  --update-secrets=REDIS_URL=REDIS_URL:latest \
  --region=us-central1 \
  --project=vocahire-prod-20810233
```

## 🔧 Local Development

For local development, create a service account key:

```bash
# Create key for local development
gcloud iam service-accounts keys create vocahire-secrets-local.json \
  --iam-account=vocahire-secrets@vocahire-prod-20810233.iam.gserviceaccount.com

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="./vocahire-secrets-local.json"
```

**⚠️ IMPORTANT**: 
- Add `vocahire-secrets-local.json` to `.gitignore`
- Never commit this file to version control

## 📖 Accessing Secrets in Code

### Option 1: Using @google-cloud/secret-manager (Recommended)

```typescript
// lib/secrets.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const projectId = 'vocahire-prod-20810233';

export async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });
  
  const payload = version.payload?.data?.toString();
  if (!payload) {
    throw new Error(`Secret ${secretName} not found`);
  }
  
  return payload;
}

// Usage
const databaseUrl = await getSecret('DATABASE_URL');
```

### Option 2: Environment Variables (Cloud Run)

When deployed to Cloud Run with the configuration above, secrets are automatically available as environment variables:

```typescript
// Direct access (Cloud Run only)
const databaseUrl = process.env.DATABASE_URL;
const clerkSecret = process.env.CLERK_SECRET_KEY;
```

## 🔄 Updating Secrets

To update a secret:

```bash
# Create new version
echo -n "new_secret_value" | \
  gcloud secrets versions add SECRET_NAME \
  --data-file=- \
  --project=vocahire-prod-20810233

# Cloud Run will automatically use the latest version
```

## 🗑️ Cleanup (if needed)

```bash
# Delete a secret
gcloud secrets delete SECRET_NAME --project=vocahire-prod-20810233

# Delete service account
gcloud iam service-accounts delete vocahire-secrets@vocahire-prod-20810233.iam.gserviceaccount.com
```

## 📊 Monitoring

View secret access logs:

```bash
gcloud logging read \
  'resource.type="secretmanager.googleapis.com/Secret"' \
  --project=vocahire-prod-20810233 \
  --limit=50
```

## 🚨 Security Best Practices

1. **Rotation**: Rotate secrets regularly (every 90 days)
2. **Least Privilege**: Only grant necessary permissions
3. **Audit**: Regularly review access logs
4. **Versioning**: Keep old versions for rollback (auto-deleted after 30 days)
5. **Encryption**: All secrets are encrypted at rest by default

## 🔗 References

- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Run with Secret Manager](https://cloud.google.com/run/docs/configuring/secrets)
- [Secret Manager Pricing](https://cloud.google.com/secret-manager/pricing)

---

**Note**: Remember to update the actual secret values with your real credentials when running the setup commands.