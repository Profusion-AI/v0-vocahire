"use client"

import { useState, useEffect } from "react"
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
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usage Dashboard</h1>
        <Button onClick={fetchUsageData} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Interview Sessions</CardTitle>
            <CardDescription>Total sessions today</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              usageData.reduce((sum, user) => sum + (user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0), 0)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Generations</CardTitle>
            <CardDescription>Total feedback generations today</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              usageData.reduce((sum, user) => sum + (user.usage[UsageType.FEEDBACK_GENERATION]?.daily || 0), 0)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Users with activity today</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              usageData.filter(
                (user) =>
                  (user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0) > 0 ||
                  (user.usage[UsageType.FEEDBACK_GENERATION]?.daily || 0) > 0,
              ).length
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>User Usage Details</CardTitle>
          <CardDescription>Detailed usage statistics by user</CardDescription>
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
