import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prefetchUserCredentials } from "@/lib/user-cache"
import { warmDatabaseConnection } from "@/lib/prisma"
import { connectionPoolMonitor } from "@/lib/db-connection-monitor"

// Force dynamic rendering to prevent database connection during build
export const dynamic = 'force-dynamic';

/**
 * Pre-fetch user credentials to warm the cache
 * This reduces latency when creating interview sessions
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const auth = getAuth(request);
    
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Monitor pool health before operations
    await connectionPoolMonitor.updateMetrics();
    const poolMetrics = connectionPoolMonitor.getCurrentMetrics();
    console.log(`[Prefetch] Pool status - Active: ${poolMetrics.activeConnections}/${poolMetrics.poolSize}, Utilization: ${connectionPoolMonitor.getUtilization()}%`);
    
    // Warm database connection in parallel with credential fetching
    const warmPromise = warmDatabaseConnection().catch(err => {
      console.warn('[Prefetch] Connection warming failed:', err);
      return false;
    });
    
    const prefetchPromise = prefetchUserCredentials(auth.userId).catch(err => {
      console.warn('[Prefetch] Credential prefetch failed:', err);
      return false;
    });
    
    // Wait for both operations with timeout
    const [connectionWarmed, credentialsPrefetched] = await Promise.race([
      Promise.all([warmPromise, prefetchPromise]),
      new Promise<[boolean, boolean]>((_, reject) => 
        setTimeout(() => reject(new Error('Prefetch timeout')), 20000) // 20s timeout
      )
    ]);
    
    const elapsed = Date.now() - startTime;
    console.log(`[Prefetch] Completed in ${elapsed}ms - Connection: ${connectionWarmed}, Credentials: ${credentialsPrefetched}`);
    
    return NextResponse.json({ 
      success: true,
      connectionWarmed,
      credentialsPrefetched,
      timeMs: elapsed
    });
  } catch (error) {
    console.error('[Prefetch] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to prefetch credentials" 
    }, { status: 500 });
  }
}