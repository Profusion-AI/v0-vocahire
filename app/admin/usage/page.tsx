"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { UsageType } from "@/lib/usage-tracking"

interface UserUsage {
  userId: string
  email?: string
  name?: string
  usage: {
    [key in UsageType]: {
      daily: number
      monthly: number
      limit: number
    }
  }
}

export default function AdminUsagePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usageData, setUsageData] = useState<UserUsage[]>([])

  const fetchUsageData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/usage")

      if (!response.ok) {
        throw new Error(`Failed to fetch usage data: ${response.status}`)
      }

      const data = await response.json()
      setUsageData(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageData()
  }, [])

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
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          ) : usageData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No usage data available</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Interviews (Today/Month)</TableHead>
                  <TableHead>Feedback (Today/Month)</TableHead>
                  <TableHead>Limit Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">
                      {user.name || user.email || user.userId.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0} /{" "}
                      {user.usage[UsageType.INTERVIEW_SESSION]?.monthly || 0}
                    </TableCell>
                    <TableCell>
                      {user.usage[UsageType.FEEDBACK_GENERATION]?.daily || 0} /{" "}
                      {user.usage[UsageType.FEEDBACK_GENERATION]?.monthly || 0}
                    </TableCell>
                    <TableCell>
                      {(user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0) >=
                      (user.usage[UsageType.INTERVIEW_SESSION]?.limit || 0) ? (
                        <span className="text-red-500 font-medium">Limit Reached</span>
                      ) : (
                        <span className="text-green-500">
                          {user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0}/
                          {user.usage[UsageType.INTERVIEW_SESSION]?.limit || 0}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
