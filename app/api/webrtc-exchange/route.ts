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

    // Get the OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY

    if (!apiKey) {
      console.error("OpenAI API key is missing")
      return NextResponse.json(
        {
          error: "Configuration error",
          message: "OpenAI API key is missing",
          code: "missing_api_key",
        },
        { status: 500 },
      )
    }

    try {
      // Send the SDP offer directly to OpenAI's realtime API
      console.log("Sending SDP offer to OpenAI realtime API...")
      console.log("Request URL:", "https://api.openai.com/v1/audio/realtime")
      console.log("Request headers:", {
        Authorization: "Bearer sk-***" + (apiKey ? apiKey.substring(apiKey.length - 4) : ""),
        "Content-Type": "application/sdp",
        "OpenAI-Beta": "realtime",
        "OpenAI-Client-Secret": token.substring(0, 3) + "..." + token.substring(token.length - 3),
      })
      console.log("SDP offer length:", sdp.length)

      const response = await fetch("https://api.openai.com/v1/audio/realtime", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime",
          "OpenAI-Client-Secret": token,
        },
        body: sdp,
      })

      // Log response details
      console.log("OpenAI realtime API response status:", response.status)
      console.log("OpenAI realtime API response statusText:", response.statusText)
      console.log("OpenAI realtime API response headers:", Object.fromEntries([...response.headers.entries()]))

      // Get response content type
      const contentType = response.headers.get("content-type") || ""
      const isHtmlResponse = contentType.includes("text/html")
      const isSdpResponse = contentType.includes("application/sdp")

      console.log("Response content type:", contentType)
      console.log("Is HTML response:", isHtmlResponse)
      console.log("Is SDP response:", isSdpResponse)

      // Get the response as text
      const responseText = await response.text()

      // Log a safe substring of the response
      const safeResponseText = responseText.length > 500 ? responseText.substring(0, 500) + "..." : responseText
      console.log("OpenAI realtime API response body:", safeResponseText)

      // Check if it looks like HTML even if content-type doesn't say so
      const looksLikeHtml = responseText.trim().startsWith("<")

      if (looksLikeHtml) {
        console.log("Response looks like HTML even though content-type is:", contentType)
      }

      if (!response.ok) {
        console.error(`OpenAI WebRTC exchange error: ${response.status}`)

        if (isHtmlResponse || looksLikeHtml) {
          console.error("Received HTML response instead of SDP answer")
          // Extract a meaningful error message from HTML if possible
          const errorMatch = responseText.match(/<title>(.*?)<\/title>/) || responseText.match(/<h1>(.*?)<\/h1>/)
          const htmlErrorMessage = errorMatch ? errorMatch[1] : "Received HTML response instead of SDP"

          return NextResponse.json(
            {
              error: "Invalid API response format",
              message:
                "The OpenAI API returned HTML instead of an SDP answer. This could indicate a network issue, incorrect endpoint, or lack of access to the Realtime API.",
              htmlError: htmlErrorMessage,
              code: "html_response",
              details:
                "Your API key may not have access to the Realtime API. Please check your OpenAI account permissions.",
            },
            { status: 500 },
          )
        }

        return NextResponse.json(
          {
            error: `OpenAI WebRTC exchange error: ${response.status}`,
            message: responseText,
          },
          { status: response.status },
        )
      }

      // Check if the response is valid SDP
      if (isHtmlResponse || looksLikeHtml) {
        console.error("Received HTML response instead of SDP answer")
        return NextResponse.json(
          {
            error: "Invalid API response format",
            message:
              "The OpenAI API returned HTML instead of an SDP answer. This could indicate a network issue, incorrect endpoint, or lack of access to the Realtime API.",
            code: "html_response",
          },
          { status: 500 },
        )
      }

      // Validate that the response looks like SDP
      if (!responseText.includes("v=0") || !responseText.includes("m=audio")) {
        console.error("Response doesn't appear to be valid SDP")
        return NextResponse.json(
          {
            error: "Invalid SDP response",
            message: "The response from OpenAI doesn't appear to be valid SDP",
            code: "invalid_sdp",
          },
          { status: 500 },
        )
      }

      console.log(`Received SDP answer from OpenAI (length: ${responseText.length} characters)`)

      return NextResponse.json({
        sdp: responseText,
      })
    } catch (fetchError) {
      console.error("Fetch error when calling OpenAI API:", fetchError)

      // Check if it's a network error
      const isNetworkError =
        fetchError instanceof TypeError &&
        (fetchError.message.includes("fetch failed") ||
          fetchError.message.includes("network") ||
          fetchError.message.includes("Failed to fetch"))

      if (isNetworkError) {
        return NextResponse.json(
          {
            error: "Network error connecting to OpenAI",
            message: "Failed to connect to OpenAI API. Please check your internet connection and try again.",
            details: fetchError.message,
            code: "network_error",
          },
          { status: 503 }, // Service Unavailable
        )
      }

      throw fetchError
    }
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
