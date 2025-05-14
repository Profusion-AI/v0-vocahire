import React from 'react'
import Link from 'next/link' // Used for actual page navigation

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full z-10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-indigo-600 font-bold text-xl">VocaHire Coach</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="#home"
                className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </a>
              <a
                href="#simulation"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Interview Simulation
              </a>
              <a
                href="#feedback"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Feedback
              </a>
              <a
                href="#pricing"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {/* Login button */}
            <Link href="/login">
              <button
                type="button"
                className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium transition"
                style={{ minWidth: 90 }}
              >
                Login
              </button>
            </Link>
            {/* Sign Up button */}
            <Link href="/register">
              <button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                style={{ minWidth: 110 }}
              >
                Sign Up Free
              </button>
            </Link>
          </div>
          {/* TODO: Add mobile menu button and functionality */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
