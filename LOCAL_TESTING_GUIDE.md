# VocaHire Local Testing Guide

This guide helps you test changes made by Claude and Gemini on your local machine before deployment.

## 🚀 Quick Start

### 1. Pull Latest Changes
```bash
git pull origin main --rebase
```

### 2. Run Local Docker Environment
```bash
# Start all services (PostgreSQL, Redis, App)
./scripts/docker-dev.sh up

# Or run specific services
docker-compose up -d postgres redis
pnpm dev
```

### 3. Access Local Services
- **Frontend**: http://localhost:3000
- **Orchestrator API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432 (user: postgres, password: postgres)
- **Redis**: localhost:6379

## 🧪 Testing Workflows

### A. Testing Backend Changes (Gemini's Work)

1. **WebRTC Server Testing**
   ```bash
   # Test WebSocket connection
   wscat -c ws://localhost:3000/api/webrtc-exchange/test-session-id
   
   # Test session creation
   curl -X POST http://localhost:3000/api/v1/sessions/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-jwt-token>" \
     -d '{"userId": "test-user", "jobTitle": "Software Engineer"}'
   ```

2. **API Endpoint Testing**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Ready check
   curl http://localhost:3000/ready
   ```

### B. Testing Frontend Changes (Claude's Work)

1. **Interview Flow**
   - Navigate to http://localhost:3000
   - Log in with test credentials
   - Start an interview session
   - Check browser console for WebRTC connection logs
   - Monitor Network tab for API calls

2. **WebRTC Connection**
   - Open Chrome DevTools → Network → WS tab
   - Look for WebSocket connection to `/api/webrtc-exchange/`
   - Verify message exchange (offer/answer/ICE candidates)

### C. Integration Testing

1. **Full Stack Test**
   ```bash
   # Terminal 1: Run backend with logs
   docker-compose up
   
   # Terminal 2: Run frontend with debugging
   NEXT_PUBLIC_DEBUG=true pnpm dev
   
   # Terminal 3: Monitor logs
   docker-compose logs -f
   ```

2. **Database Verification**
   ```bash
   # Connect to database
   docker exec -it vocahire-postgres psql -U postgres -d vocahire
   
   # Check sessions
   SELECT * FROM "Session" ORDER BY "createdAt" DESC LIMIT 5;
   
   # Check user credits
   SELECT id, email, "vocahireCredits" FROM "User";
   ```

## 📊 Monitoring Development

### 1. Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Filter by keyword
docker-compose logs -f | grep "WebRTC"
```

### 2. Performance Monitoring
```bash
# CPU/Memory usage
docker stats

# Network connections
netstat -an | grep 3000
```

### 3. Error Tracking
- Check Sentry dashboard for production-like errors
- Monitor browser console for client-side errors
- Check server logs for backend errors

## 🔄 Continuous Integration Testing

### Local CI Simulation
```bash
# Run same checks as GitHub Actions
pnpm lint
pnpm tsc --noEmit
pnpm test

# Build production bundle
pnpm build
```

### Staging Environment Testing
Once changes are pushed to main:
1. GitHub Actions will automatically deploy to staging
2. Access staging URL: `https://vocahire-orchestrator-staging-xxxxx-uc.a.run.app`
3. Test with production-like data
4. Report issues back to Claude/Gemini

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Docker Build Failed**
   ```bash
   # Clean rebuild
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up
   ```

3. **Database Connection Issues**
   ```bash
   # Reset database
   docker-compose down
   docker volume rm vocahire_postgres_data
   docker-compose up -d postgres
   pnpm prisma migrate deploy
   ```

## 📝 Reporting Issues

When reporting issues to Claude or Gemini:

1. **Include Error Context**
   - Full error message
   - Browser console logs
   - Network tab screenshots
   - Docker logs

2. **Steps to Reproduce**
   - Exact commands run
   - User actions taken
   - Expected vs actual behavior

3. **System Information**
   - Node version: `node --version`
   - Docker version: `docker --version`
   - Browser and version

## 🔐 Environment Variables

Create `.env.local` for frontend testing:
```env
# Backend API (local or staging)
NEXT_PUBLIC_API_URL=http://localhost:3000
# Or for staging tests:
# NEXT_PUBLIC_API_URL=https://vocahire-orchestrator-staging-xxxxx-uc.a.run.app

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Optional: Debug mode
NEXT_PUBLIC_DEBUG=true
```

## 📊 Testing Checklist

Before reporting successful integration:

- [ ] Session creation works
- [ ] WebRTC connection establishes
- [ ] Audio flows both ways
- [ ] Transcripts appear in UI
- [ ] Credits deduct properly
- [ ] Error handling works
- [ ] Reconnection logic functions
- [ ] Database updates correctly

## 🚦 Next Steps

1. **Daily Testing Routine**
   - Pull latest changes
   - Run local tests
   - Check staging deployment
   - Report findings

2. **Weekly Integration Review**
   - Full end-to-end test
   - Performance benchmarking
   - Security audit
   - User experience review