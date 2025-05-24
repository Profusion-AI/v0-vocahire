"use client"

import { motion } from "framer-motion"
import { LucideIcon, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

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
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({});
  
  // Track progress for each stage with 10s timeout
  useEffect(() => {
    if (!currentStageId) return;
    
    const startTime = Date.now();
    const duration = 10000; // 10 seconds
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setStageProgress(prev => ({ ...prev, [currentStageId]: progress }));
      
      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    updateProgress();
    
    return () => {
      // Clean up when stage changes
      setStageProgress(prev => {
        const next = { ...prev };
        delete next[currentStageId];
        return next;
      });
    };
  }, [currentStageId]);
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
            <motion.div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative",
                {
                  "bg-primary text-primary-foreground": isCurrent && !isCompleted,
                  "bg-green-500 text-white": isCompleted,
                  "bg-muted": !isCurrent && !isCompleted
                }
              )}
              animate={
                isCurrent && !isCompleted
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(79, 70, 229, 0)",
                        "0 0 0 8px rgba(79, 70, 229, 0.1)",
                        "0 0 0 16px rgba(79, 70, 229, 0)"
                      ]
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
              {isCurrent && !isCompleted ? (
                // Show a loading spinner for active stage
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    rotate: 360 
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    rotate: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : Icon ? (
                <motion.div
                  initial={isCompleted ? { scale: 0, rotate: -180 } : false}
                  animate={
                    isCompleted
                      ? {
                          scale: [0, 1.3, 1],
                          rotate: [0, 15, -15, 0]
                        }
                      : {}
                  }
                  transition={
                    isCompleted
                      ? {
                          duration: 0.6,
                          ease: "easeOut"
                        }
                      : {}
                  }
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              ) : null}
            </motion.div>
            
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
              <div className="flex items-center gap-2">
                {/* Circular progress indicator */}
                <div className="relative w-8 h-8">
                  <svg className="transform -rotate-90 w-8 h-8" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-primary"
                      strokeDasharray={88}
                      strokeDashoffset={88 - (88 * (stageProgress[stage.id] || 0)) / 100}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 88 }}
                      animate={{ strokeDashoffset: 88 - (88 * (stageProgress[stage.id] || 0)) / 100 }}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {Math.round(stageProgress[stage.id] || 0)}%
                    </span>
                  </div>
                </div>
                
                {/* Linear progress bar */}
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
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}