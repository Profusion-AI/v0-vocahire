"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const _router = useRouter();
  
  useEffect(() => {
    // Redirect to Clerk's custom domain for registration
    // Using the correct 'redirect_url' parameter (not 'afterSignUpUrl')
    window.location.href = "https://accounts.vocahire.com/sign-up?redirect_url=" + 
      encodeURIComponent(window.location.origin + "/interview");
  }, []);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <p className="text-center text-gray-500">Redirecting to secure registration...</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
