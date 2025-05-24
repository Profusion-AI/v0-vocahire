# Hooks Directory - Critical Implementation Guide

This directory contains custom React hooks that power VocaHire's core functionality. This guide documents critical implementation details, known issues, and solutions.

## 🚨 CRITICAL: Interview Session Hook Architecture

### useRealtimeInterviewSession.ts

This is the most complex and critical hook in the application. It manages the entire WebRTC-based interview session with OpenAI's Realtime API.

#### Working Configuration (DO NOT MODIFY without extensive testing):

1. **WebRTC Connection Flow**:
   - `idle` → `requesting_mic` → `fetching_token` → `creating_offer` → `exchanging_sdp` → `connecting_webrtc` → `data_channel_open` → `active`
   - The transition to `active` MUST happen when the data channel opens
   - The `session.update` message MUST be sent immediately when data channel opens

2. **Critical Fix (January 2025)**:
   ```typescript
   dataChannel.onopen = () => {
     // CRITICAL: Send session configuration immediately
     const sessionUpdate = {
       type: "session.update",
       session: {
         instructions: `...`,
         voice: "alloy",
         turn_detection: { ... },
         modalities: ["text", "audio"]
       }
     }
     dataChannel.send(JSON.stringify(sessionUpdate))
     
     // Force transition to active state
     setTimeout(() => {
       setStatus("active")
       setIsActive(true)
       setIsConnecting(false)
     }, 500)
   }
   ```

3. **Known Issues & Solutions**:
   - **Issue**: Interview gets stuck at "Finalizing setup"
   - **Cause**: WebRTC connection state events not firing reliably
   - **Solution**: Force state transition after data channel opens and session config is sent

4. **State Management**:
   - All state transitions must call `addDebugMessage()` for debugging
   - The `status` state drives the UI loading screens
   - `isActive` and `isConnecting` are separate boolean states for finer control

5. **Error Handling**:
   - Session creation has a mutex (`sessionCreationInProgress`) to prevent duplicates
   - Retry logic with exponential backoff for transient failures
   - Specific error messages for insufficient credits, auth issues, etc.

### useUserData.ts

Manages user authentication state and credits across the application.

#### Performance Optimizations (January 2025):

1. **Removed Console Logging**:
   - DO NOT add console.log in the hook body - it causes performance issues
   - Console logs in hooks execute on EVERY render
   - Only use console.error for actual errors

2. **Caching Strategy**:
   - Hook fetches user data on mount
   - Refetches on window focus with 30-second cooldown
   - Parent components can call `refetchUserData()` after mutations

3. **Error Handling**:
   - Safe toast wrapper to avoid SSR issues
   - Provides default user object on error to prevent UI crashes

### useInterviewRecorder.ts

Manages audio recording during interviews (currently unused but available for future audio persistence features).

#### Key Features:
- Uses MediaRecorder API with webm/opus format
- Handles browser compatibility
- Provides blob output for upload

### useAudioPlayer.ts

Simple audio playback hook for playing interview recordings or AI responses.

## 🎯 Common Pitfalls to Avoid

1. **Console Logging in Hook Bodies**:
   ```typescript
   // ❌ BAD - Logs on every render
   export function useMyHook() {
     console.log('Hook state:', state)
     return state
   }
   
   // ✅ GOOD - Logs only when effect runs
   export function useMyHook() {
     useEffect(() => {
       console.log('State changed:', state)
     }, [state])
     return state
   }
   ```

2. **Missing Dependencies**:
   - Always include all dependencies in useCallback and useEffect
   - The linter will warn you - don't ignore it
   - Missing deps can cause stale closures and bugs

3. **Infinite Loops**:
   - Be careful with state updates in effects
   - Use refs for values that shouldn't trigger re-renders
   - Guard effects with proper conditions

4. **WebRTC State Management**:
   - Don't rely solely on WebRTC connection events
   - Always have timeouts and fallback state transitions
   - The data channel opening is more reliable than connection state changes

## 📊 Performance Monitoring

When debugging interview connection issues:

1. Check the browser console for `🔧 Debug:` messages
2. Look for the state transition sequence
3. Verify `session.update` message is sent
4. Check for WebRTC connection state logs

## 🚀 Future Improvements

1. **Connection Resilience**:
   - Add reconnection logic for dropped connections
   - Implement connection quality monitoring
   - Add fallback to WebSocket if WebRTC fails

2. **State Persistence**:
   - Save interview state to localStorage
   - Resume interrupted interviews
   - Offline mode with sync

3. **Analytics**:
   - Track connection success rates
   - Monitor average connection times
   - Identify failure patterns

## ⚠️ Testing Guidelines

Before modifying any hook:

1. Test the full interview flow 10+ times
2. Test with various network conditions
3. Test with different browsers (Chrome, Safari, Firefox)
4. Monitor CPU usage during interviews
5. Check for memory leaks with long sessions

Remember: The interview functionality is the core of VocaHire. Any changes must be thoroughly tested to ensure users can reliably start and complete interviews.