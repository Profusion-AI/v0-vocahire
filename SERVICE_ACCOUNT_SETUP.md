# Service Account Setup Guide for VocaHire

Project ID: `vocahire-prod`

## 🔐 Creating Service Account JSON Keys

### Step 1: Create Service Accounts (if not already created)

```bash
# Set your project
export GCP_PROJECT_ID=vocahire-prod
gcloud config set project vocahire-prod

# Create staging service account
gcloud iam service-accounts create vocahire-staging \
  --display-name="VocaHire Staging Service Account" \
  --project=vocahire-prod

# Create production service account  
gcloud iam service-accounts create vocahire-production \
  --display-name="VocaHire Production Service Account" \
  --project=vocahire-prod

# For GitHub Actions CI/CD
gcloud iam service-accounts create vocahire-ci-cd \
  --display-name="VocaHire CI/CD Service Account" \
  --project=vocahire-prod
```

### Step 2: Grant Necessary Roles

```bash
# For staging service account
for ROLE in \
  "roles/run.admin" \
  "roles/cloudsql.client" \
  "roles/redis.editor" \
  "roles/storage.objectAdmin" \
  "roles/secretmanager.secretAccessor" \
  "roles/logging.logWriter" \
  "roles/cloudtrace.agent"
do
  gcloud projects add-iam-policy-binding vocahire-prod \
    --member="serviceAccount:vocahire-staging@vocahire-prod.iam.gserviceaccount.com" \
    --role="$ROLE"
done

# For CI/CD service account (for GitHub Actions)
for ROLE in \
  "roles/run.admin" \
  "roles/storage.admin" \
  "roles/artifactregistry.admin" \
  "roles/cloudbuild.builds.editor" \
  "roles/serviceusage.serviceUsageConsumer" \
  "roles/iam.serviceAccountUser"
do
  gcloud projects add-iam-policy-binding vocahire-prod \
    --member="serviceAccount:vocahire-ci-cd@vocahire-prod.iam.gserviceaccount.com" \
    --role="$ROLE"
done
```

### Step 3: Create Service Account Keys

```bash
# Create keys directory
mkdir -p ~/.gcp-keys

# Generate key for staging
gcloud iam service-accounts keys create \
  ~/.gcp-keys/vocahire-staging-sa.json \
  --iam-account=vocahire-staging@vocahire-prod.iam.gserviceaccount.com

# Generate key for CI/CD (GitHub Actions)
gcloud iam service-accounts keys create \
  ~/.gcp-keys/vocahire-ci-cd-sa.json \
  --iam-account=vocahire-ci-cd@vocahire-prod.iam.gserviceaccount.com

# Generate key for production (be extra careful with this)
gcloud iam service-accounts keys create \
  ~/.gcp-keys/vocahire-production-sa.json \
  --iam-account=vocahire-production@vocahire-prod.iam.gserviceaccount.com
```

### Step 4: Verify Keys Were Created

```bash
# List your keys
ls -la ~/.gcp-keys/

# You should see:
# vocahire-staging-sa.json
# vocahire-ci-cd-sa.json  
# vocahire-production-sa.json
```

## 🚀 Using the Service Account Keys

### For Local Development

1. **Set environment variable**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=~/.gcp-keys/vocahire-staging-sa.json
   ```

2. **Or add to .env.local**:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/Users/YOUR_USERNAME/.gcp-keys/vocahire-staging-sa.json
   GOOGLE_PROJECT_ID=vocahire-prod
   ```

### For GitHub Actions

1. **Encode the key**:
   ```bash
   # Copy this output
   cat ~/.gcp-keys/vocahire-ci-cd-sa.json | base64
   ```

2. **Add to GitHub Secrets**:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Create new secret: `GCP_SA_KEY`
   - Paste the base64 encoded content
   - Create another: `GCP_PROJECT_ID` with value `vocahire-prod`

### For Application Deployment

The service account JSON will be stored as a Google Secret Manager secret:

```bash
# Store staging SA in Secret Manager
gcloud secrets create google-creds-staging \
  --data-file=~/.gcp-keys/vocahire-staging-sa.json \
  --project=vocahire-prod

# Store production SA in Secret Manager  
gcloud secrets create google-creds-production \
  --data-file=~/.gcp-keys/vocahire-production-sa.json \
  --project=vocahire-prod
```

## 🛡️ Security Best Practices

1. **Never commit service account keys to git**
2. **Add to .gitignore**:
   ```
   *.json
   *-sa.json
   .gcp-keys/
   ```

3. **Rotate keys regularly**:
   ```bash
   # List existing keys
   gcloud iam service-accounts keys list \
     --iam-account=vocahire-staging@vocahire-prod.iam.gserviceaccount.com
   
   # Delete old keys
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=vocahire-staging@vocahire-prod.iam.gserviceaccount.com
   ```

## 🧪 Test Your Setup

```bash
# Test authentication
gcloud auth activate-service-account \
  --key-file=~/.gcp-keys/vocahire-staging-sa.json

# Test access
gcloud run services list --project=vocahire-prod

# Should show your Cloud Run services (if any exist)
```

## 📝 Organization-Specific Notes

Since you mentioned creating an organization, ensure:

1. **Project is linked to organization**:
   ```bash
   gcloud projects describe vocahire-prod
   ```

2. **Organization policies allow service accounts**:
   - Check IAM & Admin → Organization Policies
   - Ensure "Disable Service Account Key Creation" is not enforced

3. **Billing is enabled**:
   ```bash
   gcloud beta billing projects describe vocahire-prod
   ```

## 🚨 Troubleshooting

### "Permission denied" creating keys
```bash
# You need this role
gcloud projects add-iam-policy-binding vocahire-prod \
  --member="user:YOUR_EMAIL@DOMAIN.COM" \
  --role="roles/iam.serviceAccountKeyAdmin"
```

### "Service account does not exist"
```bash
# List all service accounts
gcloud iam service-accounts list --project=vocahire-prod
```

### Organization Policy Blocks
- Go to IAM & Admin → Organization Policies
- Look for policies blocking service account key creation
- May need to create exception for your project

---

Once you have the service account JSON files created, you can proceed with the PAB setup script!