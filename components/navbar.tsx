"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { useUser, SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"; // Import Clerk components and hooks

export function Navbar() {
  const { isLoaded: _isLoaded, isSignedIn, user: _user } = useUser(); // Use Clerk's useUser hook

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
            {isSignedIn && ( // Show navigation links only when logged in using Clerk's isSignedIn
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
          <SignedOut> {/* Show sign-in/sign-up when signed out using Clerk's SignedOut */}
            <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"> {/* Styled button */}
              <SignInButton>Sign In</SignInButton> {/* Use Clerk's SignInButton */}
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"> {/* Styled button */}
              <SignUpButton>Sign Up</SignUpButton> {/* Use Clerk's SignUpButton */}
            </Button>
          </SignedOut>
          <SignedIn> {/* Show user button when signed in using Clerk's SignedIn */}
            <UserButton afterSignOutUrl="/" /> {/* Use Clerk's UserButton */}
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
