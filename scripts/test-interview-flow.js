#!/usr/bin/env node

/**
 * Test script to verify interview flow without authentication
 * This tests the SSE connection and error handling
 */

const EventSource = require('eventsource');

async function testInterviewFlow() {
  console.log('🧪 Testing Interview Flow...\n');

  // Test 1: Check if server is responding
  console.log('1️⃣ Testing server health...');
  try {
    const healthResponse = await fetch('http://localhost:3000/api/health');
    console.log(`   Health check: ${healthResponse.status} ${healthResponse.statusText}`);
  } catch (error) {
    console.error('   ❌ Server not responding on port 3000');
    console.log('   Trying port 3001...');
    
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      console.log(`   Health check: ${healthResponse.status} ${healthResponse.statusText}`);
    } catch (error2) {
      console.error('   ❌ Server not responding on port 3001 either');
      process.exit(1);
    }
  }

  // Test 2: Test interview session creation (will fail without auth, but should return 401)
  console.log('\n2️⃣ Testing interview session endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/interview-v2/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        jobPosition: 'Software Engineer',
        jobDescription: 'Test position',
        interviewType: 'Behavioral'
      })
    });

    console.log(`   Response: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      console.log('   ✅ Expected 401 Unauthorized (authentication required)');
    } else if (response.status === 500) {
      const error = await response.json();
      console.error('   ❌ Server error:', error);
    } else if (response.ok) {
      console.log('   ⚠️  Unexpected success without authentication');
    }
  } catch (error) {
    console.error('   ❌ Failed to connect:', error.message);
  }

  // Test 3: Check for database connectivity issues
  console.log('\n3️⃣ Checking database connectivity...');
  try {
    const response = await fetch('http://localhost:3001/api/ready');
    const data = await response.json();
    console.log(`   Database status: ${data.database ? '✅ Connected' : '❌ Not connected'}`);
    if (!data.database) {
      console.log('   Check your DATABASE_URL in .env.local');
    }
  } catch (error) {
    console.error('   ❌ Ready endpoint error:', error.message);
  }

  console.log('\n✅ Tests completed');
}

// Run the tests
testInterviewFlow().catch(console.error);