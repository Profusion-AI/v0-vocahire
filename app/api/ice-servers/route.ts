import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { config } from "@/lib/config"

export async function GET() {
  try {
    // Create a Supabase client using cookies
    const cookieStore = cookies()
    const supabaseUrl = config.supabase.url
    const supabaseAnonKey = config.supabase.anonKey

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables in ICE servers route")
      // Return default ICE servers instead of failing
      return NextResponse.json({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
          },
        ],
      })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        },
      },
    })

    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Even if there's no session, return default ICE servers
    // This makes the route more robust for testing
    if (!session) {
      console.warn("No authenticated session found, returning default ICE servers")
      return NextResponse.json({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
          },
        ],
      })
    }

    // Default ICE servers (STUN)
    const iceServers = [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ]

    // If TURN URL is configured, fetch ICE servers from Xirsys
    if (process.env.NEXT_PUBLIC_TURN_URL) {
      try {
        // Fetch ICE servers from Xirsys
        const response = await fetch(process.env.NEXT_PUBLIC_TURN_URL)

        if (response.ok) {
          const data = await response.json()

          // If Xirsys returned valid data, use it
          if (data && data.iceServers) {
            return NextResponse.json({ iceServers: data.iceServers })
          }

          // If Xirsys returned data but not in the expected format,
          // add a static TURN server configuration
          iceServers.push({
            urls: ["turn:global.xirsys.net:3478?transport=udp", "turn:global.xirsys.net:5349?transport=tcp"],
            username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
          })
        } else {
          console.error("Failed to fetch ICE servers from Xirsys:", await response.text())
          // Add static TURN configuration as fallback
          iceServers.push({
            urls: ["turn:global.xirsys.net:3478?transport=udp", "turn:global.xirsys.net:5349?transport=tcp"],
            username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
          })
        }
      } catch (error) {
        console.error("Error fetching ICE servers from Xirsys:", error)
        // Add static TURN configuration as fallback
        iceServers.push({
          urls: ["turn:global.xirsys.net:3478?transport=udp", "turn:global.xirsys.net:5349?transport=tcp"],
          username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
        })
      }
    }

    return NextResponse.json({ iceServers })
  } catch (error) {
    console.error("Error fetching ICE servers:", error)
    // Return default ICE servers instead of failing
    return NextResponse.json({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        },
      ],
    })
  }
}
