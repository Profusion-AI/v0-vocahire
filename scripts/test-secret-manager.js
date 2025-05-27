#!/usr/bin/env node

// Test script for Secret Manager setup
// Run with: node scripts/test-secret-manager.js

async function testSecretManager() {
  console.log('🔐 Testing Secret Manager Setup\n');
  
  try {
    // Check if running with credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.NODE_ENV !== 'development') {
      console.warn('⚠️  Warning: GOOGLE_APPLICATION_CREDENTIALS not set');
      console.log('For local testing, run:');
      console.log('export GOOGLE_APPLICATION_CREDENTIALS="./vocahire-secrets-local.json"\n');
    }
    
    // Try to import the secret manager module
    const secretManager = await import('../lib/secret-manager.js');
    console.log('✅ Secret Manager module loaded successfully\n');
    
    // Test getting a single secret
    console.log('Testing single secret access...');
    const testSecretName = 'DATABASE_URL';
    
    try {
      const secret = await secretManager.getSecret(testSecretName);
      console.log(`✅ Successfully accessed secret: ${testSecretName}`);
      console.log(`   Value starts with: ${secret.substring(0, 15)}...`);
    } catch (error) {
      console.error(`❌ Failed to access secret ${testSecretName}:`, error.message);
    }
    
    // Test getting multiple secrets
    console.log('\nTesting multiple secrets access...');
    const secretNames = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'STRIPE_SECRET_KEY'];
    
    try {
      const secrets = await secretManager.getSecrets(secretNames);
      console.log('✅ Successfully accessed multiple secrets:');
      Object.keys(secrets).forEach(name => {
        if (secrets[name]) {
          console.log(`   - ${name}: ${secrets[name].substring(0, 10)}...`);
        } else {
          console.log(`   - ${name}: NOT FOUND`);
        }
      });
    } catch (error) {
      console.error('❌ Failed to access multiple secrets:', error.message);
    }
    
    // Test the full VocaHire secrets function
    console.log('\nTesting VocaHire secrets bundle...');
    try {
      const allSecrets = await secretManager.getVocaHireSecrets();
      console.log('✅ Successfully loaded all VocaHire secrets');
      console.log('   Available secrets:', Object.keys(allSecrets).join(', '));
    } catch (error) {
      console.error('❌ Failed to load VocaHire secrets:', error.message);
    }
    
    console.log('\n✨ Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSecretManager().catch(console.error);