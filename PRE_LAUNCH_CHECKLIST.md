# 🚀 Pre-Launch Checklist - VocaHire

**Launch Date**: June 1, 2025  
**Time Remaining**: ~48 hours  
**Created**: May 29, 2025

## 🔴 Critical Issues (Must Fix Before Launch)

### 1. Mock Data Removal
- [ ] Remove/guard mock mode in interview session API
- [ ] Add production check to fallback database
- [ ] Update testimonials (names/companies)
- [ ] Change dummy@example.com to noreply@localhost
- [ ] Test all changes in production-like environment

### 2. Build Failures
- [ ] Fix transcript ID field (✅ Done - monitoring build)
- [ ] Fix Google Live API naming conventions
- [ ] Update audio MIME types (16kHz input, 24kHz output)
- [ ] Ensure all TypeScript errors resolved

### 3. Environment Variables
- [ ] Verify GOOGLE_AI_API_KEY in Secret Manager
- [ ] Verify DATABASE_URL points to Supabase (not localhost)
- [ ] Check all Stripe keys are production keys
- [ ] Ensure REDIS_URL is configured

### 4. Legal Compliance
- [ ] Update Terms of Service language
- [ ] Review Privacy Policy is current
- [ ] Ensure GDPR/CCPA compliance basics
- [ ] Add cookie consent if needed

### 5. Repository Cleanup
- [ ] Add internal docs to .gitignore
- [ ] Remove sensitive documentation from git history
- [ ] Keep only public-facing READMEs (README.md, CLAUDE.md, docs/)
- [ ] Verify no API keys or secrets in commit history

## 🟡 Important (Should Fix)

### 1. Google Live API Compliance
- [ ] Transform camelCase config to snake_case for API
- [ ] Use correct voice names and modalities
- [ ] Test audio streaming with proper sample rates

### 2. Error Handling
- [ ] Graceful error messages for missing API key
- [ ] User-friendly database connection errors
- [ ] Clear messaging for payment failures

### 3. Security
- [ ] Remove all console.log statements
- [ ] Ensure no secrets in code
- [ ] Verify rate limiting is active

## ✅ Pre-Launch Testing

### Functional Tests
- [ ] Complete user journey: Sign up → Interview → Feedback
- [ ] Test free credits (3 interviews)
- [ ] Test credit purchase flow
- [ ] Test premium subscription
- [ ] Verify audio quality (both directions)

### Production Simulation
```bash
# Test with production environment
NODE_ENV=production npm run build
NODE_ENV=production npm start

# Check for any mock data
grep -r "MOCK MODE" dist/
grep -r "dummy@example.com" dist/
grep -r "Using fallback database" dist/
```

### Load Testing
- [ ] Test with 10 concurrent users
- [ ] Monitor Cloud Run metrics
- [ ] Check database connection pooling
- [ ] Verify Redis session management

## 📊 Monitoring Setup

### Production Logs to Monitor
```bash
# Mock mode activation (should be 0)
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"[MOCK MODE]\"" --limit=50

# Fallback database (should be 0)
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"Using fallback database\"" --limit=50

# API key errors
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"GOOGLE_AI_API_KEY\"" --limit=50

# General errors
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=50
```

### Alerts to Set Up
- [ ] High error rate (>5%)
- [ ] Missing API key
- [ ] Database connection failures
- [ ] Payment processing errors

## 🎯 Launch Day Plan

### June 1, 2025 - Launch Steps

1. **Morning (6-9 AM)**
   - [ ] Final build verification
   - [ ] Run production tests
   - [ ] Check all monitoring

2. **Pre-Launch (9-11 AM)**
   - [ ] Update DNS if needed
   - [ ] Clear any test data
   - [ ] Prepare rollback plan

3. **Launch (12 PM)**
   - [ ] Announce on social media
   - [ ] Monitor logs closely
   - [ ] Be ready to scale

4. **Post-Launch (12-6 PM)**
   - [ ] Monitor user signups
   - [ ] Watch for errors
   - [ ] Respond to feedback
   - [ ] Fix any critical issues

## 🔄 Rollback Plan

If critical issues arise:

1. **Immediate Actions**
   ```bash
   # Revert to previous Cloud Run revision
   gcloud run services update-traffic v0-vocahire \
     --to-revisions=PREVIOUS_REVISION=100 \
     --region=us-central1
   ```

2. **Communication**
   - Post status update
   - Email early users
   - Fix issues quickly

3. **Recovery**
   - Fix critical bugs
   - Test thoroughly
   - Re-deploy when ready

## 📝 Final Reminders

1. **Must Have**
   - Working AI interviews
   - Payment processing
   - User authentication
   - Basic error handling

2. **Nice to Have**
   - Perfect UI/UX
   - All features
   - Advanced analytics

3. **Can Wait**
   - Enhanced feedback
   - Social features
   - Mobile apps

Remember: **Ship it when it works, perfect it when it's live!**

## Emergency Contacts

- Cloud Run Issues: Check Cloud Console
- Payment Issues: Stripe Dashboard
- Database Issues: Supabase Dashboard
- Domain Issues: DNS Provider

Good luck with the launch! 🎉