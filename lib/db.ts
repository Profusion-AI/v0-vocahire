import { PrismaClient } from "@prisma/client"
import { neon, neonConfig } from "@neondatabase/serverless"

// Configure neon to use WebSockets for serverless environments
neonConfig.fetchConnectionCache = true

declare global {
  var prisma: PrismaClient | undefined
}

// Use PrismaClient in development, but create a new instance for production
export const db = globalThis.prisma || new PrismaClient()

// Create a SQL client using neon for direct SQL queries
export const sql = neon(process.env.DATABASE_URL!)

if (process.env.NODE_ENV !== "production") globalThis.prisma = db
