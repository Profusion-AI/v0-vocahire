"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}

export default Providers;