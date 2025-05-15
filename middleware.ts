import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/login/sso-callback(.*)', // Add SSO callback for login
  '/register',
  '/register/sso-callback(.*)', // Add SSO callback for register
  '/api/webhooks/clerk',
  '/api/webhooks/stripe',
  '/forgot-password(.*)', // Added forgot-password as public
  '/terms(.*)', // Added terms as public
  '/privacy(.*)', // Added privacy as public
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isPublicRoute(req)) {
    await auth.protect(); // If not public, protect the route. Clerk handles redirection.
  }
  return NextResponse.next(); // Explicitly allow public routes or authenticated access
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
