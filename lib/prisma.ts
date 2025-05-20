import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is properly formatted and fix if possible
function getValidatedPrismaClient() {
  try {
    let databaseUrl = process.env.DATABASE_URL;
    
    // Create a sanitized URL for logging (hide credentials)
    const sanitizedForLogging = databaseUrl ? databaseUrl.replace(/\/\/[^@]*@/, "//****:****@") : "undefined";
    console.log(`Original DATABASE_URL format (sanitized): ${sanitizedForLogging}`);
    
    // Check for common formatting errors and attempt to fix
    if (databaseUrl) {
      // Case 1: URL with nested http protocol - postgresql://https://host
      if (databaseUrl.includes('postgresql://https://') || databaseUrl.includes('postgres://https://')) {
        console.warn('DATABASE_URL contains nested protocols (postgresql://https://). Attempting to fix...');
        
        // Attempt to parse and fix the URL
        const urlMatch = databaseUrl.match(/(?:postgresql|postgres):\/\/https:\/\/([^\/]+)(?:\/(.*))?/);
        if (urlMatch) {
          const [_, host, database = 'postgres'] = urlMatch;
          
          // For Supabase, correct the host format
          let correctedHost = host;
          if (host.includes('supabase.co') && !host.startsWith('db.')) {
            correctedHost = `db.${host}`;
            console.log(`Corrected Supabase host to use db. prefix: ${correctedHost}`);
          }
          
          // Use default credentials if none provided (these will likely be overridden by env vars)
          const fixedUrl = `postgresql://postgres:postgres@${correctedHost}:5432/${database}`;
          console.log(`Fixed DATABASE_URL format: postgresql://****:****@${correctedHost}:5432/${database}`);
          
          // Set the environment variable directly
          process.env.DATABASE_URL = fixedUrl;
          databaseUrl = fixedUrl;
        }
      }
      
      // Case 2: Missing protocol slashes - postgresql:host:port
      else if (databaseUrl.match(/^(?:postgresql|postgres):[^\/]/)) {
        console.warn('DATABASE_URL missing proper protocol format. Attempting to fix...');
        
        // Add the necessary slashes
        const fixedUrl = databaseUrl.replace(/^(postgresql|postgres):/, '$1://');
        console.log(`Fixed DATABASE_URL format: ${fixedUrl.replace(/\/\/[^@]*@/, "//****:****@")}`);
        
        // Set the environment variable directly
        process.env.DATABASE_URL = fixedUrl;
        databaseUrl = fixedUrl;
      }
      
      // Final validation
      if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
        console.error('DATABASE_URL still does not start with postgresql:// or postgres:// after fix attempts');
        console.error('Please update your environment variables with the correct format:');
        console.error('postgresql://username:password@hostname:5432/database_name');
      }
    }
    
    // Use MIGRATE_DATABASE_URL as fallback if available
    const migrateUrl = process.env.MIGRATE_DATABASE_URL;
    if (!databaseUrl && migrateUrl) {
      console.log('Using MIGRATE_DATABASE_URL as fallback for DATABASE_URL');
      process.env.DATABASE_URL = migrateUrl;
    }
    
    // Log connection details for troubleshooting
    try {
      const urlObj = new URL(databaseUrl || '');
      console.log(`Attempting database connection to: ${urlObj.hostname}:${urlObj.port || '5432'}`);
      
      // Check for known limitations with Supabase
      if (urlObj.hostname.includes('supabase.co')) {
        console.log('IMPORTANT: For Supabase connections, please verify:');
        console.log('1. IP allow list includes Vercel deployment IPs');
        console.log('2. Database is active and not in maintenance mode');
        console.log('3. Connection credentials are correct and URL-encoded');
        
        // Check for direct vs pooled connection for migrations
        if (urlObj.hostname.includes('db.') && process.env.NODE_ENV === 'production') {
          console.log('WARNING: Using direct connection (db.*) in production.');
          console.log('For normal operations, use pooled connection: aws-0-[region].pooler.supabase.com');
        }
        
        // Check for special characters in password that need encoding
        if (urlObj.password) {
          console.log('Checking database password for special characters...');
          
          // Check if the password is properly encoded
          try {
            // First try to decode it - if it throws an error, it might have
            // unencoded % characters
            const decodedPassword = decodeURIComponent(urlObj.password);
            
            // Special characters that should be encoded in URLs
            const specialChars = ['&', '%', '@', '+', '!', '*', '#', '$', '=', ':', '/', '?', ' '];
            const hasSpecialChars = specialChars.some(char => decodedPassword.includes(char));
            
            if (hasSpecialChars) {
              console.log('WARNING: Password contains special characters that may need URL encoding');
              
              // Re-encode the password properly
              const reEncodedPassword = encodeURIComponent(decodedPassword);
              
              // If re-encoding changed the password, it's not properly encoded
              if (reEncodedPassword !== urlObj.password) {
                console.log('Detected unencoded special characters in database password');
                
                // Attempt to re-encode the password in the URL
                try {
                  // Reconstruct URL with properly encoded password
                  const user = urlObj.username;
                  const auth = user ? `${user}:${reEncodedPassword}` : '';
                  const authPrefix = auth ? `${auth}@` : '';
                  const newUrl = `${urlObj.protocol}//${authPrefix}${urlObj.host}${urlObj.pathname}${urlObj.search}`;
                  
                  console.log('Automatically re-encoding special characters in database password');
                  process.env.DATABASE_URL = newUrl;
                  databaseUrl = newUrl;
                } catch (encodeError) {
                  console.error('Error encoding URL:', encodeError instanceof Error ? encodeError.message : String(encodeError));
                }
              }
            }
          } catch (decodeError) {
            console.error('Error decoding password - might have unencoded % characters:', decodeError instanceof Error ? decodeError.message : String(decodeError));
            
            // Try to handle the case where there are unencoded % characters
            try {
              // Replace unencoded % with %25
              let fixedPassword = urlObj.password.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
              
              // Reconstruct URL with fixed password
              const user = urlObj.username;
              const auth = user ? `${user}:${fixedPassword}` : '';
              const authPrefix = auth ? `${auth}@` : '';
              const newUrl = `${urlObj.protocol}//${authPrefix}${urlObj.host}${urlObj.pathname}${urlObj.search}`;
              
              console.log('Fixed unencoded % characters in database password');
              process.env.DATABASE_URL = newUrl;
              databaseUrl = newUrl;
            } catch (fixError) {
              console.error('Error fixing unencoded % characters:', fixError instanceof Error ? fixError.message : String(fixError));
            }
          }
        }
      }
    } catch (urlError) {
      console.error('Error parsing DATABASE_URL:', urlError instanceof Error ? urlError.message : String(urlError));
    }
    
    // Create Prisma client with error logging and connection timeout
    return new PrismaClient({
      errorFormat: 'colorless',
      log: ['error', 'warn', 'info'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error instanceof Error ? error.message : String(error));
    // Return a basic PrismaClient as fallback
    return new PrismaClient();
  }
}

export const prisma = globalThis.prisma || getValidatedPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}