import React from "react";

/**
 * SessionLayout provides a visually consistent, modern wrapper for all interview-related pages.
 * It applies a subtle gradient background, centers content, and ensures consistent padding and max-width.
 * Use this to wrap the main content of /prepare, /interview, and /feedback pages.
 */
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <div className="w-full max-w-3xl px-4 py-10 sm:px-8">
        {children}
      </div>
    </div>
  );
}