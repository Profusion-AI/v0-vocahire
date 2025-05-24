"use client"

import { motion } from "framer-motion"
import { LucideIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingStage {
  id: string
  label: string
  icon?: LucideIcon
}

interface InterviewLoadingIndicatorProps {
  stages: LoadingStage[]
  currentStageId?: string
  completedStageIds: string[]
  className?: string
}

export function InterviewLoadingIndicator({
  stages,
  currentStageId,
  completedStageIds,
  className
}: InterviewLoadingIndicatorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {stages.map((stage, index) => {
        const isCompleted = completedStageIds.includes(stage.id)
        const isCurrent = stage.id === currentStageId
        const Icon = isCompleted ? Check : stage.icon

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
              {
                "bg-primary/10 text-primary": isCurrent && !isCompleted,
                "bg-green-500/10 text-green-600": isCompleted,
                "text-muted-foreground": !isCurrent && !isCompleted
              }
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                {
                  "bg-primary text-primary-foreground": isCurrent && !isCompleted,
                  "bg-green-500 text-white": isCompleted,
                  "bg-muted": !isCurrent && !isCompleted
                }
              )}
            >
              {Icon && (
                <motion.div
                  initial={false}
                  animate={
                    isCurrent && !isCompleted
                      ? {
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8]
                        }
                      : {}
                  }
                  transition={
                    isCurrent && !isCompleted
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      : {}
                  }
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
            </div>
            
            <span
              className={cn(
                "flex-1 text-sm sm:text-base font-medium transition-all duration-300",
                {
                  "font-semibold": isCurrent || isCompleted
                }
              )}
            >
              {stage.label}
            </span>

            {/* Progress indicator for current stage */}
            {isCurrent && !isCompleted && (
              <motion.div
                className="w-16 h-1 bg-muted rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}