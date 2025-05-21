import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Use the global instance

export async function GET() {
  // Get the raw environment variable for comparison
  const dbUrl = process.env.DATABASE_URL; 
  const sanitizedDbUrl = dbUrl ? dbUrl.replace(/:[^@]+@/, ':*****@') : "DATABASE_URL not set";
  
  console.log(`[DB Global Test API] Testing connection via global prisma instance`);
  console.log(`[DB Global Test API] Environment DATABASE_URL: ${sanitizedDbUrl}`);

  try {
    // Test the global prisma instance connection
    const result = await prisma.$queryRaw`SELECT 1 as connection_status`;
    console.log("[DB Global Test API] Connection successful:", result);
    
    // Get Prisma client details for debugging
    const clientDetails = {
      clientVersion: (prisma as any)._clientVersion || 'unknown',
      engineVersion: (prisma as any)._engineVersion || 'unknown',
      connectionInfo: (prisma as any)._connectionPromise ? 'Active connection promise' : 'No active connection'
    };
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Successfully connected to database via global prisma instance',
      result,
      clientDetails,
      dbUrlUsed: sanitizedDbUrl
    });
  } catch (e: any) {
    console.error("[DB Global Test API] DB Connection Error:", e);
    
    // Log the full error object structure if possible
    const errorDetails: Record<string, any> = { 
      message: e.message, 
      code: e.code, 
      clientVersion: e.clientVersion,
      name: e.name,
      stack: e.stack?.substring(0, 500) // Truncated stack trace
    };
    
    if (e.meta) errorDetails.meta = e.meta; // Include meta if Prisma provides it
    
    // Check if the fallback DB is being used
    const isFallbackDb = typeof (prisma as any).isFallbackDb === 'function' || 
                         (prisma as any)._isFallbackDb === true;
    
    return NextResponse.json({
      status: 'error',
      message: `Database connection failed: ${e.message}`,
      errorDetails,
      dbUrlUsed: sanitizedDbUrl,
      isFallbackDb
    }, { status: 500 });
  }
}