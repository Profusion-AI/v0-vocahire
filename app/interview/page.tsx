import { Suspense } from "react"
import InterviewRoom from "@/components/InterviewRoom"
import { Skeleton } from "@/components/ui/skeleton"
import { requireAuth } from "@/lib/auth-utils"

interface InterviewPageProps {
  searchParams: {
    jobTitle?: string
  }
}

export default async function InterviewPage({ searchParams }: InterviewPageProps) {
  // Use our simplified auth check that works in preview
  const session = await requireAuth()

  const jobTitle = searchParams.jobTitle || "Software Engineer"

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mock Interview</h1>

      <div className="mb-4 text-center text-sm text-muted-foreground">
        <p>Logged in as: {session.user.name || session.user.email}</p>
      </div>

      <Suspense fallback={<InterviewSkeleton />}>
        <InterviewRoom jobTitle={jobTitle} />
      </Suspense>
    </div>
  )
}

function InterviewSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
  )
}
