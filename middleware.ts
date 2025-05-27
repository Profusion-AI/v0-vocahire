import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/login/sso-callback(.*)', // Add SSO callback for login
  '/register',
  '/register/sso-callback(.*)', // Add SSO callback for register
  '/sso-callback(.*)', // Added generic SSO callback
  '/api/webhooks/clerk',
  '/api/webhooks/stripe',
  '/forgot-password(.*)', // Added forgot-password as public
  '/terms(.*)', // Added terms as public
  '/privacy(.*)', // Added privacy as public
  '/api/oauth_callback', // Added OAuth callback
  '/oauth_callback', // Added OAuth callback without API prefix
  '/api/diagnostic/db-performance(.*)' // Temporarily public for testing
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip auth in development mode
  if (process.env.DEV_SKIP_AUTH === 'true') {
    return NextResponse.next();
  }
  
  if (!isPublicRoute(req)) {
    await auth.protect(); // If not public, protect the route. Clerk handles redirection automatically
  }
  // No need to return anything - clerkMiddleware handles the response automatically
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
