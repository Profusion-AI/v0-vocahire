import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const testId = `vercel_db_${startTime}`;
  
  const results: any = {
    testId,
    environment: {
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || "unknown",
      runtime: "nodejs"
    },
    databaseConfig: {},
    connectivity: {},
    timing: {}
  };
  
  try {
    // Check database configuration
    const dbUrl = process.env.DATABASE_URL;
    const migrateDbUrl = process.env.MIGRATE_DATABASE_URL;
    
    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        results.databaseConfig.runtime = {
          host: url.hostname,
          port: url.port,
          database: url.pathname.substring(1),
          isPooled: url.hostname.includes('pooler') || url.port === '6543',
          sslMode: url.searchParams.get('sslmode'),
          provider: url.hostname.includes('supabase') ? 'supabase' : 
                   url.hostname.includes('neon') ? 'neon' : 'unknown'
        };
      } catch (e) {
        results.databaseConfig.runtime = { error: "Invalid DATABASE_URL format" };
      }
    }
    
    if (migrateDbUrl) {
      try {
        const url = new URL(migrateDbUrl);
        results.databaseConfig.migration = {
          host: url.hostname,
          port: url.port,
          database: url.pathname.substring(1),
          isPooled: url.hostname.includes('pooler') || url.port === '6543',
          isDirect: url.hostname.includes('db.') && url.port === '5432'
        };
      } catch (e) {
        results.databaseConfig.migration = { error: "Invalid MIGRATE_DATABASE_URL format" };
      }
    }
    
    // Test Prisma import and initialization timing
    const prismaImportStart = Date.now();
    const { prisma } = await import("@/lib/prisma");
    const prismaImportTime = Date.now() - prismaImportStart;
    results.timing.prismaImport = prismaImportTime;
    
    // Test basic connectivity with different timeout thresholds
    const timeouts = [5000, 10000, 20000, 30000]; // 5s, 10s, 20s, 30s
    
    for (const timeout of timeouts) {
      const testStart = Date.now();
      try {
        await Promise.race([
          prisma.$queryRaw`SELECT 1 as test, current_timestamp as server_time`,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
          )
        ]);
        const testTime = Date.now() - testStart;
        results.connectivity[`${timeout}ms_timeout`] = {
          success: true,
          actualTime: testTime,
          status: testTime < timeout * 0.1 ? "excellent" : 
                 testTime < timeout * 0.3 ? "good" : 
                 testTime < timeout * 0.7 ? "acceptable" : "slow"
        };
        break; // If one timeout succeeds, shorter ones will too
      } catch (error) {
        const testTime = Date.now() - testStart;
        results.connectivity[`${timeout}ms_timeout`] = {
          success: false,
          actualTime: testTime,
          error: error instanceof Error ? error.message : String(error),
          timedOut: testTime >= timeout * 0.95 // Within 5% of timeout = likely timed out
        };
      }
    }
    
    // Cold start detection
    results.timing.totalTestTime = Date.now() - startTime;
    results.assessment = {
      likelyColdStart: results.timing.prismaImport > 1000 || results.timing.totalTestTime > 10000,
      dbConnectivity: Object.values(results.connectivity).some((test: any) => test.success) ? "working" : "failed",
      recommendedTimeout: (() => {
        const workingTest = Object.entries(results.connectivity).find(([_, test]: [string, any]) => test.success);
        if (!workingTest) return "60000"; // If nothing works, use very high timeout
        const [timeoutKey] = workingTest;
        const timeoutMs = parseInt(timeoutKey.replace('ms_timeout', ''));
        return Math.max(timeoutMs * 1.5, 25000).toString(); // 50% buffer, minimum 25s
      })()
    };
    
    // Specific recommendations for Vercel + Supabase
    if (results.environment.isVercel && results.databaseConfig.runtime?.provider === 'supabase') {
      results.vercelSupabaseAdvice = {
        usingPooledConnection: results.databaseConfig.runtime.isPooled,
        recommendedSetup: {
          runtime: "Use pooled connection (*.pooler.supabase.com:6543) for serverless functions",
          migration: "Use direct connection (db.*.supabase.co:5432) for migrations only",
          timeout: "Use 25-45 second timeouts for cold starts",
          connectionLimit: "Consider connection pooling if high concurrent load"
        },
        currentSetup: {
          correct: results.databaseConfig.runtime.isPooled && 
                  results.databaseConfig.migration?.isDirect,
          issues: []
        }
      };
      
      if (!results.databaseConfig.runtime.isPooled) {
        results.vercelSupabaseAdvice.currentSetup.issues.push("Runtime should use pooled connection");
      }
      if (!results.databaseConfig.migration?.isDirect) {
        results.vercelSupabaseAdvice.currentSetup.issues.push("Migration URL should use direct connection");
      }
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json({
      testId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      totalTime: Date.now() - startTime
    }, { status: 500 });
  }
}