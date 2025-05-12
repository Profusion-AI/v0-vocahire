import { Redis } from "@upstash/redis"

// Create a Redis client
let redisClient: Redis | null = null

// Function to get or create a Redis client
export function getRedisClient() {
  if (!redisClient) {
    try {
      // Check if we have the required environment variables
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.warn("Redis environment variables not found. Using fallback implementation.")
        return createFallbackRedisClient()
      }

      redisClient = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    } catch (error) {
      console.error("Failed to initialize Redis client:", error)
      return createFallbackRedisClient()
    }
  }
  return redisClient
}

// Create a fallback implementation for when Redis is not available
function createFallbackRedisClient() {
  // In-memory storage for fallback
  const storage = new Map<string, { value: any; expiry: number | null }>()

  // Clean up expired keys periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, { expiry }] of storage.entries()) {
      if (expiry && now > expiry) {
        storage.delete(key)
      }
    }
  }, 60000) // Run every minute

  const mockClient: Redis = {\
    get: async <T>(key: string): Promise<T | null> => {
      const item = storage.get(key)
      if (!item) return null
      if (item.expiry && Date.now() > item.expiry) {
        storage.delete(key)
        return null
      }
  return item.value as T
}
,
    set: async <T>(key: string, value: T, options?:
{
  ex?: number
}
): Promise<string> =>
{
  const expiry = options?.ex ? Date.now() + options.ex * 1000 : null
  storage.set(key, { value, expiry })
  return 'OK'
}
,
    incr: async (key: string): Promise<number> =>
{
  const item = storage.get(key)
  const currentValue = item ? (typeof item.value === "number" ? item.value : 0) : 0
  const newValue = currentValue + 1
  storage.set(key, { value: newValue, expiry: item?.expiry || null })
  return newValue
}
,
    expire: async (key: string, seconds: number): Promise<number> =>
{
  const item = storage.get(key)
  if (!item) return 0
  item.expiry = Date.now() + seconds * 1000
  storage.set(key, item)
  return 1
}
,
    del: async (key: string): Promise<number> =>
{
  return storage.delete(key) ? 1 : 0
}
,
    // Add more methods as needed
  } as unknown as Redis

return mockClient
}
