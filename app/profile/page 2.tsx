/**
 * TODO: Refactor this page to use Clerk authentication.
 * The previous NextAuth-based session logic is deprecated.
 * See https://clerk.com/docs/nextjs/get-session for Clerk usage.
 */
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// TODO: Refactor this page to use Clerk authentication.
// Remove all NextAuth imports and logic.

export default function ProfilePage() {
  // Example Clerk usage (uncomment and implement as needed):
  // import { useUser } from "@clerk/nextjs";
  // const { user } = useUser();

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p>This page is under construction. Clerk authentication will be used here.</p>
    </div>
  );
}
