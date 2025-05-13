import { Redis } from "@upstash/redis"

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL || process.env.KV_REST_API_URL || process.env.REDIS_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN

    if (!url || !token) {
      console.warn("Redis URL or token not found. Using fallback in-memory implementation.")
      return createFallbackRedisClient()
    }

    try {
      redisClient = new Redis({
        url,
        token,
      })
    } catch (error) {
      console.error("Failed to initialize Redis client:", error)
      return createFallbackRedisClient()
    }
  }

  return redisClient
}

// Simple in-memory implementation for fallback when Redis is unavailable
function createFallbackRedisClient(): Redis {
  const store = new Map<string, { value: any; expiry?: number }>()

  // Clean up expired keys periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, data] of store.entries()) {
      if (data.expiry && data.expiry < now) {
        store.delete(key)
      }
    }
  }, 60000) // Run every minute

  const mock = {\
    get: async <T>(key: string): Promise<T | null> => {
      const data = store.get(key)
      if (!data) return null
      if (data.expiry && data.expiry < Date.now()) {
        store.delete(key)
        return null
      }
  return item.value as T
}
,
    
    set: async (
      key: string,
      value: any,
      options?:
{
  ex?: number;
  px?: number
}
): Promise<string | null> =>
{
  let expiry: number | undefined
  if (options?.ex) {
    expiry = Date.now() + options.ex * 1000
  } else if (options?.px) {
    expiry = Date.now() + options.px
  }
  storage.set(key, { value, expiry })
  return "OK"
}
,
    
    incr: async (key: string): Promise<number> =>
{
  const item = storage.get(key)
  let currentValue = 0
  if (item && typeof item.value === "number") {
    if (!item.expiry || item.expiry > Date.now()) {
      currentValue = item.value
    }
  }
  const newValue = currentValue + 1
  storage.set(key, { value: newValue, expiry: item?.expiry })
  return newValue
}
,
    
    expire: async (key: string, seconds: number): Promise<number> =>
{
  const item = storage.get(key)
  if (item) {
    item.expiry = Date.now() + seconds * 1000
    return 1
  }
  return 0
}
,
    
    pipeline: () =>
{
  const commands: Array<{ command: string; args: any[] }> = []
  const pipeline = {
    incr: (key: string) => {
      commands.push({ command: "incr", args: [key] })
      return pipeline
    },
    expire: (key: string, seconds: number) => {
      commands.push({ command: "expire", args: [key, seconds] })
      return pipeline
    },
    exec: async () => {
      const results: any[] = []
      for (const cmd of commands) {
        if (cmd.command === "incr") {
          results.push(await mock.incr(cmd.args[0]))
        } else if (cmd.command === "expire") {
          results.push(await mock.expire(cmd.args[0], cmd.args[1]))
        }
      }
      return results
    },
  }
  return pipeline
}
,
    
    del: async (key: string): Promise<number> =>
{
  return storage.delete(key) ? 1 : 0
}
}
  
  mockRedisClient = mock
return mock
}

/**
 * Returns a Redis client or a mock implementation if Redis is unavailable
 */
export function getRedisClient(): Redis | any {
  if (redis) {
    return redis
  }

  const UPSTASH_URL = process.env.KV_REST_API_URL
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN

  if (mockRedisClient && (!UPSTASH_URL || !UPSTASH_TOKEN)) {
    // If already using mock and still no creds, return existing mock
    return mockRedisClient
  }

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    if (!mockRedisClient) {
      mockRedisClient = createMockRedisClient()
    }
    return mockRedisClient
  }

  try {
    redis = new Redis({
      url: UPSTASH_URL,
      token: UPSTASH_TOKEN,
    })
    console.log("Successfully connected to Upstash Redis.")
    return redis
  } catch (error) {
    console.error("Failed to connect to Upstash Redis:", error)
    if (!mockRedisClient) {
      mockRedisClient = createMockRedisClient()
    }
    return mockRedisClient
  }
}
