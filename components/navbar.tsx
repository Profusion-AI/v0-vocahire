import Link from "next/link"
import { UserProfile } from "@/components/auth/user-profile"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">VocaHire</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link href="/prepare" className="text-sm font-medium transition-colors hover:text-primary">
              Prepare
            </Link>
            <Link href="/interview" className="text-sm font-medium transition-colors hover:text-primary">
              Interview
            </Link>
            <Link href="/feedback" className="text-sm font-medium transition-colors hover:text-primary">
              Feedback
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
