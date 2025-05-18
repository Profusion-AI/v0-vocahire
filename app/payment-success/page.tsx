"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";

type User = {
  id: string;
  name?: string;
  email?: string;
  credits?: number;
  isPremium?: boolean;
};

export default function PaymentSuccessPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch("/api/user")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        if (isMounted) {
          setUser(data.user || data); // handle both {user: ...} and direct user object
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Unable to load user data. Please refresh the page.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 flex flex-col items-center gap-6 shadow-lg">
          <div className="text-green-600 text-3xl font-bold mb-2">Payment Successful!</div>
          <div className="text-muted-foreground text-center mb-4">
            Thank you for your purchase. Your account has been updated.
          </div>

          {loading && (
            <div className="w-full flex justify-center my-6">
              <span className="animate-pulse text-sm text-muted-foreground">Loading your updated account...</span>
            </div>
          )}

          {error && (
            <div className="w-full text-center text-destructive mb-2">{error}</div>
          )}

          {!loading && !error && user && (
            <div className="w-full flex flex-col items-center gap-2 mb-4">
              {user.isPremium ? (
                <div className="text-lg font-semibold text-primary">
                  Premium status activated!
                </div>
              ) : (
                <div className="text-lg font-semibold">
                  Credits: <span className="text-primary">{user.credits ?? 0}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Link href="/interview" className="w-full sm:w-auto">
              <Button className="w-full" variant="default">Continue to Interview</Button>
            </Link>
            <Link href="/profile" className="w-full sm:w-auto">
              <Button className="w-full" variant="outline">Go to Profile</Button>
            </Link>
          </div>
        </Card>
      </div>
    </AuthGuard>
  );
}