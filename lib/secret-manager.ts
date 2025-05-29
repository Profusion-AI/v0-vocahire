import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Cache for secrets to avoid repeated API calls
const secretCache = new Map<string, string>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

// Initialize client
let client: SecretManagerServiceClient | null = null;

// Project configuration
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID || 'vocahire-prod';

/**
 * Gets a secret from Google Secret Manager or environment variable
 * Falls back to environment variables in both development and production
 */
export async function getSecret(secretName: string): Promise<string> {
  // Always check environment variables first (for both dev and prod)
  const envValue = process.env[secretName];
  if (envValue) {
    return envValue;
  }

  // Check cache
  const cached = secretCache.get(secretName);
  const cachedTime = cacheTimestamps.get(secretName);
  
  if (cached && cachedTime && Date.now() - cachedTime < CACHE_TTL) {
    return cached;
  }

  // In development, if not found in env vars or cache, throw error
  if (process.env.NODE_ENV === 'development') {
    throw new Error(`Secret ${secretName} not found in environment variables (development mode)`);
  }

  // Try Secret Manager in production (Cloud Run has implicit auth)
  if (process.env.NODE_ENV === 'production') {
    try {
      if (!client) {
        client = new SecretManagerServiceClient();
      }

      const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      
      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error(`Secret ${secretName} not found in Secret Manager`);
      }

      // Cache the secret
      secretCache.set(secretName, payload);
      cacheTimestamps.set(secretName, Date.now());
      
      return payload;
    } catch (error) {
      console.error(`Failed to get secret ${secretName} from Secret Manager:`, error);
      throw error;
    }
  }
  
  // If we reach here, we're in production but missing credentials
  throw new Error(`Secret ${secretName} not found - production mode but GOOGLE_APPLICATION_CREDENTIALS not set`);
}

/**
 * Gets multiple secrets at once (more efficient)
 */
export async function getSecrets(secretNames: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  // Use Promise.all for parallel fetching
  const promises = secretNames.map(async (name) => {
    try {
      results[name] = await getSecret(name);
    } catch (error) {
      console.error(`Failed to get secret ${name}:`, error);
      // Don't throw, let other secrets load
    }
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * Configuration object with all secrets
 */
export interface VocaHireSecrets {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  REDIS_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Get all VocaHire secrets at once
 */
export async function getVocaHireSecrets(): Promise<VocaHireSecrets> {
  const secretNames = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'REDIS_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const secrets = await getSecrets(secretNames);
  
  // Validate required secrets
  const required = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'STRIPE_SECRET_KEY', 'REDIS_URL'];
  for (const key of required) {
    if (!secrets[key]) {
      throw new Error(`Required secret ${key} not found`);
    }
  }
  
  return {
    DATABASE_URL: secrets.DATABASE_URL,
    CLERK_SECRET_KEY: secrets.CLERK_SECRET_KEY,
    STRIPE_SECRET_KEY: secrets.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: secrets.STRIPE_WEBHOOK_SECRET,
    REDIS_URL: secrets.REDIS_URL,
    SUPABASE_SERVICE_ROLE_KEY: secrets.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Clear the secret cache (useful for testing or rotation)
 */
export function clearSecretCache(): void {
  secretCache.clear();
  cacheTimestamps.clear();
}

/**
 * Initialize secrets on app startup
 * This pre-loads all secrets to avoid cold start delays
 */
export async function initializeSecrets(): Promise<void> {
  try {
    console.log('Initializing secrets...');
    await getVocaHireSecrets();
    console.log('Secrets initialized successfully');
  } catch (error) {
    console.error('Failed to initialize secrets:', error);
    // Don't throw in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}