'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mock user for development
const DEV_USER = {
  id: 'dev_user_123',
  firstName: 'Dev',
  lastName: 'User',
  emailAddresses: [{
    emailAddress: 'dev@vocahire.com',
    id: 'email_123'
  }],
  primaryEmailAddressId: 'email_123',
  publicMetadata: {
    credits: 10.0,
    isSubscribed: true
  }
};

export function useQuickAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signIn } = useAuth();
  const router = useRouter();

  // In development with mock auth enabled
  if (process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true') {
    return {
      user: DEV_USER,
      isLoaded: true,
      isSignedIn: true,
      userId: DEV_USER.id
    };
  }

  // Auto-login with test account in dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN === 'true' &&
        isLoaded && !isSignedIn) {
      
      // Option 1: Use Clerk's test account
      console.log('🔐 Dev Mode: Use test@clerk.dev / clerk123 to login');
      
      // Option 2: Auto-redirect to sign-in
      // router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  return { user, isLoaded, isSignedIn, userId: user?.id };
}