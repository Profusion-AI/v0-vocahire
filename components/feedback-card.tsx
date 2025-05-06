import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FeedbackCardProps {
  category: string
  rating: string
  feedback: string
}

export function FeedbackCard({ category, rating, feedback }: FeedbackCardProps) {
  const getBadgeVariant = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "satisfactory":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
      case "needs improvement":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "consider":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{category}</CardTitle>
          <Badge className={getBadgeVariant(rating)}>{rating}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p>{feedback}</p>
      </CardContent>
    </Card>
  )
}
