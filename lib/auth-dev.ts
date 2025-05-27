// Development auth utilities
import { auth } from '@clerk/nextjs/server';

export const DEV_USER = {
  id: 'dev_user_123',
  email: 'dev@vocahire.com',
  firstName: 'Dev',
  lastName: 'User',
  emailVerified: true,
  credits: 10.0,
  isSubscribed: true,
  organizationId: 'dev_org_123',
};

export async function getAuthForDev() {
  // In development with DEV_SKIP_AUTH=true, return mock user
  if (process.env.NODE_ENV === 'development' && process.env.DEV_SKIP_AUTH === 'true') {
    return {
      userId: DEV_USER.id,
      user: DEV_USER,
      sessionId: 'dev_session_123',
      session: { id: 'dev_session_123' },
      orgId: DEV_USER.organizationId,
    };
  }
  
  // Otherwise use real auth
  return auth();
}

// Client-side hook wrapper
export function useAuthForDev() {
  // This would wrap useUser() from Clerk
  if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true') {
    return {
      isLoaded: true,
      isSignedIn: true,
      user: DEV_USER,
    };
  }
  
  // Use real Clerk hook
  // return useUser();
}