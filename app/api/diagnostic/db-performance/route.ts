import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const testId = `db_perf_${startTime}`;
  
  const perfLog = (phase: string, additionalData?: any) => {
    const elapsed = Date.now() - startTime;
    console.log(`[${testId}] ${phase} - ${elapsed}ms elapsed${additionalData ? ` | ${JSON.stringify(additionalData)}` : ''}`);
    return elapsed;
  };
  
  const results: any = {
    testId,
    startTime: new Date().toISOString(),
    tests: {}
  };
  
  try {
    perfLog("TEST_START");
    
    // Test 1: Basic connection test
    perfLog("CONNECTION_TEST_START");
    try {
      const connectionTime = Date.now();
      await prisma.$queryRaw`SELECT 1 as connection_test`;
      const connectionElapsed = Date.now() - connectionTime;
      perfLog("CONNECTION_TEST_COMPLETE", { time: connectionElapsed });
      results.tests.connectionTest = { 
        success: true, 
        time: connectionElapsed,
        status: connectionElapsed < 1000 ? "good" : connectionElapsed < 3000 ? "slow" : "very_slow"
      };
    } catch (error) {
      const connectionElapsed = perfLog("CONNECTION_TEST_ERROR");
      results.tests.connectionTest = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        time: connectionElapsed
      };
    }
    
    // Test 2: User table query test (similar to what's failing in realtime-session)
    perfLog("USER_QUERY_TEST_START");
    try {
      const auth = getAuth(request);
      const testUserId = auth.userId;
      
      // If no auth, use a test query without specific user
      if (!testUserId) {
        const userCountTime = Date.now();
        const userCount = await prisma.user.count();
        const userCountElapsed = Date.now() - userCountTime;
        perfLog("USER_COUNT_TEST_COMPLETE", { count: userCount, time: userCountElapsed });
        results.tests.userQueryTest = { 
          success: true, 
          type: "count_query",
          count: userCount,
          time: userCountElapsed,
          status: userCountElapsed < 2000 ? "good" : userCountElapsed < 5000 ? "slow" : "very_slow"
        };
      } else {
        // Test the exact query that's failing in realtime-session
        const userQueryTime = Date.now();
        const user = await prisma.user.findUnique({
          where: { id: testUserId },
          select: { credits: true, isPremium: true },
        });
        const userQueryElapsed = Date.now() - userQueryTime;
        perfLog("USER_QUERY_TEST_COMPLETE", { userFound: !!user, time: userQueryElapsed });
        results.tests.userQueryTest = { 
          success: true,
          type: "findUnique_query", 
          userFound: !!user,
          time: userQueryElapsed,
          status: userQueryElapsed < 2000 ? "good" : userQueryElapsed < 5000 ? "slow" : "very_slow"
        };
      }
    } catch (error) {
      const userQueryElapsed = perfLog("USER_QUERY_TEST_ERROR");
      results.tests.userQueryTest = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        time: userQueryElapsed
      };
    }
    
    // Test 3: Multiple concurrent queries (stress test)
    perfLog("CONCURRENT_TEST_START");
    try {
      const concurrentTime = Date.now();
      const concurrentPromises = Array.from({ length: 3 }, () => 
        prisma.$queryRaw`SELECT 1 as test_${Math.random()}`
      );
      await Promise.all(concurrentPromises);
      const concurrentElapsed = Date.now() - concurrentTime;
      perfLog("CONCURRENT_TEST_COMPLETE", { queries: 3, time: concurrentElapsed });
      results.tests.concurrentTest = { 
        success: true, 
        queries: 3,
        time: concurrentElapsed,
        avgTimePerQuery: Math.round(concurrentElapsed / 3),
        status: concurrentElapsed < 3000 ? "good" : concurrentElapsed < 8000 ? "slow" : "very_slow"
      };
    } catch (error) {
      const concurrentElapsed = perfLog("CONCURRENT_TEST_ERROR");
      results.tests.concurrentTest = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        time: concurrentElapsed
      };
    }
    
    // Test 4: Database info
    perfLog("DB_INFO_TEST_START");
    try {
      const dbInfoTime = Date.now();
      const dbInfo = await prisma.$queryRaw`SELECT version() as postgres_version, current_database() as database_name, current_user as username`;
      const dbInfoElapsed = Date.now() - dbInfoTime;
      perfLog("DB_INFO_TEST_COMPLETE", { time: dbInfoElapsed });
      results.tests.dbInfoTest = { 
        success: true, 
        info: dbInfo,
        time: dbInfoElapsed
      };
    } catch (error) {
      const dbInfoElapsed = perfLog("DB_INFO_TEST_ERROR");
      results.tests.dbInfoTest = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        time: dbInfoElapsed
      };
    }
    
    const totalElapsed = perfLog("ALL_TESTS_COMPLETE");
    results.totalTime = totalElapsed;
    results.completedAt = new Date().toISOString();
    
    // Overall assessment
    const failedTests = Object.values(results.tests).filter((test: any) => !test.success).length;
    const slowTests = Object.values(results.tests).filter((test: any) => 
      test.success && (test.status === "slow" || test.status === "very_slow")
    ).length;
    
    results.assessment = {
      overallStatus: failedTests > 0 ? "failed" : slowTests > 1 ? "slow" : "good",
      failedTests,
      slowTests,
      recommendation: failedTests > 0 
        ? "Database connectivity issues detected. Check Supabase status and connection configuration."
        : slowTests > 1 
        ? "Database performance issues detected. Consider connection pooling optimization or Supabase plan upgrade."
        : "Database performance is within acceptable ranges."
    };
    
    return NextResponse.json(results);
    
  } catch (error) {
    const totalElapsed = perfLog("FATAL_ERROR");
    return NextResponse.json({
      testId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      totalTime: totalElapsed,
      completedAt: new Date().toISOString()
    }, { status: 500 });
  }
}