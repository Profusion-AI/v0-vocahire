"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabaseClient"
import { CheckCircle, XCircle } from "lucide-react"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const router = useRouter()

  const setupDatabase = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // SQL script to create the interviews table
      const { error } = await supabase.rpc("setup_vocahire_tables")

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Database tables created successfully!",
      })
    } catch (error: any) {
      console.error("Setup error:", error)
      setResult({
        success: false,
        message: `Error setting up database: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">VocaHire Database Setup</CardTitle>
          <CardDescription>
            Run this setup to create the necessary database tables for your VocaHire application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
            <h3 className="font-medium mb-2">This will create the following tables:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <code>interviews</code> - Stores interview sessions, transcripts, and feedback
              </li>
            </ul>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={setupDatabase} disabled={isLoading} className="w-full">
            {isLoading ? "Setting up database..." : "Run Setup"}
          </Button>
          {result?.success && (
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
