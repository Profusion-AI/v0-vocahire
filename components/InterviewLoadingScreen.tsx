"use client"

import { motion } from "framer-motion"
import { InterviewLoadingIndicator, LoadingStage } from "@/components/ui/InterviewLoadingIndicator"
import { AnimatedQuoteDisplay } from "@/components/ui/AnimatedQuoteDisplay"

interface InterviewLoadingScreenProps {
  stages: LoadingStage[]
  currentStageId?: string
  completedStageIds: string[]
}

export function InterviewLoadingScreen({
  stages,
  currentStageId,
  completedStageIds
}: InterviewLoadingScreenProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle background animation - gradient pulse */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-primary/5 via-transparent to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-gradient-radial from-primary/5 via-transparent to-transparent"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              Preparing Your Interview
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Getting everything ready for your personalized coaching session...
            </motion.p>
          </div>

          {/* Progress Indicator */}
          <InterviewLoadingIndicator
            stages={stages}
            currentStageId={currentStageId}
            completedStageIds={completedStageIds}
            className="max-w-md mx-auto"
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-background px-4"
              >
                <span className="text-muted-foreground text-sm">✨</span>
              </motion.div>
            </div>
          </div>

          {/* Quote Display */}
          <AnimatedQuoteDisplay />
        </motion.div>
      </div>
    </div>
  )
}