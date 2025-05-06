import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { config as appConfig } from "./lib/config"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname is for protected routes
  const isProtectedRoute = ["/interview", "/dashboard", "/feedback"].some((route) => pathname.startsWith(route))

  // Check if the pathname is for auth routes
  const isAuthRoute = ["/login", "/signup"].some((route) => pathname.startsWith(route))

  // Create a Supabase client using cookies
  const supabaseUrl = appConfig.supabase.url
  const supabaseAnonKey = appConfig.supabase.anonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in middleware")
    return NextResponse.next()
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        // This is used for setting cookies in the response
        // We'll handle this in the response below
      },
      remove(name, options) {
        // This is used for removing cookies in the response
        // We'll handle this in the response below
      },
    },
  })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access a protected route, redirect to login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If there is a session and the user is trying to access an auth route, redirect to dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/interview/:path*", "/dashboard/:path*", "/feedback/:path*", "/login", "/signup"],
}
