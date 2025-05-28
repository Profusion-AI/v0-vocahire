'use client';

import { useState, useRef } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

// SessionConfig type that matches what the page expects
interface SessionConfig {
  interviewType: string;
  domainOrRole: string;
  sessionId?: string;
  userId?: string;
}

// Validation schema for setup form with enhanced validation
const SetupFormSchema = z.object({
  interviewType: z.enum(['behavioral', 'technical', 'situational'], {
    errorMap: () => ({ message: 'Please select an interview type' })
  }),
  domainOrRole: z.string()
    .min(2, 'Job role must be at least 2 characters')
    .max(100, 'Job role must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\/&,.()]+$/, 'Job role contains invalid characters')
    .transform(str => str.trim()),
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'You must consent to recording the interview to proceed',
  }),
});

type SetupFormData = z.infer<typeof SetupFormSchema>;

interface SessionSetupProps {
  onComplete: (config: SessionConfig) => void | Promise<void>;
  isLoading?: boolean;
}

export function SessionSetup({ onComplete, isLoading = false }: SessionSetupProps) {
  const [formData, setFormData] = useState<SetupFormData>({
    interviewType: 'behavioral',
    domainOrRole: '',
    consentGiven: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const lastSubmitTime = useRef<number>(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof SetupFormData, value: any) => {
    try {
      // Create a type-safe pick object
      const pickObj = { [field]: true } as const;
      const schema = SetupFormSchema.pick(pickObj as any);
      schema.parse({ [field]: value });
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Invalid value'
        }));
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent rapid submissions
    const now = Date.now();
    if (now - lastSubmitTime.current < 1000) {
      setErrors({ submit: 'Please wait a moment before submitting again.' });
      return;
    }
    lastSubmitTime.current = now;
    setSubmitAttempts(prev => prev + 1);
    
    // Mark all fields as touched
    setTouched({
      interviewType: true,
      domainOrRole: true,
      consentGiven: true,
    });
    
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
      
      // Focus on first error field
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
      
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // Convert to SessionConfig format
      const config: SessionConfig = {
        interviewType: result.data.interviewType,
        domainOrRole: result.data.domainOrRole,
        sessionId: `session_${Date.now()}`,
      };
      
      await onComplete(config);
    } catch (error) {
      console.error('Failed to start session:', error);
      setErrors({ submit: 'Failed to start interview session. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleBlur = (field: keyof SetupFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Interview Type */}
          <div className="space-y-3">
            <Label id="interviewType">
              Interview Type
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup
              value={formData.interviewType}
              onValueChange={(value) => {
                setFormData(prev => ({ 
                  ...prev, 
                  interviewType: value as SetupFormData['interviewType'] 
                }));
                if (touched.interviewType) {
                  validateField('interviewType', value);
                }
              }}
              aria-invalid={!!errors.interviewType}
              aria-describedby={errors.interviewType ? 'interviewType-error' : undefined}
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
            {touched.interviewType && errors.interviewType && (
              <p id="interviewType-error" className="text-sm text-red-500">{errors.interviewType}</p>
            )}
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
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, domainOrRole: value }));
                
                // Real-time validation if field has been touched
                if (touched.domainOrRole) {
                  validateField('domainOrRole', value);
                }
              }}
              onBlur={() => handleBlur('domainOrRole')}
              className={touched.domainOrRole && errors.domainOrRole ? 'border-red-500' : ''}
              aria-invalid={!!(touched.domainOrRole && errors.domainOrRole)}
              aria-describedby={errors.domainOrRole ? 'domainOrRole-error' : undefined}
              maxLength={100}
              required
            />
            {touched.domainOrRole && errors.domainOrRole && (
              <p id="domainOrRole-error" className="text-sm text-red-500">{errors.domainOrRole}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.domainOrRole.length}/100 characters
            </p>
          </div>

          {/* Consent */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consentGiven"
                checked={formData.consentGiven}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, consentGiven: checked as boolean }));
                  if (touched.consentGiven) {
                    validateField('consentGiven', checked);
                  }
                }}
                onBlur={() => handleBlur('consentGiven')}
                className={touched.consentGiven && errors.consentGiven ? 'border-red-500' : ''}
                aria-invalid={!!(touched.consentGiven && errors.consentGiven)}
                aria-describedby={errors.consentGiven ? 'consentGiven-error' : undefined}
              />
              <div className="space-y-1">
                <Label htmlFor="consentGiven" className="text-sm font-normal cursor-pointer">
                  I consent to this practice interview session
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your conversation will be transcribed for feedback generation. 
                  We do not store audio recordings - only transcripts and feedback are saved.
                </p>
              </div>
            </div>
            {touched.consentGiven && errors.consentGiven && (
              <p id="consentGiven-error" className="text-sm text-red-500">{errors.consentGiven}</p>
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

          {/* Submit Error */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Interview...
              </>
            ) : (
              'Start Interview'
            )}
          </Button>
          
          {/* Help text for multiple failed attempts */}
          {submitAttempts > 3 && Object.keys(errors).length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Having trouble? Make sure all fields are filled correctly and you've agreed to the recording consent.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}