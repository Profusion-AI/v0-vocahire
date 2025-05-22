import { NextResponse } from "next/server"
import { getOpenAIApiKey } from "@/lib/api-utils"

export async function GET() {
  console.log('=== Testing OpenAI Session Creation ===')
  
  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    return NextResponse.json({ error: "No OpenAI API key" }, { status: 500 })
  }
  
  console.log(`🔑 API key available: ${apiKey.slice(0, 6)}...`)
  
  // Test minimal session creation
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.log("⏰ Request timed out after 30 seconds")
    controller.abort()
  }, 30000)
  
  try {
    console.log("📡 Starting session creation test...")
    const startTime = Date.now()
    
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime'
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        instructions: "You are a helpful assistant."
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    console.log(`✅ Response received: ${response.status} ${response.statusText} (${responseTime}ms)`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`📝 Session created: ${data.id}`)
      
      return NextResponse.json({
        success: true,
        status: response.status,
        responseTime,
        sessionId: data.id,
        hasToken: !!data.client_secret?.value,
        tokenExpires: data.client_secret?.expires_at
      })
    } else {
      const errorText = await response.text()
      console.log(`❌ Error: ${errorText}`)
      
      return NextResponse.json({
        success: false,
        status: response.status,
        responseTime,
        error: errorText
      })
    }
    
  } catch (error) {
    clearTimeout(timeoutId)
    console.log(`❌ Exception: ${error}`)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: "Request timed out",
        timeout: true
      }, { status: 408 })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}