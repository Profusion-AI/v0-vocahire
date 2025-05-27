# Secret Manager Migration Guide

**Date**: May 27, 2025  
**Purpose**: Migrate from environment variables to Google Secret Manager

## 🎯 Migration Strategy

We'll use a **hybrid approach** that works seamlessly in both development and production:

1. **Development**: Use `.env.local` files (not committed)
2. **Production**: Use Google Secret Manager
3. **Fallback**: Code checks both sources automatically

## 📦 Step 1: Install Dependencies

```bash
pnpm add @google-cloud/secret-manager
```

## 🔧 Step 2: Update Configuration Files

### Update `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { getSecret } from './secret-manager';

declare global {
  var prisma: PrismaClient | undefined;
}

async function initializePrisma(): Promise<PrismaClient> {
  const databaseUrl = await getSecret('DATABASE_URL');
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

export const prisma = global.prisma || await initializePrisma();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

### Update API Routes

Example: `app/api/auth/[...nextauth]/route.ts`

```typescript
import { getSecrets } from '@/lib/secret-manager';

// At the top of the file, outside the handler
let secrets: Awaited<ReturnType<typeof getSecrets>>;

async function initializeAuth() {
  secrets = await getSecrets([
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
  ]);
}

// Call this before using secrets
await initializeAuth();
```

### Update Stripe Configuration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';
import { getSecret } from './secret-manager';

let stripeInstance: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
  if (!stripeInstance) {
    const secretKey = await getSecret('STRIPE_SECRET_KEY');
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }
  return stripeInstance;
}
```

## 🚀 Step 3: Update Cloud Run Deployment

### Update `cloudbuild.yaml`

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/vocahire-web', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/vocahire-web']
  
  # Deploy to Cloud Run with secrets
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'vocahire-web'
      - '--image'
      - 'gcr.io/$PROJECT_ID/vocahire-web'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--set-secrets'
      - 'DATABASE_URL=DATABASE_URL:latest,CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,REDIS_URL=REDIS_URL:latest'
```

## 🔄 Step 4: Gradual Migration

### Phase 1: Add Secret Manager Support (Week 1)
- Add `lib/secret-manager.ts`
- Install dependencies
- Test locally with service account

### Phase 2: Update Non-Critical Services (Week 2)
- Logging services
- Analytics
- Non-payment features

### Phase 3: Update Critical Services (Week 3)
- Database connections
- Authentication (Clerk)
- Payment processing (Stripe)

### Phase 4: Remove .env Files (Week 4)
- Delete all `.env` files from production
- Update deployment scripts
- Verify everything works

## 🧪 Testing

### Local Testing

1. Create service account key:
```bash
gcloud iam service-accounts keys create vocahire-secrets-local.json \
  --iam-account=vocahire-secrets@vocahire-prod-20810233.iam.gserviceaccount.com
```

2. Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./vocahire-secrets-local.json"
```

3. Test secret access:
```typescript
// test-secrets.ts
import { getVocaHireSecrets } from './lib/secret-manager';

async function test() {
  try {
    const secrets = await getVocaHireSecrets();
    console.log('✅ Secrets loaded successfully');
    console.log('Available secrets:', Object.keys(secrets));
  } catch (error) {
    console.error('❌ Failed to load secrets:', error);
  }
}

test();
```

### Production Testing

1. Deploy a test endpoint:
```typescript
// app/api/test-secrets/route.ts
import { getSecret } from '@/lib/secret-manager';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Don't return actual secret values!
    await getSecret('DATABASE_URL');
    return NextResponse.json({ 
      status: 'success',
      message: 'Secrets accessible' 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to access secrets' 
    }, { status: 500 });
  }
}
```

2. Test after deployment:
```bash
curl https://vocahire-web-xxxxx-uc.a.run.app/api/test-secrets
```

## ⚠️ Common Issues

### Issue 1: "Permission denied" errors
**Solution**: Ensure the Cloud Run service account has `secretmanager.secretAccessor` role

### Issue 2: "Secret not found" errors
**Solution**: Check secret name matches exactly (case-sensitive)

### Issue 3: Slow cold starts
**Solution**: Pre-load secrets on app initialization

### Issue 4: Local development issues
**Solution**: Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly

## 🎯 Benefits After Migration

1. **Security**: No more secrets in code or environment variables
2. **Rotation**: Easy secret rotation without redeployment
3. **Audit**: Full audit trail of secret access
4. **Access Control**: Fine-grained IAM permissions
5. **Versioning**: Rollback capability for secrets

## 📝 Checklist

- [ ] Install `@google-cloud/secret-manager` package
- [ ] Create `lib/secret-manager.ts`
- [ ] Run `setup-secret-manager.sh` script
- [ ] Update database connection code
- [ ] Update authentication code
- [ ] Update payment processing code
- [ ] Test locally with service account
- [ ] Deploy and test in staging
- [ ] Update production deployment
- [ ] Remove `.env` files from production
- [ ] Set up secret rotation reminders
- [ ] Document secret names in team wiki

## 🔗 Next Steps

After migration:
1. Set up secret rotation policy (90 days)
2. Configure alerts for secret access failures
3. Review and minimize secret access patterns
4. Consider using Workload Identity for Cloud Run