import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getUserUsageStats, UsageType } from "@/lib/usage-tracking"

// Mock function to get all users - replace with your actual implementation
async function getAllUsers() {
  // In a real app, you would fetch this from your database
  return [
    { id: "user1", email: "user1@example.com" },
    { id: "user2", email: "user2@example.com" },
    { id: "user3", email: "user3@example.com" },
  ]
}

export default async function AdminUsagePage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session || !session.user?.email) {
    redirect("/")
  }

  // This is a simplified check - in a real app, you'd check for admin role in your database
  const isAdmin = session.user.email === "admin@example.com"
  if (!isAdmin) {
    redirect("/")
  }

  const users = await getAllUsers()

  // Get usage stats for all users
  const usageStats = await Promise.all(
    users.map(async (user) => {
      const stats = await getUserUsageStats(user.id)
      return {
        ...user,
        stats,
      }
    }),
  )

  // Calculate totals
  const totalDailyInterviews = usageStats.reduce(
    (sum, user) => sum + (user.stats.daily[UsageType.INTERVIEW_SESSION] || 0),
    0,
  )
  const totalMonthlyInterviews = usageStats.reduce(
    (sum, user) => sum + (user.stats.monthly[UsageType.INTERVIEW_SESSION] || 0),
    0,
  )
  const totalDailyFeedback = usageStats.reduce(
    (sum, user) => sum + (user.stats.daily[UsageType.FEEDBACK_GENERATION] || 0),
    0,
  )
  const totalMonthlyFeedback = usageStats.reduce(
    (sum, user) => sum + (user.stats.monthly[UsageType.FEEDBACK_GENERATION] || 0),
    0,
  )
  const totalDailyTokens = usageStats.reduce((sum, user) => sum + (user.stats.daily[UsageType.TOKEN_USAGE] || 0), 0)
  const totalMonthlyTokens = usageStats.reduce((sum, user) => sum + (user.stats.monthly[UsageType.TOKEN_USAGE] || 0), 0)

  // Estimate costs (these are rough estimates)
  const estimatedDailyCost = totalDailyTokens * 0.00001 + totalDailyInterviews * 0.05
  const estimatedMonthlyCost = totalMonthlyTokens * 0.00001 + totalMonthlyInterviews * 0.05

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Usage Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDailyInterviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMonthlyInterviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Est. Daily Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedDailyCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Est. Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedMonthlyCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Usage</CardTitle>
          <CardDescription>Detailed usage statistics by user</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Usage statistics for all users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Daily Interviews</TableHead>
                <TableHead>Monthly Interviews</TableHead>
                <TableHead>Daily Feedback</TableHead>
                <TableHead>Monthly Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageStats.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.stats.tier}</TableCell>
                  <TableCell>{user.stats.daily[UsageType.INTERVIEW_SESSION] || 0}</TableCell>
                  <TableCell>{user.stats.monthly[UsageType.INTERVIEW_SESSION] || 0}</TableCell>
                  <TableCell>{user.stats.daily[UsageType.FEEDBACK_GENERATION] || 0}</TableCell>
                  <TableCell>{user.stats.monthly[UsageType.FEEDBACK_GENERATION] || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
