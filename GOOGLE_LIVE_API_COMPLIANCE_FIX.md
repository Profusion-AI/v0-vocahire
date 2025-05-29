# Google Live API Compliance Fix Guide

**Created**: May 29, 2025
**Status**: 🔴 Multiple naming convention issues found

## Overview

After reviewing the official Google Live API documentation and comparing with VocaHire's implementation, several critical naming convention mismatches were identified that could cause API failures or unexpected behavior.

## Critical Issues Found

### 1. ❌ Response Modalities Configuration

**Location**: `/app/api/interview-v2/session/route.ts` (line 94)

**Current (INCORRECT)**:
```typescript
generationConfig: {
  responseModalities: ['AUDIO'],  // ❌ Wrong property name
  speechConfig: {                 // ❌ Wrong property name
    voiceConfig: {                // ❌ Wrong property name
      prebuiltVoiceConfig: {      // ❌ Wrong property name
        voiceName: 'Aoede'        // ❌ Wrong property name
      }
    }
  }
}
```

**Should Be (CORRECT)**:
```typescript
generationConfig: {
  response_modalities: ['AUDIO'],    // ✅ Snake case
  speech_config: {                   // ✅ Snake case
    voice_config: {                  // ✅ Snake case
      prebuilt_voice_config: {       // ✅ Snake case
        voice_name: 'Aoede'          // ✅ Snake case
      }
    }
  }
}
```

### 2. ❌ Audio MIME Type Mismatch

**Location**: `/app/api/interview-v2/session/route.ts` (line 137)

**Current Issue**:
- Sending output audio with `audio/pcm;rate=24000`
- But input audio should be `audio/pcm;rate=16000`
- Live API outputs at 24kHz but expects input at 16kHz

**Fix Required**:
```typescript
// For input audio (from client microphone)
mimeType: 'audio/pcm;rate=16000'

// For output audio (from AI)
mimeType: 'audio/pcm;rate=24000'
```

### 3. ❌ Method Naming Conventions

**Location**: `/lib/google-live-api.ts`

**Current Methods**:
- `sendRealtimeInput()` - Not matching Live API pattern
- `sendClientContent()` - Not matching Live API pattern

**According to Live API docs, should use**:
- `sendRealtimeInput()` - For audio/video streaming
- `sendClientContent()` - For text/turn-based content

### 4. ❌ Configuration Object Structure

**Location**: `/lib/google-live-api.ts` (LiveAPIConfig interface)

**Current**:
```typescript
export interface LiveAPIConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: Partial<GenerationConfig> & {
    response_modalities?: string[];    // ❌ Using snake_case here
    speech_config?: {                  // ❌ But camelCase here
      voice_config?: {
        prebuilt_voice_config?: {
          voice_name?: string;
        };
      };
    };
  };
  tools?: Tool[];
  responseModality?: 'AUDIO' | 'TEXT';  // ❌ Redundant with response_modalities
}
```

**Should Be Consistent**:
- Either all camelCase (for TypeScript interface)
- Or all snake_case (for API payload)
- Need transformation layer between the two

## Implementation Plan

### Step 1: Create Type-Safe Configuration Transformer

Create a utility function to transform TypeScript camelCase to API snake_case:

```typescript
// lib/google-ai-config-transformer.ts
export function transformConfigForAPI(config: CamelCaseConfig): SnakeCaseConfig {
  return {
    response_modalities: config.responseModalities,
    speech_config: config.speechConfig ? {
      voice_config: config.speechConfig.voiceConfig ? {
        prebuilt_voice_config: config.speechConfig.voiceConfig.prebuiltVoiceConfig ? {
          voice_name: config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName
        } : undefined
      } : undefined
    } : undefined
  };
}
```

### Step 2: Update Session Route Configuration

Fix the configuration in `/app/api/interview-v2/session/route.ts`:

```typescript
generationConfig: transformConfigForAPI({
  responseModalities: ['AUDIO'],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: 'Aoede'
      }
    }
  }
})
```

### Step 3: Fix Audio Sample Rates

Update audio handling to use correct sample rates:

```typescript
// When receiving audio from client (microphone)
const CLIENT_AUDIO_SAMPLE_RATE = 16000;

// When sending audio from AI
const AI_AUDIO_SAMPLE_RATE = 24000;

// In audio message
sendMessage({
  type: 'audio',
  audio: {
    data: base64Audio,
    mimeType: `audio/pcm;rate=${AI_AUDIO_SAMPLE_RATE}` // 24000 for AI output
  }
});
```

### Step 4: Update Type Definitions

Create proper type definitions that match Live API:

```typescript
// types/google-live-api.d.ts
export interface LiveAPIGenerationConfig {
  response_modalities?: Array<'TEXT' | 'AUDIO'>;
  speech_config?: {
    voice_config?: {
      prebuilt_voice_config?: {
        voice_name?: string;
      };
    };
    language_code?: string;
  };
  temperature?: number;
  candidate_count?: number;
  max_output_tokens?: number;
  stop_sequences?: string[];
}
```

## Testing Checklist

After implementing fixes:

- [ ] Verify WebSocket connection establishes successfully
- [ ] Confirm audio streaming works in both directions
- [ ] Check that voice configuration is applied (Aoede voice)
- [ ] Ensure proper sample rates (16kHz input, 24kHz output)
- [ ] Test error handling for invalid configurations
- [ ] Verify transcript generation works correctly

## Risk Assessment

**High Risk**: 
- Current naming mismatches could cause complete API failure
- Audio sample rate mismatch could cause distorted audio

**Medium Risk**:
- Voice configuration might fall back to default
- Some features might not work as expected

**Mitigation**:
- Implement fixes incrementally
- Test each change thoroughly
- Have fallback configuration ready

## References

- [Google Live API Documentation](https://ai.google.dev/api/live)
- [Audio Format Requirements](https://ai.google.dev/api/live#audio-formats)
- [Configuration Options](https://ai.google.dev/api/live#configuration)

## Next Steps

1. Implement configuration transformer utility
2. Update all API calls to use correct naming
3. Fix audio sample rate handling
4. Add comprehensive error logging
5. Test with real API calls
6. Update documentation