# VocaHire - AI-Powered Interview Practice Platform

[![Cloud Run](https://img.shields.io/badge/deployed%20on-Cloud%20Run-blue)](https://vocahire.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black)](https://nextjs.org/)

Practice job interviews with AI that understands what it takes to succeed in today's evolving job market.

## Overview

VocaHire provides realistic interview simulations powered by Google's Gemini AI, helping job seekers build confidence and improve their interview skills. In an era where AI is reshaping the workforce, we believe AI should also be a tool for empowerment—helping people navigate career transitions and land their next opportunity.

### Key Features

- 🎙️ **Real-time Voice Conversations** - Natural speech-to-speech interviews with <1.5s latency
- 🧠 **Adaptive AI Interviewer** - Powered by Gemini 2.5 Flash with native audio understanding
- 📊 **Detailed Feedback** - Get actionable insights on your responses, filler words, and areas for improvement
- 🎯 **Multiple Interview Types** - Behavioral, Technical, Leadership, and General interviews
- 💳 **Flexible Credit System** - Pay-as-you-go with 3 free credits to start
- 🔒 **Privacy-First** - Your interview data is yours; we don't train on user conversations

## Tech Stack

- **Frontend**: Next.js 15.2 (App Router), TypeScript, Tailwind CSS
- **AI/ML**: Google Gemini 2.5 Flash (native audio), Genkit
- **Infrastructure**: Google Cloud Run, Cloud SQL (PostgreSQL), Redis
- **Authentication**: Clerk
- **Payments**: Stripe
- **Real-time**: WebRTC for low-latency audio streaming

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Google Cloud account (for AI services)
- Clerk account (authentication)
- Stripe account (payments)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vocahire.git
   cd vocahire
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Start development environment**
   ```bash
   make dev-build  # First time setup
   make dev        # Start services
   ```

   The app will be available at `http://localhost:3001`

4. **Run database migrations**
   ```bash
   make migrate
   ```

### Quick Commands

```bash
make dev        # Start development server
make test       # Run tests
make studio     # Open Prisma Studio
make shell      # Container shell
make help       # Show all commands
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  Cloud Run   │────▶│ Gemini API  │
│   Client    │     │   Backend    │     │   (Audio)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────▼────┐  ┌────▼─────┐
              │ PostgreSQL│  │  Redis   │
              │    (RDS)  │  │ (Cache)  │
              └──────────┘  └──────────┘
```

## Project Structure

```
vocahire/
├── app/              # Next.js app directory
│   ├── api/          # API routes
│   ├── interview-v2/ # Interview interface
│   └── (auth)/       # Authentication pages
├── components/       # Reusable React components
├── lib/              # Utilities and integrations
├── prisma/           # Database schema
└── scripts/          # Build and deployment scripts
```

## Contributing

We welcome contributions! Whether you're fixing bugs, improving documentation, or proposing new features, your input helps make interview practice accessible to everyone navigating career changes.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Run tests: `make test`
4. Submit a pull request

### Code Style

- TypeScript with strict mode enabled
- Prettier for formatting
- ESLint for linting
- Conventional commits

## Deployment

VocaHire runs on Google Cloud Run for automatic scaling and high availability:

```bash
npm run build          # Production build
gcloud run deploy      # Deploy to Cloud Run
```

See [CLOUD_RUN_DEPLOYMENT_GUIDE.md](./CLOUD_RUN_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Environment Variables

Key environment variables needed:

```env
# Database
DATABASE_URL=postgresql://...

# Google Cloud
GOOGLE_PROJECT_ID=your-project-id

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Redis
REDIS_URL=redis://...
```

## Testing

```bash
# Unit tests
npm test

# E2E tests (coming soon)
npm run test:e2e

# Type checking
npm run typecheck
```

## Support

- 📧 Email: support@vocahire.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/vocahire/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/vocahire/discussions)

## License

MIT License - see [LICENSE](./LICENSE) for details

---

**Built with ❤️ to help people thrive in the age of AI**

*VocaHire - Where AI helps you land your next opportunity*