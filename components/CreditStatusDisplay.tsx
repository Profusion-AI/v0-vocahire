import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface CreditStatusDisplayProps {
  credits: number | null
  isPremium: boolean
  isLoading: boolean
  onUpgrade?: () => void
  onBuyCredits?: () => void
  canStartInterview: boolean
  onStartInterview: () => void
  isConnecting: boolean
}

export function CreditStatusDisplay({
  credits,
  isPremium,
  isLoading,
  onUpgrade,
  onBuyCredits,
  canStartInterview,
  onStartInterview,
  isConnecting
}: CreditStatusDisplayProps) {
  if (isLoading) {
    return <Skeleton className="h-8 w-48" />
  }

  if (isPremium) {
    return (
      <div className="flex items-center space-x-4">
        <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600">
          Premium User
        </Badge>
        <Button
          onClick={onStartInterview}
          disabled={!canStartInterview || isConnecting}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {isConnecting ? "Connecting..." : "Start Interview"}
        </Button>
      </div>
    )
  }

  if (credits && Number(credits) > 0) {
    return (
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="text-sm">
          {Number(credits)} Credit{Number(credits) !== 1 ? 's' : ''} Remaining
        </Badge>
        <Button
          onClick={onStartInterview}
          disabled={!canStartInterview || isConnecting}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {isConnecting ? "Connecting..." : "Start Interview"}
        </Button>
        {credits !== null && Number(credits) === 0 && typeof onBuyCredits === "function" && (
          <Button
            variant="outline"
            onClick={onBuyCredits}
            size="sm"
            className="mt-2"
          >
            Upgrade to Premium
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-muted-foreground">
        You need credits or a premium subscription to start an interview.
      </p>
      <div className="flex gap-2 justify-center">
        {typeof onUpgrade === "function" && (
          <Button onClick={onUpgrade} size="lg">
            Upgrade to Premium
          </Button>
        )}
        {typeof onBuyCredits === "function" && (
          <Button variant="outline" onClick={onBuyCredits} size="lg">
            Buy Credits
          </Button>
        )}
      </div>
    </div>
  )
}