import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error")

  let errorMessage = "An unknown error occurred"

  if (error) {
    switch (error) {
      case "Configuration":
        errorMessage = "There is a problem with the server configuration."
        break
      case "AccessDenied":
        errorMessage = "You do not have access to this resource."
        break
      case "Verification":
        errorMessage = "The verification token has expired or has already been used."
        break
      case "OAuthSignin":
        errorMessage = "Error in the OAuth sign-in process."
        break
      case "OAuthCallback":
        errorMessage = "Error in the OAuth callback process."
        break
      case "OAuthCreateAccount":
        errorMessage = "Error creating OAuth account."
        break
      case "EmailCreateAccount":
        errorMessage = "Error creating email account."
        break
      case "Callback":
        errorMessage = "Error in the OAuth callback."
        break
      case "OAuthAccountNotLinked":
        errorMessage = "Email already in use with different provider."
        break
      case "EmailSignin":
        errorMessage = "Error sending email sign-in link."
        break
      case "CredentialsSignin":
        errorMessage = "Invalid credentials."
        break
      case "SessionRequired":
        errorMessage = "You must be signed in to access this page."
        break
      default:
        errorMessage = `An authentication error occurred: ${error}`
    }
  }

  return NextResponse.json({ error: errorMessage }, { status: 400 })
}
