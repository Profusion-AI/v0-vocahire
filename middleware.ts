import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect diagnostic routes in production
  if (process.env.NODE_ENV === "production") {
    // Block access to diagnostic pages and test APIs
    if (
      pathname.startsWith("/diagnostics") ||
      pathname.startsWith("/api/test-") ||
      pathname.startsWith("/api/debug-") ||
      pathname === "/api-diagnostics"
    ) {
      // Either redirect to home or return 404
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/diagnostics/:path*", "/api/test-:path*", "/api/debug-:path*", "/api-diagnostics"],
}
