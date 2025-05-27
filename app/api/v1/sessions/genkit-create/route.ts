import { NextRequest, NextResponse } from 'next/server';
import { createInterviewSession } from '@/src/genkit/flows/interview-session.flow';
import { z } from 'zod';

const requestSchema = z.object({
  userId: z.string(),
  jobRole: z.string(),
  difficulty: z.enum(['entry', 'mid', 'senior']),
  jobDescription: z.string().optional(),
  resume: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = requestSchema.parse(body);

    const result = await createInterviewSession(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error creating interview session:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create interview session' },
      { status: 500 }
    );
  }
}