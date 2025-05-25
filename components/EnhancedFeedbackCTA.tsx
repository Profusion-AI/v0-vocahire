import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Target, FileText, Lock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface EnhancedFeedbackCTAProps {
  onPurchase: () => void
  userCredits: number
  isProcessing?: boolean
}

export default function EnhancedFeedbackCTA({ 
  onPurchase, 
  userCredits, 
  isProcessing = false 
}: EnhancedFeedbackCTAProps) {
  const [showDetails, setShowDetails] = useState(false)
  const hasEnoughCredits = userCredits >= 0.5
  
  const features = [
    {
      icon: <TrendingUp className="h-5 w-5 text-indigo-600" />,
      title: "Industry Benchmarking",
      description: "Compare your performance against industry standards and top performers"
    },
    {
      icon: <Target className="h-5 w-5 text-indigo-600" />,
      title: "Question-by-Question Analysis",
      description: "Detailed breakdown of each response with specific improvement tips"
    },
    {
      icon: <FileText className="h-5 w-5 text-indigo-600" />,
      title: "Custom Action Plan",
      description: "Personalized 30-day improvement roadmap based on your performance"
    },
    {
      icon: <Sparkles className="h-5 w-5 text-indigo-600" />,
      title: "AI-Powered Insights",
      description: "Advanced analysis of communication patterns, confidence levels, and more"
    }
  ]

  const handleUnlock = () => {
    if (!hasEnoughCredits) {
      toast.error("Insufficient VocahireCredits", {
        description: "You need at least 0.50 VocahireCredits to unlock enhanced feedback."
      })
      return
    }
    onPurchase()
  }

  return (
    <Card className="shadow-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Unlock Enhanced Feedback
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Get deeper insights and actionable recommendations
              </p>
            </div>
          </div>
          <Badge className="bg-indigo-600 text-white px-3 py-1">
            0.50 Credits
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick preview of what's included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex gap-3 ${showDetails ? '' : index > 1 ? 'hidden md:flex' : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {!showDetails && (
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Show all features →
          </button>
        )}

        {/* Benefits list */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">What you'll receive:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Detailed performance metrics across 10+ dimensions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Specific examples from your interview with corrections
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Industry-specific recommendations and best practices
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Downloadable PDF report for future reference
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={handleUnlock}
            disabled={isProcessing}
            className={`w-full sm:w-auto ${
              hasEnoughCredits 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Processing...
              </>
            ) : hasEnoughCredits ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Unlock Enhanced Feedback
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Insufficient Credits
              </>
            )}
          </Button>
          
          {!hasEnoughCredits && (
            <p className="text-sm text-gray-600">
              You have {userCredits.toFixed(2)} VocahireCredits. 
              <a href="/profile" className="text-indigo-600 hover:text-indigo-700 ml-1">
                Purchase more →
              </a>
            </p>
          )}
        </div>

        {/* Trust indicators */}
        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-gray-500 text-center">
            Join 10,000+ professionals who've improved their interview skills with enhanced feedback
          </p>
        </div>
      </CardContent>
    </Card>
  )
}