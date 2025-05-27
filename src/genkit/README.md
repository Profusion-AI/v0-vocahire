# GenKit Integration for VocaHire

This directory contains the Google GenKit implementation for VocaHire's AI-powered interview system.

## Structure

- `/flows` - GenKit flows for interview sessions and feedback generation
- `/models` - Model configurations and custom models
- `/prompts` - Reusable prompt templates
- `/tools` - Custom tools for GenKit
- `/config` - GenKit configuration

## Key Flows

### 1. Create Interview Session (`interview-session.flow.ts`)
Creates a new interview session with:
- Custom system prompt based on job role and difficulty
- Structured interview questions
- Live API connection details

### 2. Generate Feedback (`generate-feedback.flow.ts`)
Processes interview transcripts to generate:
- Comprehensive performance feedback
- Category scores
- Improvement recommendations
- Enhanced personalized insights

## Development

### Running GenKit Developer UI
Access the GenKit Developer UI at: http://localhost:3001/api/genkit (development only)

### Testing Flows
Use the test page at: http://localhost:3001/genkit-test

### Environment Variables
Required:
```env
GOOGLE_AI_API_KEY=your-api-key
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1
```

## Integration with Live API

The GenKit flows prepare the interview session, but the real-time audio streaming happens through Google's Live API using WebSockets. The flow provides:
1. Session configuration
2. System prompts
3. WebSocket connection details

The client then connects directly to the Live API for real-time conversation.