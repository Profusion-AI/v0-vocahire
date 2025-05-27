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
          {Object.entries(feedback.categoryScores).map(([category, score]) => (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant={getScoreBadgeVariant(score)}>
                  {score}%
                </Badge>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Feedback Tabs */}
      <Tabs defaultValue="strengths" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
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

        <TabsContent value="suggestions" className="space-y-2">
          {feedback.detailedFeedback?.suggestions?.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{suggestion}</p>
            </div>
          )) || (
            <p className="text-sm text-gray-500">No specific suggestions available.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary */}
      {feedback.summary && (
        <Card className="p-4 bg-gray-50">
          <h4 className="text-sm font-semibold mb-2">Summary</h4>
          <p className="text-sm text-gray-700">{feedback.summary}</p>
        </Card>
      )}
    </div>
  );
}