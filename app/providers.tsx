"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * Wraps child components with the Clerk authentication provider context.
 *
 * @param children - The React nodes to be rendered within the authentication context.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}

export default Providers;