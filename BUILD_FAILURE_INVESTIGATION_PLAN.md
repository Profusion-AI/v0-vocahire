# Build Failure Investigation & Resolution Plan

**Date**: May 29, 2025  
**Build ID**: b1ceba2e-e918-47fb-a918-b41b8ccbbf0a  
**Status**: FAILURE (ESLint errors during Next.js build)

## Root Cause Analysis

The build is failing due to ESLint errors during the Next.js production build phase. The errors are:

### 1. WebSocket Route Handler (`/app/api/interview-v2/ws/route.ts`)
- **9 ESLint errors** related to unused variables and parameters
- These are in the mock WebSocket implementation

### 2. LiveInterview Component (`/app/interview-v2/components/LiveInterview.tsx`)
- **2 ESLint warnings** about missing `audioStream` dependency in useEffect hooks

### 3. Test File (`/app/interview-v2/hooks/__tests__/useGenkitRealtime.test.ts`)
- **4 ESLint errors** about using `as const` assertions instead of literal type annotations

### 4. useGenkitRealtime Hook (`/app/interview-v2/hooks/useGenkitRealtime.ts`)
- **1 ESLint warning** about unnecessary `onReconnected` dependency

## Investigation Plan

### Phase 1: Immediate ESLint Fixes (Priority 1)
1. **Fix WebSocket route unused variables**
   - Add underscore prefix to unused parameters
   - Remove completely unused imports

2. **Fix test file const assertions**
   - Replace literal type annotations with `as const`

3. **Fix React Hook dependencies**
   - Add missing dependencies or disable rules where appropriate

### Phase 2: Build Verification (Priority 2)
1. Run local lint check: `npm run lint`
2. Run local build: `npm run build`
3. Verify all ESLint errors are resolved

### Phase 3: Deeper Investigation (If needed)
1. Check for TypeScript compilation errors
2. Review ESLint configuration for overly strict rules
3. Consider if WebSocket mock needs refactoring

## Resolution Steps

### ✅ Step 1: Fix WebSocket Route (COMPLETED)
- Removed unused import of 'z'
- Changed unused parameters to have underscore prefix

### ✅ Step 2: Fix Test File (COMPLETED)
- Changed literal type annotations to `as const`

### ✅ Step 3: Fix React Hooks (COMPLETED)
- Added `audioStream` to dependency arrays

### ❌ Step 4: New Issue Found - Invalid Route Export
**Problem**: `SOCKET` is not a valid Next.js Route export
**Root Cause**: Next.js App Router doesn't support WebSocket endpoints
**Solution**: Need to either:
1. Remove the WebSocket route (it's just a mock)
2. Move WebSocket functionality to a custom server
3. Revert to HTTP/SSE implementation

### Step 5: Test Locally
```bash
npm run lint  # ✅ PASSED
npm run build # ❌ FAILED - Route export issue
```

### ✅ Step 6: Fix Route Export Issue (COMPLETED)
**Solution Applied**: Deleted the ws/route.ts file
- Removed `/app/api/interview-v2/ws/route.ts` (mock implementation)
- Also removed duplicate Prisma generated file `index.d 2.ts`

### ✅ Step 7: Build Success!
```bash
npm run lint  # ✅ PASSED - No ESLint errors
npm run build # ✅ PASSED - Build completed successfully!
```

## Alternative Solutions

### Option A: Disable Specific Rules (Quick Fix)
- Add eslint-disable comments for non-critical warnings
- Good for immediate unblocking

### Option B: Refactor WebSocket Mock (Better Long-term)
- Create a proper WebSocket mock that doesn't have unused parameters
- More maintainable solution

### Option C: Adjust ESLint Config (If too strict)
- Modify `.eslintrc` to be less strict about unused vars in specific patterns
- Consider allowing unused args that match certain patterns

## Success Criteria
1. `npm run lint` passes with no errors
2. `npm run build` completes successfully
3. Cloud Build succeeds on push to main
4. No regression in functionality

## Next Steps After Fix
1. Monitor Cloud Build for successful deployment
2. Consider adding pre-commit hooks to catch ESLint errors earlier
3. Document any ESLint rule changes made