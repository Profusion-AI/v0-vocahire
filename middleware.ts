import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// Add routes that require authentication
const protectedRoutes = ["/prepare", "/interview", "/feedback", "/profile", "/settings"]

// Add routes that should be accessible only when not authenticated
const authRoutes = ["/login", "/register"]

// Add routes that should be accessible without authentication
const publicRoutes = ["/", "/privacy", "/terms"]

// Add diagnostic routes that should be accessible in development
const diagnosticRoutes = ["/diagnostics", "/mock-auth"]

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Check if the route is a diagnostic route
  const isDiagnosticRoute = diagnosticRoutes.some((route) => pathname.startsWith(route))

  // Allow access to diagnostic routes in development
  if (isDiagnosticRoute && process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If the route is an auth route and the user is authenticated, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Allow access to API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
