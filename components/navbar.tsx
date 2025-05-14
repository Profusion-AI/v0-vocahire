import Link from "next/link"
import { Button } from "@/components/ui/button"

import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Import dropdown components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import avatar components

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === "development";

  return (
    <header className="border-b bg-white dark:bg-gray-950"> {/* Added background color */}
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-gray-900 dark:text-white"> {/* Styled logo */}
            VocaHire Coach
          </Link>
          <nav className="hidden md:flex gap-6">
            {session && ( // Show navigation links only when logged in
              <>
                <Link href="/prepare" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"> {/* Styled link */}
                  Prepare
                </Link>
                <Link href="/interview" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"> {/* Styled link */}
                  Interview
                </Link>
                <Link href="/feedback" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"> {/* Styled link */}
                  Feedback
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"> {/* Styled link */}
                  Profile
                </Link>
              </>
            )}

            {/* Only show diagnostics link in development */}
            {isDev && (
              <Link href="/diagnostics" className="text-sm font-medium text-amber-600 hover:underline">
                Diagnostics
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!session && !isLoading && ( // Show sign-in/sign-up when not logged in
            <>
              <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"> {/* Styled button */}
                <Link href="/login">Sign In</Link> {/* Changed to /login */}
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"> {/* Styled button */}
                <Link href="/register">Sign Up</Link> {/* Changed to /register */}
              </Button>
            </>
          )}
          {session && ( // Show user dropdown when logged in
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                    <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
