"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";

export interface InterviewPageClientProps {
  initialJobTitle: string;
  initialSkipResume: boolean;
  initialProfileFormData: any;
  stripePublishableKey: string;
  userId: string;
  isUsingFallbackDb?: boolean;
}

export default function InterviewPageClient(props: InterviewPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new interview page after 3 seconds
    const timeout = setTimeout(() => {
      router.push('/interview-v2');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Migration Notice</span>
          </div>
          <CardTitle>Interview System Updated</CardTitle>
          <CardDescription>
            We've upgraded our interview system to provide you with a better experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The interview system has been migrated to use Google's GenKit framework 
            with enhanced AI capabilities. You'll be automatically redirected to the 
            new interview page in a few seconds.
          </p>
          <Button 
            onClick={() => router.push('/interview-v2')}
            className="w-full"
          >
            Go to New Interview Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}