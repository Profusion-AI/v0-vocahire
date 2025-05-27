# ⚠️ PRODUCTION CHECKLIST - MAY 31, 2025

## CRITICAL: Remove Development Bypasses Before Production

### 1. **Remove Dev Auth Bypass Flags**
Edit `.env.local` and **REMOVE** these lines:
```env
# REMOVE THESE LINES:
DEV_SKIP_AUTH=true
NEXT_PUBLIC_DEV_SKIP_AUTH=true
NEXT_PUBLIC_DEV_AUTO_LOGIN=true
```

### 2. **Update Dockerfile for Production**
Switch from `Dockerfile.dev` to the production `Dockerfile`:
```bash
# In docker-compose.yml or deployment scripts
dockerfile: Dockerfile  # NOT Dockerfile.dev
```

### 3. **Remove Dev Mode Code**
Check and remove/comment out:
- [ ] Dev auth bypass in `AuthGuard.tsx`
- [ ] Mock user data in `useQuickAuth.ts`
- [ ] Dev login route `/api/auth/dev-login/route.ts`
- [ ] Any `process.env.NODE_ENV === 'development'` checks that bypass security
- [ ] **NEW**: Remove DEV_SKIP_AUTH checks from:
  - [ ] `middleware.ts` (line ~23)
  - [ ] `hooks/use-terms-agreement.ts` (lines ~38-39, ~49-54, ~88-92)
  - [ ] `app/interview/page.tsx` (lines ~27-28, ~31-37, ~48-58)
  - [ ] `app/profile/page.tsx` (lines ~20, ~26-36)

### 4. **Security Checklist**
- [ ] Ensure all API keys are production keys
- [ ] Verify Clerk is using live keys (`pk_live_`, `sk_live_`)
- [ ] Confirm Stripe is using live keys
- [ ] Remove any hardcoded test credentials
- [ ] Disable debug mode flags

### 5. **Build Production Image**
```bash
# Build the production Docker image
docker build -t vocahire-prod:latest -f Dockerfile .

# Test it locally first
docker run -p 3000:3000 vocahire-prod:latest
```

### 6. **Environment Variables for Production**
Ensure production deployment has:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://vocahire.com
# NO DEV_SKIP_AUTH FLAGS!
```

### 7. **Final Testing**
- [ ] Test auth flow works properly
- [ ] Verify credits are deducted
- [ ] Check payments process correctly
- [ ] Ensure no dev mode indicators appear
- [ ] **Verify terms modal appears for new users**
- [ ] Test that returning users don't see terms modal again
- [ ] Confirm authentication redirects work correctly

## Remember:
**The yellow "DEV MODE" banner should NEVER appear in production!**

---

Created: May 27, 2025
Due: May 31, 2025 (before deployment)
Priority: 🔴 CRITICAL