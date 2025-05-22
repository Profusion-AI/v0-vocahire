import { PrismaClient } from '../prisma/generated/client'

// Optimized Prisma client with connection pooling for Vercel
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

// Create a single instance of Prisma Client with optimized settings
function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] as const
      : ['error'] as const,
  })
}

// Use global variable in development to prevent multiple instances
const prisma = global.prismaGlobal || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma
}

// Pre-warm connection with a lightweight query
export async function warmConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[Prisma] Connection warming failed:', error)
    return false
  }
}

// Execute raw queries with built-in timeout
export async function queryWithTimeout<T>(
  query: TemplateStringsArray,
  ...values: any[]
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Query timeout')), 5000)
  })
  
  try {
    const result = await Promise.race([
      prisma.$queryRaw<T>(query, ...values),
      timeoutPromise
    ])
    return result
  } catch (error) {
    if (error instanceof Error && error.message === 'Query timeout') {
      console.error('[Prisma] Query timed out after 5 seconds')
    }
    throw error
  }
}

// Optimized user query for session creation
export async function getUserCredentials(userId: string) {
  return queryWithTimeout<Array<{
    id: string
    credits: number
    isPremium: boolean
  }>>`
    SELECT id, credits::float8 as credits, "isPremium" 
    FROM "User" 
    WHERE id = ${userId}
    LIMIT 1
  `
}

// Optimized credit operations
export async function grantInitialCredits(userId: string, amount: number) {
  return queryWithTimeout<void>`
    UPDATE "User" 
    SET credits = ${amount}
    WHERE id = ${userId} AND credits = 0
  `
}

export async function deductCredits(userId: string, amount: number) {
  return queryWithTimeout<void>`
    UPDATE "User" 
    SET credits = credits - ${amount}
    WHERE id = ${userId} AND credits >= ${amount}
  `
}

export { prisma }