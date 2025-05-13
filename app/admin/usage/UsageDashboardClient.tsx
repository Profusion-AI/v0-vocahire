"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertCircle } from "lucide-react";
import type { TopUser } from "./page"; // Import the TopUser type

// Define UsageType enum locally or import if defined elsewhere
// This should match the one used in your API and database
export enum UsageType {
  INTERVIEW_SESSION = "INTERVIEW_SESSION",
  FEEDBACK_GENERATION = "FEEDBACK_GENERATION",
  // Add other usage types as needed
}

export interface UsageRecord {
  daily: number;
  monthly: number; // Or any other relevant period
}

export interface UserUsage {
  [key: string]: UsageRecord | undefined; // Allow dynamic keys for UsageType
}

export interface UsageData {
  userId: string;
  email: string | null; // Assuming email can be null
  usage: UserUsage;
}

interface UsageDashboardClientProps {
  topUsersByInterviews: TopUser[];
  initialUsageStats: UsageData[]; // Renamed for clarity
}

export function UsageDashboardClient({
  topUsersByInterviews,
  initialUsageStats,
}: UsageDashboardClientProps) {
  const [usageStats, setUsageStats] = useState<UsageData[]>(initialUsageStats);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/usage");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch usage data");
      }
      const data: UsageData[] = await response.json();
      setUsageStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Failed to fetch usage data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on initial load if initialUsageStats is empty,
  // or to allow refresh even if initial data was provided.
  useEffect(() => {
    if (initialUsageStats.length === 0) {
      fetchUsageData();
    }
  }, [fetchUsageData, initialUsageStats.length]);

  const totalInterviewSessions = usageStats.reduce(
    (sum, user) => sum + (user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0),
    0,
  );
  const totalFeedbackGenerations = usageStats.reduce(
    (sum, user) => sum + (user.usage[UsageType.FEEDBACK_GENERATION]?.daily || 0),
    0,
  );
  const activeUsersCount = usageStats.filter(
    (user) =>
      (user.usage[UsageType.INTERVIEW_SESSION]?.daily || 0) > 0 ||
      (user.usage[UsageType.FEEDBACK_GENERATION]?.daily || 0) > 0,
  ).length;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Usage Dashboard</h1>
        <Button
          onClick={fetchUsageData}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Interview Sessions</CardTitle>
            <CardDescription>Total sessions today</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading && initialUsageStats.length === 0 ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
              totalInterviewSessions
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Generations</CardTitle>
            <CardDescription>Total feedback generations today</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading && initialUsageStats.length === 0 ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
              totalFeedbackGenerations
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Users with activity today</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading && initialUsageStats.length === 0 ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
              activeUsersCount
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Top Users by Interviews</CardTitle>
          <CardDescription>
            Users with the highest number of interviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topUsersByInterviews.length > 0 ? (
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
                    <TableCell className="font-medium">
                      {user.name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
<TableCell className="text-right">
  {user._count.interviewSessions}
</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-gray-500">No user data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
