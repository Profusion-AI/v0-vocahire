import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};
  
  // Test both connection URLs
  const pooledUrl = process.env.DATABASE_URL;
  const directUrl = process.env.MIGRATE_DATABASE_URL;
  
  results.environment = {
    hasPooledUrl: !!pooledUrl,
    hasDirectUrl: !!directUrl,
    vercelEnvironment: process.env.VERCEL ? 'true' : 'false',
    nodeVersion: process.version
  };

  // Test pooled connection (runtime)
  if (pooledUrl) {
    try {
      const pooledPrisma = new PrismaClient({
        datasources: { db: { url: pooledUrl } }
      });
      
      const pooledResult = await pooledPrisma.$queryRaw`SELECT 1 as test, version() as pg_version`;
      await pooledPrisma.$disconnect();
      
      results.pooledConnection = {
        status: 'SUCCESS',
        result: pooledResult
      };
    } catch (error: any) {
      results.pooledConnection = {
        status: 'ERROR',
        error: error.message,
        code: error.code
      };
    }
  }

  // Test direct connection (migrations)
  if (directUrl) {
    try {
      const directPrisma = new PrismaClient({
        datasources: { db: { url: directUrl } }
      });
      
      const directResult = await directPrisma.$queryRaw`SELECT 1 as test, version() as pg_version`;
      await directPrisma.$disconnect();
      
      results.directConnection = {
        status: 'SUCCESS',
        result: directResult
      };
    } catch (error: any) {
      results.directConnection = {
        status: 'ERROR',
        error: error.message,
        code: error.code
      };
    }
  }

  // Test User table existence via pooled connection
  if (pooledUrl && results.pooledConnection?.status === 'SUCCESS') {
    try {
      const pooledPrisma = new PrismaClient({
        datasources: { db: { url: pooledUrl } }
      });
      
      // Check if User table exists
      const tableCheck = await pooledPrisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      `;
      
      const userCount = await pooledPrisma.user.count();
      await pooledPrisma.$disconnect();
      
      results.userTableTest = {
        status: 'SUCCESS',
        tableExists: Array.isArray(tableCheck) && tableCheck.length > 0,
        userCount
      };
    } catch (error: any) {
      results.userTableTest = {
        status: 'ERROR',
        error: error.message,
        code: error.code
      };
    }
  }

  return NextResponse.json(results, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}