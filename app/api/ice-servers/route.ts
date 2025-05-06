import { NextResponse } from "next/server"

// Skip authentication for now to simplify debugging
export async function GET() {
  try {
    console.log("ICE servers API route called")

    const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
    const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

    console.log("TURN credentials available:", !!turnUsername && !!turnCredential)

    // Use a variety of reliable public STUN servers for redundancy
    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ]

    // Add TURN servers if credentials are available
    if (turnUsername && turnCredential) {
      iceServers.push({
        urls: ["turn:global.xirsys.net:3478?transport=udp", "turn:global.xirsys.net:5349?transport=tcp"],
        username: turnUsername,
        credential: turnCredential,
      })
      console.log("Added TURN servers to configuration")
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
