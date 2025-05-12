import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getGlobalUsage } from "@/lib/usage-tracking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminUsagePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Check if user is an admin (you would need to add an isAdmin field to your User model)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })

  // This is a simple check - in production, you'd want a proper role system
  const adminEmails = ["admin@example.com"] // Replace with actual admin emails
  const isAdmin = user && adminEmails.includes(user.email || "")

  if (!isAdmin) {
    redirect("/")
  }

  // Get global usage statistics
  const globalUsage = await getGlobalUsage()

  // Get top users by interview count
  const topUsersByInterviews = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          interviews: true,
        },
      },
    },
    orderBy: {
      interviews: {
        _count: "desc",
      },
    },
    take: 10,
  })

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Usage Statistics</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Interviews</CardTitle>
            <CardDescription>Interviews conducted today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.interviews.daily}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Interviews</CardTitle>
            <CardDescription>Interviews conducted this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.interviews.monthly}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Interviews</CardTitle>
            <CardDescription>All-time interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.interviews.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Feedback</CardTitle>
            <CardDescription>Feedback generated today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.feedback.daily}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Feedback</CardTitle>
            <CardDescription>Feedback generated this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.feedback.monthly}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Feedback</CardTitle>
            <CardDescription>All-time feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.feedback.total}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Users by Interview Count</CardTitle>
          <CardDescription>Users who have conducted the most interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Interviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsersByInterviews.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user._count.interviews}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
