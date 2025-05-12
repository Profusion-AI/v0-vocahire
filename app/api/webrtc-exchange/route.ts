import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("=== /api/webrtc-exchange endpoint called ===")

  try {
    // Parse the request body
    const body = await request.json()
    const { sessionId, token, sdp, model } = body

    if (!sessionId || !token || !sdp) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing required parameters",
          message: "sessionId, token, and sdp are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log(`Exchanging SDP for session: ${sessionId}`)
    console.log(`SDP offer length: ${sdp.length} chars`)
    console.log(`Using model: ${model || "default"}`)

    // Create the URL for the OpenAI Realtime API
    // The correct URL format is just /v1/realtime with the token as the Bearer token
    const url = "https://api.openai.com/v1/realtime"

    console.log(`DEBUG: Using SDP exchange URL: ${url}`)
    console.log(`DEBUG: Using ephemeral token (client_secret) for Authorization: Bearer ${token.substring(0, 10)}...`)

    // Send the SDP offer to OpenAI using the ephemeral token as the Bearer token
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/sdp",
        Authorization: `Bearer ${token}`, // Using the ephemeral token instead of the API key
        "OpenAI-Beta": "realtime", // Include this header for beta features
      },
      body: sdp, // Send the raw SDP offer
    })

    console.log(`OpenAI SDP POST response status: ${response.status}`)

    // Get the response body as text for logging
    const responseBodyText = await response.text()
    console.log(`OpenAI SDP POST response body (first 500 chars): ${responseBodyText.substring(0, 500)}`)

    // Check if the response is successful
    if (!response.ok) {
      console.error(`OpenAI SDP exchange failed with status: ${response.status}`)
      console.error(`Full error response: ${responseBodyText}`)

      // Return detailed error
      return new NextResponse(
        JSON.stringify({
          error: "SDP exchange failed",
          message: responseBodyText.substring(0, 500),
          status: response.status,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Return the SDP answer to the client
    return NextResponse.json({
      sdp: responseBodyText,
    })
  } catch (error) {
    console.error("Error in WebRTC exchange:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to exchange WebRTC SDP",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
