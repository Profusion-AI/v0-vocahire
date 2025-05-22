import { AlertTriangle, Wifi } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface FallbackMessageProps {
  reason: string
  onRetry: () => void
  onSwitchToText: () => void
  showFallbackMessage: boolean
}

export function FallbackMessage({ 
  reason, 
  onRetry, 
  onSwitchToText, 
  showFallbackMessage 
}: FallbackMessageProps) {
  if (!showFallbackMessage) return null

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex flex-col space-y-3">
          <div>
            <strong>Voice connection failed:</strong> {reason}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSwitchToText}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Continue with Text
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}