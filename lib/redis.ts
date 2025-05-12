import { Redis } from "@upstash/redis"

// Use singleton pattern to avoid multiple connections
let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (redis) {
    return redis
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn(
      "Upstash Redis not configured. Rate limiting and other Redis-dependent features will not work correctly.",
    )

    // For development/testing, create a mock Redis client that won't block functionality
    // This allows the app to work even if Redis isn't configured
    return createMockRedisClient()
  }

  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })

  return redis
}

// Mock Redis client for development/testing when Redis isn't available
function createMockRedisClient(): Redis {
  const mockStorage = new Map<string, any>()
  const mockExpirations = new Map<string, number>()

  return {
    get: async (key: string) => mockStorage.get(key) || null,
    set: async (key: string, value: any, options?: any) => {
      mockStorage.set(key, value)
      if (options?.ex) {
        mockExpirations.set(key, Date.now() + options.ex * 1000)
        setTimeout(() => {
          if (mockExpirations.get(key) <= Date.now()) {
            mockStorage.delete(key)
            mockExpirations.delete(key)
          }
        }, options.ex * 1000)
      }
      return "OK"
    },
    incr: async (key: string) => {
      const current = mockStorage.get(key) || 0
      const newValue = current + 1
      mockStorage.set(key, newValue)
      return newValue
    },
    expire: async (key: string, seconds: number) => {
      if (mockStorage.has(key)) {
        mockExpirations.set(key, Date.now() + seconds * 1000)
        setTimeout(() => {
          if (mockExpirations.get(key) <= Date.now()) {
            mockStorage.delete(key)
            mockExpirations.delete(key)
          }
        }, seconds * 1000)
        return 1
      }
      return 0
    },
    pipeline: () => {
      const commands: Array<{ command: string; args: any[] }> = []
      return {
        incr: (key: string) => {
          commands.push({ command: "incr", args: [key] })
          return commands
        },
        expire: (key: string, seconds: number) => {
          commands.push({ command: "expire", args: [key, seconds] })
          return commands
        },
        exec: async () => {
          return Promise.all(
            commands.map(async (cmd) => {
              if (cmd.command === "incr") {
                return await (mockStorage as any).incr(cmd.args[0])
              } else if (cmd.command === "expire") {
                return await (mockStorage as any).expire(cmd.args[0], cmd.args[1])
              }
              return null
            }),
          )
        },
      } as any
    },
  } as unknown as Redis
}
