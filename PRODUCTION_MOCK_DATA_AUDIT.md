# 🚨 Production Mock Data Audit - CRITICAL for Launch

**Created**: May 29, 2025  
**Launch Date**: June 1, 2025 (48 hours)  
**Status**: 🔴 Multiple mock data issues found that MUST be fixed

## Executive Summary

Found 3 critical areas where development mock data could leak into production, potentially damaging user trust and product credibility.

## Critical Issues Found

### 1. 🔴 CRITICAL: Mock Mode in Interview Session API

**File**: `/app/api/interview-v2/session/route.ts` (lines 56-79)

**Issue**: 
- Returns "[MOCK MODE]" messages when conditions are met
- Currently checks: `NODE_ENV === 'development' && !process.env.GOOGLE_AI_API_KEY`
- Risk: If API key is missing, users see development messages

**Sample Output**:
```
[MOCK MODE] Hello! I'm ready to conduct your Technical interview for the Software Engineer position. 
Please note: This is a mock interview session for development. To use the real AI, please configure your Google AI API key.
```

**Fix Required**:
```typescript
// OPTION 1: Remove entirely
// Delete lines 55-79

// OPTION 2: Stronger production guard
if (process.env.NODE_ENV === 'development' && process.env.ALLOW_MOCK_MODE === 'true' && !process.env.GOOGLE_AI_API_KEY) {
  // Mock mode code
}

// OPTION 3: Fail fast in production
if (!process.env.GOOGLE_AI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_AI_API_KEY is required in production');
  }
  // Dev mock mode
}
```

### 2. 🔴 CRITICAL: Fallback Database with Fake Data

**File**: `/lib/fallback-db.ts`

**Issues**:
- Creates fake users with 3.00 credits
- Returns mock session IDs: `fallback-${Date.now()}`
- Could activate if database fails in production
- Users would get free credits and broken functionality

**Current Behavior**:
```typescript
const getDefaultUser = (id: string, name: string | null = null, email: string | null = null): User => ({
  id,
  clerkId: id,
  name,
  email,
  credits: new Prisma.Decimal(3.00), // FREE CREDITS!
  // ... other defaults
});
```

**Fix Required**:
```typescript
// Add production guard at file start
if (process.env.NODE_ENV === 'production') {
  throw new Error('Fallback database cannot be used in production');
}

// OR better: Let the app fail gracefully
export const fallbackUserOps = {
  findUnique: async () => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database connection required');
    }
    // existing fallback code
  }
}
```

### 3. 🟡 MODERATE: Fake Testimonials on Landing Page

**File**: `/components/landing/Testimonials.tsx`

**Issues**:
- "Sarah L. - Software Engineer at Google" (fake)
- "Mark T. - Marketing Manager" (no company)
- "Jamie K. - Project Manager" (generic)
- Could damage trust if discovered as fake

**Current Content**:
```typescript
{
  quote: "I used VocaHire Coach to prepare for my Google interview...",
  author: 'Sarah L.',
  role: 'Software Engineer at Google',
}
```

**Fix Options**:
1. Replace with real testimonials (best)
2. Add disclaimer: "Names changed for privacy"
3. Use more generic titles: "Software Engineer at Major Tech Company"
4. Remove section until real testimonials available

### 4. 🟡 MODERATE: Dummy Config in Interview Page

**File**: `/app/interview-v2/page.tsx` (lines 59-71)

**Context**: 
- Uses dummy config to satisfy TypeScript before real session starts
- Hook properly skips connection when detecting 'dummy' values
- Generally safe pattern, but includes `dummy@example.com`

**Current Code**:
```typescript
const dummyConfig = useMemo(() => ({
  sessionId: 'dummy',
  userId: 'dummy',
  userEmail: 'dummy@example.com',  // Could be logged
  userName: 'dummy'
  // ... other dummy values
}), []);
```

**Risk**: Low - Hook skips connection, but email could appear in logs

**Recommendation**: Use more obviously fake email like `noreply@localhost`

## Other Findings

### ✅ Good Patterns
- Proper production checks in `/lib/prisma.ts`
- No hardcoded test emails or API keys  
- Authentication properly uses Clerk
- Dummy config pattern prevents unnecessary API calls

### 🟡 Minor Issues
- Some console.log statements that should be removed
- Development-only error messages that expose internals

## Action Plan

### Before Launch (Next 48 Hours)

1. **Fix Interview Mock Mode** (2 hours)
   - Add strong production guards
   - Test with missing API key scenario
   - Add monitoring for this condition

2. **Disable Fallback Database** (1 hour)
   - Add production check to throw error
   - Ensure proper error handling in UI
   - Test database failure scenarios

3. **Update Testimonials** (30 mins)
   - Either get real testimonials
   - Or add privacy disclaimer
   - Or remove section temporarily

### Testing Checklist

- [ ] Test with `NODE_ENV=production` locally
- [ ] Test with missing GOOGLE_AI_API_KEY
- [ ] Test with database connection failure
- [ ] Verify no "[MOCK MODE]" text appears
- [ ] Verify no free credits given
- [ ] Check all user-facing text for "test", "mock", "demo"

## Code to Search Production Logs

After deployment, monitor for these strings:
```bash
# Search for mock mode activation
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"[MOCK MODE]\"" --limit=50

# Search for fallback database usage
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"Using fallback database\"" --limit=50

# Search for missing API key
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"no Google AI API key configured\"" --limit=50
```

## Risk Assessment

**If Not Fixed**:
- Users could see "[MOCK MODE]" messages → Loss of trust
- Users could get free credits → Financial loss
- Users could see fake testimonials → Legal/reputation risk

**Estimated Time to Fix All**: 3-4 hours

## Recommendation

These issues MUST be fixed before launch. The mock interview session API is the most critical as it's in the core user path. The fallback database is second priority. Testimonials can be updated post-launch if needed.