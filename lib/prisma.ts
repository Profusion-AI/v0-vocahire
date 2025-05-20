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
          
          // Use default credentials if none provided (these will likely be overridden by env vars)
          const fixedUrl = `postgresql://postgres:postgres@${host}:5432/${database}`;
          console.log(`Fixed DATABASE_URL format: postgresql://****:****@${host}:5432/${database}`);
          
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
    
    // Create Prisma client with error logging
    return new PrismaClient({
      errorFormat: 'colorless',
      log: ['error', 'warn', 'info', 'query'],
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    // Return a basic PrismaClient as fallback
    return new PrismaClient();
  }
}

export const prisma = globalThis.prisma || getValidatedPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}