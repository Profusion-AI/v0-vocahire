"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiRoutesPage() {
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchRoutes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug/routes")
      const data = await response.json()

      if (data.routes) {
        setRoutes(data.routes)
      } else {
        setError("Invalid response format")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>API Routes Diagnostic</CardTitle>
          <CardDescription>Lists all active API routes in the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={fetchRoutes} disabled={loading} className="mb-4">
              {loading ? "Loading..." : "Refresh Routes"}
            </Button>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

            {routes.length > 0 ? (
              <div className="space-y-2">
                <div className="font-semibold">Found {routes.length} API routes:</div>
                <ul className="space-y-1 pl-2">
                  {routes.map((route, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{route}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : !loading && !error ? (
              <div className="text-amber-600">No API routes found</div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">This tool helps identify potential route conflicts</CardFooter>
      </Card>
    </div>
  )
}
