"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { TermsAgreement } from "@/components/terms-agreement";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    // Loading state
    return null;
  }

  if (!isSignedIn) {
    return null;
  }

  // TermsAgreement will show modal if needed, otherwise render children
  return (
    <>
      <TermsAgreement />
      {children}
    </>
  );
}