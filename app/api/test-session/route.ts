import { NextResponse } from "next/server"

export async function POST(_req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  console.log("🔑 OPENAI_API_KEY (first 6 chars):", apiKey?.slice(0, 6))
  console.log("Starting minimal create-session test…")

  const url = "https://api.openai.com/v1/realtime/sessions"
  const opts = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "realtime",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "gpt-4o-mini-realtime-preview", voice: "alloy" }),
  }

  console.log("👉 OPENAI SESSION CREATE CALL:", url, {
    ...opts,
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${apiKey?.slice(0, 6)}...`,
    },
  })

  try {
    const res = await fetch(url, opts)
    console.log("👈 OPENAI RESPONSE status:", res.status)
    console.log("👈 OPENAI RESPONSE headers:", Object.fromEntries([...res.headers.entries()]))

    const text = await res.text()
    console.log("👈 OPENAI RESPONSE body:", text.substring(0, 500))

    // Try to parse as JSON if possible
    let jsonData = null
    try {
      if (text && text.trim().startsWith("{")) {
        jsonData = JSON.parse(text)
      }
    } catch (_e) {
      console.log("Response is not valid JSON")
    }

    return NextResponse.json({
      status: res.status,
      contentType: res.headers.get("content-type"),
      body: text.substring(0, 1000),
      json: jsonData,
    })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json(
      {
        error: "Fetch failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
