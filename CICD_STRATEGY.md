# VocaHire CI/CD Strategy Guide

**Document Version**: 1.0  
**Last Updated**: May 27, 2025  
**Target Launch**: June 1, 2025 (Public Beta)

## Table of Contents
1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Claude Code CLI Integration](#claude-code-cli-integration)
4. [Pre-Launch Strategy (Now → June 1)](#pre-launch-strategy-now--june-1)
5. [Launch Day Protocol](#launch-day-protocol)
6. [Post-v1.0 Strategy (Open Beta & Beyond)](#post-v10-strategy-open-beta--beyond)
7. [Infrastructure Recommendations](#infrastructure-recommendations)
8. [Monitoring & Observability](#monitoring--observability)
9. [Rollback & Disaster Recovery](#rollback--disaster-recovery)
10. [Security Considerations](#security-considerations)
11. [Cost Optimization](#cost-optimization)

---

## Overview

This document outlines VocaHire's CI/CD strategy for the critical pre-launch period and evolution into a mature production system post-v1.0. The strategy emphasizes rapid iteration pre-launch while establishing foundations for stability post-launch.

### Key Principles
- **Pre-Launch**: Speed > Perfect Process
- **Post-Launch**: Stability > Speed
- **Always**: Security & User Data Protection

---

## Current State Analysis

### Existing Infrastructure
- **CI**: GitHub Actions with lint, test, and build steps
- **Deployment**: Cloud Run with staging/production environments
- **Container Registry**: Google Artifact Registry
- **Secrets**: Google Secret Manager
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis (Upstash)

### Current Gaps
- No automated rollback mechanism
- Limited monitoring/alerting
- No canary deployment strategy
- Manual database migration process
- No performance testing in pipeline

---

## Claude Code CLI Integration

### Current Workflow Reality

VocaHire's development heavily leverages Claude Code CLI for rapid iteration and deployment-ready changes. This section documents how to optimize this workflow and its limitations.

### Claude Code Capabilities

#### What Claude Code CAN Do:
- ✅ Read/write all project files
- ✅ Execute bash commands (build, test, lint)
- ✅ Run Docker commands locally
- ✅ Generate and update GitHub Actions workflows
- ✅ Create deployment scripts
- ✅ Update environment configurations
- ✅ Run database migrations locally
- ✅ Execute git commands (commit, branch, etc.)

#### What Claude Code CANNOT Do:
- ❌ Direct deployment to Cloud Run
- ❌ Access production secrets/credentials
- ❌ Modify GitHub repository settings
- ❌ Trigger GitHub Actions remotely
- ❌ Access Google Cloud Console
- ❌ Direct database access to production
- ❌ Real-time monitoring of deployed services

### Recommended Claude Code Workflow

```bash
# 1. Claude prepares deployment
Claude: Let me prepare the deployment...
- Updates version numbers
- Runs tests locally
- Builds Docker image
- Creates git commit
- Generates deployment checklist

# 2. Human executes deployment
Human: Running deployment now...
$ git push origin main
$ gh workflow run deploy-production

# 3. Claude assists with verification
Claude: Here's a verification script...
$ ./scripts/verify-deployment.sh
```

### Firebase/Google Cloud SDK Setup for Claude

#### Option 1: Local Firebase Emulators (Recommended)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Initialize Firebase in project
firebase init

# Start emulators for local testing
firebase emulators:start

# Claude can now test against local Firebase
```

#### Option 2: Service Account with Limited Permissions
```bash
# Create a deployment service account
gcloud iam service-accounts create claude-deployer \
  --display-name="Claude Code Deployment Assistant"

# Grant specific permissions (principle of least privilege)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:claude-deployer@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

# Download key (store securely, never commit)
gcloud iam service-accounts keys create ~/claude-deployer-key.json \
  --iam-account=claude-deployer@PROJECT_ID.iam.gserviceaccount.com

# Set in environment for Claude
export GOOGLE_APPLICATION_CREDENTIALS=~/claude-deployer-key.json
```

#### Option 3: Hybrid Approach (Best Practice)
```typescript
// scripts/claude-deploy-assistant.ts
import { execSync } from 'child_process';

interface DeploymentConfig {
  environment: 'staging' | 'production';
  version: string;
  skipTests?: boolean;
}

export class ClaudeDeploymentAssistant {
  async prepareDeployment(config: DeploymentConfig) {
    console.log('🤖 Claude preparing deployment...');
    
    // 1. Run pre-deployment checks
    if (!config.skipTests) {
      execSync('pnpm test', { stdio: 'inherit' });
    }
    
    // 2. Build and tag
    execSync(`docker build -t vocahire:${config.version} .`);
    
    // 3. Generate deployment manifest
    const manifest = {
      version: config.version,
      timestamp: new Date().toISOString(),
      environment: config.environment,
      checklist: [
        'Tests passed',
        'Docker image built',
        'Environment variables verified',
        'Database migrations ready'
      ]
    };
    
    // 4. Create deployment command
    const deployCommand = `
      # Run this command to deploy:
      gcloud run deploy vocahire-${config.environment} \\
        --image gcr.io/PROJECT_ID/vocahire:${config.version} \\
        --region us-central1
    `;
    
    return { manifest, deployCommand };
  }
}

// Claude can run this safely
const assistant = new ClaudeDeploymentAssistant();
const deployment = await assistant.prepareDeployment({
  environment: 'staging',
  version: 'v1.0.0-beta.1'
});
```

### Claude Code CI/CD Helper Scripts

```bash
# scripts/claude-ci-helper.sh
#!/bin/bash

# Claude-safe CI/CD operations
case "$1" in
  "prepare-release")
    echo "Preparing release $2..."
    # Update version in package.json
    npm version $2
    # Generate changelog
    git log --oneline --decorate > CHANGELOG-$2.md
    # Create release branch
    git checkout -b release/$2
    ;;
    
  "verify-deployment")
    echo "Verifying deployment..."
    # Check health endpoints
    curl -f https://vocahire.com/health || exit 1
    # Run smoke tests
    pnpm test:e2e:smoke
    ;;
    
  "rollback-prep")
    echo "Preparing rollback..."
    # List recent deployments
    gcloud run revisions list --service=vocahire
    # Generate rollback command
    echo "To rollback, run:"
    echo "gcloud run services update-traffic vocahire --to-revisions=REVISION=100"
    ;;
esac
```

### Integrating Claude into CI/CD Pipeline

```yaml
# .github/workflows/claude-assisted-deploy.yml
name: Claude-Assisted Deployment

on:
  workflow_dispatch:
    inputs:
      claude_prepared:
        description: 'Has Claude prepared this deployment?'
        required: true
        type: boolean
      
jobs:
  validate-claude-prep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check Claude preparation
        run: |
          if [[ "${{ inputs.claude_prepared }}" != "true" ]]; then
            echo "❌ Deployment must be prepared by Claude first!"
            echo "Run: claude 'Prepare deployment for version X.Y.Z'"
            exit 1
          fi
          
      - name: Verify Claude checklist
        run: |
          # Check for required files
          test -f DEPLOYMENT_CHECKLIST.md || exit 1
          test -f scripts/deployment-commands.sh || exit 1
```

### Best Practices for Claude Code CI/CD

1. **Preparation vs Execution**
   ```bash
   # Claude prepares
   claude: "I'll prepare everything for deployment"
   - Generates scripts
   - Runs local validations
   - Creates checklists
   
   # Human executes
   human: "Running the deployment now"
   - Triggers GitHub Actions
   - Monitors deployment
   - Handles production access
   ```

2. **Deployment Readiness Checklist**
   ```markdown
   <!-- DEPLOYMENT_CHECKLIST.md -->
   # Deployment Checklist for v1.0.0-beta
   
   ## Pre-Deployment (Claude Verified)
   - [x] All tests passing locally
   - [x] Docker image builds successfully
   - [x] Environment variables documented
   - [x] Database migrations tested
   - [x] Version numbers updated
   
   ## Deployment (Human Action Required)
   - [ ] Push to main branch
   - [ ] Trigger production workflow
   - [ ] Monitor deployment logs
   - [ ] Verify health checks
   - [ ] Test critical paths
   ```

3. **Claude-Friendly Firebase Setup**
   ```json
   // firebase.json
   {
     "emulators": {
       "auth": {
         "port": 9099
       },
       "firestore": {
         "port": 8080
       },
       "functions": {
         "port": 5001
       },
       "hosting": {
         "port": 5000
       }
     },
     "hosting": {
       "public": ".next",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
     }
   }
   ```

### Limitations & Workarounds

| Limitation | Workaround |
|------------|------------|
| Can't deploy directly | Generate deployment scripts for human execution |
| No production access | Use staging/emulators for testing |
| Can't trigger workflows | Create git hooks that auto-trigger |
| No real-time monitoring | Generate monitoring scripts to run post-deploy |
| Can't access secrets | Use placeholder values, document required secrets |

### Future Enhancements

As Claude Code evolves, consider requesting:
1. GitHub CLI integration for workflow triggers
2. Read-only access to deployment status
3. Ability to run gcloud commands with restrictions
4. Integration with deployment preview environments

---

## Pre-Launch Strategy (Now → June 1)

### Goals
1. **Rapid iteration** - Deploy multiple times per day
2. **Quick feedback loops** - See changes in < 10 minutes
3. **Minimal ceremony** - Focus on shipping features

### Recommended Pipeline

```yaml
# .github/workflows/pre-launch-deploy.yml
name: Pre-Launch Rapid Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  quick-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Quick lint & type check
        run: |
          # Skip non-critical checks
          pnpm install --frozen-lockfile
          pnpm tsc --noEmit || true  # Type errors don't block
          pnpm lint || true           # Lint errors don't block

  deploy-staging:
    needs: quick-check
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        # Existing deploy steps
        # Add: Automatic smoke test

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Wait for manual approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ github.TOKEN }}
          approvers: kylegreenwell
          minimum-approvals: 1
          issue-title: "Deploy to production?"
          
      - name: Deploy to production
        # Deploy with same image tested in staging
```

### Database Migration Strategy (Pre-Launch)
```bash
# Run migrations directly from local for speed
pnpm prisma migrate deploy --preview-feature

# Document all migrations in MIGRATION_LOG.md
echo "$(date): Applied migration X" >> MIGRATION_LOG.md
```

### Feature Flags (Recommended)
```typescript
// lib/feature-flags.ts
export const features = {
  enhancedFeedback: process.env.NEXT_PUBLIC_FEATURE_ENHANCED_FEEDBACK === 'true',
  aiVoiceSelection: process.env.NEXT_PUBLIC_FEATURE_VOICE_SELECTION === 'true',
  // Add new features here for safe rollout
};
```

---

## Launch Day Protocol

### June 1, 2025 Checklist

#### 24 Hours Before
- [ ] Freeze non-critical changes
- [ ] Run full test suite on staging
- [ ] Verify all secrets are set in production
- [ ] Test rollback procedure
- [ ] Prepare status page

#### Launch Day
```bash
# 1. Tag the release
git tag -a v1.0.0-beta -m "Public Beta Launch"
git push origin v1.0.0-beta

# 2. Deploy to production
# Use existing production workflow

# 3. Monitor closely
# Set up dashboard with key metrics

# 4. Have rollback ready
gcloud run services update-traffic vocahire-orchestrator \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1
```

### Launch Day Monitoring
- Real-time dashboard showing:
  - Active users
  - Interview sessions started/completed
  - Error rates
  - Response times
  - Credit purchases

---

## Post-v1.0 Strategy (Open Beta & Beyond)

### Evolution Timeline

#### Phase 1: Stabilization (Weeks 1-4 of Beta)
- Keep existing rapid deploy process
- Add comprehensive monitoring
- Implement automated rollbacks
- Establish SLOs

#### Phase 2: Maturation (Months 2-3)
- Implement blue-green deployments
- Add canary releases
- Automated performance testing
- Database migration automation

#### Phase 3: Scale (Months 4+)
- Multi-region deployment
- Advanced traffic management
- Chaos engineering
- Full GitOps implementation

### Recommended Post-v1.0 Pipeline

```yaml
# .github/workflows/production-deploy-v2.yml
name: Production Deploy v2

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - name: Full test suite
        # Comprehensive testing
      
      - name: Performance tests
        # Load testing with k6 or similar
      
      - name: Security scan
        # SAST/DAST scanning

  build-and-push:
    needs: test
    steps:
      - name: Build multi-arch image
        # Support ARM64 for cost optimization

  canary-deploy:
    needs: build-and-push
    steps:
      - name: Deploy canary (5% traffic)
        run: |
          gcloud run deploy vocahire-canary \
            --image ${{ env.IMAGE }} \
            --tag canary
          
          gcloud run services update-traffic vocahire \
            --to-tags canary=5
      
      - name: Monitor canary metrics
        # Check error rates, latency
      
      - name: Gradual rollout
        # 5% → 25% → 50% → 100%

  production-deploy:
    needs: canary-deploy
    steps:
      - name: Full production deploy
      - name: Update traffic to 100%
      - name: Clean up canary
```

### Database Migration Automation

```yaml
# .github/workflows/db-migration.yml
name: Database Migration

on:
  workflow_dispatch:
  push:
    paths:
      - 'prisma/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - name: Run migrations
        run: |
          # Use migration service account
          pnpm prisma migrate deploy
          
      - name: Verify migration
        # Run health checks
      
      - name: Backup post-migration
        # Trigger backup job
```

---

## Infrastructure Recommendations

### Pre-Launch (Current)
```yaml
# Cloud Run Configuration
Memory: 2Gi
CPU: 2
Min Instances: 1
Max Instances: 10
```

### Post-v1.0 Scaling
```yaml
# Production Configuration
Memory: 4Gi
CPU: 4
Min Instances: 3  # Across regions
Max Instances: 100
Autoscaling:
  - CPU utilization > 60%
  - Request count > 100/sec
  - Custom metrics (active sessions)
```

### Multi-Region Strategy (Post-v1.0)
```
Primary: us-central1 (current)
Beta expansion:
  - us-east1 (Month 2)
  - europe-west1 (Month 3)
  - asia-northeast1 (Month 6)

Traffic Management:
  - Cloud Load Balancing
  - Anycast IPs
  - Regional failover
```

---

## Monitoring & Observability

### Pre-Launch Essentials
```typescript
// lib/monitoring.ts
export const metrics = {
  interviewStarted: () => console.log('[METRIC] Interview started'),
  interviewCompleted: (duration: number) => console.log(`[METRIC] Interview completed: ${duration}s`),
  creditPurchased: (amount: number) => console.log(`[METRIC] Credits purchased: ${amount}`),
  errorOccurred: (error: Error) => console.error('[ERROR]', error),
};
```

### Post-v1.0 Full Stack
1. **Application Performance Monitoring (APM)**
   - Google Cloud Trace
   - Custom dashboards
   - SLO monitoring

2. **Log Aggregation**
   - Structured logging
   - Cloud Logging
   - Log-based metrics

3. **Synthetic Monitoring**
   - Uptime checks every 60s
   - Full user journey tests
   - Multi-region probes

4. **Real User Monitoring (RUM)**
   - Core Web Vitals
   - Session replay (privacy-compliant)
   - User journey analytics

### Key Metrics & SLOs

```yaml
SLOs:
  Availability: 99.9% (43.2 min/month downtime)
  Interview Start Latency: p95 < 3s
  Speech-to-Speech Latency: p95 < 1.5s
  Error Rate: < 0.1%
  
Alerts:
  - Availability < 99.5% (5 min window)
  - Error rate > 1% (1 min window)
  - Interview queue depth > 100
  - Credit purchase failures > 5/min
```

---

## Rollback & Disaster Recovery

### Immediate Rollback (< 2 minutes)
```bash
# Cloud Run instant rollback
gcloud run services update-traffic vocahire-orchestrator \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1
```

### Database Rollback Strategy
```bash
# 1. Point-in-time recovery (Supabase)
# 2. Migration rollback
pnpm prisma migrate resolve --rolled-back

# 3. Data fix scripts
pnpm run scripts/fix-data-issue.ts
```

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 15 minutes
2. **RPO (Recovery Point Objective)**: 5 minutes

```yaml
DR Runbook:
  1. Identify failure type
  2. If regional: failover to backup region
  3. If data: restore from backup
  4. If code: rollback deployment
  5. Communicate via status page
  6. Post-mortem within 48 hours
```

---

## Security Considerations

### Pre-Launch Security
- [x] Remove all development auth bypasses
- [x] Secure all API endpoints
- [ ] Run security scan before launch
- [ ] Enable Cloud Armor (DDoS protection)

### Post-v1.0 Security
```yaml
Security Pipeline:
  - SAST scanning (every commit)
  - Dependency scanning (daily)
  - Container scanning (every build)
  - DAST scanning (weekly)
  - Penetration testing (quarterly)
  
Runtime Security:
  - WAF rules
  - Rate limiting
  - API authentication
  - Encryption at rest/transit
  - Audit logging
```

---

## Cost Optimization

### Pre-Launch
- Use Cloud Run minimum instances = 1
- Leverage free tiers where possible
- Monitor costs daily

### Post-v1.0 Cost Management
```yaml
Optimization Strategies:
  1. Reserved Instances:
     - Commit to 1-year for 30% discount
     
  2. Autoscaling Policies:
     - Scale down during off-peak (11 PM - 6 AM)
     - Regional traffic routing
     
  3. Resource Right-Sizing:
     - Weekly analysis of CPU/Memory usage
     - Adjust based on actual needs
     
  4. Caching Strategy:
     - CDN for static assets
     - Redis for session data
     - Edge caching for API responses
     
  5. Monitoring:
     - Daily cost alerts
     - Budget caps
     - Cost per user metrics
```

---

## Implementation Roadmap

### Week of May 27 (Launch Week)
- [x] Document current state
- [ ] Implement pre-launch pipeline
- [ ] Set up basic monitoring
- [ ] Test rollback procedures
- [ ] Prepare launch runbook

### June 1-7 (Launch Week)
- [ ] Monitor closely
- [ ] Daily deployments allowed
- [ ] Gather user feedback
- [ ] Fix critical issues immediately

### June 8-30 (Beta Month 1)
- [ ] Implement canary deployments
- [ ] Enhance monitoring
- [ ] Automate database migrations
- [ ] Establish SLOs

### July-August (Beta Months 2-3)
- [ ] Multi-region preparation
- [ ] Advanced deployment strategies
- [ ] Performance optimization
- [ ] Security hardening

### September+ (Scale Phase)
- [ ] Full production maturity
- [ ] GitOps implementation
- [ ] Chaos engineering
- [ ] Global expansion

---

## Quick Reference Commands

### Pre-Launch Deployment
```bash
# Quick deploy to staging
git push origin main

# Deploy to production (with approval)
gh workflow run deploy-production

# Emergency rollback
gcloud run services update-traffic vocahire-orchestrator \
  --to-revisions=PREVIOUS_REVISION=100
```

### Monitoring
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit 50

# Check metrics
gcloud monitoring metrics list --filter="metric.type:vocahire"

# Health check
curl https://vocahire.com/health
```

### Database
```bash
# Run migration
pnpm prisma migrate deploy

# Create backup
gcloud sql backups create --instance=vocahire-db

# Connect to production DB (carefully!)
pnpm prisma studio
```

---

## Claude Code Deployment Workflow

### Daily Development with Claude Code

```bash
# Morning sync
human: "Claude, what's our deployment status?"
claude: *checks git status, recent commits, and pending tasks*

# Feature development
human: "Add the new feedback enhancement feature"
claude: *implements feature, runs tests, prepares for deployment*

# Pre-deployment
human: "Prepare this for production"
claude: *runs full test suite, builds Docker image, creates deployment checklist*

# Deployment trigger
human: "Looks good, deploying now"
*human runs: git push && gh workflow run deploy-production*

# Post-deployment
human: "Claude, verify the deployment"
claude: *generates and runs verification scripts*
```

### Setting Up Claude Code for Optimal CI/CD

```bash
# 1. Install necessary tools
npm install -g firebase-tools @google-cloud/cli

# 2. Configure local environment
cp .env.example .env.local
# Add development credentials (never production!)

# 3. Set up Firebase emulators
firebase init emulators
firebase emulators:start --only auth,firestore,functions

# 4. Create Claude helper scripts
mkdir -p scripts/claude
cat > scripts/claude/deploy-helper.sh << 'EOF'
#!/bin/bash
# Claude's deployment assistant
set -e

echo "🤖 Claude Deployment Helper"
echo "========================"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "⚠️  Warning: Not on main branch!"
fi

# Run tests
echo "
🧪 Running tests..."
pnpm test || { echo "❌ Tests failed!"; exit 1; }

# Build check
echo "
🏭 Building application..."
pnpm build || { echo "❌ Build failed!"; exit 1; }

# Generate deployment commands
echo "
🚀 Deployment commands:"
echo "git push origin main"
echo "gh workflow run deploy-production"

echo "
✅ Ready for deployment!"
EOF

chmod +x scripts/claude/deploy-helper.sh
```

### Claude Code Limitations Workaround Guide

```typescript
// lib/claude-deployment-utils.ts
export class ClaudeDeploymentUtils {
  // Since Claude can't deploy directly, generate commands instead
  generateDeploymentScript(version: string): string {
    return `
#!/bin/bash
# Generated by Claude on ${new Date().toISOString()}
# Deploy VocaHire ${version}

set -e

# 1. Tag the release
git tag -a ${version} -m "Release ${version}"
git push origin ${version}

# 2. Trigger deployment
gh workflow run deploy-production -f version=${version}

# 3. Monitor (open in browser)
echo "Monitor deployment at:"
echo "https://github.com/YOUR_REPO/actions"
    `.trim();
  }
  
  // Generate rollback script since Claude can't access production
  generateRollbackScript(): string {
    return `
#!/bin/bash
# Rollback script generated by Claude

# List recent revisions
gcloud run revisions list --service=vocahire-orchestrator --region=us-central1

# To rollback, run:
# gcloud run services update-traffic vocahire-orchestrator \\
#   --to-revisions=<PREVIOUS_REVISION>=100 \\
#   --region=us-central1
    `.trim();
  }
}
```

## Conclusion

The journey from pre-launch to mature production system requires careful evolution of CI/CD practices. Start simple, iterate based on real needs, and always prioritize user experience and data safety over process perfection.

**Remember**: Perfect is the enemy of shipped. Launch, learn, and improve continuously.

**Claude Code Note**: While Claude can't directly deploy to production, it serves as an invaluable deployment preparation assistant, ensuring consistency, running validations, and generating the exact commands needed for successful deployments.