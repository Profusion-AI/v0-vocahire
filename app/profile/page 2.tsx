import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (!session?.user?.email) {
    throw new Error('User session or user email is missing')
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  }) as unknown as {
    id: string
    name: string | null
    email: string | null
    image: string | null
    credits: number
    createdAt: Date
    interviews: Array<{
      id: string
      createdAt: Date
      duration: number | null
      feedback: any
    }>
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback>
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Credits: {user.credits}</Badge>
              <Badge variant="outline">Member since {new Date(user.createdAt).toLocaleDateString()}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Your most recent interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {user.interviews.length > 0 ? (
              <ul className="space-y-4">
            {(user.interviews as Array<{
              id: string
              createdAt: Date
              duration: number | null
              feedback: any
            }>).map((interview) => (
              <li key={interview.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Interview on {new Date(interview.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {interview.duration ? `${Math.round(interview.duration / 60)} minutes` : "N/A"}
                    </p>
                  </div>
                  <Badge>{interview.feedback ? "Completed" : "Pending"}</Badge>
                </div>
              </li>
            ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">You haven't completed any interviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
