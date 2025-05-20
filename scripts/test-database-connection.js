// Simple script to test database connection

require('dotenv').config();
const { spawn } = require('child_process');
const { URL } = require('url');

// Helper function to log with timestamp
function logWithTime(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Helper function to create a redacted URL for logging
function redactUrl(url) {
  try {
    if (!url) return "undefined";
    
    const urlObj = new URL(url);
    const redactedAuth = urlObj.username ? "****:****" : "";
    const authPart = redactedAuth ? `${redactedAuth}@` : "";
    
    return `${urlObj.protocol}//${authPart}${urlObj.hostname}:${urlObj.port || '5432'}${urlObj.pathname}`;
  } catch (error) {
    return "Invalid URL format";
  }
}

// Function to test if a host is reachable on a specific port
function testHostConnection(hostname, port) {
  return new Promise((resolve) => {
    logWithTime(`Testing connection to ${hostname}:${port}...`);
    
    // Use nc (netcat) to test port connectivity
    const timeout = 5; // seconds
    const nc = spawn('nc', ['-zv', '-w', timeout.toString(), hostname, port.toString()]);
    
    let output = '';
    
    nc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    nc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    nc.on('close', (code) => {
      if (code === 0) {
        logWithTime(`✅ Connection to ${hostname}:${port} successful`);
        resolve({ success: true, output });
      } else {
        logWithTime(`❌ Connection to ${hostname}:${port} failed with code ${code}`);
        resolve({ success: false, output, code });
      }
    });
  });
}

// Function to parse and test database URL
async function testDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  logWithTime(`Testing database connection...`);
  logWithTime(`Database URL: ${redactUrl(databaseUrl)}`);
  
  if (!databaseUrl) {
    logWithTime("❌ DATABASE_URL environment variable is not set");
    return { success: false, error: "DATABASE_URL not set" };
  }
  
  try {
    // Parse the URL
    const urlObj = new URL(databaseUrl);
    const hostname = urlObj.hostname;
    const port = urlObj.port || '5432';
    
    // 1. Test basic connectivity to the hostname:port
    const connectionTest = await testHostConnection(hostname, port);
    
    if (!connectionTest.success) {
      logWithTime("❌ Cannot establish TCP connection to database server");
      logWithTime("Possible causes:");
      logWithTime("  - Database server is down");
      logWithTime("  - Firewall is blocking the connection");
      logWithTime("  - IP allowlist does not include your current IP");
      logWithTime("  - Port number is incorrect");
      
      // For Supabase, provide specific guidance
      if (hostname.includes('supabase.co')) {
        logWithTime("\nSUPABASE SPECIFIC GUIDANCE:");
        logWithTime("1. Check your Supabase project's Database settings.");
        logWithTime("2. Ensure the 'Connection Pooling' setting is enabled.");
        logWithTime("3. Verify that your IP address is in the allow list.");
        logWithTime("4. For local development, add your IP address to Supabase's IP allow list.");
        logWithTime("5. For Vercel deployment, you may need to add Vercel's IP ranges.");
        logWithTime("   See: https://vercel.com/guides/how-to-allowlist-deployment-ip-address");
      }
      
      return { 
        success: false, 
        error: "Cannot connect to database server", 
        hostname, 
        port,
        isSupabase: hostname.includes('supabase.co')
      };
    }
    
    // 2. Analyze URL format
    let formatIssues = [];
    
    // Check protocol
    if (!urlObj.protocol.startsWith('postgres')) {
      formatIssues.push(`Invalid protocol: ${urlObj.protocol}. Should be postgresql:// or postgres://`);
    }
    
    // Check for port
    if (!urlObj.port && !hostname.includes('pooler.supabase')) {
      formatIssues.push(`No port specified. Default is 5432, but explicit is better.`);
    }
    
    // Check for special characters in password
    const specialChars = ['&', '%', '@', '+', '!', '*'];
    if (urlObj.password) {
      const decodedPassword = decodeURIComponent(urlObj.password);
      const reEncodedPassword = encodeURIComponent(decodedPassword);
      
      const hasSpecialChars = specialChars.some(char => decodedPassword.includes(char));
      const isProperlyEncoded = reEncodedPassword === urlObj.password;
      
      if (hasSpecialChars && !isProperlyEncoded) {
        formatIssues.push(`Password contains special characters that are not properly URL-encoded.`);
        
        // Suggest fixed URL
        const user = urlObj.username;
        const auth = user ? `${user}:${reEncodedPassword}` : '';
        const authPrefix = auth ? `${auth}@` : '';
        const fixedUrl = `${urlObj.protocol}//${authPrefix}${urlObj.host}${urlObj.pathname}${urlObj.search}`;
        
        logWithTime("\nSuggested fixed URL format (credentials redacted):");
        logWithTime(redactUrl(fixedUrl));
        logWithTime("\nPlease update your .env file or environment variables with the correctly encoded URL.");
      }
    }
    
    // Supabase specific checks
    if (hostname.includes('supabase.co')) {
      // Check if using direct vs pooled connection
      if (hostname.startsWith('db.') && !process.env.NODE_ENV === 'production') {
        formatIssues.push(`Using direct connection (${hostname}) which may be slower than pooled connection.`);
        formatIssues.push(`For better performance, consider using the pooled connection (aws-0-[region].pooler.supabase.com).`);
      }
    }
    
    // Report results
    if (formatIssues.length > 0) {
      logWithTime("\n⚠️ Database URL format issues:");
      formatIssues.forEach(issue => logWithTime(`- ${issue}`));
    } else {
      logWithTime("✅ Database URL format appears correct");
    }
    
    logWithTime("\n✅ Basic connectivity test passed!");
    logWithTime("NOTE: This only verifies TCP connection to the database server.");
    logWithTime("It does not verify authentication or database access permissions.");
    
    return { 
      success: true, 
      formatIssues: formatIssues.length > 0 ? formatIssues : null,
      hostname,
      port,
      isSupabase: hostname.includes('supabase.co')
    };
    
  } catch (error) {
    logWithTime(`❌ Error parsing or testing database URL: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Print environment info
logWithTime("=== Database Connection Diagnostic Tool ===");
logWithTime(`Node.js: ${process.version}`);
logWithTime(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Run the test
testDatabaseConnection()
  .then((result) => {
    if (result.success) {
      logWithTime("\n=== SUMMARY ===");
      logWithTime("✅ TCP connection to database server successful");
      
      if (result.formatIssues) {
        logWithTime("⚠️ Database URL format has issues that should be fixed");
      } else {
        logWithTime("✅ Database URL format appears correct");
      }
      
      if (result.isSupabase) {
        logWithTime("\n=== NEXT STEPS FOR SUPABASE ===");
        logWithTime("1. Verify your database credentials are correct");
        logWithTime("2. Ensure your IP is on the allowlist in Supabase dashboard");
        logWithTime("3. For Vercel deployment, add Vercel's IP ranges to allowlist");
        logWithTime("4. Check that your database is active and not in maintenance mode");
      }
    } else {
      logWithTime("\n=== SUMMARY ===");
      logWithTime(`❌ Connection failed: ${result.error}`);
      
      if (result.isSupabase) {
        logWithTime("\n=== RECOMMENDATIONS FOR SUPABASE ===");
        logWithTime("1. Log in to your Supabase dashboard");
        logWithTime("2. Go to Project Settings > Database");
        logWithTime("3. Check if your database is online");
        logWithTime("4. Verify your connection info is correct");
        logWithTime("5. Add your current IP address to the allowlist");
        logWithTime("6. For Vercel deployments, add Vercel's IP ranges");
      }
    }
    
    logWithTime("\nDiagnostic completed.");
  })
  .catch((error) => {
    logWithTime(`💥 Unexpected error: ${error.message}`);
  });