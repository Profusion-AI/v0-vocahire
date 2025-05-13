import { Redis } from "@upstash/redis";

// Configuration for Redis connection
// Prioritize Vercel KV environment variables, then generic Redis, then Upstash direct
const REDIS_URL =
  process.env.KV_REST_API_URL ||
  process.env.REDIS_URL ||
  process.env.UPSTASH_REDIS_REST_URL;

const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.REDIS_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

const FALLBACK_CLEANUP_INTERVAL_MS = 60 * 1000 * 5; // Clean up mock store every 5 minutes

// Singleton instances
let redisClientInstance: Redis | null = null;
let mockRedisClientInstance: MockRedisClient | null = null;
let isFallbackCurrentlyActive = false;
let fallbackCleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Represents the structure of data stored in the fallback client,
 * including an optional expiry timestamp.
 */
interface FallbackStoreValue {
  value: any;
  expiry?: number; // Timestamp in milliseconds
}

// Define an interface for the methods we actually use from Redis
// This helps in creating a more type-safe mock.
// Extend this with other methods if your application uses them.
interface IVocaHireRedisClient {
  get<TData = unknown>(key: string): Promise<TData | null>;
  set(
    key: string,
    value: unknown,
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean; keepttl?: boolean }
  ): Promise<"OK" | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<0 | 1>;
  del(...keys: string[]): Promise<number>;
  pipeline(): IVocaHireRedisPipeline; // Use our own pipeline type for the mock
  // Add any other methods from @upstash/redis that you use, e.g., hget, hset, etc.
}

// Define a type for our mock pipeline
interface IVocaHireRedisPipeline {
  get<TData = unknown>(key: string): this;
  set(key: string, value: unknown, options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean; keepttl?: boolean }): this;
  incr(key: string): this;
  expire(key: string, seconds: number): this;
  del(...keys: string[]): this;
  exec(): Promise<any[]>;
}


/**
 * Creates a simplified in-memory fallback client that mimics a subset of the Redis API.
 */
class MockRedisClient implements IVocaHireRedisClient {
  private store = new Map<string, FallbackStoreValue>();

