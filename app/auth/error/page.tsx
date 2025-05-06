"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An error occurred during authentication")

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setErrorMessage("You do not have access to this resource.")
          break
        case "Verification":
          setErrorMessage("The verification token has expired or has already been used.")
          break
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth sign-in process.")
          break
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.")
          break
        case "OAuthCreateAccount":
          setErrorMessage("Error creating OAuth account.")
          break
        case "EmailCreateAccount":
          setErrorMessage("Error creating email account.")
          break
        case "Callback":
          setErrorMessage("Error in the OAuth callback.")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("Email already in use with different provider.")
          break
        case "EmailSignin":
          setErrorMessage("Error sending email sign-in link.")
          break
        case "CredentialsSignin":
          setErrorMessage("Invalid credentials.")
          break
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page.")
          break
        default:
          setErrorMessage(`An authentication error occurred: ${error}`)
      }
    }
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription>There was a problem with your authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex space-x-4 w-full">
            <Link href="/login" className="w-full">
              <Button variant="default" className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
