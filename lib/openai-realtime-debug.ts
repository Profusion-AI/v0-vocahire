/**
 * Enhanced debugging tools for OpenAI Realtime API
 */
import { getOpenAIApiKey } from "./api-utils"

interface OpenAIErrorResponse {
  error?: {
    message?: string
    type?: string
    code?: string
  }
}

export interface DiagnosticResult {
  stage: string
  success: boolean
  message: string
  details?: any
  error?: any
  raw?: string
}

/**
 * Runs a comprehensive diagnostic on OpenAI Realtime API access
 */
export async function runOpenAIRealtimeDiagnostic(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = []
  const apiKey = getOpenAIApiKey()

  // Check if API key exists
  if (!apiKey) {
    results.push({
      stage: "API Key Check",
      success: false,
      message: "No OpenAI API key found in environment variables",
    })
    return results
  }

  results.push({
    stage: "API Key Check",
    success: true,
    message: `API key found (starts with ${apiKey.substring(0, 5)}...)`,
  })

  // Verify API key format
  if (!apiKey.startsWith("sk-") || apiKey.length < 30) {
    results.push({
      stage: "API Key Format",
      success: false,
      message: "API key has invalid format (should start with sk- and be at least 30 characters long)",
    })
  } else {
    results.push({
      stage: "API Key Format",
      success: true,
      message: "API key format appears valid",
    })
  }

  // Check general API access (models endpoint)
  try {
    const modelsResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    const modelsRaw = await modelsResponse.text()
    let modelsData: any
    let isJson = false

    try {
      modelsData = JSON.parse(modelsRaw)
      isJson = true
    } catch (e) {
      modelsData = null
    }

    if (modelsResponse.ok && isJson) {
      const modelCount = modelsData?.data?.length || 0
      results.push({
        stage: "General API Access",
        success: true,
        message: `Successfully accessed OpenAI API. Found ${modelCount} models.`,
        details: {
          status: modelsResponse.status,
          modelCount,
        },
      })

      // Check for realtime models specifically
      const allModels = modelsData?.data?.map((m: any) => m.id) || []
      const realtimeModels = allModels.filter((m: string) => m.includes("realtime"))

      if (realtimeModels.length > 0) {
        results.push({
          stage: "Realtime Models",
          success: true,
          message: `Found ${realtimeModels.length} realtime models`,
          details: {
            models: realtimeModels,
          },
        })
      } else {
        results.push({
          stage: "Realtime Models",
          success: false,
          message: "No realtime models found in available models",
          details: {
            sample: allModels.slice(0, 10),
          },
        })
      }
    } else {
      results.push({
        stage: "General API Access",
        success: false,
        message: `Failed to access OpenAI API: ${modelsResponse.status} ${modelsResponse.statusText}`,
        details: {
          status: modelsResponse.status,
          isJson,
          error: isJson ? modelsData?.error : "Non-JSON response",
        },
        raw: modelsRaw.substring(0, 1000),
      })
    }
  } catch (error) {
    results.push({
      stage: "General API Access",
      success: false,
      message: `Error accessing OpenAI API: ${error instanceof Error ? error.message : String(error)}`,
      error,
    })
  }

  // Test Realtime API endpoint specifically
  try {
    const realtimeResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview",
        voice: "alloy",
      }),
    })

    const realtimeRaw = await realtimeResponse.text()
    let realtimeData: any
    let isJson = false

    try {
      realtimeData = JSON.parse(realtimeRaw)
      isJson = true
    } catch (e) {
      realtimeData = null
    }

    if (realtimeResponse.ok && isJson) {
      results.push({
        stage: "Realtime API Access",
        success: true,
        message: "Successfully created a realtime session",
        details: {
          sessionId: realtimeData?.id,
          status: realtimeResponse.status,
        },
      })
    } else {
      // Check response headers for clues
      const headers = Object.fromEntries([...realtimeResponse.headers.entries()])

      // Look for specific error patterns
      let errorType = "unknown"
      let errorDetails = ""

      if (!isJson) {
        errorType = "non-json"

        // Common HTML response patterns
        if (realtimeRaw.includes("Not Found") || realtimeResponse.status === 404) {
          errorType = "endpoint-not-found"
          errorDetails = "The realtime API endpoint might not exist or your account doesn't have access to it"
        } else if (realtimeRaw.includes("Unauthorized") || realtimeResponse.status === 401) {
          errorType = "unauthorized"
          errorDetails = "Your API key is invalid or expired"
        } else if (realtimeRaw.includes("Permission denied") || realtimeResponse.status === 403) {
          errorType = "permission-denied"
          errorDetails = "Your account doesn't have permission to use the Realtime API"
        }
      } else {
        // JSON error responses
        const error = realtimeData?.error as OpenAIErrorResponse["error"]

        if (error) {
          errorType = error.type || error.code || "api-error"
          errorDetails = error.message || JSON.stringify(error)
        }
      }

      results.push({
        stage: "Realtime API Access",
        success: false,
        message: `Failed to create realtime session: ${errorType}`,
        details: {
          status: realtimeResponse.status,
          errorType,
          errorDetails,
          headers,
          isJson,
        },
        raw: realtimeRaw.substring(0, 1000),
      })
    }
  } catch (error) {
    results.push({
      stage: "Realtime API Access",
      success: false,
      message: `Error creating realtime session: ${error instanceof Error ? error.message : String(error)}`,
      error,
    })
  }

  // Test with each model in fallback list
  const modelsToTest = [
    "gpt-4o-mini-realtime-preview",
    "gpt-4o-mini-realtime",
    "gpt-4o-realtime-preview",
    "gpt-4o-realtime",
  ]

  const modelResults: DiagnosticResult[] = []

  for (const model of modelsToTest) {
    try {
      const modelResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "realtime",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          voice: "alloy",
        }),
      })

      const modelRaw = await modelResponse.text()
      let modelData: any
      let isJson = false

      try {
        modelData = JSON.parse(modelRaw)
        isJson = true
      } catch (e) {
        modelData = null
      }

      modelResults.push({
        stage: `Model Test: ${model}`,
        success: modelResponse.ok && isJson,
        message:
          modelResponse.ok && isJson
            ? `Successfully created session with model: ${model}`
            : `Failed to create session with model: ${model}`,
        details: {
          status: modelResponse.status,
          isJson,
          error: isJson && !modelResponse.ok ? modelData?.error : isJson ? null : "Non-JSON response",
        },
        raw: isJson ? null : modelRaw.substring(0, 500),
      })
    } catch (error) {
      modelResults.push({
        stage: `Model Test: ${model}`,
        success: false,
        message: `Error testing model ${model}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      })
    }
  }

  results.push(...modelResults)

  return results
}

/**
 * Try to create a realtime session with multiple model attempts
 */
export async function createRealtimeSessionWithFallback(
  apiKey: string,
  modelsToTry: string[],
): Promise<{
  success: boolean
  sessionData?: any
  model?: string
  error?: string
  status?: number
  raw?: string
}> {
  let lastError = ""
  let lastStatus = 0
  let lastRaw = ""

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting to create session with model: ${model}`)

      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "realtime",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          voice: "alloy",
        }),
      })

      const raw = await response.text()

      // Log full response for debugging
      console.log(`Model ${model} response status: ${response.status}`)
      console.log(`Model ${model} response (first 200 chars): ${raw.substring(0, 200)}`)

      // Try to parse as JSON
      try {
        const data = JSON.parse(raw)

        if (response.ok) {
          console.log(`Successfully created session with model: ${model}`)
          return {
            success: true,
            sessionData: data,
            model,
          }
        } else {
          lastError = data.error?.message || JSON.stringify(data.error) || `Status ${response.status}`
          lastStatus = response.status
          lastRaw = raw
        }
      } catch (e) {
        // Not JSON - likely HTML error
        lastError = `Non-JSON response (HTML): Status ${response.status}`
        lastStatus = response.status
        lastRaw = raw
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }

  // If we get here, all models failed
  return {
    success: false,
    error: lastError,
    status: lastStatus,
    raw: lastRaw,
  }
}
