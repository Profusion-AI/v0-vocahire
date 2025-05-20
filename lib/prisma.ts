import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is properly formatted
function getValidatedPrismaClient() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Log database URL format (without credentials) for debugging
    if (databaseUrl) {
      const urlPattern = /^(https?:|postgres:|postgresql:)/;
      const protocol = databaseUrl.match(urlPattern)?.[0] || "unknown";
      console.log(`Database URL protocol: ${protocol}`);
      
      // If URL doesn't start with postgresql:// or postgres://, try to fix it
      if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
        console.warn('DATABASE_URL does not start with postgresql:// or postgres://, which may cause connection issues');
      }
    }
    
    // Create Prisma client with error logging
    return new PrismaClient({
      errorFormat: 'colorless',
      log: ['error', 'warn'],
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    // Return a basic PrismaClient as fallback
    return new PrismaClient();
  }
}

export const prisma = globalThis.prisma || getValidatedPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}