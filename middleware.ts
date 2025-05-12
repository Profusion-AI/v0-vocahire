import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Check if this is a diagnostic route
  if (
    path.startsWith("/diagnostics") ||
    (path.startsWith("/api/") && (path.includes("test") || path.includes("debug") || path.includes("diagnostic")))
  ) {
    // In production, restrict access to diagnostic routes
    if (process.env.NODE_ENV === "production") {
      // Allow access if a special query parameter is present
      // This is a simple mechanism - in a real app you might want to use a more secure approach
      const allowDebug = request.nextUrl.searchParams.get("debug") === process.env.DEBUG_SECRET

      if (!allowDebug) {
        // Block access in production unless explicitly allowed
        return new NextResponse("Access Denied", {
          status: 403,
          headers: {
            "Content-Type": "text/plain",
          },
        })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/diagnostics/:path*", "/api/:path*"],
}
