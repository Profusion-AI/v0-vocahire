import { PrismaClient } from "../prisma/generated/client"
import { fallbackDb } from "./fallback-db"
import { getSecret } from './secret-manager';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | Promise<PrismaClient> | undefined
}

// Global flag to track if we're using the fallback database
export let isUsingFallbackDb = false;

async function initializePrisma(): Promise<PrismaClient> {
  try {
    // In production, don't manipulate the DATABASE_URL, just use it as-is
    if (process.env.NODE_ENV === 'production') {
      // Only log sanitized connection information for diagnostics
      const databaseUrl = await getSecret('DATABASE_URL');
      if (databaseUrl) {
        try {
          const urlObj = new URL(databaseUrl);
          console.log(`[Prisma] Production environment: Using DATABASE_URL as-is`);
          console.log(`[Prisma] Attempting connection to: ${urlObj.hostname}:${urlObj.port || '5432'}`);

          // Only show information about Supabase connections, no modifications
          if (urlObj.hostname.includes('supabase.co') || urlObj.hostname.includes('pooler.supabase.com')) {
            console.log('[Prisma] Detected Supabase connection');
            console.log('[Prisma] Note: For production, ensure:');
            console.log('[Prisma] 1. IP allow list includes Vercel deployment IPs');
            console.log('[Prisma] 2. Database is active and not in maintenance mode');
          }
        } catch (_urlError) {
          console.error('[Prisma] Error parsing DATABASE_URL (but continuing without modification)');
        }
      } else {
        console.error('[Prisma] DATABASE_URL not set in production environment');
      }
    }
    // For development/test environments, we can apply fixes
    else {
      let databaseUrl = process.env.DATABASE_URL;

      // Create a sanitized URL for logging (hide credentials)
      const sanitizedForLogging = databaseUrl ? databaseUrl.replace(/\/\/[^@]*@/, "//****:****@") : "undefined";
      console.log(`[Prisma] Original DATABASE_URL format (sanitized): ${sanitizedForLogging}`);

      // Check for common formatting errors and attempt to fix in development only
      if (databaseUrl) {
        // Case 1: URL with nested http protocol - postgresql://https://host
        if (databaseUrl.includes('postgresql://https://') || databaseUrl.includes('postgres://https://')) {
          console.warn('[Prisma] DATABASE_URL contains nested protocols (postgresql://https://). Attempting to fix...');

          // Attempt to parse and fix the URL
          const urlMatch = databaseUrl.match(/(?:postgresql|postgres):\/\/https:\/\/([^\/]+)(?:\/(.*))?/);
          if (urlMatch) {
            const [_, host, database = 'postgres'] = urlMatch;

            // For Supabase, correct the host format
            let correctedHost = host;
            if (host.includes('supabase.co') && !host.startsWith('db.')) {
              correctedHost = `db.${host}`;
              console.log(`[Prisma] Corrected Supabase host to use db. prefix: ${correctedHost}`);
            }

            // Use default credentials if none provided (these will likely be overridden by env vars)
            const fixedUrl = `postgresql://postgres:postgres@${correctedHost}:5432/${database}`;
            console.log(`[Prisma] Fixed DATABASE_URL format: postgresql://****:****@${correctedHost}:5432/${database}`);

            // Set the environment variable directly
            process.env.DATABASE_URL = fixedUrl;
            databaseUrl = fixedUrl;
          }
        }

        // Case 2: Missing protocol slashes - postgresql:host:port
        else if (databaseUrl.match(/^(?:postgresql|postgres):[^\/]/)) {
          console.warn('[Prisma] DATABASE_URL missing proper protocol format. Attempting to fix...');

          // Add the necessary slashes
          const fixedUrl = databaseUrl.replace(/^(postgresql|postgres):/, '$1://');
          console.log(`[Prisma] Fixed DATABASE_URL format: ${fixedUrl.replace(/\/\/[^@]*@/, "//****:****@")}`);

          // Set the environment variable directly
          process.env.DATABASE_URL = fixedUrl;
          databaseUrl = fixedUrl;
        }

        // Final validation
        if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
          console.error('[Prisma] DATABASE_URL still does not start with postgresql:// or postgres:// after fix attempts');
          console.error('[Prisma] Please update your environment variables with the correct format:');
          console.error('[Prisma] postgresql://username:password@hostname:5432/database_name');
        }
      }

      // Use MIGRATE_DATABASE_URL as fallback if available
      const migrateUrl = process.env.MIGRATE_DATABASE_URL;
      if (!databaseUrl && migrateUrl) {
        console.log('[Prisma] Using MIGRATE_DATABASE_URL as fallback for DATABASE_URL');
        process.env.DATABASE_URL = migrateUrl;
      }

      // Log connection details for troubleshooting
      try {
        const urlObj = new URL(databaseUrl || '');
        console.log(`[Prisma] Attempting database connection to: ${urlObj.hostname}:${urlObj.port || '5432'}`);

        // Check for known limitations with Supabase
        if (urlObj.hostname.includes('supabase.co')) {
          console.log('[Prisma] IMPORTANT: For Supabase connections, please verify:');
          console.log('[Prisma] 1. IP allow list includes Vercel deployment IPs');
          console.log('[Prisma] 2. Database is active and not in maintenance mode');
          console.log('[Prisma] 3. Connection credentials are correct and URL-encoded');

          // Check for direct vs pooled connection for migrations
          if (urlObj.hostname.includes('db.')) {
            console.log('[Prisma] NOTE: Using direct connection (db.*)');
            console.log('[Prisma] For normal operations, use pooled connection: aws-0-[region].pooler.supabase.com');
          }

          // Only check for special characters in development, don't modify in any environment
          if (urlObj.password) {
            // Check if the password is properly encoded - just warn, don't modify
            try {
              const decodedPassword = decodeURIComponent(urlObj.password);
              const specialChars = ['&', '%', '@', '+', '!', '*', '#', '$', '=', ':', '/', '?', ' '];
              const hasSpecialChars = specialChars.some(char => decodedPassword.includes(char));

              if (hasSpecialChars) {
                console.log('[Prisma] WARNING: Password contains special characters');
                console.log('[Prisma] Please ensure DATABASE_URL has proper URL encoding in environment variables');
                console.log('[Prisma] Special characters should be URL-encoded (e.g., space = %20)');
              }
            } catch (_decodeError) {
              console.error('[Prisma] Database password contains invalid URL encoding characters');
              console.error('[Prisma] Please fix your DATABASE_URL environment variable directly');
            }
          }
        }
      } catch (urlError) {
        console.error('[Prisma] Error parsing DATABASE_URL:', urlError instanceof Error ? urlError.message : String(urlError));
      }
    }

    // Create Prisma client with optimized settings for serverless
    const dbUrl = process.env.DATABASE_URL || '';
    let optimizedUrl = dbUrl;

    try {
      // Parse connection pool settings from URL or use optimized defaults
      const url = new URL(dbUrl);
      const currentPoolSize = url.searchParams.get('connection_limit') || url.searchParams.get('pool_size');
      const currentPoolTimeout = url.searchParams.get('pool_timeout');

      // Set optimized pool settings if not already specified
      if (!currentPoolSize) {
        url.searchParams.set('connection_limit', '25'); // Increased from default 5
      }
      if (!currentPoolTimeout) {
        url.searchParams.set('pool_timeout', '20'); // Increased from default 10
      }

      // Add pgbouncer mode for better connection pooling
      if (!url.searchParams.has('pgbouncer')) {
        url.searchParams.set('pgbouncer', 'true');
      }

      // Add statement timeout to prevent long-running queries
      if (!url.searchParams.has('statement_timeout')) {
        url.searchParams.set('statement_timeout', '30000'); // 30 seconds
      }

      optimizedUrl = url.toString();

      console.log(`[Prisma] Connection pool settings: limit=${currentPoolSize || 25}, timeout=${currentPoolTimeout || 20}s`);
    } catch (urlError) {
      console.warn('[Prisma] Could not parse DATABASE_URL for optimization, using as-is:', urlError);
    }

    return new PrismaClient({
      errorFormat: 'colorless',
      log: ['error', 'warn', 'info'],
      datasources: {
        db: {
          url: process.env.NODE_ENV === 'production' ? optimizedUrl : process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error instanceof Error ? error.message : String(error));
    console.warn('Using fallback database functionality (limited capabilities)');

    // Set the global flag to indicate we're using the fallback database
    isUsingFallbackDb = true;

    // Return the fallback database instead of a real PrismaClient
    // This allows the application to run with limited functionality
    // even when the database is unavailable
    return fallbackDb as unknown as PrismaClient;
  }
}

let prismaInstance: PrismaClient | Promise<PrismaClient> | undefined;

export function getPrismaClient(): PrismaClient | Promise<PrismaClient> {
  if (!prismaInstance) {
    prismaInstance = initializePrisma();
  }
  return prismaInstance;
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = getPrismaClient();
}

// Connection pool warming for serverless functions
let isConnectionWarmed = false;
let lastWarmTime = 0;
const WARM_INTERVAL = 5 * 60 * 1000; // Re-warm every 5 minutes

/**
 * Pre-warm database connection pool to reduce cold start latency
 * This is especially important for Vercel serverless functions
 */
export async function warmDatabaseConnection(): Promise<boolean> {
  const now = Date.now();

  // Skip if recently warmed
  if (isConnectionWarmed && (now - lastWarmTime) < WARM_INTERVAL) {
    console.log('[Prisma] Connection already warmed, skipping');
    return true;
  }

  try {
    console.log('[Prisma] Warming database connection pool...');
    const warmStart = Date.now();

    // Get and await the prisma client
    const awaitedPrisma = await getPrismaClient();
    await awaitedPrisma.$queryRaw`SELECT 1 as warmup`;

    // Mark as warmed
    isConnectionWarmed = true;
    lastWarmTime = now;

    const warmTime = Date.now() - warmStart;
    console.log(`[Prisma] Connection pool warmed successfully in ${warmTime}ms`);

    return true;
  } catch (error) {
    console.error('[Prisma] Failed to warm connection:', error instanceof Error ? error.message : String(error));
    isConnectionWarmed = false;
    return false;
  }
}

// Auto-warm on module load for critical routes
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Fire and forget - don't block module loading
  setImmediate(() => {
    warmDatabaseConnection().catch(err =>
      console.error('[Prisma] Background connection warming failed:', err)
    );
  });
}

/**
 * Check if the database is available for connections
 * @returns Promise<boolean> True if the database is available, false otherwise
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Get and await the prisma client
    const awaitedPrisma = await getPrismaClient();
    await awaitedPrisma.$queryRaw`SELECT 1 as connection_test`;
    return true;
  } catch (error) {
    console.warn('Database connectivity check failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Wrapper for Prisma operations that handles database errors gracefully
 * @param operation Function that performs a database operation
 * @param fallback Function to call if the database operation fails
 * @returns Result of the operation or fallback
 */
export async function withDatabaseFallback<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  fallback: () => Promise<T> | T
): Promise<T> {
  try {
    // Get and await the prisma client
    const awaitedPrisma = await getPrismaClient();
    // Pass the awaited client to the operation
    return await operation(awaitedPrisma);
  } catch (error) {
    console.error('Database operation failed:', error instanceof Error ? error.message : String(error));
    return await fallback();
  }
}
