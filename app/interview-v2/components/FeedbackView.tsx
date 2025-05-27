'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Download,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import type { Feedback } from '@/src/genkit/schemas/types';
import Link from 'next/link';

interface FeedbackViewProps {
  feedback: Feedback;
  sessionConfig?: {
    interviewType: string;
    domainOrRole: string;
  };
  onStartNewInterview?: () => void;
}

export function FeedbackView({ feedback, sessionConfig, onStartNewInterview }: FeedbackViewProps) {
  // Calculate overall performance
  const averageScore = feedback.feedbackItems.reduce((sum, item) => 
    sum + (item.rating || 0), 0
  ) / feedback.feedbackItems.length;

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 3) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interview Feedback</CardTitle>
              <CardDescription>
                Your performance summary and recommendations
              </CardDescription>
            </div>
            {sessionConfig && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{sessionConfig.interviewType}</Badge>
                <Badge variant="secondary">{sessionConfig.domainOrRole}</Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                Score: <span className={getScoreColor(averageScore)}>{averageScore.toFixed(1)}/5</span>
              </span>
              <Progress value={averageScore * 20} className="w-1/2" />
            </div>
            {feedback.overallFeedback && (
              <p className="text-muted-foreground">{feedback.overallFeedback}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
          <CardDescription>Question-by-question analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback.feedbackItems.map((item, index) => (
            <div key={index}>
              <div className="space-y-3">
                {/* Question */}
                <div className="font-medium text-lg">
                  Q{index + 1}: {item.question}
                </div>

                {/* Answer Summary */}
                {item.answerSummary && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{item.answerSummary}</p>
                  </div>
                )}

                {/* Rating and Feedback */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(item.rating || 0)}
                    <span className={`font-bold ${getScoreColor(item.rating || 0)}`}>
                      {item.rating}/5
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{item.feedback}</p>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                {item.improvementSuggestions && item.improvementSuggestions.length > 0 && (
                  <div className="ml-7">
                    <p className="text-sm font-medium mb-2">Suggestions for improvement:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {item.improvementSuggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {index < feedback.feedbackItems.length - 1 && (
                <Separator className="my-6" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      {feedback.recommendedResources && feedback.recommendedResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Resources</CardTitle>
            <CardDescription>
              Materials to help you improve based on your performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.recommendedResources.map((resource, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Learn more ’
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      {feedback.motivationalMessage && (
        <Alert>
          <AlertDescription className="text-base">
            =¡ {feedback.motivationalMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onStartNewInterview}
              className="flex-1"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Start New Interview
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: Implement download functionality
                console.log('Download feedback');
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Feedback
            </Button>
            <Link href="/profile" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Sessions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}