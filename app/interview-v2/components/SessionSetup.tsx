'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
// SessionConfig type that matches what the page expects
interface SessionConfig {
  interviewType: string;
  domainOrRole: string;
  sessionId?: string;
  userId?: string;
}

// Validation schema for setup form
const SetupFormSchema = z.object({
  interviewType: z.enum(['behavioral', 'technical', 'situational']),
  domainOrRole: z.string().min(1, 'Please enter a domain or role'),
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'You must give consent to record the interview',
  }),
});

type SetupFormData = z.infer<typeof SetupFormSchema>;

interface SessionSetupProps {
  onComplete: (config: SessionConfig) => void;
  isLoading?: boolean;
}

export function SessionSetup({ onComplete, isLoading = false }: SessionSetupProps) {
  const [formData, setFormData] = useState<SetupFormData>({
    interviewType: 'behavioral',
    domainOrRole: '',
    consentGiven: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const result = SetupFormSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    
    // Convert to SessionConfig format
    const config: SessionConfig = {
      interviewType: formData.interviewType,
      domainOrRole: formData.domainOrRole,
      sessionId: `session_${Date.now()}`,
    };
    
    onComplete(config);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Setup Your Interview</CardTitle>
        <CardDescription>
          Configure your practice interview session. We'll tailor the experience to your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Type */}
          <div className="space-y-3">
            <Label>Interview Type</Label>
            <RadioGroup
              value={formData.interviewType}
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  interviewType: value as SetupFormData['interviewType'] 
                }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="behavioral" id="behavioral" />
                <Label htmlFor="behavioral" className="font-normal cursor-pointer">
                  Behavioral Interview
                  <span className="block text-sm text-muted-foreground">
                    Focus on past experiences and situational questions
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical" className="font-normal cursor-pointer">
                  Technical Interview
                  <span className="block text-sm text-muted-foreground">
                    Programming concepts, system design, and problem-solving
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="situational" id="situational" />
                <Label htmlFor="situational" className="font-normal cursor-pointer">
                  Situational Interview
                  <span className="block text-sm text-muted-foreground">
                    Hypothetical scenarios and how you would handle them
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Domain/Role */}
          <div className="space-y-2">
            <Label htmlFor="domainOrRole">
              Domain or Role
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="domainOrRole"
              placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
              value={formData.domainOrRole}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, domainOrRole: e.target.value }))
              }
              className={errors.domainOrRole ? 'border-red-500' : ''}
            />
            {errors.domainOrRole && (
              <p className="text-sm text-red-500">{errors.domainOrRole}</p>
            )}
          </div>

          {/* Consent */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consentGiven}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, consentGiven: checked as boolean }))
                }
                className={errors.consentGiven ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <Label htmlFor="consent" className="text-sm font-normal cursor-pointer">
                  I consent to recording this practice interview session
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your session will be recorded for feedback generation and improvement purposes.
                  The recording will be automatically deleted after processing.
                </p>
              </div>
            </div>
            {errors.consentGiven && (
              <p className="text-sm text-red-500">{errors.consentGiven}</p>
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              This is a practice interview designed to help you improve. 
              The AI interviewer will ask relevant questions based on your selections 
              and provide detailed feedback at the end.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Interview...
              </>
            ) : (
              'Start Interview'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}