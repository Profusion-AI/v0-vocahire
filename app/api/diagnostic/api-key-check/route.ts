import { NextResponse } from "next/server"
import { getOpenAIApiKey, validateApiKey } from "@/lib/api-utils"

export async function POST() {
  try {
    console.log("=== API KEY CHECK ===")
    const apiKey = getOpenAIApiKey()

    // Basic validation
    const keyValidation = validateApiKey(apiKey)
    if (!keyValidation.isValid) {
      return NextResponse.json({
        valid: false,
        message: keyValidation.error || "API key is invalid",
      })
    }

    // Check if the key can access the models endpoint
    try {
      const modelsResponse = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!modelsResponse.ok) {
        return NextResponse.json({
          valid: false,
          message: `API key cannot access models: ${modelsResponse.status} ${modelsResponse.statusText}`,
        })
      }

      const modelsData = await modelsResponse.json()

      // Check for realtime models
      const realtimeModels = modelsData.data
        .filter((model: any) => model.id.includes("realtime"))
        .map((model: any) => model.id)

      if (realtimeModels.length === 0) {
        return NextResponse.json({
          valid: true,
          message:
            "API key is valid but no realtime models are available. Your account may not have access to the Realtime API.",
          models: modelsData.data.map((model: any) => model.id).slice(0, 10),
        })
      }

      // Try to create a minimal realtime session
      try {
        const sessionResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime",
          },
          body: JSON.stringify({
            model: realtimeModels[0],
          }),
        })

        if (!sessionResponse.ok) {
          const errorText = await sessionResponse.text()
          return NextResponse.json({
            valid: true,
            message: `API key is valid but cannot create realtime sessions: ${sessionResponse.status} - ${errorText.substring(0, 100)}`,
            models: realtimeModels,
          })
        }

        const sessionData = await sessionResponse.json()

        return NextResponse.json({
          valid: true,
          message: "API key is valid and can create realtime sessions",
          models: realtimeModels,
          permissions: {
            canAccessModels: true,
            canCreateRealtimeSessions: true,
            sessionId: sessionData.id,
          },
        })
      } catch (sessionError) {
        return NextResponse.json({
          valid: true,
          message: `API key is valid but error creating realtime session: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`,
          models: realtimeModels,
        })
      }
    } catch (modelsError) {
      return NextResponse.json({
        valid: false,
        message: `Error checking models: ${modelsError instanceof Error ? modelsError.message : String(modelsError)}`,
      })
    }
  } catch (error) {
    console.error("API key check error:", error)
    return NextResponse.json(
      {
        valid: false,
        message: `Error checking API key: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
