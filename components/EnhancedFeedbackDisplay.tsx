import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Target, 
  Brain, 
  BarChart3, 
  Calendar,
  Sparkles,
  ChevronRight,
  AlertCircle
} from "lucide-react"

interface EnhancedFeedbackDisplayProps {
  enhancedFeedback: any // TODO: Use proper type
}

export default function EnhancedFeedbackDisplay({ enhancedFeedback }: EnhancedFeedbackDisplayProps) {
  if (!enhancedFeedback?.enhancedReportData) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-8 text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Enhanced feedback data is not available.</p>
        </CardContent>
      </Card>
    )
  }

  const report = enhancedFeedback.enhancedReportData
  const metrics = report.overallPerformanceMetrics || {}
  const toneAnalysis = enhancedFeedback.toneAnalysis || {}
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Enhanced Feedback Report
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                In-depth analysis and personalized recommendations
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold">{value as number}%</span>
                </div>
                <Progress value={value as number} className="h-2" />
              </div>
            ))}
          </div>
          
          {enhancedFeedback.keywordRelevanceScore !== undefined && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Job Description Keyword Match</span>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {enhancedFeedback.keywordRelevanceScore}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="answers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="answers">Answer Analysis</TabsTrigger>
          <TabsTrigger value="tone">Tone & Style</TabsTrigger>
          <TabsTrigger value="action">Action Plan</TabsTrigger>
        </TabsList>
        
        {/* Answer Analysis Tab */}
        <TabsContent value="answers" className="space-y-4">
          {report.detailedAnswerAnalysis?.map((analysis: any, index: number) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {analysis.questionNumber}: {analysis.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    Your answer: "{analysis.originalAnswer}"
                  </p>
                </div>
                
                {/* Strengths */}
                {analysis.analysis.strengths?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">Strengths:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.analysis.strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Areas for Improvement */}
                {analysis.analysis.weaknesses?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-amber-700 mb-2">Areas for Improvement:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.analysis.weaknesses.map((weakness: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Suggested Improvement */}
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h5 className="font-semibold text-indigo-700 mb-1">Suggested Improvement:</h5>
                  <p className="text-sm text-gray-700">{analysis.analysis.suggestedImprovement}</p>
                </div>
                
                {/* Alternative Phrasings */}
                {analysis.analysis.alternativePhrasings?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Better Phrasings:</h5>
                    {analysis.analysis.alternativePhrasings.map((phrasing: string, i: number) => (
                      <div key={i} className="p-2 bg-gray-50 rounded mb-2">
                        <p className="text-sm text-gray-700">"{phrasing}"</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* STAR Method Score */}
                {analysis.analysis.starMethodAdherence !== undefined && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">STAR Method</Badge>
                    <Progress value={analysis.analysis.starMethodAdherence} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{analysis.analysis.starMethodAdherence}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Tone Analysis Tab */}
        <TabsContent value="tone" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                Communication Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-1">Overall Tone</h5>
                  <p className="text-sm text-gray-600">{toneAnalysis.overallTone || "Not analyzed"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-1">Communication Style</h5>
                  <p className="text-sm text-gray-600">{toneAnalysis.communicationStyle || "Not analyzed"}</p>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg">
                <h5 className="font-semibold text-amber-700 mb-1">Perceived Energy</h5>
                <p className="text-sm text-gray-700">{toneAnalysis.perceivedEnergy || "Not analyzed"}</p>
              </div>
              
              {/* Emotional Progression */}
              {toneAnalysis.emotionalProgression?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Emotional Journey</h5>
                  <div className="space-y-2">
                    {toneAnalysis.emotionalProgression.map((segment: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Badge variant="outline">Part {segment.segment}</Badge>
                        <span className="text-sm font-medium">{segment.dominantEmotion}</span>
                        <Progress value={segment.confidence} className="h-2 flex-1" />
                        <span className="text-xs text-gray-500">{segment.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Action Plan Tab */}
        <TabsContent value="action" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Your Personalized Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Immediate Actions */}
              <div>
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Immediate Actions (This Week)
                </h5>
                <div className="space-y-2">
                  {report.customActionPlan?.immediate?.map((action: any, i: number) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.action}</p>
                          <p className="text-xs text-gray-600 mt-1">Why: {action.rationale}</p>
                          <p className="text-xs text-indigo-600 mt-1">Impact: {action.expectedImpact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Short Term Actions */}
              <div>
                <h5 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Short Term Goals (1-2 Weeks)
                </h5>
                <div className="space-y-2">
                  {report.customActionPlan?.shortTerm?.map((action: any, i: number) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.action}</p>
                          <p className="text-xs text-gray-600 mt-1">Timeline: {action.timeline}</p>
                          {action.resources?.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              Resources: {action.resources.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Long Term Actions */}
              <div>
                <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Long Term Goals (30 Days)
                </h5>
                <div className="space-y-2">
                  {report.customActionPlan?.longTerm?.map((action: any, i: number) => (
                    <div key={i} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.action}</p>
                          <p className="text-xs text-gray-600 mt-1">Timeline: {action.timeline}</p>
                          {action.milestones?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">Milestones:</p>
                              <ul className="list-disc pl-4 mt-1">
                                {action.milestones.map((milestone: string, j: number) => (
                                  <li key={j} className="text-xs text-gray-600">{milestone}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Industry Benchmarking */}
          {report.industryBenchmarking && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Industry Benchmarking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                  <span className="font-medium">Your Percentile Ranking</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-700">
                      {report.industryBenchmarking.percentile}th
                    </div>
                    <p className="text-xs text-gray-600">percentile</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Industry Comparison</h5>
                  <p className="text-sm text-gray-600">
                    {report.industryBenchmarking.comparisonToTopPerformers}
                  </p>
                </div>
                
                {report.industryBenchmarking.industrySpecificStrengths?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">Your Industry Strengths</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.industryBenchmarking.industrySpecificStrengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {report.industryBenchmarking.areasToMatchIndustryStandards?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-amber-700 mb-2">Areas to Match Industry Standards</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.industryBenchmarking.areasToMatchIndustryStandards.map((area: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}