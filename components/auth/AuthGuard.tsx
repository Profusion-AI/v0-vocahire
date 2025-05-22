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

  // Show loading state while Clerk is initializing
  if (!isLoaded || !isMounted) {
    return <LoadingSpinner />;
  }
  
  // Redirect to login if user isn't signed in
  if (!isSignedIn) {
    // Only redirect on the client side
    if (isMounted) {
      // Use a more graceful approach - push rather than replace to avoid history issues
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