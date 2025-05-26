# VocaHire CI/CD Quick Reference

## 🚀 Quick Commands

### Local Development & Testing
```bash
# Pull latest changes
git pull origin main --rebase

# Start local environment
./scripts/docker-dev.sh up

# Run tests locally
pnpm test
pnpm lint
pnpm build

# Test with staging backend
cp .env.staging .env.local
pnpm dev
```

### Deployment
```bash
# Deploy to staging (manual)
./scripts/deploy-staging.sh

# Setup Google Cloud secrets (first time)
./scripts/setup-gcp-secrets.sh
```

## 🔄 Automated Workflows

### On Push to Main
1. **CI Pipeline** runs automatically
   - Linting & type checking
   - Unit tests
   - Build verification

2. **Staging Deployment** triggers
   - Builds Docker image
   - Pushes to Artifact Registry
   - Deploys to Cloud Run staging
   - Posts URL in GitHub

### Manual Triggers
- **Production Deploy**: Go to Actions → Deploy to Production → Run workflow
- **Staging Deploy**: Push to main OR Actions → Deploy to Staging → Run workflow

## 📊 Monitoring Progress

### GitHub Actions
- View at: https://github.com/[your-repo]/actions
- Check build status
- Review deployment logs
- Get staging URLs from deployment runs

### Local Testing
```bash
# Watch logs
docker-compose logs -f

# Monitor specific service
docker-compose logs -f app | grep WebRTC

# Check service health
curl http://localhost:3000/health
```

### Staging Testing
```bash
# Get staging URL
gcloud run services describe vocahire-orchestrator-staging \
  --region us-central1 --format 'value(status.url)'

# Test staging health
curl https://[staging-url]/health
```

## 🔐 Required Secrets in GitHub

Go to Settings → Secrets and variables → Actions:

1. `GCP_PROJECT_ID` - Your Google Cloud project ID
2. `GCP_SA_KEY` - Service account JSON for staging
3. `GCP_SA_KEY_PROD` - Service account JSON for production

## 📝 Testing Checklist

Before reporting integration success:

- [ ] Local Docker build succeeds
- [ ] All tests pass locally
- [ ] GitHub Actions CI passes
- [ ] Staging deployment successful
- [ ] Staging health checks pass
- [ ] WebRTC connection works on staging
- [ ] Can complete full interview flow

## 🚨 Troubleshooting

### Build Failures
```bash
# Check GitHub Actions logs
# Look for error messages in red

# Common fixes:
- Check environment variables
- Verify secrets are set
- Ensure dependencies are installed
```

### Deployment Issues
```bash
# Check Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Check service status
gcloud run services describe vocahire-orchestrator-staging --region us-central1
```

## 📊 Daily Workflow

1. **Morning**
   - Check GitHub Actions for overnight builds
   - Pull latest changes
   - Review staging deployment

2. **During Development**
   - Monitor local Docker logs
   - Test changes locally first
   - Push to trigger staging deploy

3. **End of Day**
   - Verify all tests pass
   - Check staging is healthy
   - Report findings to team

## 🔗 Important URLs

- **Local**: http://localhost:3000
- **Staging**: Check GitHub Actions or run `gcloud run services list`
- **Logs**: GitHub Actions tab in repository
- **Monitoring**: Google Cloud Console → Cloud Run

---

Need help? Check `LOCAL_TESTING_GUIDE.md` for detailed instructions.