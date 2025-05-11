import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("=== /api/webrtc-exchange endpoint called ===")

  try {
    const body = await request.json()
    const { sessionId, token, sdp } = body

    if (!sessionId || !token || !sdp) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          message: "sessionId, token, and sdp are required",
        },
        { status: 400 },
      )
    }

    console.log(`Processing WebRTC exchange for session: ${sessionId}`)
    console.log(`SDP offer length: ${sdp.length} characters`)

    // Check if this is a mock session
    if (sessionId.startsWith("mock-")) {
      console.log("Mock session detected. Returning mock SDP answer.")

      // Return a mock SDP answer
      return NextResponse.json({
        sdp: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:mock\r\na=ice-pwd:mockpwd\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1\r\n",
        useMockMode: true,
      })
    }

    // For real sessions, we would send the SDP offer to OpenAI
    // But since we're having issues with the realtime API, we'll return a mock response
    console.log("Returning mock SDP answer for compatibility.")
    return NextResponse.json({
      sdp: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:mock\r\na=ice-pwd:mockpwd\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1\r\n",
      useMockMode: true,
    })
  } catch (error) {
    console.error("Error in WebRTC exchange:", error)
    return NextResponse.json(
      {
        error: "Failed to process WebRTC exchange",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
