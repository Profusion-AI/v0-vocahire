# Claude Code CI/CD Quick Reference

**For VocaHire Development with Claude Code CLI**  
**Last Updated**: May 27, 2025

## 🚀 Daily Workflow Commands

### Morning Routine
```bash
# 1. Check status
git status
git log --oneline -10

# 2. Pull latest
git pull origin main --rebase

# 3. Check deployment status
curl -s https://vocahire.com/health | jq

# 4. Review todos
cat TODO.md
```

### Pre-Deployment Checklist (Claude Can Do)
```bash
# 1. Run all tests
pnpm test
pnpm lint
pnpm typecheck

# 2. Build locally
pnpm build
docker build -t vocahire:test .

# 3. Check for secrets in code
git grep -i "sk_" --cached
git grep -i "secret" --cached

# 4. Update version
npm version patch  # or minor/major

# 5. Generate deployment manifest
cat > DEPLOY_$(date +%Y%m%d).md << EOF
# Deployment Manifest
- Version: $(node -p "require('./package.json').version")
- Date: $(date)
- Tests: ✅ Passing
- Build: ✅ Success
- Ready: YES
EOF
```

### Deployment Commands (Human Must Run)
```bash
# Deploy to staging
git push origin main
# Wait for GitHub Actions

# Deploy to production
gh workflow run deploy-production

# Monitor deployment
gh run watch
gh run list --workflow=deploy-production
```

## 🛠️ Claude-Safe Operations

### ✅ What Claude CAN Do
```bash
# Local development
pnpm dev
pnpm test
pnpm build

# Docker operations
docker build -t vocahire:local .
docker run -p 3000:3000 vocahire:local
docker-compose up -d

# Git operations
git add .
git commit -m "feat: description"
git branch feature/new-feature
git checkout -b fix/bug-fix

# Script generation
echo "Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash
# Deployment commands here
EOF

# Environment setup
cp .env.example .env.local
echo "NEXT_PUBLIC_APP_URL=localhost:3000" >> .env.local
```

### ❌ What Claude CANNOT Do
```bash
# These require human action:
git push origin main          # Triggers CI/CD
gh workflow run               # Triggers GitHub Actions
gcloud run deploy            # Deploys to Cloud Run
firebase deploy              # Deploys to Firebase
npm publish                  # Publishes packages
```

## 📝 Deployment Script Templates

### Quick Deploy Helper
```bash
#!/bin/bash
# scripts/claude-deploy-helper.sh

echo "🤖 Claude's Deployment Helper"
echo "============================"

# 1. Pre-flight checks
echo -n "Running tests... "
pnpm test --silent && echo "✅" || { echo "❌"; exit 1; }

echo -n "Type checking... "
pnpm typecheck && echo "✅" || { echo "❌"; exit 1; }

echo -n "Building... "
pnpm build && echo "✅" || { echo "❌"; exit 1; }

# 2. Generate commands
echo -e "\n📋 Run these commands to deploy:"
echo "1. git add ."
echo "2. git commit -m 'chore: prepare for deployment'"
echo "3. git push origin main"
echo "4. gh workflow run deploy-production"

# 3. Create verification script
cat > verify-deploy.sh << 'VERIFY'
#!/bin/bash
echo "Checking deployment..."
curl -f https://vocahire.com/health || exit 1
echo "✅ Deployment verified!"
VERIFY
chmod +x verify-deploy.sh
```

## 🔧 Environment Setup for Claude

### Firebase Emulators
```bash
# One-time setup
npm install -g firebase-tools
firebase init emulators

# Daily use
firebase emulators:start

# Claude can now test against:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080  
# - Functions: http://localhost:5001
```

### Local Database
```bash
# Start local Postgres
docker run -d \
  --name vocahire-db \
  -e POSTGRES_PASSWORD=localpass \
  -e POSTGRES_DB=vocahire \
  -p 5432:5432 \
  postgres:15

# Run migrations
DATABASE_URL="postgresql://postgres:localpass@localhost:5432/vocahire" \
pnpm prisma migrate dev
```

## 🚨 Emergency Procedures

### If Build Fails
```bash
# 1. Check Node version
node --version  # Should be v20+

# 2. Clean and retry
rm -rf node_modules .next
pnpm install --frozen-lockfile
pnpm build

# 3. Check for type errors
pnpm tsc --noEmit
```

### If Tests Fail
```bash
# 1. Run specific test
pnpm test -- --testNamePattern="failing test"

# 2. Run with coverage
pnpm test -- --coverage

# 3. Update snapshots if needed
pnpm test -- -u
```

### Generate Rollback Commands
```bash
cat > rollback-commands.txt << 'EOF'
# List recent deployments
gcloud run revisions list \
  --service=vocahire-orchestrator \
  --region=us-central1

# Rollback to previous
gcloud run services update-traffic \
  vocahire-orchestrator \
  --to-revisions=PREVIOUS_REVISION_ID=100 \
  --region=us-central1
EOF
```

## 📊 Monitoring Commands

### Health Checks
```bash
# Production
curl https://vocahire.com/health

# Staging  
curl https://staging.vocahire.com/health

# Local
curl http://localhost:3000/health
```

### Log Viewing (Generate Commands)
```bash
echo "To view logs, run:"
echo "gcloud logging read 'resource.type=\"cloud_run_revision\"' --limit=50"
echo "gcloud run services logs read vocahire-orchestrator --region=us-central1"
```

## 🎯 Quick Wins

### 1. Prepare Release
```bash
# Claude runs this
./scripts/claude-deploy-helper.sh

# Human runs this
git push origin main
```

### 2. Fix Production Issue
```bash
# Claude writes fix
# ... makes code changes ...

# Claude prepares
pnpm test
git add .
git commit -m "fix: critical issue"

# Human deploys
git push origin main
```

### 3. Add Feature Flag
```bash
# Claude adds to .env.example
echo "NEXT_PUBLIC_FEATURE_NEW=false" >> .env.example

# Claude updates code
# ... adds feature flag check ...

# Ready for gradual rollout
```

## 📚 Remember

1. **Claude prepares, Human deploys**
2. **Always test locally first**
3. **Generate scripts, don't execute deployments**
4. **Document what needs human action**
5. **Use emulators for safe testing**

---

**Pro Tip**: Save frequently used commands in `scripts/claude/` for easy reuse!