import { PrismaClient } from "@prisma/client"
import { Pool } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neon } from "@neondatabase/serverless"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a connection pool
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })

// Create a Neon adapter
const adapter = new PrismaNeon(pool)

// Create a new PrismaClient instance
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

// Create a SQL client using neon for direct SQL queries
export const sql = neon(connectionString)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
