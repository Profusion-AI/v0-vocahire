import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("ICE servers API route called")

    const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
    const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

    console.log("TURN credentials available:", !!turnUsername && !!turnCredential)

    // Use a variety of reliable public STUN servers for redundancy
    const iceServers = [
      // Google's STUN servers are very reliable and support IPv4
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },

      // Additional public STUN servers for redundancy
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.voip.blackberry.com:3478" },
      { urls: "stun:stun.nextcloud.com:443" },
    ]

    // Add TURN servers if credentials are available
    if (turnUsername && turnCredential) {
      // Add both UDP and TCP TURN servers for better connectivity
      iceServers.push({
        urls: [
          "turn:global.turn.twilio.com:3478?transport=udp",
          "turn:global.turn.twilio.com:3478?transport=tcp",
          "turn:global.turn.twilio.com:443?transport=tcp",
        ],
        username: turnUsername,
        credential: turnCredential,
      })

      console.log("Added TURN servers with credentials")
    } else {
      console.log("No TURN credentials available, using STUN servers only")
    }

    // Return the configuration
    return NextResponse.json({
      iceServers,
    })
  } catch (error) {
    console.error("Error in ICE servers API route:", error)

    // Even on error, return a valid fallback configuration with multiple STUN servers
    return NextResponse.json({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })
  }
}
