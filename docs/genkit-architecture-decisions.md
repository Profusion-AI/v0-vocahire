# GenKit Architecture Decisions

**Created**: May 27, 2025  
**Last Updated**: May 27, 2025

## Overview

This document outlines key architectural decisions made during the GenKit integration, incorporating feedback from both Claude and Gemini's reviews.

## Key Decisions

### 1. Session Management Architecture

**Decision**: Implement a dedicated `LiveAPISessionManager` class with proper lifecycle management.

**Rationale**:
- Prevents resource leaks from orphaned WebSocket connections
- Enables horizontal scaling with Redis-backed session metadata
- Provides automatic cleanup of inactive sessions
- Supports session persistence across server restarts

**Implementation**:
```typescript
// Singleton pattern with automatic cleanup
const sessionManager = LiveAPISessionManager.getInstance();

// Session stored in memory with Redis backup
sessionManager.createSession(sessionId, userId, config);
```

### 2. Server-Sent Events (SSE) vs WebSockets

**Decision**: Use Server-Sent Events for client-server communication instead of WebSockets.

**Rationale**:
- Next.js App Router doesn't natively support WebSocket upgrades
- SSE provides sufficient functionality for our streaming needs
- Simpler to implement and debug
- Better compatibility with serverless deployments

**Trade-offs**:
- SSE is unidirectional (server-to-client only)
- Requires separate POST requests for client-to-server messages
- Slightly higher latency for bidirectional communication

### 3. Schema-First Development

**Decision**: Define comprehensive Zod schemas for all data structures.

**Rationale**:
- Type safety across the entire application
- Runtime validation of API inputs/outputs
- Self-documenting code
- Better error messages for developers

**Key Schemas**:
- `RealtimeInputSchema` / `RealtimeOutputSchema` for streaming
- `TranscriptSchema` for interview records
- `FeedbackSchema` for structured feedback
- `ErrorSchema` for standardized error handling

### 4. Hybrid Audio Processing

**Decision**: Process audio on both client and server sides.

**Client-side**:
- Microphone capture and initial encoding
- Audio playback and queuing
- Format conversion (Blob → PCM16)

**Server-side**:
- Direct WebSocket connection to Google Live API
- Audio streaming management
- Transcript generation

### 5. Error Handling Strategy

**Decision**: Implement standardized error format with retry logic.

**Format**:
```typescript
{
  code: string,
  message: string,
  retryable?: boolean,
  details?: any,
  timestamp: string
}
```

**Benefits**:
- Consistent error handling across the application
- Clear indication of retryable vs fatal errors
- Better debugging with timestamps and details

### 6. Flow Streaming Architecture

**Decision**: Use GenKit's `streamingCallback` for real-time data flow.

**Implementation**:
- Flows use `streamingCallback` to send chunks
- SSE endpoint forwards chunks to client
- Client processes chunks based on type

**Benefits**:
- Low-latency streaming
- Type-safe chunk handling
- Easy to add new chunk types

## Performance Considerations

### 1. Connection Pooling
- Reuse `GoogleLiveAPIClient` instances per session
- Automatic cleanup after 30 minutes of inactivity

### 2. Audio Buffering
- Client-side buffering for smooth playback
- Chunk size optimization (100ms intervals)

### 3. Memory Management
- Proper cleanup of audio contexts
- Event listener removal on disconnect
- Session metadata expiration

## Security Considerations

### 1. Authentication
- Clerk authentication required for all endpoints
- User ID validation for session access

### 2. Rate Limiting
- Session creation limits per user
- Audio chunk submission throttling

### 3. Input Validation
- Zod schemas validate all inputs
- Sanitization of user-provided text

## Future Improvements

### 1. WebSocket Support
Consider implementing a dedicated WebSocket server for true bidirectional communication:
- Separate service for WebSocket handling
- Proxy through CloudFlare or similar
- Lower latency for audio streaming

### 2. Distributed Session Management
- Move session state entirely to Redis
- Enable multi-instance deployments
- Session migration between servers

### 3. Enhanced Monitoring
- Latency metrics for audio round-trip
- Session success/failure rates
- User experience metrics

### 4. Offline Support
- Client-side audio buffering
- Automatic reconnection
- Session resumption

## Conclusion

The current architecture provides a solid foundation for real-time AI interviews while working within the constraints of Next.js App Router. The modular design allows for future enhancements without major refactoring.