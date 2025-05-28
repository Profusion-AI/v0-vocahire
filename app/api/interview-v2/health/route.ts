import { NextResponse } from 'next/server';
import { getSecret } from '@/lib/secret-manager';

export async function GET() {
  try {
    // Try to fetch API key from Secret Manager
    const apiKey = await getSecret('GOOGLE_AI_API_KEY');
    const hasApiKey = !!apiKey;
    
    return NextResponse.json({
      status: hasApiKey ? 'healthy' : 'unhealthy',
      service: 'interview-v2',
      hasApiKey,
      timestamp: new Date().toISOString()
    }, {
      status: hasApiKey ? 200 : 503
    });
  } catch (error) {
    // If Secret Manager fails, check environment variable as fallback
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
    
    return NextResponse.json({
      status: hasApiKey ? 'healthy' : 'unhealthy',
      service: 'interview-v2',
      hasApiKey,
      secretManagerError: true,
      timestamp: new Date().toISOString()
    }, {
      status: hasApiKey ? 200 : 503
    });
  }
}