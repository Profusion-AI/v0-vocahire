# Vertex AI Migration - Important Note

## Critical Issue: Real-time Audio Streaming

**Problem**: Vertex AI does not support real-time audio streaming WebSocket connections like Google AI Studio does.

### Google AI Studio (Current)
- Uses WebSocket: `wss://generativelanguage.googleapis.com`
- Supports real-time bidirectional audio streaming
- Low latency voice conversations
- Direct audio-to-audio communication

### Vertex AI (Proposed)
- REST API only - no WebSocket support
- No native real-time audio streaming
- Would require workaround:
  1. Audio → Speech-to-Text API
  2. Text → Vertex AI Gemini
  3. Response → Text-to-Speech API
  4. Higher latency (3+ API calls)

## Impact on VocaHire MVP

Since VocaHire's core value proposition is **real-time voice conversations**, migrating to Vertex AI would significantly degrade the user experience:

1. **Increased Latency**: Multiple API calls vs single WebSocket
2. **Lost Features**: No interruption support, no real-time feedback
3. **Higher Complexity**: Managing multiple APIs
4. **Higher Cost**: Multiple API calls per interaction

## Recommendation

For the MVP launch (June 1, 2025), we should:

1. **Keep Google AI Studio** for the Live API (real-time voice)
2. **Use Vertex AI** for non-real-time features (feedback generation, question generation)
3. **Plan Migration** after Google releases Vertex AI Multimodal Live API

## Alternative Approach

If we must use only Google Cloud services:

1. Use Google Cloud Speech-to-Text for audio input
2. Use Vertex AI Gemini for processing
3. Use Google Cloud Text-to-Speech for audio output
4. Accept the latency trade-off

This would require significant refactoring of the interview experience and may not meet the "magic" threshold for user experience.