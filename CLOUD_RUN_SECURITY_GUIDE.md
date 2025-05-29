# Cloud Run Security Configuration Guide

## Current Security Status

### ✅ What's Working
1. **Clerk Middleware** - Protects authenticated routes
2. **Public Routes Defined** - Only specific routes are public in middleware.ts
3. **Webhook Signature Verification** - Stripe and Clerk webhooks verify signatures

### ❌ Security Issues
1. **Secrets Exposed** - API keys visible as environment variables
2. **Database URL Invalid** - Points to localhost instead of Supabase
3. **No Rate Limiting** - Vulnerable to abuse
4. **No Cloud Armor** - No DDoS protection

## Security Configuration Options

### Option 1: Public Access with Enhanced Security (Recommended)
Keep "Allow unauthenticated" but add security layers:

#### 1. Fix Secret Management (CRITICAL - Do First!)
```bash
# Create all secrets in Secret Manager
echo -n "YOUR_SUPABASE_DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "YOUR_NEW_CLERK_SECRET_KEY" | gcloud secrets create CLERK_SECRET_KEY --data-file=-
echo -n "YOUR_STRIPE_SECRET_KEY" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo -n "YOUR_STRIPE_WEBHOOK_SECRET" | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "YOUR_REDIS_URL" | gcloud secrets create REDIS_URL --data-file=-

# Grant access
SERVICE_ACCOUNT="727828254616-compute@developer.gserviceaccount.com"
for SECRET in DATABASE_URL CLERK_SECRET_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET REDIS_URL; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
done

# Update Cloud Run to use secrets
gcloud run services update v0-vocahire \
  --update-secrets=DATABASE_URL=DATABASE_URL:latest \
  --update-secrets=CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest \
  --update-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
  --update-secrets=STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest \
  --update-secrets=REDIS_URL=REDIS_URL:latest \
  --remove-env-vars=DATABASE_URL,CLERK_SECRET_KEY,REDIS_URL \
  --region=us-central1
```

#### 2. Add Cloud Armor for DDoS Protection
```bash
# Create security policy
gcloud compute security-policies create vocahire-security-policy \
  --description="Security policy for VocaHire"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy=vocahire-security-policy \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60 \
  --ban-duration-sec=600 \
  --conform-action=allow \
  --exceed-action=deny-429 \
  --enforce-on-key=IP

# Add country restrictions (optional)
gcloud compute security-policies rules create 2000 \
  --security-policy=vocahire-security-policy \
  --action=allow \
  --expression="origin.region_code in ['US', 'CA', 'GB', 'AU']"
```

#### 3. Implement Application-Level Security

**Add rate limiting to your API routes:**
```typescript
// lib/rate-limit-config.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const rateLimits = {
  api: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  }),
  auth: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  }),
  interview: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 interviews per hour
  }),
};
```

#### 4. Add Request Validation Headers
```typescript
// middleware.ts - Add security headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  
  return response;
}
```

### Option 2: Authenticated Access Only (Not Recommended for Public Apps)
This would require users to authenticate with Google before accessing your site:

```bash
# Remove public access
gcloud run services remove-iam-policy-binding v0-vocahire \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-central1

# Add domain-restricted access
gcloud run services add-iam-policy-binding v0-vocahire \
  --member="domain:yourdomain.com" \
  --role="roles/run.invoker" \
  --region=us-central1
```

## Recommended Security Checklist

### Immediate Actions (Do Now!)
- [ ] Rotate all exposed API keys
- [ ] Move all secrets to Secret Manager
- [ ] Fix DATABASE_URL to use actual Supabase URL
- [ ] Remove hardcoded environment variables

### Short-term (This Week)
- [ ] Implement rate limiting with Upstash Redis
- [ ] Add security headers to middleware
- [ ] Set up Cloud Armor for DDoS protection
- [ ] Enable Cloud Run CPU allocation: `--cpu-throttling`

### Medium-term (This Month)
- [ ] Set up monitoring alerts for suspicious activity
- [ ] Implement request logging for security analysis
- [ ] Add API key authentication for sensitive endpoints
- [ ] Set up Cloud CDN for static assets

## Monitoring Security

### 1. Enable Audit Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND severity>=WARNING" \
  --limit=50 --format=json
```

### 2. Set Up Alerts
```bash
# Alert on high error rates
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="High Error Rate on VocaHire" \
  --condition-display-name="Error rate > 10%" \
  --condition-expression='
    resource.type="cloud_run_revision"
    AND resource.labels.service_name="v0-vocahire"
    AND metric.type="run.googleapis.com/request_count"
    AND metric.labels.response_code_class="5xx"
  '
```

### 3. Regular Security Audits
- Review IAM permissions monthly
- Rotate API keys quarterly
- Check for exposed secrets in logs
- Monitor unusual traffic patterns

## Best Practices

1. **Principle of Least Privilege**
   - Only grant necessary permissions
   - Use service accounts with minimal roles

2. **Defense in Depth**
   - Multiple security layers (Cloud Armor + App Auth + Rate Limiting)
   - Don't rely on a single security mechanism

3. **Zero Trust**
   - Verify every request
   - Don't trust based on network location

4. **Secure by Default**
   - New endpoints should be protected by default
   - Explicitly mark public routes

## Testing Security

```bash
# Test rate limiting
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://vocahire.com/api/health
done

# Test authentication
curl -H "Authorization: Bearer invalid-token" https://vocahire.com/api/user

# Check security headers
curl -I https://vocahire.com
```

## Emergency Response

If you detect a security breach:

1. **Immediate Actions**:
   ```bash
   # Temporarily restrict access
   gcloud run services update v0-vocahire \
     --ingress=internal \
     --region=us-central1
   ```

2. **Rotate All Secrets**:
   - Change all API keys
   - Update Secret Manager
   - Redeploy service

3. **Review Logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" \
     --limit=1000 --format=json > security-audit.json
   ```

4. **Restore Service**:
   ```bash
   gcloud run services update v0-vocahire \
     --ingress=all \
     --region=us-central1
   ```