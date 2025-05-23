"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AddCreditsPage() {
  const [credits, setCredits] = useState("10")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddCredits = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/add-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: parseFloat(credits) })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Credits Added",
          description: `Successfully added ${data.added} VocahireCredits. New balance: ${data.newBalance}`,
        })
      } else {
        throw new Error(data.error || "Failed to add credits")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add credits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add VocahireCredits (Development)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">VocahireCredits to Add</label>
            <Input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              min="1"
              step="1"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleAddCredits}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Adding..." : `Add ${credits} VocahireCredits`}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            This is a development tool. Remove in production.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}