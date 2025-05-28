"use client"; // Required for useUser hook

import React from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Briefcase } from 'lucide-react' // Placeholder for fa-user-tie

const Hero = () => {
  const { isSignedIn } = useUser();
  return (
    <section id="home" className="pt-20 md:pt-28 lg:pt-32"> {/* Adjusted top padding to account for fixed navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Land your dream job with</span>
              <span className="block text-indigo-600">AI Interview Coaching</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Practice unlimited interview scenarios with our AI-powered coach. Get real-time feedback on your speaking style, answer content, and confidence. All in a safe, private environment.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              {isSignedIn ? (
                <>
                  <Link
                    href="/interview-v2"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Practice Interview
                  </Link>
                  <Link
                    href="/profile"
                    className="ml-3 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                  >
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <a
                    href="#simulation"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    See How It Works
                  </a>
                  <a
                    href="#pricing"
                    className="ml-3 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                  >
                    See Pricing
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                <div className="w-full h-64 bg-indigo-100 flex items-center justify-center">
                  <div className="text-center p-5">
                    <Briefcase className="text-indigo-500 mx-auto" size={64} strokeWidth={1.5} />
                    <p className="text-gray-700 mt-4">AI Interview Simulation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
