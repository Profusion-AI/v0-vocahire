'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface DevAuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function DevAuthWrapper({ children, requireAuth = true }: DevAuthWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Auto-login in development
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN === 'true' &&
        isLoaded && !isSignedIn && requireAuth) {
      
      // Option 1: Redirect to Clerk's test mode sign-in
      // router.push('/sign-in?redirect_url=' + window.location.pathname);
      
      // Option 2: Use Clerk's development instance test accounts
      console.log('🔧 Dev Mode: Auto-login enabled. Use Clerk test accounts.');
      
      // Option 3: Skip auth entirely (you'd need to mock the hooks)
      // This is what the auth-dev.ts approach enables
    }
  }, [isLoaded, isSignedIn, requireAuth, router]);

  // In dev mode with skip auth, always render children
  if (process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true') {
    return <>{children}</>;
  }

  // Normal auth flow
  if (!isLoaded) return <div>Loading...</div>;
  if (requireAuth && !isSignedIn) return <div>Please sign in...</div>;
  
  return <>{children}</>;
}