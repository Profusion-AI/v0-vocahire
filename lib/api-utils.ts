/**
 * Utility functions for API validation and error handling
 */

// Get the OpenAI API key from environment variables
export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPENAI_KEY
}

/**
 * Validates an OpenAI API key format
 */
export function validateApiKey(apiKey?: string): { isValid: boolean; error?: string } {
  if (!apiKey) {
    return { isValid: false, error: "API key is missing" }
  }

  // Basic format check (OpenAI keys start with "sk-")
  if (!apiKey.startsWith("sk-")) {
    return { isValid: false, error: "API key has invalid format (should start with 'sk-')" }
  }

  // Length check (OpenAI keys are typically long)
  if (apiKey.length < 20) {
    return { isValid: false, error: "API key is too short" }
  }

  return { isValid: true }
}

/**
 * Formats API errors for consistent response
 */
export function formatApiError(error: any): { error: string; details?: any } {
  console.error("API Error:", error)

  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack,
    }
  }

  return {
    error: String(error),
  }
}

/**
 * Safely parses an OpenAI API response
 */
export async function parseOpenAIResponse(response: Response): Promise<{ isJson: boolean; data: any }> {
  try {
    // First get the response as text
    const text = await response.text()

    // Try to parse as JSON
    try {
      const json = JSON.parse(text)
      return { isJson: true, data: json }
    } catch (_e) {
      // Not JSON, return as text
      return { isJson: false, data: text }
    }
  } catch (error) {
    console.error("Error parsing OpenAI response:", error)
    return { isJson: false, data: `Error parsing response: ${error}` }
  }
}
