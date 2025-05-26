# Principal Access Boundary (PAB) Setup Guide

## What is PAB?

Principal Access Boundaries limit what resources a service account can access, even if it has broad IAM permissions. Think of it as a "fence" around your service accounts.

## 🚀 Quick Setup

### 1. Grant Yourself PAB Admin Role
```bash
# Replace with your email
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member='user:your-email@example.com' \
  --role='roles/iam.principalAccessBoundaryAdmin'
```

### 2. Run the Setup Script
```bash
# Simple setup (recommended)
./scripts/setup-pab-policies.sh

# Choose option 3 for both staging and production
```

## 📋 What Gets Created

### Simple PAB Policy Structure
```json
{
  "rules": [
    {
      "description": "Staging secrets only",
      "resources": ["//secretmanager.googleapis.com/projects/PROJECT/secrets/*-staging"],
      "permissions": ["secretmanager.versions.access"]
    },
    {
      "description": "Staging Cloud Run only",
      "resources": ["//run.googleapis.com/projects/PROJECT/locations/REGION/services/*-staging"],
      "permissions": ["run.services.get", "run.routes.invoke"]
    }
  ]
}
```

## 🔒 Security Benefits

1. **Environment Isolation**: Staging can't access production resources
2. **Least Privilege**: Service accounts only access what they need
3. **Defense in Depth**: Extra security layer beyond IAM roles
4. **Audit Compliance**: Clear boundaries for compliance requirements

## 🧪 Testing PAB Policies

### Verify Policies Exist
```bash
gcloud iam principal-access-boundary-policies list \
  --location=global \
  --project=YOUR_PROJECT_ID
```

### Test Boundary Enforcement
```bash
# This should FAIL (staging trying to access production)
gcloud secrets versions access latest \
  --secret=database-url-production \
  --impersonate-service-account=vocahire-staging@PROJECT.iam.gserviceaccount.com

# This should SUCCEED (staging accessing staging)
gcloud secrets versions access latest \
  --secret=database-url-staging \
  --impersonate-service-account=vocahire-staging@PROJECT.iam.gserviceaccount.com
```

## 📝 Manual PAB Creation (if script fails)

### Step 1: Create Policy in Console
1. Go to [IAM & Admin → Principal Access Boundary](https://console.cloud.google.com/iam-admin/pab)
2. Click "Create Policy"
3. Name: `vocahire-staging-boundary`
4. Add rules:
   - Resource: `//secretmanager.googleapis.com/projects/PROJECT/secrets/*-staging`
   - Permissions: `secretmanager.versions.access`

### Step 2: Bind to Service Account
```bash
gcloud iam service-accounts add-iam-policy-binding \
  vocahire-staging@PROJECT.iam.gserviceaccount.com \
  --role='roles/iam.principalAccessBoundaryPolicyBinding' \
  --member='principal://iam.googleapis.com/projects/PROJECT/locations/global/principalAccessBoundaryPolicies/vocahire-staging-boundary'
```

## 🚨 Troubleshooting

### "Permission Denied" Creating PAB
- Ensure you have `roles/iam.principalAccessBoundaryAdmin`
- Wait 5 minutes for role propagation
- Try using project owner account

### PAB Not Enforcing
- Policies take 5-10 minutes to propagate
- Check policy is bound to service account
- Verify resource paths match exactly

### Service Account Can't Access Resources
- Check PAB rules include necessary resources
- Verify permissions in PAB match IAM needs
- Use `--log-http` flag for detailed errors

## 📊 Best Practices

1. **Start Simple**: Use basic resource patterns first
2. **Test Thoroughly**: Verify both allows and denies
3. **Document Rules**: Keep README of what each rule does
4. **Monitor Logs**: Check Cloud Logging for PAB denials
5. **Regular Review**: Audit PAB policies quarterly

## 🔗 Resources

- [PAB Documentation](https://cloud.google.com/iam/docs/principal-access-boundary-policies)
- [IAM Troubleshooter](https://cloud.google.com/iam/docs/troubleshooter)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)