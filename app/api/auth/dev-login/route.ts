import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// DEV ONLY - Auto login for local development
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 });
  }

  // Mock a successful Clerk session
  // In real Clerk, you'd use their testing tokens
  const mockUser = {
    id: 'dev_user_123',
    email: 'dev@vocahire.com',
    firstName: 'Dev',
    lastName: 'User',
    credits: 10.0,
  };

  // For now, just redirect to home with a message
  // You'll need to implement actual Clerk dev auth
  return NextResponse.redirect(new URL('/?dev=true', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'));
}