#!/bin/bash

# Test OpenAI Realtime API using curl
# This script tests both models to identify which one works

echo "=== OpenAI Realtime API Diagnostic Test ==="

# Check if we have OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY environment variable is not set"
    echo "Please set it: export OPENAI_API_KEY=your_key_here"
    exit 1
fi

echo "✅ API key available: ${OPENAI_API_KEY:0:6}..."

# Test 1: gpt-4o-realtime-preview (documented model)
echo ""
echo "--- Testing model: gpt-4o-realtime-preview ---"
curl -s -w "Response time: %{time_total}s\nHTTP status: %{http_code}\n" \
  -X POST https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: realtime" \
  -d '{
    "model": "gpt-4o-realtime-preview",
    "modalities": ["audio", "text"],
    "voice": "alloy",
    "instructions": "You are a helpful assistant conducting a mock interview.",
    "turn_detection": { 
      "type": "server_vad",
      "threshold": 0.5,
      "prefix_padding_ms": 300,
      "silence_duration_ms": 500
    },
    "input_audio_transcription": { 
      "model": "whisper-1" 
    }
  }' | python3 -m json.tool 2>/dev/null || echo "Invalid JSON response"

echo ""
echo "--- Testing model: gpt-4o-mini-realtime-preview ---"
curl -s -w "Response time: %{time_total}s\nHTTP status: %{http_code}\n" \
  -X POST https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: realtime" \
  -d '{
    "model": "gpt-4o-mini-realtime-preview",
    "modalities": ["audio", "text"],
    "voice": "alloy",
    "instructions": "You are a helpful assistant conducting a mock interview.",
    "turn_detection": { 
      "type": "server_vad",
      "threshold": 0.5,
      "prefix_padding_ms": 300,
      "silence_duration_ms": 500
    },
    "input_audio_transcription": { 
      "model": "whisper-1" 
    }
  }' | python3 -m json.tool 2>/dev/null || echo "Invalid JSON response"

echo ""
echo "--- Testing minimal configuration ---"
curl -s -w "Response time: %{time_total}s\nHTTP status: %{http_code}\n" \
  -X POST https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: realtime" \
  -d '{
    "model": "gpt-4o-realtime-preview",
    "instructions": "You are a helpful assistant."
  }' | python3 -m json.tool 2>/dev/null || echo "Invalid JSON response"

echo ""
echo "=== Test Complete ==="