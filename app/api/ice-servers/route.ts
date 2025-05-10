import { NextResponse } from "next/server"

// Skip authentication for now to simplify debugging
export async function GET() {
  try {
    console.log("ICE servers API route called")

    const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
    const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

    console.log("TURN credentials available:", !!turnUsername && !!turnCredential)

    // Use a variety of reliable public STUN servers for redundancy
    // Avoid using IPv6-only STUN servers as they can cause issues
    // Avoid xirsys servers since they're causing errors
    const iceServers = [
      // Google's STUN servers are very reliable and support IPv4
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },

      // Additional reliable STUN server
      { urls: "stun:stun.stunprotocol.org:3478" },
      // Removed problematic blackberry STUN server
      // Removed nextcloud STUN server as it may have similar issues
    ]

    // Add TURN servers if credentials are available
    // But don't use xirsys since it's causing errors
    if (turnUsername && turnCredential) {
      // Use a different TURN server if available
      // For now, we'll comment out the xirsys servers since they're causing issues
      /*
      iceServers.push({
        urls: ["turn:global.xirsys.net:3478?transport=udp", "turn:global.xirsys.net:5349?transport=tcp"],
        username: turnUsername,
        credential: turnCredential,
      })
      */
      console.log("TURN servers temporarily disabled due to connection issues")
    }

    // Return the configuration
    return NextResponse.json({
      iceServers,
    })
  } catch (error) {
    console.error("Error in ICE servers API route:", error)

    // Even on error, return a valid fallback configuration with multiple STUN servers
    return NextResponse.json({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    })
  }
}
