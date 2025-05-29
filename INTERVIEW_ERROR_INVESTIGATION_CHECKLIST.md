# Interview Error Investigation Checklist

## Current Issues Identified

### 1. Database Connection Problems (Critical)
- **Evidence**: Logs show "Database connection not available" errors
- **Impact**: Cannot store/retrieve session data, user credits, or feedback
- [ ] Check DATABASE_URL in Secret Manager
- [ ] Verify connection pool configuration in `/lib/prisma.ts`
- [ ] Check if Supabase connection strings are valid
- [ ] Review connection pool size limits (currently 0/25 active)
- [ ] Check for connection timeouts

### 2. Flickering and Re-rendering Issues
- **Evidence**: User reports flickering on interview screen
- **Root Causes**:
  - [ ] Duplicate connection attempts in useEffect
  - [ ] Missing dependency arrays causing re-renders
  - [ ] Connection state management causing UI flickers
  - [ ] AudioContext being created/destroyed repeatedly

### 3. Handshake/Connection Stability
- **Evidence**: "sendData bypassed: status is not 'streaming' or 'connected'"
- **Issues to Check**:
  - [ ] SSE connection not establishing properly
  - [ ] Session endpoint returns 404 (missing route)
  - [ ] Google AI API key not available in production
  - [ ] Race condition between connection states

## Investigation Steps

### Step 1: Database Connection
```bash
# Check if database is accessible
curl https://v0-vocahire-727828254616.us-central1.run.app/api/health

# Check database connection locally
npm run dev
# Navigate to /api/health
```

### Step 2: API Endpoint Verification
- [ ] Verify `/api/interview-v2/session` endpoint exists and responds
- [ ] Check if SSE stream establishes correctly
- [ ] Verify `/api/interview-v2/session/[sessionId]` dynamic route works
- [ ] Test with curl: `curl -X POST https://v0-vocahire-727828254616.us-central1.run.app/api/interview-v2/session`

### Step 3: Environment Variables
- [ ] GOOGLE_AI_API_KEY in Secret Manager
- [ ] DATABASE_URL is correct and accessible
- [ ] REDIS_URL for session management
- [ ] All Clerk keys are properly set

### Step 4: Frontend State Management
- [ ] Check React DevTools for excessive re-renders
- [ ] Monitor Network tab for duplicate API calls
- [ ] Check Console for specific error messages
- [ ] Use React Profiler to identify performance issues

### Step 5: Connection Flow Issues
- [ ] User clicks "Start Interview" → SessionSetup
- [ ] MicCheckModal opens → Permissions granted
- [ ] Connection initiated → SSE stream established
- [ ] Audio streaming begins → Data sent to server
- [ ] Server forwards to Google Live API

## Common Error Patterns

### 1. "Cannot close a closed AudioContext"
**Cause**: Component unmounting/remounting
**Fix**: Proper cleanup in useEffect

### 2. "sendData bypassed: status is not 'streaming' or 'connected'"
**Cause**: Connection not established before sending data
**Fix**: Proper connection state management

### 3. Database Connection Errors
**Cause**: Connection pool exhausted or misconfigured
**Fix**: Review Prisma configuration and connection limits

## Quick Fixes to Try

1. **Add Connection Logging**:
```typescript
// In useGenkitRealtime.ts
console.log('[Connection Debug]', {
  status,
  isConnected,
  sessionId: sessionConfig.sessionId,
  timestamp: new Date().toISOString()
});
```

2. **Add Database Health Check**:
```typescript
// In session/route.ts
try {
  await prisma.$queryRaw`SELECT 1`;
} catch (error) {
  console.error('[Database Check Failed]', error);
}
```

3. **Prevent Multiple Connections**:
```typescript
// Add connection mutex
const connectionInProgress = useRef(false);
if (connectionInProgress.current) return;
connectionInProgress.current = true;
```

## Production Debugging Commands

```bash
# View real-time logs
gcloud run services logs tail v0-vocahire

# Check service configuration
gcloud run services describe v0-vocahire --region=us-central1

# Check secrets
gcloud secrets list
gcloud secrets versions list GOOGLE_AI_API_KEY

# Test endpoints
curl -X GET https://v0-vocahire-727828254616.us-central1.run.app/api/health
curl -X GET https://v0-vocahire-727828254616.us-central1.run.app/api/interview-v2/health
```

## Monitoring Checklist

- [ ] Cloud Run metrics (CPU, Memory, Request count)
- [ ] Error rate in Cloud Logging
- [ ] Database connection pool metrics
- [ ] WebSocket/SSE connection success rate
- [ ] User session completion rate

## Root Cause Hypothesis

Based on the evidence, the primary issues appear to be:

1. **Database Connection Pool**: The pool shows 0 active connections, indicating a configuration or connection string issue
2. **Race Conditions**: Multiple components trying to establish connections simultaneously
3. **Missing Error Recovery**: No graceful fallback when connections fail

## Recommended Solution Order

1. Fix database connection issues first (critical)
2. Implement proper connection state management
3. Add retry logic with exponential backoff
4. Implement the mic check modal (already done)
5. Add comprehensive error logging
6. Test with production-like environment locally