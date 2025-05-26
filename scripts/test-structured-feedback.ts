#!/usr/bin/env tsx
// Test script to demonstrate structured feedback generation

import { generateInterviewFeedback, parseFeedback, generateInterviewFeedbackV2 } from '../lib/openai'
import { config } from 'dotenv'

// Load environment variables
config()

// Sample interview transcript
const sampleTranscript = [
  {
    role: "assistant",
    content: "Hello! I'm your AI interview coach. Let's start with a common question: Can you tell me about yourself?"
  },
  {
    role: "user", 
    content: "Hi, I'm a software engineer with 5 years of experience. I've worked mainly with React and Node.js, building web applications. I'm passionate about creating user-friendly interfaces and solving complex problems."
  },
  {
    role: "assistant",
    content: "That's great! Can you tell me about a challenging project you've worked on recently?"
  },
  {
    role: "user",
    content: "Recently, I led the development of a real-time collaboration platform. The main challenge was implementing WebRTC for video calls while maintaining low latency. We had to optimize our server architecture and implement efficient data synchronization."
  },
  {
    role: "assistant",
    content: "Interesting! How did you handle the technical challenges with WebRTC?"
  },
  {
    role: "user",
    content: "We implemented a signaling server using Socket.io and used STUN/TURN servers for NAT traversal. I also implemented adaptive bitrate streaming to handle varying network conditions. The key was extensive testing across different network scenarios."
  }
]

async function testFeedbackGeneration() {
  console.log("🔬 Testing Feedback Generation Approaches\n")
  console.log("=" * 50)
  
  try {
    // Test 1: Legacy approach
    console.log("\n📝 TEST 1: Legacy Text-Based Approach")
    console.log("-" * 30)
    const startLegacy = Date.now()
    const legacyFeedback = await generateInterviewFeedback(sampleTranscript)
    const legacyParsed = parseFeedback(legacyFeedback)
    const legacyTime = Date.now() - startLegacy
    
    console.log("✅ Generated in", legacyTime, "ms")
    console.log("📄 Raw length:", legacyFeedback.length, "characters")
    console.log("🎯 Parsed categories:")
    legacyParsed.forEach(cat => {
      console.log(`  - ${cat.category}: ${cat.rating}`)
    })
    
    // Test 2: Structured approach
    console.log("\n🚀 TEST 2: Structured JSON Approach (V2)")
    console.log("-" * 30)
    const startV2 = Date.now()
    const v2Result = await generateInterviewFeedbackV2(sampleTranscript)
    const v2Time = Date.now() - startV2
    
    console.log("✅ Generated in", v2Time, "ms")
    console.log("📊 Has structured data:", !!v2Result.structured)
    
    if (v2Result.structured) {
      console.log("\n📋 Structured Feedback Details:")
      console.log("  Interview Quality:")
      console.log(`    - Completeness: ${v2Result.structured.interviewQuality.completeness}`)
      console.log(`    - Engagement: ${v2Result.structured.interviewQuality.engagementLevel}`)
      console.log(`    - Depth: ${v2Result.structured.interviewQuality.responseDepth}`)
      
      console.log("\n  Categories with Key Points:")
      v2Result.structured.categories.forEach(cat => {
        console.log(`    ${cat.category}: ${cat.rating}`)
        if (cat.keyPoints?.length) {
          cat.keyPoints.forEach(point => console.log(`      • ${point}`))
        }
      })
      
      console.log("\n  🎯 Actionable Advice:")
      v2Result.structured.actionableAdvice.forEach((advice, i) => {
        console.log(`    ${i + 1}. ${advice}`)
      })
    }
    
    // Test 3: Error handling with malformed transcript
    console.log("\n🔴 TEST 3: Error Handling with Short Transcript")
    console.log("-" * 30)
    const shortTranscript = [
      { role: "assistant", content: "Hello!" },
      { role: "user", content: "Hi" }
    ]
    
    const errorResult = await generateInterviewFeedbackV2(shortTranscript)
    console.log("✅ Handled gracefully:", !!errorResult.parsed)
    console.log("📊 Has fallback structured data:", !!errorResult.structured)
    
    // Summary
    console.log("\n📊 SUMMARY")
    console.log("=" * 50)
    console.log("Legacy approach:")
    console.log("  - Pros: Simple, established")
    console.log("  - Cons: Brittle parsing, inconsistent format")
    console.log("\nStructured approach:")
    console.log("  - Pros: Reliable JSON, rich metadata, better error handling")
    console.log("  - Cons: Slightly more complex, requires OpenAI JSON mode")
    console.log("\n✅ Recommendation: Use generateInterviewFeedbackV2() for new code")
    
  } catch (error) {
    console.error("\n❌ Error during testing:", error)
  }
}

// Run the test
if (process.env.OPENAI_API_KEY) {
  testFeedbackGeneration()
} else {
  console.error("❌ Please set OPENAI_API_KEY environment variable")
}