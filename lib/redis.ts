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

  return {\
    get: async <T>(key: string): Promise<T | null> => {
      const data = store.get(key)
      if (!data) return null
      if (data.expiry && data.expiry < Date.now()) {
        store.delete(key)
        return null
      }
  return data.value as T
}
,
    set: async (key: string, value: any, options?:
{
  ex?: number
}
): Promise<string> =>
{
  const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined
  store.set(key, { value, expiry })
  return 'OK'
}
,
    incr: async (key: string): Promise<number> =>
{
  const data = store.get(key)
  const currentValue = data ? (typeof data.value === "number" ? data.value : 0) : 0
  const newValue = currentValue + 1
  store.set(key, { value: newValue, expiry: data?.expiry })
  return newValue
}
,
    expire: async (key: string, seconds: number): Promise<number> =>
{
  const data = store.get(key)
  if (!data) return 0
  const expiry = Date.now() + seconds * 1000
  data.expiry = expiry
  store.set(key, data)
  return 1
}
,
    ttl: async (key: string): Promise<number> =>
{
  const data = store.get(key)
  if (!data || !data.expiry) return -1
  const ttl = Math.ceil((data.expiry - Date.now()) / 1000)
  return ttl > 0 ? ttl : -2
}
,
    // Add other methods as needed with fallback implementations
  } as unknown as Redis
}
