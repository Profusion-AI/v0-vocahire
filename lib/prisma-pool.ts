import { PrismaClient } from "@prisma/client"

// Connection pool configuration for production
const connectionPoolConfig = {
  // Maximum number of connections in the pool
  connectionLimit: 10,
  // Pool timeout (how long to wait for a connection)
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 8000, // 8 seconds to acquire connection
    createTimeoutMillis: 8000,   // 8 seconds to create connection
    idleTimeoutMillis: 60000,    // 1 minute idle timeout
    reapIntervalMillis: 1000,    // Check for idle connections every 1s
    createRetryIntervalMillis: 100, // Retry connection creation after 100ms
  }
}

// Create a production-optimized Prisma client with connection pooling
export function createOptimizedPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  
  // Parse the database URL to add pooling parameters
  try {
    const url = new URL(databaseUrl)
    
    // Add connection pooling parameters
    url.searchParams.set("connection_limit", String(connectionPoolConfig.connectionLimit))
    url.searchParams.set("pool_timeout", "8")
    url.searchParams.set("connect_timeout", "8")
    url.searchParams.set("pgbouncer", "true") // Enable pgbouncer mode for Supabase
    url.searchParams.set("statement_cache_size", "0") // Disable statement cache for pgbouncer
    
    // Create Prisma client with optimized settings
    return new PrismaClient({
      datasources: {
        db: {
          url: url.toString()
        }
      },
      errorFormat: "minimal",
      log: process.env.NODE_ENV === "development" 
        ? ["error", "warn"] 
        : ["error"],
    })
  } catch (error) {
    console.error("Failed to parse DATABASE_URL:", error)
    // Fallback to default configuration
    return new PrismaClient({
      errorFormat: "minimal",
      log: ["error"],
    })
  }
}

// Singleton instance with lazy initialization
let prismaInstance: PrismaClient | null = null

export function getOptimizedPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = createOptimizedPrismaClient()
  }
  return prismaInstance
}

// Helper to test database connectivity with timeout
export async function testDatabaseConnection(timeoutMs: number = 5000): Promise<boolean> {
  const prisma = getOptimizedPrisma()
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), timeoutMs)
    })
    
    const queryPromise = prisma.$queryRaw`SELECT 1 as test`
    
    await Promise.race([queryPromise, timeoutPromise])
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}