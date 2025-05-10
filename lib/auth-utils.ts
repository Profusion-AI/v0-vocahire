import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Simple function to check if user is authenticated in preview environment
export async function getAuthSession() {
  try {
    // In a real implementation, we would use getServerSession from next-auth/next
    // But for preview, we'll use a simplified approach

    // Check for a mock auth cookie or session
    const mockAuthCookie = cookies().get("mock_auth_session")

    // For preview purposes, we'll consider the user authenticated if:
    // 1. We're in development/preview mode
    // 2. There's a mock auth cookie OR we want to bypass auth for testing
    const isPreview = process.env.NODE_ENV !== "production"
    const bypassAuthForPreview = true // Set to false to enforce auth in preview

    if (isPreview && (mockAuthCookie || bypassAuthForPreview)) {
      // Return a mock session for preview
      return {
        user: {
          id: "preview-user-id",
          name: "Preview User",
          email: "preview@example.com",
          image: null,
        },
      }
    }

    // If we're not in preview or bypass is disabled, try to get the real session
    // This would normally use getServerSession, but we'll skip it for now

    // If no session, return null
    return null
  } catch (error) {
    console.error("Auth check error:", error)
    return null
  }
}

// Helper to require authentication and redirect if not authenticated
export async function requireAuth() {
  const session = await getAuthSession()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return session
}
