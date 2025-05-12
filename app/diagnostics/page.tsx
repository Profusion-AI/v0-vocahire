"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function DiagnosticsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">API Diagnostics Dashboard</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="realtime">Realtime API</TabsTrigger>
          <TabsTrigger value="routes">API Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Diagnostics Overview</CardTitle>
              <CardDescription>Use these tools to diagnose API connectivity and configuration issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Select a tab above to run specific diagnostics:</p>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">OpenAI API</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test basic OpenAI API connectivity and permissions
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("openai")}>
                    Run OpenAI Tests
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">Realtime API</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test OpenAI Realtime API access and available models
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("realtime")}>
                    Run Realtime Tests
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">API Routes</h3>
                  <p className="text-sm text-muted-foreground mb-4">List all available API routes in the application</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("routes")}>
                    View API Routes
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">Session Test</h3>
                  <p className="text-sm text-muted-foreground mb-4">Test session creation and WebRTC exchange</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/diagnostics/session-test">Go to Session Test</Link>
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <CardTitle>OpenAI API Test</CardTitle>
              <CardDescription>Test basic connectivity to the OpenAI API</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe src="/api/test-openai" className="w-full h-[500px] border rounded-md" title="OpenAI API Test" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <iframe
            src="/diagnostics/realtime-test"
            className="w-full h-[600px] border rounded-md"
            title="Realtime API Test"
          />
        </TabsContent>

        <TabsContent value="routes">
          <iframe src="/diagnostics/routes" className="w-full h-[600px] border rounded-md" title="API Routes" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
