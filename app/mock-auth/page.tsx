"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function MockAuthPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleMockLogin = () => {
    // Set a mock auth cookie for testing
    document.cookie = "mock_auth_session=true; path=/; max-age=3600"
    setIsAuthenticated(true)

    // Redirect after a short delay
    setTimeout(() => {
      router.push("/interview")
    }, 1500)
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mock Authentication</CardTitle>
          <CardDescription>This is a simplified authentication page for testing purposes only.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 rounded-md text-sm">
              <p>
                <strong>Note:</strong> This is only for development and testing. In production, we would use a real
                authentication provider.
              </p>
            </div>

            {isAuthenticated ? (
              <div className="p-3 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-md">
                <p>
                  <strong>Success!</strong> You are now authenticated. Redirecting to the interview page...
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMockLogin} className="w-full" disabled={isAuthenticated}>
            {isAuthenticated ? "Authenticated" : "Mock Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
