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
  
  // Check if the password might already be partially encoded
  try {
    // Try to decode - if it fails, then we might have unencoded % characters
    decodeURIComponent(password);
    
    // If we can decode it, do a normal encoding
    let encodedPassword = '';
    for (let i = 0; i < password.length; i++) {
      const char = password[i];
      encodedPassword += specialChars[char] || char;
    }
    
    return encodedPassword;
  } catch (error) {
    // If decoding fails, we need to fix unencoded % characters first
    logWithTime("WARNING: Password contains unencoded % characters");
    
    // Replace unencoded % with %25, but preserve correctly encoded sequences
    let fixedPassword = '';
    for (let i = 0; i < password.length; i++) {
      const char = password[i];
      
      // Check if this is a % followed by two hex digits (already encoded)
      if (char === '%' && 
          i + 2 < password.length && 
          /[0-9A-Fa-f]{2}/.test(password.substr(i + 1, 2))) {
        fixedPassword += char; // Keep it as is
      } else {
        fixedPassword += specialChars[char] || char;
      }
    }
    
    return fixedPassword;
  }
}

// Fix a complete database URL by extracting and fixing components
function fixDatabaseUrl(originalUrl) {
  if (!originalUrl) return { success: false, url: null, error: "No URL provided" };
  
  try {
    let url = originalUrl;
    
    // Handle nested protocol case: postgresql://https://host
    if (url.includes('postgresql://https://') || url.includes('postgres://https://')) {
      const urlMatch = url.match(/(?:postgresql|postgres):\/\/https:\/\/([^\/]+)(?:\/(.*))?/);
      if (urlMatch) {
        const [_, host, database = 'postgres'] = urlMatch;
        
        // For Supabase, ensure the db. prefix is present for direct connection
        let correctedHost = host;
        if (host.includes('supabase.co') && !host.startsWith('db.')) {
          correctedHost = `db.${host}`;
        }
        
        // Use placeholder credentials - these should be replaced with actual values
        url = `postgresql://postgres:postgres@${correctedHost}:5432/${database}`;
        logWithTime(`Fixed nested protocol: ${sanitizeUrl(url)}`);
      }
    }
    
    // Try to parse the URL
    try {
      const urlObj = new URL(url);
      
      // For Supabase, ensure hostname has db. prefix for direct connections
      if (urlObj.hostname.includes('supabase.co') && 
          !urlObj.hostname.startsWith('db.') &&
          !urlObj.hostname.includes('pooler')) {
        const newHost = `db.${urlObj.hostname}`;
        
        // Reconstruct the URL with corrected hostname
        const auth = urlObj.username ? `${urlObj.username}:${urlObj.password}@` : '';
        url = `${urlObj.protocol}//${auth}${newHost}:${urlObj.port || '5432'}${urlObj.pathname}${urlObj.search}`;
        logWithTime(`Added db. prefix to Supabase hostname: ${sanitizeUrl(url)}`);
      }
      
      // Fix password encoding if needed
      if (urlObj.password) {
        // Check for special characters that need encoding
        const hasSpecialChars = ['%', '&', '@', '+', '!', '*', '#', '$', '=', ':', '/'].some(
          char => urlObj.password.includes(char)
        );
        
        if (hasSpecialChars) {
          const encodedPassword = encodeSpecialChars(urlObj.password);
          
          // Only update if encoding changed something
          if (encodedPassword !== urlObj.password) {
            // Reconstruct the URL with encoded password
            const auth = urlObj.username ? `${urlObj.username}:${encodedPassword}@` : '';
            url = `${urlObj.protocol}//${auth}${urlObj.hostname}:${urlObj.port || '5432'}${urlObj.pathname}${urlObj.search}`;
            logWithTime(`Fixed password encoding: ${sanitizeUrl(url)}`);
          }
        }
      }
      
      // Ensure port is specified
      if (!urlObj.port) {
        const newUrlObj = new URL(url);
        newUrlObj.port = '5432';
        url = newUrlObj.toString();
        logWithTime(`Added default port 5432: ${sanitizeUrl(url)}`);
      }
      
      return { success: true, url, changed: url !== originalUrl };
      
    } catch (parseError) {
      // Handle malformed URLs
      if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
        // Try to fix protocol
        if (url.startsWith('https://')) {
          // Convert https:// to postgresql://
          url = url.replace('https://', 'postgresql://postgres:postgres@');
          
          // Add port and database if not present
          if (!url.includes(':5432')) {
            url = url.replace(/\/?$/, ':5432/postgres');
          }
          
          logWithTime(`Fixed protocol from HTTPS to PostgreSQL: ${sanitizeUrl(url)}`);
          return { success: true, url, changed: true };
        }
      }
      
      return { success: false, url: null, error: parseError.message };
    }
    
  } catch (error) {
    return { success: false, url: null, error: error.message };
  }
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
  
  // Try to fix the DATABASE_URL if it exists
  if (databaseUrl) {
    logWithTime("\n=== Analyzing DATABASE_URL ===");
    
    // Check if it's the problematic format
    if (databaseUrl.includes('postgresql://https://')) {
      logWithTime("ISSUE DETECTED: DATABASE_URL contains nested protocols (postgresql://https://)");
      logWithTime("This is a common misconfiguration that needs to be fixed");
      
      // Try to fix the URL
      const fixResult = fixDatabaseUrl(databaseUrl);
      
      if (fixResult.success && fixResult.changed) {
        logWithTime("\n=== FIXED URL ===");
        logWithTime(`Original: ${sanitizeUrl(databaseUrl)}`);
        logWithTime(`Fixed:    ${sanitizeUrl(fixResult.url)}`);
        
        // Update the environment variable
        process.env.DATABASE_URL = fixResult.url;
        
        // Write the fix to .env file if present
        try {
          const { existsSync, readFileSync, writeFileSync } = require('fs');
          const { resolve } = require('path');
          const envPath = resolve(process.cwd(), '.env');
          
          if (existsSync(envPath)) {
            logWithTime("\nUpdating .env file with fixed URL...");
            const envContent = readFileSync(envPath, 'utf8');
            
            // Replace DATABASE_URL line
            const newContent = envContent.replace(
              /^DATABASE_URL=.*$/m,
              `DATABASE_URL=${fixResult.url}`
            );
            
            if (newContent !== envContent) {
              writeFileSync(envPath, newContent);
              logWithTime("✅ Updated .env file successfully");
            } else {
              logWithTime("⚠️ Could not update .env file (DATABASE_URL line not found)");
            }
          } else {
            logWithTime("No .env file found in current directory");
          }
        } catch (fileError) {
          logWithTime(`Error updating .env file: ${fileError.message}`);
        }
        
        // Suggest environment variable update for Vercel
        logWithTime("\n=== ACTION REQUIRED ===");
        logWithTime("Please update your environment variable in Vercel dashboard:");
        logWithTime("1. Go to your Vercel project dashboard");
        logWithTime("2. Go to Settings > Environment Variables");
        logWithTime("3. Update DATABASE_URL with the fixed value");
        logWithTime("4. Redeploy your application");
      } else if (!fixResult.success) {
        logWithTime(`❌ Could not fix URL: ${fixResult.error}`);
      } else {
        logWithTime("✅ No changes needed to DATABASE_URL format");
      }
    } 
    // Check for Supabase password encoding issues
    else if (databaseUrl.includes('supabase.co') && (
      databaseUrl.includes('@&') || 
      databaseUrl.includes('%') || 
      databaseUrl.includes('!') ||
      databaseUrl.includes('*')
    )) {
      logWithTime("ISSUE DETECTED: DATABASE_URL may have unencoded special characters in password");
      
      // Try to fix the URL
      const fixResult = fixDatabaseUrl(databaseUrl);
      
      if (fixResult.success && fixResult.changed) {
        logWithTime("\n=== FIXED URL ===");
        logWithTime(`Original: ${sanitizeUrl(databaseUrl)}`);
        logWithTime(`Fixed:    ${sanitizeUrl(fixResult.url)}`);
        
        // Update the environment variable
        process.env.DATABASE_URL = fixResult.url;
        
        logWithTime("\n=== ACTION REQUIRED ===");
        logWithTime("Please update your environment variable with the fixed value");
      }
    }
    // Otherwise, normal validation
    else {
      try {
        const url = new URL(databaseUrl);
        
        // Check for components
        const missingComponents = [];
        if (!url.username || !url.password) missingComponents.push("credentials");
        if (!url.port) missingComponents.push("port");
        if (url.pathname === "/" || !url.pathname) missingComponents.push("database name");
        
        if (missingComponents.length > 0) {
          logWithTime(`WARNING: DATABASE_URL missing ${missingComponents.join(", ")}`);
        } else {
          logWithTime("✅ DATABASE_URL format appears correct");
        }
        
        // For Supabase URLs, provide specific guidance
        if (url.hostname.includes('supabase.co')) {
          const isDirectConnection = url.hostname.startsWith('db.');
          const isPooledConnection = url.hostname.includes('pooler');
          
          logWithTime("\n=== SUPABASE CONNECTION DETAILS ===");
          logWithTime(`Connection type: ${isDirectConnection ? 'Direct' : isPooledConnection ? 'Pooled' : 'Unknown'}`);
          logWithTime(`Hostname: ${url.hostname}`);
          
          if (!isDirectConnection && !isPooledConnection) {
            logWithTime("WARNING: Supabase hostname format is unusual - should start with 'db.' or include 'pooler'");
          }
        }
      } catch (parseError) {
        logWithTime(`ERROR: Unable to parse DATABASE_URL: ${parseError.message}`);
        
        // Try to fix malformed URL
        const fixResult = fixDatabaseUrl(databaseUrl);
        if (fixResult.success && fixResult.changed) {
          logWithTime("\n=== FIXED URL ===");
          logWithTime(`Original: ${sanitizeUrl(databaseUrl)}`);
          logWithTime(`Fixed:    ${sanitizeUrl(fixResult.url)}`);
          
          // Update the environment variable
          process.env.DATABASE_URL = fixResult.url;
        }
      }
    }
  } else {
    logWithTime("❌ DATABASE_URL is not defined in environment variables");
    logWithTime("Please set the DATABASE_URL in your .env file or deployment environment");
    
    if (migrateUrl) {
      logWithTime("RECOMMENDATION: Copy your MIGRATE_DATABASE_URL to DATABASE_URL");
    }
  }
  
  // Test connections after fixing
  if (process.env.DATABASE_URL) {
    logWithTime("\n=== Testing Database Connection ===");
    const result = await testDatabaseConnection(process.env.DATABASE_URL);
    if (!result.success) {
      logWithTime(`❌ Connection test failed: ${result.error}`);
      
      // For Supabase, provide specific troubleshooting
      if (process.env.DATABASE_URL.includes('supabase.co')) {
        logWithTime("\n=== SUPABASE TROUBLESHOOTING ===");
        logWithTime("1. Check if your database is active in Supabase dashboard");
        logWithTime("2. Verify IP allowlist includes your current IP address");
        logWithTime("3. For Vercel deployments, add Vercel's IP ranges to the allowlist:");
        logWithTime("   - Visit: https://vercel.com/guides/how-to-allowlist-deployment-ip-address");
        logWithTime("4. Ensure your database password is correctly encoded in the URL");
      }
    } else {
      logWithTime("✅ Database connection successful!");
    }
  }
  
  // Provide helpful information about Supabase connections if relevant
  if ((databaseUrl && databaseUrl.includes('supabase.co')) || 
      (migrateUrl && migrateUrl.includes('supabase.co'))) {
    logWithTime("\n=== SUPABASE CONNECTION TIPS ===");
    logWithTime("1. For normal app operations, use the pooled connection:");
    logWithTime("   - Format: postgresql://postgres.[project_ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres");
    logWithTime("2. For database migrations, use the direct connection:");
    logWithTime("   - Format: postgresql://postgres:[password]@db.[project_ref].supabase.co:5432/postgres");
    logWithTime("3. Ensure special characters in passwords are properly URL-encoded");
    logWithTime("4. Add your deployment's IP addresses to the Supabase allowlist");
  }
  
  // Handle the case with the specific error mentioned in the prompt
  if (databaseUrl && databaseUrl.includes('https:5432')) {
    logWithTime("\n=== CRITICAL ERROR DETECTED ===");
    logWithTime("Your DATABASE_URL contains the malformed port 'https:5432'");
    logWithTime("This is caused by a malformed Supabase connection string.");
    logWithTime("\nThe correct format should be:");
    logWithTime("postgresql://postgres:[password]@db.[project_ref].supabase.co:5432/postgres");
    
    logWithTime("\nPlease update your DATABASE_URL in both your .env file and your Vercel environment variables.");
  }
}

// Run the main function
main().catch(error => {
  console.error("ERROR RUNNING SCRIPT:", error);
});