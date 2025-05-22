import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prefetchUserCredentials } from "@/lib/user-cache"
import { warmDatabaseConnection } from "@/lib/prisma"

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
    
    // Warm database connection in parallel with credential fetching
    const warmPromise = warmDatabaseConnection().catch(err => {
      console.warn('[Prefetch] Connection warming failed:', err);
      return false;
    });
    
    const prefetchPromise = prefetchUserCredentials(auth.userId).catch(err => {
      console.warn('[Prefetch] Credential prefetch failed:', err);
      return false;
    });
    
    // Wait for both operations
    const [connectionWarmed, credentialsPrefetched] = await Promise.all([
      warmPromise,
      prefetchPromise
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