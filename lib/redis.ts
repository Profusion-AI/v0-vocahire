import { Redis } from "@upstash/redis";

// Configuration for Redis connection
const REDIS_URL = process.env.KV_REST_API_URL || process.env.REDIS_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;

const FALLBACK_CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

let redisClientInstance: Redis | null = null;
let isFallbackActive = false;

/**
 * Represents the structure of data stored in the fallback client,
 * including an optional expiry timestamp.
 */
interface FallbackStoreValue {
  value: any;
  expiry?: number; // Timestamp in milliseconds
}

/**
 * Creates a simplified in-memory fallback client that mimics a subset of the Redis API.
 * This is used when a connection to the actual Redis server cannot be established.
 * @returns A fallback Redis client instance.
 */
function createFallbackRedisClient(): Redis {
  const store = new Map<string, FallbackStoreValue>();

  // Periodically clean up expired keys from the in-memory store
  // const cleanupInterval = // Commented out as setInterval in global scope can cause issues in some environments like serverless.
  // Consider a different cleanup strategy if this is an issue, or ensure it's managed appropriately.
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of store.entries()) {
      if (data.expiry && data.expiry < now) {
        store.delete(key);
        // console.debug(`Fallback store: Expired and deleted key "${key}"`);
      }
    }
  }, FALLBACK_CLEANUP_INTERVAL_MS);

  const fallbackImplementation = {
    get: async <TData = unknown>(key: string): Promise<TData | null> => {
      const data = store.get(key);
      if (!data) {
        return null;
      }
      if (data.expiry && data.expiry < Date.now()) {
        store.delete(key);
        return null;
      }
      return data.value as TData;
    },

    set: async (
      key: string,
      value: unknown,
      options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean; keepttl?: boolean; }
    ): Promise<"OK" | null> => {
      const keyExists = store.has(key);
      const currentItem = store.get(key);

      if (options?.nx && keyExists) return null; // Not set if key exists and NX option
      if (options?.xx && !keyExists) return null; // Not set if key doesn't exist and XX option

      let expiry: number | undefined;

      if (options?.keepttl && currentItem?.expiry) {
        expiry = currentItem.expiry;
      } else if (options?.ex) {
        expiry = Date.now() + options.ex * 1000;
      } else if (options?.px) {
        expiry = Date.now() + options.px;
      }
      // If no expiry option is provided and not KEEPTTL, the key is persistent (expiry is undefined).
      // If KEEPTTL is false/undefined and no ex/px, existing TTL is removed.

      store.set(key, { value, expiry });
      return "OK";
    },

    incr: async (key: string): Promise<number> => {
      const data = store.get(key);
      let currentValue = 0;
      let currentExpiry = data?.expiry;

      if (data) {
        if (data.expiry && data.expiry < Date.now()) {
          store.delete(key); // Expired, so treat as non-existent for incr
          currentExpiry = undefined; // Expired, so new value won't have old expiry
        } else if (typeof data.value === "number") {
          currentValue = data.value;
        }
        // If not a number, it defaults to 0, which is fine for incr.
      }
      const newValue = currentValue + 1;
      store.set(key, { value: newValue, expiry: currentExpiry }); // Preserve original expiry if item was not expired
      return newValue;
    },

    expire: async (key: string, seconds: number): Promise<0 | 1> => {
      const data = store.get(key);
      if (data) {
        if (data.expiry && data.expiry < Date.now()) {
          // Already expired, effectively gone
          store.delete(key);
          return 0;
        }
        data.expiry = Date.now() + seconds * 1000;
        store.set(key, data); // Update the store with new expiry
        return 1;
      }
      return 0;
    },

    del: async (...keys: string[]): Promise<number> => {
      let deletedCount = 0;
      for (const key of keys) {
        if (store.delete(key)) {
          deletedCount++;
        }
      }
      return deletedCount;
    },

    pipeline: () => {
      const commands: Array<{ command: string; args: any[]; operation: () => Promise<any> }> = [];
      const self = fallbackImplementation; // Reference to the fallbackImplementation methods

      const pipelineInstance = {
        get: (key: string) => {
          commands.push({ command: "get", args: [key], operation: () => self.get(key) });
          return pipelineInstance;
        },
        set: (key: string, value: unknown, options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean; keepttl?: boolean; }) => {
          commands.push({ command: "set", args: [key, value, options], operation: () => self.set(key, value, options) });
          return pipelineInstance;
        },
        incr: (key: string) => {
          commands.push({ command: "incr", args: [key], operation: () => self.incr(key) });
          return pipelineInstance;
        },
        expire: (key: string, seconds: number) => {
          commands.push({ command: "expire", args: [key, seconds], operation: () => self.expire(key, seconds) });
          return pipelineInstance;
        },
        del: (...keys: string[]) => {
          commands.push({ command: "del", args: keys, operation: () => self.del(...keys) });
          return pipelineInstance;
        },
        exec: async (): Promise<any[]> => {
          const results: any[] = [];
          for (const cmd of commands) {
            results.push(await cmd.operation());
          }
          return results;
        },
      };
      // Cast to `any` for the pipeline's chainable methods, then to Redis for the final object.
      // A more robust pipeline mock would return specific types for each command.
      return pipelineInstance as any;
    },
    // Add other Redis methods here if your application needs them for the fallback.
    // e.g., hget, hset, zadd, etc.
  };

  // Cast to `Redis` type, acknowledging this is a partial mock.
  // For full type safety, ensure all methods used by the application are implemented
  // or use a more specific interface for the client.
  return fallbackImplementation as unknown as Redis;
}

