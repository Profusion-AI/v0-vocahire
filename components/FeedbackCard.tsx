import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FeedbackCardProps {
  title: string
  description?: string
  content: string
  type?: "positive" | "improvement" | "neutral"
}

export function FeedbackCard({ title, description, content, type = "neutral" }: FeedbackCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {type && (
            <Badge variant={type === "positive" ? "default" : type === "improvement" ? "destructive" : "outline"}>
              {type === "positive" ? "Strength" : type === "improvement" ? "Improvement" : "Observation"}
            </Badge>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
    </Card>
  )
}
