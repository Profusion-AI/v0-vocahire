import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session
  const isAuthPage = req.nextUrl.pathname === "/login"
  const isPublicPage = ["/", "/privacy", "/terms", "/auth/callback"].includes(req.nextUrl.pathname)

  // Redirect unauthenticated users to login page
  if (!isAuthenticated && !isAuthPage && !isPublicPage) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/prepare", req.url))
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
