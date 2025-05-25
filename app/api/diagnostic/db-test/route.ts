import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../prisma/generated/client';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const sanitizedDbUrl = dbUrl ? dbUrl.replace(/:[^@]+@/, ':*****@') : "DATABASE_URL not set";
  console.log(`[DB Test API] Attempting connection with URL: ${sanitizedDbUrl}`);
  
  if (!dbUrl) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'DATABASE_URL environment variable is not set in the Vercel function environment.' 
    }, { status: 500 });
  }
  
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    await prisma.$connect(); // Explicitly connect
    const result = await prisma.$queryRaw`SELECT 1 as connection_status`;
    await prisma.$disconnect(); // Explicitly disconnect
    
    console.log("[DB Test API] Connection successful:", result);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Successfully connected to database.', 
      result, 
      dbUrlUsed: sanitizedDbUrl 
    });
  } catch (e: any) {
    console.error("[DB Test API] DB Connection Error:", e);
    
    // Log the full error object structure if possible
    const errorDetails: Record<string, any> = { 
      message: e.message, 
      code: e.code, 
      clientVersion: e.clientVersion 
    };
    
    if (e.meta) errorDetails.meta = e.meta; // Include meta if Prisma provides it
    if (e.stack) errorDetails.stackTraceStart = e.stack.substring(0, 200); // Small part of stack

    return NextResponse.json({
      status: 'error',
      message: `Database connection failed: ${e.message}`,
      errorDetails,
      dbUrlUsed: sanitizedDbUrl,
    }, { status: 500 });
  }
}