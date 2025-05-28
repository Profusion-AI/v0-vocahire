import { NextResponse } from 'next/server';

export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
  
  return NextResponse.json({
    status: hasApiKey ? 'healthy' : 'unhealthy',
    service: 'interview-v2',
    hasApiKey,
    timestamp: new Date().toISOString()
  }, {
    status: hasApiKey ? 200 : 503
  });
}