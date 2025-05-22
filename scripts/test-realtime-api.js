#!/usr/bin/env node

/**
 * Test script to diagnose OpenAI Realtime API issues
 * This helps identify if the problem is with our configuration or the API itself
 */

// Use Node.js built-in fetch (available in Node 18+)

async function testRealtimeAPI() {
  console.log('=== OpenAI Realtime API Diagnostic Test ===\n');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  console.log('✅ API key available:', apiKey.slice(0, 6) + '...');
  
  // Test different models
  const modelsToTest = [
    'gpt-4o-realtime-preview',
    'gpt-4o-mini-realtime-preview'
  ];
  
  for (const model of modelsToTest) {
    console.log(`\n--- Testing model: ${model} ---`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timed out after 30 seconds');
        controller.abort();
      }, 30000);
      
      const startTime = Date.now();
      
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'realtime'
        },
        body: JSON.stringify({
          model: model,
          modalities: ["audio", "text"],
          voice: "alloy",
          instructions: "You are a helpful assistant conducting a mock interview.",
          turn_detection: { 
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          },
          input_audio_transcription: { 
            model: "whisper-1" 
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      console.log(`⏱️  Response time: ${responseTime}ms`);
      
      // Log response headers
      console.log('📋 Response headers:');
      response.headers.forEach((value, key) => {
        console.log(`   ${key}: ${value}`);
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session created successfully!');
        console.log(`📝 Session ID: ${data.id}`);
        console.log(`🔑 Token available: ${!!data.client_secret?.value}`);
        console.log(`⏰ Token expires: ${new Date(data.client_secret?.expires_at * 1000).toISOString()}`);
        
        // Test minimal configuration too
        console.log('\n  Testing minimal configuration...');
        const minimalResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'realtime'
          },
          body: JSON.stringify({
            model: model,
            instructions: "You are a helpful assistant."
          })
        });
        
        if (minimalResponse.ok) {
          const minimalData = await minimalResponse.json();
          console.log('  ✅ Minimal configuration also works');
        } else {
          console.log('  ❌ Minimal configuration failed:', minimalResponse.status);
        }
        
      } else {
        const errorText = await response.text();
        console.log('❌ Session creation failed');
        console.log(`📄 Error response: ${errorText}`);
        
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Parsed error:', JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log('📄 Raw error text:', errorText);
        }
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('❌ Request timed out');
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testRealtimeAPI().catch(console.error);