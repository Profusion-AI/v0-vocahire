import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackCardProps {
  title: string
  content: string
  type: "positive" | "improvement" | "neutral"
}

export function FeedbackCard({ title, content, type }: FeedbackCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        type === "positive" && "border-green-200 dark:border-green-900",
        type === "improvement" && "border-amber-200 dark:border-amber-900",
        type === "neutral" && "border-blue-200 dark:border-blue-900",
      )}
    >
      <CardHeader
        className={cn(
          "py-3",
          type === "positive" && "bg-green-50 dark:bg-green-950",
          type === "improvement" && "bg-amber-50 dark:bg-amber-950",
          type === "neutral" && "bg-blue-50 dark:bg-blue-950",
        )}
      >
        <CardTitle className="text-base flex items-center gap-2">
          {type === "positive" && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
          {type === "improvement" && <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          {type === "neutral" && <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{content}</CardContent>
    </Card>
  )
}
