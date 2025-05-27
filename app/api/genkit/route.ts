import { genkitPlugin } from '@genkit-ai/next/plugin';
import { NextRequest } from 'next/server';
import { ai } from '@/src/genkit';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not Found', { status: 404 });
  }

  return genkitPlugin(ai)(request);
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not Found', { status: 404 });
  }

  return genkitPlugin(ai)(request);
}