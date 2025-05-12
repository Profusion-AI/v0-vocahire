import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">VocaHire Coach</h1>
        <p className="text-xl mb-8">AI-powered mock interviews to help you prepare for your next job</p>

        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-background rounded-md">
                <div className="text-3xl font-bold text-primary mb-2">1</div>
                <h3 className="font-medium mb-2">Prepare</h3>
                <p className="text-sm text-muted-foreground">Enter your resume details to personalize your interview</p>
              </div>
              <div className="p-4 bg-background rounded-md">
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <h3 className="font-medium mb-2">Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Complete a 10-minute mock interview with our AI interviewer
                </p>
              </div>
              <div className="p-4 bg-background rounded-md">
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <h3 className="font-medium mb-2">Improve</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized feedback to improve your interview skills
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/prepare">Start Preparing</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/test-interview-mock">Try Demo Interview</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
