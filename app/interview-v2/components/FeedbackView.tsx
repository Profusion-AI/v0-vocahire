'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Download,
  RefreshCcw,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb
} from 'lucide-react';
import type { Feedback } from '@/src/genkit/schemas/types';
import Link from 'next/link';

interface FeedbackViewProps {
  feedback: Feedback;
  sessionConfig?: {
    interviewType: string;
    domainOrRole: string;
  };
  onClose?: () => void;
}

export function FeedbackView({ feedback, sessionConfig, onClose }: FeedbackViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interview Complete!</CardTitle>
              <CardDescription>
                {feedback.summary || `Your performance summary for the ${sessionConfig?.interviewType} interview`}
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
                Score: <span className={getScoreColor(feedback.overallScore)}>
                  {Math.round(feedback.overallScore)}/100
                </span>
              </span>
              <Progress value={feedback.overallScore} className="w-1/2" />
            </div>
            {feedback.motivationalMessage && (
              <Alert>
                <AlertDescription>
                  💪 {feedback.motivationalMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="strengths" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Your Strengths</CardTitle>
              <CardDescription>What you did well in this interview</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(feedback.categoryScores).map(([category, score]) => (
                  score !== undefined && (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
              <CardDescription>Focus on these areas to enhance your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvementAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {feedback.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Actionable steps to improve your interview skills</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {feedback.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="font-bold text-primary">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {feedback.detailedFeedback.map((detail, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <CardDescription>{detail.question}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response */}
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Your Response:</p>
                  <p className="text-sm">{detail.response}</p>
                </div>

                {/* Score and Feedback */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(detail.score)}
                    <span className={`font-bold ${getScoreColor(detail.score)}`}>
                      Score: {detail.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{detail.feedback}</p>
                </div>

                {/* Strengths */}
                {detail.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-600">Strengths:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {detail.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {detail.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-orange-600">Areas to improve:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {detail.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {feedback.recommendedResources.length > 0 ? (
            feedback.recommendedResources.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {resource.type === 'article' && <BookOpen className="h-3 w-3" />}
                      {resource.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2" />
                <p>No specific resources recommended at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onClose}
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
                const feedbackText = JSON.stringify(feedback, null, 2);
                const blob = new Blob([feedbackText], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `interview-feedback-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(url);
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