import { NextResponse } from "next/server"
import { getOpenAIApiKey } from "@/lib/api-utils"

export async function POST(request: Request) {
  try {
    console.log("=== BASIC REALTIME TEST ===")

    // Get the OpenAI API key
    const apiKey = getOpenAIApiKey()
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not found" }, { status: 500 })
    }

    // Get the request body
    let body
    try {
      body = await request.json()
      console.log("Request:", {
        model: body?.model,
        voice: body?.voice,
      })
    } catch (_error) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const model = body?.model || "gpt-4o-mini-realtime-preview"
    const voice = body?.voice || "alloy"

    // Make a minimal request to the OpenAI Realtime API
    console.log(`Testing Realtime API with model: ${model}, voice: ${voice}`)

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
      }),
    })

    console.log(`Response status: ${response.status}`)
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]))

    // Get the response body as text
    const responseText = await response.text()

    // Try to parse as JSON
    try {
      const responseJson = JSON.parse(responseText)
      console.log("Response parsed as JSON:", JSON.stringify(responseJson).substring(0, 200))

      return NextResponse.json(
        {
          success: response.ok,
          status: response.status,
          headers: Object.fromEntries([...response.headers.entries()]),
          body: responseJson,
        },
        { status: response.ok ? 200 : response.status },
      )
    } catch (_e) {
      // Not JSON, likely HTML
      console.log(`Response is not JSON (likely HTML). First 200 chars: ${responseText.substring(0, 200)}`)

      return NextResponse.json(
        {
          success: false,
          status: response.status,
          headers: Object.fromEntries([...response.headers.entries()]),
          body: responseText.substring(0, 2000),
          error: "Response is not JSON (likely HTML)",
          isHtml: responseText.includes("<!DOCTYPE html>") || responseText.includes("<html"),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in basic realtime test:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
