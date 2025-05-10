import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { sessionId, offerSdp, model, clientSecret } = await req.json()

    if (!sessionId || !offerSdp || !model || !clientSecret) {
      console.error("[Get RTC Details] Missing required parameters")
      return NextResponse.json(
        {
          error: "Session ID, offer SDP, model, and client secret are required",
        },
        { status: 400 },
      )
    }

    console.log(`[Get RTC Details] Processing WebRTC offer for session: ${sessionId}`)
    console.log(`[Get RTC Details] Model: ${model}`)
    console.log(`[Get RTC Details] Offer SDP length: ${offerSdp.length} characters`)

    // Call OpenAI API with the correct URL pattern and authentication
    const response = await fetch(
      // model query-param is required
      `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
          // Use the ephemeral key, not the long-lived API key
          Authorization: `Bearer ${clientSecret}`,
          "OpenAI-Beta": "realtime",
        },
        body: offerSdp, // plain text SDP offer
      },
    )

    // Log response details
    console.log(`[Get RTC Details] Response status: ${response.status}`)
    console.log(`[Get RTC Details] Response status text: ${response.statusText}`)

    // Log headers
    const headers = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log(`[Get RTC Details] Response headers: ${JSON.stringify(headers, null, 2)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Get RTC Details] Error getting WebRTC details: ${response.status} ${errorText}`)

      // Try to parse error as JSON if possible
      try {
        const errorJson = JSON.parse(errorText)
        console.error(`[Get RTC Details] Parsed error: ${JSON.stringify(errorJson, null, 2)}`)
      } catch (e) {
        // Not JSON, just log the text
        console.error(`[Get RTC Details] Error text: ${errorText}`)
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to get WebRTC details: ${response.status}`,
          details: errorText,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      )
    }

    // The response body is the answer SDP as plain text
    const answerSdp = await response.text()
    console.log(`[Get RTC Details] Successfully retrieved answer SDP for session: ${sessionId}`)
    console.log(`[Get RTC Details] Answer SDP length: ${answerSdp.length} characters`)
    console.log(`[Get RTC Details] Answer SDP preview: ${answerSdp.substring(0, 100)}... [truncated]`)

    // Return the answer SDP
    return NextResponse.json({
      success: true,
      sdp: answerSdp,
    })
  } catch (error) {
    console.error("[Get RTC Details] Error getting WebRTC details:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
