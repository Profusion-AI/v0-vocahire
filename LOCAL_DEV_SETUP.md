# Local Development Setup for VocaHire

## Quick Start

1. **Create `.env.local` file** in the root directory with these required variables:

```bash
# Google AI API Key (required for real-time interviews)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Database
DATABASE_URL=your_database_url
MIGRATE_DATABASE_URL=your_migrate_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Redis (optional for local dev)
REDIS_URL=redis://localhost:6379

# Google Cloud Project (optional for local dev)
GOOGLE_PROJECT_ID=vocahire-prod-20810233
```

2. **Get your Google AI API Key**:
   - Go to https://aistudio.google.com/apikey
   - Create a new API key
   - Add it to your `.env.local` file

3. **Start the development server**:
```bash
pnpm dev
```

## Common Issues

### "GOOGLE_AI_API_KEY not found" Error
This means your `.env.local` file is missing or doesn't have the `GOOGLE_AI_API_KEY` variable set.

### Connection Errors During Interview
Check the browser console for detailed error messages. The improved error handling will tell you exactly what's missing.

## Production vs Development

- **Development**: Uses environment variables from `.env.local`
- **Production**: Uses Google Secret Manager for sensitive values

The code automatically detects the environment and uses the appropriate source for secrets.