'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function GenKitTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCreateSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/sessions/genkit-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-123',
          jobRole: 'Software Engineer',
          difficulty: 'mid',
          jobDescription: 'Full-stack developer position requiring React and Node.js experience',
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      
      const data = await response.json();
      setResult(data);
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">GenKit Integration Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Interview Session Creation</CardTitle>
          <CardDescription>
            This tests the GenKit flow for creating an interview session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobRole">Job Role</Label>
              <Input id="jobRole" defaultValue="Software Engineer" />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select defaultValue="mid">
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea 
              id="jobDescription"
              placeholder="Enter job description..."
              defaultValue="Full-stack developer position requiring React and Node.js experience"
            />
          </div>

          <Button 
            onClick={testCreateSession} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Session...' : 'Test Create Session'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p>GenKit Developer UI is available at: <a href="/api/genkit" className="text-blue-500 hover:underline">/api/genkit</a> (development only)</p>
      </div>
    </div>
  );
}