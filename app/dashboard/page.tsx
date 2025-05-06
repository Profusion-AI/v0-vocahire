"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Database, Copy, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Interview {
  id: string
  created_at: string
  duration: number | null
  feedback: {
    summary: string
  } | null
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tableError, setTableError] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "SQL script copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const sqlScript = `-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transcript TEXT,
  feedback JSONB,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;

-- Create the trigger
CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the interviews table
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS select_own_interviews ON interviews;
DROP POLICY IF EXISTS insert_own_interviews ON interviews;
DROP POLICY IF EXISTS update_own_interviews ON interviews;
DROP POLICY IF EXISTS delete_own_interviews ON interviews;

-- Create RLS policies
CREATE POLICY select_own_interviews ON interviews
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY insert_own_interviews ON interviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own_interviews ON interviews
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY delete_own_interviews ON interviews
  FOR DELETE
  USING (auth.uid() = user_id);`

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        if (!user) return

        const { data, error } = await supabase.from("interviews").select("*").order("created_at", { ascending: false })

        if (error) {
          // Check if the error is about the missing table
          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            console.error("Interviews table does not exist:", error)
            setTableError(true)
            // Show empty interviews array
            setInterviews([])
          } else {
            throw error
          }
        } else {
          setInterviews(data || [])
        }
      } catch (error) {
        console.error("Error fetching interviews:", error)
        toast({
          title: "Error",
          description: "Failed to load interviews. Please try again.",
          variant: "destructive",
        })

        // For demo purposes, show some sample interviews
        setInterviews([])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchInterviews()
    }
  }, [toast, router, user])

  if (isLoading || loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // If the table doesn't exist, show setup instructions
  if (tableError) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Database Setup Required</h1>
        <p className="text-center text-gray-500 mb-8">Set up your database to start using VocaHire</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
            <CardDescription>
              The interviews table doesn't exist in your database. Follow the instructions below to create it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>One-time setup</AlertTitle>
              <AlertDescription>
                You need to run a SQL script to create the necessary database table for storing interview data.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="instructions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="sql">SQL Script</TabsTrigger>
              </TabsList>
              <TabsContent value="instructions" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Follow these steps:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to your Supabase dashboard</li>
                    <li>Select your project</li>
                    <li>Go to the SQL Editor (in the left sidebar)</li>
                    <li>Create a new query</li>
                    <li>Copy and paste the SQL script from the "SQL Script" tab</li>
                    <li>Run the script</li>
                    <li>Return to this page and refresh</li>
                  </ol>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(sqlScript)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy SQL"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://app.supabase.com", "_blank")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Supabase
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="sql">
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                    {sqlScript}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sqlScript)}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.refresh()}>Refresh Page</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Your Interview History</h1>
      <p className="text-center text-gray-500 mb-8">Review your past interviews and feedback</p>

      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push("/interview")}>Start New Interview</Button>
      </div>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500 mb-4">You haven't completed any interviews yet.</p>
            <Button onClick={() => router.push("/interview")}>Start Your First Interview</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {interviews.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <CardTitle>Interview Session</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interview.feedback ? (
                  <p className="line-clamp-2">{interview.feedback.summary}</p>
                ) : (
                  <p className="text-gray-500">No feedback available</p>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/feedback?id=${interview.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Feedback
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
