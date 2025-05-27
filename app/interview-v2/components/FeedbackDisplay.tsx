'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import type { Feedback } from '@/src/genkit/schemas/types';

interface FeedbackDisplayProps {
  feedback: Feedback;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Overall Performance</h3>
          <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
            {feedback.overallScore}%
          </div>
          <Progress value={feedback.overallScore} className="mt-3" />
        </div>
      </Card>

      {/* Category Scores */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(feedback.categoryScores)
            .filter(([_, score]) => score !== undefined)
            .map(([category, score]) => (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant={getScoreBadgeVariant(score as number)}>
                  {score}%
                </Badge>
              </div>
              <Progress value={score as number} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Feedback Tabs */}
      <Tabs defaultValue="strengths" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="strengths" className="space-y-2">
          {feedback.strengths.map((strength, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{strength}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="improvements" className="space-y-2">
          {feedback.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{area}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {feedback.detailedFeedback?.map((item, index) => (
            <Card key={index} className="p-4">
              <h5 className="font-semibold text-sm mb-2">Q: {item.question}</h5>
              <p className="text-sm text-gray-600 mb-2">Your response: {item.response}</p>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getScoreBadgeVariant(item.score)}>
                  Score: {item.score}%
                </Badge>
              </div>
              <p className="text-sm mb-2">{item.feedback}</p>
              {item.suggestions && item.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold">Suggestions:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600">
                    {item.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="next-steps" className="space-y-2">
          {feedback.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Recommended Resources */}
      {feedback.recommendedResources && feedback.recommendedResources.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Resources</h3>
          <div className="space-y-3">
            {feedback.recommendedResources.map((resource, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-sm">{resource.title}</h4>
                <p className="text-xs text-gray-600 mb-1">{resource.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Resource →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Motivational Message */}
      {feedback.motivationalMessage && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <p className="text-sm text-gray-700 italic">{feedback.motivationalMessage}</p>
        </Card>
      )}
    </div>
  );
}