  constructor() {
    console.warn(
      "Using mock in-memory Redis client. Rate limiting and other Redis-dependent features will not be truly effective. Ensure Redis is configured for production."
    );
    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    // Clear existing timer if any (e.g., during hot-reloads in dev)
    if (fallbackCleanupIntervalId) {
      clearInterval(fallbackCleanupIntervalId);
    }
    fallbackCleanupIntervalId = setInterval(() => {
      const now = Date.now();
      let deletedCount = 0;
      for (const [key, data] of this.store.entries()) {
        if (data.expiry && data.expiry < now) {
          this.store.delete(key);
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        // console.debug(`MockRedis: Cleaned up ${deletedCount} expired keys.`);
      }
    }, FALLBACK_CLEANUP_INTERVAL_MS);
  }

  async get<TData = unknown>(key: string): Promise<TData | null> {
    const data = this.store.get(key);
    if (!data) return null;
    if (data.expiry && data.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return data.value as TData;
  }

  async set(
    key: string,
    value: unknown,
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean; keepttl?: boolean }
  ): Promise<"OK" | null> {
    const keyExists = this.store.has(key);
    const currentItem = this.store.get(key);

    if (options?.nx && keyExists) return null;
    if (options?.xx && !keyExists) return null;

    let expiry: number | undefined;
    if (options?.keepttl && currentItem?.expiry && (!currentItem.expiry || currentItem.expiry >= Date.now())) {
      expiry = currentItem.expiry;
    } else if (options?.ex) {
      expiry = Date.now() + options.ex * 1000;
    } else if (options?.px) {
      expiry = Date.now() + options.px;
    }

    this.store.set(key, { value, expiry });
    return "OK";
  }

  async incr(key: string): Promise<number> {
    const data = this.store.get(key);
    let currentValue = 0;
    let currentExpiry = data?.expiry;

    if (data) {
      if (data.expiry && data.expiry < Date.now()) {
        this.store.delete(key);
        currentExpiry = undefined;
      } else if (typeof data.value === "number") {
        currentValue = data.value;
      }
    }
    const newValue = currentValue + 1;
    this.store.set(key, { value: newValue, expiry: currentExpiry });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<0 | 1> {
    const data = this.store.get(key);
    if (data) {
      if (data.expiry && data.expiry < Date.now()) {
        this.store.delete(key);
        return 0;
      }
      data.expiry = Date.now() + seconds * 1000;
      this.store.set(key, data);
      return 1;
    }
    return 0;
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  pipeline(): IVocaHireRedisPipeline {
    const commands: Array<{ operation: () => Promise<any> }> = [];
    const self = this;

    const pipelineInstance: IVocaHireRedisPipeline = {
      get: (key: string) => {
        commands.push({ operation: () => self.get(key) });
        return pipelineInstance;
      },
      set: (key: string, value: unknown, options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean; keepttl?: boolean }) => {
        commands.push({ operation: () => self.set(key, value, options) });
        return pipelineInstance;
      },
      incr: (key: string) => {
        commands.push({ operation: () => self.incr(key) });
        return pipelineInstance;
      },
      expire: (key: string, seconds: number) => {
        commands.push({ operation: () => self.expire(key, seconds) });
        return pipelineInstance;
      },
      del: (...keys: string[]) => {
        commands.push({ operation: () => self.del(...keys) });
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
    return pipelineInstance;
  }
}

/**
 * Retrieves or initializes a Redis client instance.
 * It attempts to connect to an Upstash Redis server using environment variables.
 * If configuration is missing or connection fails, it falls back to an in-memory mock client.
 * The client instance is cached globally for efficiency in serverless environments.
 *
 * @returns {Redis | MockRedisClient} An instance of the Redis client or the mock fallback.
 */
export function getRedisClient(): Redis | MockRedisClient {
  // If a real Redis client instance already exists and is working, return it.
  if (redisClientInstance && !isFallbackCurrentlyActive) {
    return redisClientInstance;
  }

  // If a mock client is already active and credentials are still missing, return the existing mock.
  if (mockRedisClientInstance && isFallbackCurrentlyActive && (!REDIS_URL || !REDIS_TOKEN)) {
    return mockRedisClientInstance;
  }

  // Attempt to initialize a real Redis client if credentials are provided.
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      // Ensure only one real client is created.
      if (!redisClientInstance || isFallbackCurrentlyActive) {
        console.log("Initializing Upstash Redis client...");
        redisClientInstance = new Redis({
          url: REDIS_URL,
          token: REDIS_TOKEN,
          // Consider adding retry strategies if needed, though the default might be sufficient.
        });
        // Perform a quick PING to verify connection if desired, though it adds latency.
        // await redisClientInstance.ping().then(() => console.log("Successfully connected to Upstash Redis via PING.")).catch(err => throw err);
        console.log("Successfully initialized Upstash Redis client.");
        isFallbackCurrentlyActive = false;
        if (mockRedisClientInstance && fallbackCleanupIntervalId) {
            clearInterval(fallbackCleanupIntervalId); // Stop mock cleanup if real one is up
            fallbackCleanupIntervalId = null;
            mockRedisClientInstance = null; // Clear mock instance
        }
      }
      return redisClientInstance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to initialize Upstash Redis client: ${errorMessage}. Falling back to mock.`);
      // Fall through to create/return mock client
    }
  }

  // If real client initialization failed or no credentials, use/create mock client.
  if (!mockRedisClientInstance) {
    mockRedisClientInstance = new MockRedisClient();
  }
  isFallbackCurrentlyActive = true;
  return mockRedisClientInstance;
}

/**
 * Checks if the currently active Redis client is the in-memory fallback.
 * @returns {boolean} True if the fallback client is active, false otherwise.
 */
export function isRedisFallbackActive(): boolean {
  // Initialize if not already done, to get the correct active status.
  if (!redisClientInstance && !mockRedisClientInstance) {
    getRedisClient();
  }
  return isFallbackCurrentlyActive;
}