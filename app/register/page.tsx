"use client";
import { SignUp } from "@clerk/nextjs";

/**
 * Renders a full-screen registration page with a centered sign-up form.
 *
 * Displays the {@link SignUp} component from Clerk within a responsive, vertically and horizontally centered container.
 */
export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <SignUp />
      </div>
    </div>
  );
}
