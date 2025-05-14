import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === "development"

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            VocaHire Coach
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/prepare" className="text-sm font-medium hover:underline">
              Prepare
            </Link>
            <Link href="/interview" className="text-sm font-medium hover:underline">
              Interview
            </Link>
            <Link href="/feedback" className="text-sm font-medium hover:underline">
              Feedback
            </Link>

            {/* Only show diagnostics link in development */}
            {isDev && (
              <Link href="/diagnostics" className="text-sm font-medium text-amber-600 hover:underline">
                Diagnostics
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/interview">Start Interview</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
