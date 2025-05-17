import React from "react";

/**
 * Provides a centered layout with a responsive gradient background for interview-related pages.
 *
 * Wraps page content in a visually consistent container with maximum width and padding, suitable for use on `/prepare`, `/interview`, and `/feedback` routes.
 *
 * @param children - The React nodes to display within the layout.
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