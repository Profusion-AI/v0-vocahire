"use client"; // Required for useUser hook

import React from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button" // For consistent styling if needed

const Navbar = () => {
  const { isSignedIn, user } = useUser();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const firstInitial = firstName?.[0]?.toUpperCase() || '';
    const lastInitial = lastName?.[0]?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || 'U'; // Default to 'U' if no initials
  }

  return (
    <nav className="bg-white shadow-md fixed w-full z-10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-indigo-600 font-bold text-xl">
                VocaHire Coach
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="/#home" // Ensure these are valid anchor links on the landing page
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </a>
              <a
                href="/#simulation"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Simulation
              </a>
              <a
                href="/#feedback"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Feedback
              </a>
              <a
                href="/#pricing"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {isSignedIn ? (
              <Link href="/profile">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || "User"} />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" style={{ minWidth: 90 }}>
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" style={{ minWidth: 110 }}>
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>
          {/* TODO: Add mobile menu button and functionality */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
