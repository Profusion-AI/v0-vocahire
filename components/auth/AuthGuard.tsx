"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { TermsAgreement } from "@/components/terms-agreement";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [router]);

  if (isAuthenticated === null) {
    // Loading state
    return null;
  }

  if (!isAuthenticated) {
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