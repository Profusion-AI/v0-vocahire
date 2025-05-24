"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { interviewQuotes } from "@/lib/interviewQuotes"

export function AnimatedQuoteDisplay() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [quotes] = useState(() => {
    // Shuffle quotes once on mount for variety
    return [...interviewQuotes].sort(() => Math.random() - 0.5)
  })

  useEffect(() => {
    // Select initial random quote
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length))

    // Set up interval to change quotes every 15 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => {
        // Ensure we get a different quote
        let newIndex = Math.floor(Math.random() * quotes.length)
        while (newIndex === prev && quotes.length > 1) {
          newIndex = Math.floor(Math.random() * quotes.length)
        }
        return newIndex
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <div className="w-full px-6 sm:px-12 md:px-16 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.6, 
            ease: "easeInOut" 
          }}
          className="text-base sm:text-lg md:text-xl text-center text-muted-foreground font-light leading-relaxed italic"
        >
          {quotes[currentQuoteIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}