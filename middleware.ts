import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname is for protected routes
  const isProtectedRoute = ["/interview", "/dashboard", "/feedback"].some((route) => pathname.startsWith(route))

  // Check if the pathname is for auth routes
  const isAuthRoute = ["/login", "/signup"].some((route) => pathname.startsWith(route))

  // Get the auth cookie
  const authCookie = request.cookies.get("auth-user-id")?.value
  const isAuthenticated = !!authCookie

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/interview/:path*", "/dashboard/:path*", "/feedback/:path*", "/login", "/signup"],
}
