import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            VocaHire Coach
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/interview" className="text-sm font-medium hover:underline">
              Interview
            </Link>
            <Link href="/feedback" className="text-sm font-medium hover:underline">
              Feedback
            </Link>
            <Link href="/test-interview" className="text-sm font-medium hover:underline">
              Test Interview
            </Link>
            <Link href="/test-interview-mock" className="text-sm font-medium text-blue-600 hover:underline">
              Mock Test (No API)
            </Link>
            <Link href="/api-diagnostics" className="text-sm font-medium text-green-600 hover:underline">
              API Diagnostics
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/mock-auth">Mock Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/interview">Start Interview</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
