import { Check, Loader2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ConnectionStep {
  id: string
  name: string
  status: "pending" | "in-progress" | "complete" | "error" | "retrying"
  message?: string
}

interface ConnectionProgressProps {
  steps: ConnectionStep[]
  progress: number
  retryCount: number
  maxRetries: number
}

export function ConnectionProgress({ steps, progress, retryCount, maxRetries }: ConnectionProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
      <h3 className="text-lg font-medium mb-2">Connecting to OpenAI...</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Establishing secure connection. This may take a few moments.
        {retryCount > 0 && ` (Attempt ${retryCount}/${maxRetries})`}
      </p>

      {/* Connection steps */}
      <div className="w-full max-w-md space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Connection Progress</h3>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="w-full" />
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center space-x-2">
              {step.status === "complete" && <Check className="h-4 w-4 text-green-500" />}
              {step.status === "in-progress" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              {step.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
              {step.status === "retrying" && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
              {step.status === "pending" && <div className="h-4 w-4 rounded-full bg-gray-200" />}
              <span className={`text-sm ${step.status === "error" ? "text-red-500" : ""}`}>
                {step.name}
                {step.message && ` - ${step.message}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}