// Utility functions for OpenAI Realtime API

export function getOpenAIApiKey(): string | undefined {
  // Try multiple environment variable names
  return process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY
}

/**
 * Fetches available Realtime models from OpenAI
 */
export async function fetchRealtimeModels(apiKey?: string): Promise<string[]> {
  try {
    console.log("Fetching available models from OpenAI...")

    // Use the provided API key or fall back to environment variables
    const key = apiKey || getOpenAIApiKey()

    if (!key) {
      console.error("No OpenAI API key available")
      return []
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch models: ${response.status}`)
      return []
    }

    const data = await response.json()

    // Filter for realtime models
    const realtimeModels = data.data.filter((model: any) => model.id.includes("realtime")).map((model: any) => model.id)

    console.log(`Found ${realtimeModels.length} realtime models:`, realtimeModels)
    return realtimeModels
  } catch (error) {
    console.error("Error fetching realtime models:", error)
    return []
  }
}

/**
 * Tests if the API key has access to the Realtime API
 */
export async function testRealtimeAccess(apiKey?: string): Promise<{
  hasAccess: boolean
  error?: string
  response?: any
}> {
  try {
    console.log("Testing Realtime API access...")

    // Use the provided API key or fall back to environment variables
    const key = apiKey || getOpenAIApiKey()

    if (!key) {
      console.error("No OpenAI API key available")
      return {
        hasAccess: false,
        error: "No OpenAI API key available",
      }
    }

    // Use a minimal payload for testing
    const payload = {
      model: "gpt-4o-mini-realtime-preview",
      voice: "alloy",
    }

    // Log the exact request we're making
    console.log("👉 POST to OpenAI:", "https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key.substring(0, 5)}...`,
        "OpenAI-Beta": "realtime",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "OpenAI-Beta": "realtime",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // Log response status and headers
    console.log(`Response status: ${response.status}`)
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]))

    // Get response body
    const responseText = await response.text()

    // Try to parse as JSON if possible
    try {
      const responseJson = JSON.parse(responseText)
      console.log("Response JSON:", responseJson)

      return {
        hasAccess: response.ok,
        response: responseJson,
      }
    } catch (e) {
      // Not JSON, return as text
      console.log(`Response text: ${responseText.substring(0, 500)}${responseText.length > 500 ? "..." : ""}`)

      return {
        hasAccess: false,
        error: `Non-JSON response: ${responseText.substring(0, 100)}...`,
        response: responseText,
      }
    }
  } catch (error) {
    console.error("Error testing realtime access:", error)
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Fallback models to try if dynamic fetching fails
export const FALLBACK_MODELS = [
  "gpt-4o-mini-realtime-preview",
  "gpt-4o-mini-realtime-preview-2024-12-17",
  "gpt-4o-realtime-preview-2024-12-17",
  "gpt-4o-realtime-preview-2024-10-01",
  "gpt-4o-realtime-preview",
]

// Available voices
export const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
