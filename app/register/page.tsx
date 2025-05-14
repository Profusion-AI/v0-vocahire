import { RegisterForm } from "@/components/auth/register-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>
        <RegisterForm />
        <div className="text-center mt-2">
          <span className="text-sm text-muted-foreground">Already a Vocahire user?</span>
          <a
            href="/login"
            className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium underline transition"
            style={{ fontSize: "1rem" }}
          >
            Log in here
          </a>
        </div>
      </div>
    </div>
  )
}
