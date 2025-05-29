# WebSocket Build Fix Plan

**Issue**: Next.js App Router doesn't support WebSocket endpoints. The `SOCKET` export in `/app/api/interview-v2/ws/route.ts` is causing build failures.

## Option 1: Remove WebSocket Route (Quick Fix for Build)

Since the WebSocket route is just a mock and won't work in production anyway:

1. Delete `/app/api/interview-v2/ws/route.ts`
2. Update client to use HTTP/SSE fallback
3. This will unblock the build immediately

## Option 2: Implement Proper WebSocket Support

### A. Using a Custom Server (Recommended for Production)
```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const wss = new WebSocketServer({ 
    server,
    path: '/api/interview-v2/ws' 
  });

  wss.on('connection', (ws) => {
    // Handle WebSocket connections
  });

  server.listen(3000);
});
```

### B. Using a WebSocket Proxy Service
- Deploy WebSocket server separately (e.g., on Railway, Fly.io)
- Connect from client to external WebSocket service
- Keep Next.js app for everything else

### C. Revert to HTTP/SSE (What Was Working Before)
- Use POST for sending audio/text
- Use Server-Sent Events for receiving responses
- This worked in production before WebSocket migration

## Recommendation for Immediate Fix

1. **Delete the WebSocket route** to unblock build
2. **Update client to handle missing WebSocket gracefully**
3. **Deploy successfully first**
4. **Then implement proper WebSocket support** post-deployment

## Implementation Steps

### Step 1: Remove Mock WebSocket Route
```bash
rm app/api/interview-v2/ws/route.ts
```

### Step 2: Update Client to Fallback
```typescript
// In useGenkitRealtime.ts
const buildWsUrl = (baseUrl: string) => {
  // For now, throw error or use HTTP fallback
  console.warn('WebSocket not available, using HTTP fallback');
  return null;
};
```

### Step 3: Implement HTTP Fallback
- Keep existing `/api/interview-v2/session` route
- Use fetch() for sending data
- Use EventSource for receiving

This approach:
- Fixes the build immediately
- Maintains functionality
- Allows for proper WebSocket implementation later