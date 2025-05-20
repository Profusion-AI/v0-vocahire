"use client";
import React, { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { TermsAgreement } from "@/components/terms-agreement";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }
  
  if (!isSignedIn) {
    router.replace("/login");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    );
  }
  
  // Wrap the TermsAgreement in Suspense to handle any client-side rendering issues
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <TermsAgreement />
      </Suspense>
      {children}
    </>
  );
}