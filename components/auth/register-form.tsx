"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Email/password sign up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Registration failed. Please try again.");
      } else {
        toast.success("Check your email for a confirmation link.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Supabase registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth sign up
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/profile", // or wherever you want to land after sign in
        },
      });
      if (error) {
        toast.error(error.message || "Google sign-in failed.");
      }
      // Supabase will redirect on success
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
      <div className="my-4 flex items-center">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-2 text-gray-500 text-sm">or</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>
      <Button
        type="button"
        className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        {isLoading ? "Redirecting..." : "Sign up with Google"}
      </Button>
    </div>
  );
}