/**
 * Retrieves a Redis client instance.
 * It attempts to connect to a Redis server using environment variables.
 * If the connection fails or configuration is missing, it falls back to an in-memory mock.
 *
 * @returns {Redis} An instance of the Redis client or a fallback mock.
 */
export function getRedisClient(): Redis {
  // Scenario 1: Instance exists
  if (redisClientInstance) {
    // If it was a fallback but now real credentials are set, try to switch.
    if (isFallbackActive && REDIS_URL && REDIS_TOKEN) {
      console.warn("Redis credentials detected. Attempting to switch from fallback to actual Redis client.");
      redisClientInstance = null; // Force re-initialization
      // isFallbackActive will be reset during re-initialization
    } else {
      return redisClientInstance; // Return existing instance (real or fallback)
    }
  }

  // Scenario 2: No instance or forced re-initialization. Attempt to create one.
  if (!REDIS_URL || !REDIS_TOKEN) {
    console.warn(
      "Redis URL (KV_REST_API_URL or REDIS_URL) or token (KV_REST_API_TOKEN) not found. Using fallback in-memory Redis implementation."
    );
    redisClientInstance = createFallbackRedisClient();
    isFallbackActive = true;
    return redisClientInstance;
  }

  try {
    // The options type for `new Redis({})` is typically inferred by TypeScript
    // or defined inline by the library.
    const options = {
      url: REDIS_URL,
      token: REDIS_TOKEN,
      // Consider adding a retryStrategy for robustness if not default in the library
      // retry: {
      //   retries: 3, // Number of retries
      //   factor: 2, // Exponential backoff factor
      //   minTimeout: 1000, // Minimum time between retries (ms)
      // },
    };
    redisClientInstance = new Redis(options);
    isFallbackActive = false; // Successfully connected to real Redis
    // console.log("Successfully initialized Upstash Redis client.");
    return redisClientInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to initialize Upstash Redis client: ${errorMessage}`);
    console.warn("Falling back to in-memory Redis implementation due to initialization error.");
    redisClientInstance = createFallbackRedisClient();
    isFallbackActive = true;
    return redisClientInstance;
  }
}

/**
 * Checks if the currently active Redis client is the in-memory fallback.
 * This can be useful for diagnostics or conditional logic in the application.
 * @returns {boolean} True if the fallback client is active, false otherwise.
 */
export function isRedisFallbackActive(): boolean {
  // Ensure client is initialized if not already, to correctly determine fallback status
  if (!redisClientInstance) {
    getRedisClient();
  }
  return isFallbackActive;
}
