import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AuthForm } from "@/components/auth/auth-form"

export default async function LoginPage() {
  const supabase = createServerClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/prepare")
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <AuthForm />
    </div>
  )
}
