#!/usr/bin/env node

/**
 * Script to validate and fix DATABASE_URL for Supabase connections
 * Used to diagnose and correct common database connection issues
 * 
 * Usage:
 * node scripts/fix-database-url.js
 */

// Import required modules
require('dotenv').config();

// Log with timestamp
function logWithTime(message) {
  const now = new Date();
  const timeString = now.toISOString();
  console.log(`[${timeString}] ${message}`);
}

// Function to sanitize URL for logging (hide credentials)
function sanitizeUrl(url) {
  if (!url) return "undefined";
  return url.replace(/\/\/[^@]*@/, "//****:****@");
}

// Test a database connection
async function testDatabaseConnection(url) {
  if (!url) return { success: false, error: "No URL provided" };
  
  try {
    // Parse the URL to get components
    const urlObj = new URL(url);
    
    logWithTime(`Testing connection to ${urlObj.hostname}:${urlObj.port || '5432'}...`);
    
    // We'll attempt to ping the database server
    const { execSync } = require('child_process');
    
    try {
      // Try to use telnet to check basic connectivity (port is open)
      execSync(`nc -zv -w 5 ${urlObj.hostname} ${urlObj.port || 5432} 2>/dev/null`);
      logWithTime(`✅ Port connectivity test passed: Port ${urlObj.port || 5432} is open on ${urlObj.hostname}`);
      return { success: true };
    } catch (error) {
      logWithTime(`❌ Port connectivity test failed: Cannot connect to ${urlObj.hostname}:${urlObj.port || 5432}`);
      
      // Try ping to see if basic network connectivity exists
      try {
        execSync(`ping -c 1 ${urlObj.hostname} 2>/dev/null`);
        logWithTime(`✅ Host reachable via ping, but database port is closed or blocked`);
        return { success: false, error: "Host reachable but database port is closed" };
      } catch (pingError) {
        logWithTime(`❌ Host unreachable via ping: ${urlObj.hostname}`);
        return { success: false, error: "Host unreachable (DNS or network issue)" };
      }
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Encode database password safely
function encodeSpecialChars(password) {
  if (!password) return "";
  
  // Characters that need encoding in database passwords
  const specialChars = {
    '@': '%40',
    ':': '%3A',
    '/': '%2F',
    '?': '%3F',
    '#': '%23',
    '[': '%5B',
    ']': '%5D',
    '!': '%21',
    '$': '%24',
    '&': '%26',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A',
    '+': '%2B',
    ',': '%2C',
    ';': '%3B',
    '=': '%3D',
    '%': '%25',
    ' ': '%20'
  };
  
  // Replace special characters with their encoded versions
  let encodedPassword = '';
  for (let i = 0; i < password.length; i++) {
    const char = password[i];
    encodedPassword += specialChars[char] || char;
  }
  
  return encodedPassword;
}

// Main function
async function main() {
  logWithTime("DATABASE_URL Validation Tool");
  logWithTime("=========================");
  
  // Get database URLs from environment
  const databaseUrl = process.env.DATABASE_URL;
  const migrateUrl = process.env.MIGRATE_DATABASE_URL;
  
  logWithTime(`Original DATABASE_URL: ${sanitizeUrl(databaseUrl)}`);
  logWithTime(`MIGRATE_DATABASE_URL: ${sanitizeUrl(migrateUrl)}`);
  
  // Test connections if URLs are provided
  if (databaseUrl) {
    logWithTime("\nTesting DATABASE_URL connectivity...");
    const result = await testDatabaseConnection(databaseUrl);
    if (!result.success) {
      logWithTime(`Connection test failed: ${result.error}`);
    }
  }
  
  if (migrateUrl) {
    logWithTime("\nTesting MIGRATE_DATABASE_URL connectivity...");
    const result = await testDatabaseConnection(migrateUrl);
    if (!result.success) {
      logWithTime(`Connection test failed: ${result.error}`);
    }
  }
  
  // Check for common problems and provide recommendations
  
  // 1. Check if DATABASE_URL exists
  if (!databaseUrl) {
    logWithTime("ERROR: DATABASE_URL is not defined in environment variables");
    logWithTime("Please set the DATABASE_URL in your .env file or deployment environment");
    
    if (migrateUrl) {
      logWithTime("RECOMMENDATION: Copy your MIGRATE_DATABASE_URL to DATABASE_URL");
    }
    return;
  }
  
  // 2. Check for correct protocol
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    logWithTime("ERROR: DATABASE_URL does not start with 'postgresql://' or 'postgres://'");
    
    // 2.1 Check for nested protocols
    if (databaseUrl.includes('postgresql://https://') || databaseUrl.includes('postgres://https://')) {
      logWithTime("ISSUE DETECTED: Nested protocols in DATABASE_URL");
      
      const urlMatch = databaseUrl.match(/(?:postgresql|postgres):\/\/https:\/\/([^\/]+)(?:\/(.*))?/);
      if (urlMatch) {
        const [_, host, database = 'postgres'] = urlMatch;
        
        const recommendedUrl = `postgresql://postgres:password@${host}:5432/${database}`;
        logWithTime(`RECOMMENDATION: Update DATABASE_URL to: ${recommendedUrl.replace(/\/\/[^@]*@/, "//username:password@")}`);
        logWithTime("Make sure to use your actual database username and password!");
      }
    }
    // 2.2 Check for missing protocol slashes
    else if (databaseUrl.match(/^(?:postgresql|postgres):[^\/]/)) {
      logWithTime("ISSUE DETECTED: Missing protocol slashes in DATABASE_URL");
      
      const fixedUrl = databaseUrl.replace(/^(postgresql|postgres):/, '$1://');
      logWithTime(`RECOMMENDATION: Update DATABASE_URL to: ${sanitizeUrl(fixedUrl)}`);
    }
    // 2.3 Check for wrong protocol
    else if (databaseUrl.startsWith('https://')) {
      logWithTime("ISSUE DETECTED: Using HTTPS protocol instead of PostgreSQL protocol");
      logWithTime(`RECOMMENDATION: Replace 'https://' with 'postgresql://username:password@' and add ':5432/postgres' to the end`);
      
      // Extract host from https URL
      const hostnameMatch = databaseUrl.match(/https:\/\/([^\/]+)/);
      if (hostnameMatch) {
        const hostname = hostnameMatch[1];
        logWithTime(`Example: postgresql://postgres:password@${hostname}:5432/postgres`);
      }
    }
  } else {
    // 3. Check if URL has all required components
    try {
      const url = new URL(databaseUrl);
      
      // Check for username and password
      if (!url.username || !url.password) {
        logWithTime("WARNING: DATABASE_URL might be missing username and/or password");
        logWithTime("RECOMMENDATION: Ensure your connection string includes authentication credentials");
      }
      
      // Check for port
      if (!url.port) {
        logWithTime("WARNING: No port specified in DATABASE_URL, will use default (usually 5432)");
        logWithTime("RECOMMENDATION: Explicitly add port :5432 to your connection string");
      }
      
      // Check for database name
      if (url.pathname === "/" || !url.pathname) {
        logWithTime("WARNING: No database name specified in DATABASE_URL");
        logWithTime("RECOMMENDATION: Add database name to your connection string (e.g., /postgres)");
      }
      
      logWithTime("VALIDATION COMPLETE: PostgreSQL protocol format is correct");
      logWithTime(`Host: ${url.hostname}`);
      logWithTime(`Port: ${url.port || '(default)'}`);
      logWithTime(`Database: ${url.pathname.replace('/', '') || '(not specified)'}`);
      
      if (databaseUrl.includes('supabase')) {
        logWithTime("SUPABASE DETECTED: For Supabase, ensure you're using the correct connection string");
        logWithTime("Pooled connection (normal use): postgresql://postgres.[project_ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres");
        logWithTime("Direct connection (migrations): postgresql://postgres:[password]@db.[project_ref].supabase.co:5432/postgres");
      }
    } catch (error) {
      logWithTime(`ERROR PARSING URL: ${error.message}`);
    }
  }
  
  // Additional recommendation for Supabase
  if (databaseUrl.includes('supabase.co') || (migrateUrl && migrateUrl.includes('supabase.co'))) {
    logWithTime("");
    logWithTime("SUPABASE MIGRATION TIPS:");
    logWithTime("1. For normal operations, use the pooled connection URL for DATABASE_URL");
    logWithTime("2. For database migrations, use the direct connection URL for MIGRATE_DATABASE_URL");
    logWithTime("3. Both URLs should follow the format: postgresql://username:password@hostname:5432/database");
  }
}

// Run the main function
main().catch(error => {
  console.error("ERROR RUNNING SCRIPT:", error);
});