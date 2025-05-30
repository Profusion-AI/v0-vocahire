// TODO: Implement Clerk-based admin authentication here.
// import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define type for user data with usage counts
type UserWithUsage = {
  id: string;
  email: string | null;
  credits: number;
  role: string; // Assuming role is a string, adjust if it's an enum
  _count: {
    interviewSessions: number;
    feedbacks: number;
  };
};

// Define type for user data after transformation for the UI
type TransformedUserWithUsage = {
  id: string;
  email: string | null;
  usageCount: number;
  credits: number;
  role: string;
  status: "active" | "inactive";
  lastUsed: Date;
};

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

/**
 * Fetches user data with usage statistics from the database.
 * @returns A promise that resolves to an array of users with their usage details.
 */
async function getUsersWithUsage(): Promise<TransformedUserWithUsage[]> {
  const { prisma } = await import("@/lib/prisma");
  
  // Get all users with their interview session counts
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      credits: true,
      role: true,
      _count: {
        select: {
          interviewSessions: true,
          feedbacks: true,
        },
      },
    },
  });

  // Transform the data for the UI
  return users.map((user: UserWithUsage) => ({
    id: user.id,
    email: user.email || "No email",
    usageCount: user._count.interviewSessions + user._count.feedbacks,
    credits: user.credits,
    role: user.role,
    status: Number(user.credits) > 0 ? "active" : "inactive",
    // Get last activity from most recent interview or feedback
    lastUsed: new Date(), // TODO: Add last activity tracking to schema
  }));
}

export default async function AdminUsersPage() {
  // TODO: Implement Clerk-based admin authentication and admin check here.
  // Example: Use Clerk's server-side helpers to verify admin status and redirect if unauthorized.

  const users: TransformedUserWithUsage[] = await getUsersWithUsage()

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User API Usage Dashboard</CardTitle>
          <CardDescription>Monitor and manage user access to the OpenAI API</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>List of users and their API usage</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Total Usage</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: TransformedUserWithUsage) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.usageCount} requests</TableCell>
                  <TableCell>{Number(user.credits).toFixed(2)} VocahireCredits</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage Summary</CardTitle>
          <CardDescription>Overall API usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-gray-500">Total Requests</h4>
              <p className="text-2xl font-bold">{users.reduce((sum, user) => sum + user.usageCount, 0)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-gray-500">Active Users</h4>
              <p className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-gray-500">Est. Monthly Cost</h4>
              <p className="text-2xl font-bold">
                ${(users.reduce((sum, user) => sum + user.usageCount, 0) * 0.03).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
