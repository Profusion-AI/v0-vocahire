/**
 * Utility functions for API validation and error handling
 */

// Get the OpenAI API key from environment variables
export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY
}

// Validate the OpenAI API key format
export function validateApiKey(apiKey?: string): {
  isValid: boolean
  error?: string
} {
  const key = apiKey || getOpenAIApiKey()

  if (!key) {
    return {
      isValid: false,
      error: "OpenAI API key is missing",
    }
  }

  // Basic format validation
  if (!key.startsWith("sk-") || key.length < 20) {
    return {
      isValid: false,
      error: "OpenAI API key appears to be invalid (wrong format)",
    }
  }

  return { isValid: true }
}

// Format API error responses consistently
export function formatApiError(error: unknown): {
  error: string
  message: string
  details?: any
  stack?: string
} {
  if (error instanceof Error) {
    return {
      error: error.name,
      message: error.message,
      details: {
        name: error.name,
      },
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }
  }

  if (typeof error === "string") {
    return {
      error: "Error",
      message: error,
    }
  }

  return {
    error: "UnknownError",
    message: "An unknown error occurred",
    details: error,
  }
}

// Parse OpenAI API responses that might be HTML or JSON
export async function parseOpenAIResponse(response: Response): Promise<{
  isJson: boolean
  data: any
  status: number
  headers: Record<string, string>
}> {
  const text = await response.text()
  const headers = Object.fromEntries([...response.headers.entries()])

  try {
    const json = JSON.parse(text)
    return {
      isJson: true,
      data: json,
      status: response.status,
      headers,
    }
  } catch (e) {
    // Not JSON, likely HTML error page
    return {
      isJson: false,
      data: text.substring(0, 1000), // Truncate long HTML
      status: response.status,
      headers,
    }
  }
}
