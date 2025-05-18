"use client";
import React from "react";
import { useAuth } from "@clerk/nextjs";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  console.log("AuthGuard: isLoaded", isLoaded, "isSignedIn", isSignedIn); // Client-side log

  if (!isLoaded) return <p>AuthGuard Loading...</p>; // Or null
  if (!isSignedIn) {
     // router.replace("/login") // Client-side redirect, might not run at build time
     console.log("AuthGuard: Not signed in, would redirect client-side.");
     return <p>Redirecting to sign in...</p>; // Placeholder for build
  }
  // For now, skip TermsAgreement to isolate the useUser/useAuth issue
  return <>{children}</>;
}