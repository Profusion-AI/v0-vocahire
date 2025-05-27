"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Dynamically import the TermsAgreement component to avoid hydration issues
const TermsAgreement = dynamic(
  () => import('@/components/terms-agreement').then((mod) => mod.TermsAgreement),
  { ssr: false, loading: () => null }
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Track component mounting for client-side only code
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // DEV MODE: Skip auth entirely
  if (process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true') {
    return (
      <>
        <div className="fixed top-2 left-2 bg-yellow-400 text-black px-2 py-1 text-xs rounded z-50">
          DEV MODE: Auth Bypassed
        </div>
        {children}
      </>
    );
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded || !isMounted) {
    return <LoadingSpinner />;
  }
  
  // Redirect to login if user isn't signed in
  if (!isSignedIn) {
    // DEV MODE: Show quick login hint
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-gray-600">Not signed in</p>
          <div className="text-sm text-gray-500 text-center">
            <p>Quick dev login: test@clerk.dev / clerk123</p>
            <p>Or set DEV_SKIP_AUTH=true in .env.local</p>
          </div>
          <button 
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      );
    }
    
    // Only redirect on the client side
    if (isMounted) {
      router.push("/login");
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    );
  }
  
  // Render the children with TermsAgreement once authenticated
  return (
    <>
      {/* 
        Dynamic import with ssr: false to avoid hydration mismatches.
        This also prevents localStorage access during SSR.
      */}
      <TermsAgreement />
      {children}
    </>
  );
}