import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackCard } from "@/components/feedback-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-utils"

export default async function FeedbackPage() {
  // Use our simplified auth check that works in preview
  const session = await requireAuth()

  // In a real implementation, you would fetch the feedback from your database
  // based on the user's most recent interview
  const mockFeedback = [
    {
      category: "Communication Skills",
      rating: "Good",
      feedback:
        "You articulated your thoughts clearly and provided specific examples to support your points. Your responses were well-structured, though occasionally you could be more concise. Continue practicing active listening and responding directly to the questions asked.",
    },
    {
      category: "Technical Knowledge",
      rating: "Excellent",
      feedback:
        "You demonstrated strong understanding of the technical concepts discussed and explained complex ideas in an accessible way. Your examples of past projects showed both depth and breadth of knowledge. Keep up with current trends to maintain this strength.",
    },
    {
      category: "Problem-Solving Approach",
      rating: "Good",
      feedback:
        "You approached problems methodically, breaking them down into manageable components. You asked clarifying questions when needed and considered multiple solutions. To improve, try to verbalize your thought process more clearly as you work through problems.",
    },
    {
      category: "Areas for Improvement",
      rating: "Consider",
      feedback:
        "Focus on being more concise in your responses while still providing sufficient detail. Practice quantifying your achievements with specific metrics. Work on maintaining consistent eye contact and reducing filler words like 'um' and 'like' in your speech.",
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Interview Feedback</h1>
      <p className="text-center text-muted-foreground mb-8">
        Here's your personalized feedback from your mock interview
      </p>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {mockFeedback.map((item, index) => (
          <FeedbackCard key={index} category={item.category} rating={item.rating} feedback={item.feedback} />
        ))}

        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Practice makes perfect! Schedule another mock interview to continue improving your skills.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/interview">Start New Interview</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/interview?jobTitle=Product Manager">Try Different Role</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
