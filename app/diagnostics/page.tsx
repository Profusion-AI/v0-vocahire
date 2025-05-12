import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Cpu, Terminal, Wifi } from "lucide-react"

export default function DiagnosticsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">VocaHire Diagnostics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="mr-2 h-5 w-5" /> OpenAI API Test
            </CardTitle>
            <CardDescription>Test basic OpenAI API connectivity and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Checks if your OpenAI API key is valid and can access the models endpoint. Helps identify basic API
              connectivity issues.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/api/test-openai">
                Run Test <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="mr-2 h-5 w-5" /> OpenAI Realtime Diagnostics
            </CardTitle>
            <CardDescription>Comprehensive realtime API diagnostics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Runs a complete diagnostic on OpenAI Realtime API access. Tests API keys, permissions, models, and session
              creation.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/diagnostics/openai">
                Run Diagnostics <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="mr-2 h-5 w-5" /> Basic Realtime Test
            </CardTitle>
            <CardDescription>Test realtime session creation with minimal payload</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Creates a minimal realtime session request to test API access. Try different models and voices to identify
              which ones work.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/diagnostics/realtime-basic">
                Run Basic Test <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" /> Debug Realtime API
            </CardTitle>
            <CardDescription>Advanced debugging for the Realtime API</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Makes a direct call to the debug-realtime endpoint. Shows detailed information about realtime access.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/api/debug-realtime">
                Debug Realtime <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="mr-2 h-5 w-5" /> API Routes List
            </CardTitle>
            <CardDescription>View all available API routes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Lists all API routes registered in the application. Useful for debugging and discovering available
              endpoints.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/api/debug/routes">
                View Routes <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="mr-2 h-5 w-5" /> Full Realtime Test UI
            </CardTitle>
            <CardDescription>Test complete realtime session with UI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              More comprehensive UI for testing realtime sessions. Tests session creation, updates, and WebSocket
              connections.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/diagnostics/realtime-test">
                Full Test UI <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
