import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedbackDisplay from '../FeedbackDisplay';
import type { Feedback } from '@/src/genkit/schemas/types';

describe('FeedbackView', () => {
  const mockFeedback: Feedback = {
    overallScore: 85,
    strengths: [
      'Clear communication',
      'Good technical knowledge',
      'Structured problem-solving approach'
    ],
    improvementAreas: [
      'Could provide more specific examples',
      'Consider edge cases in solutions'
    ],
    categoryScores: {
      technicalKnowledge: 90,
      problemSolving: 85,
      communication: 88,
      adaptability: 82,
      culturalFit: 80
    },
    summary: 'Strong candidate with excellent technical skills and communication abilities.',
    detailedFeedback: {
      suggestions: [
        'Practice explaining complex concepts in simpler terms',
        'Prepare more real-world examples from past experience'
      ]
    }
  };

  it('should render feedback details correctly', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    // Check overall score
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    // Check category breakdown
    expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Technical Knowledge')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    
    // Check strengths
    expect(screen.getByText('Clear communication')).toBeInTheDocument();
    expect(screen.getByText('Good technical knowledge')).toBeInTheDocument();
    
    // Check improvement areas
    expect(screen.getByText('Could provide more specific examples')).toBeInTheDocument();
    
    // Check summary
    expect(screen.getByText(mockFeedback.summary)).toBeInTheDocument();
  });

  it('should handle empty feedback data gracefully', () => {
    const minimalFeedback: Feedback = {
      overallScore: 0,
      strengths: [],
      improvementAreas: [],
      categoryScores: {
        technicalKnowledge: 0,
        problemSolving: 0,
        communication: 0,
        adaptability: 0,
        culturalFit: 0
      },
      summary: ''
    };
    
    render(<FeedbackDisplay feedback={minimalFeedback} />);
    
    // Should still render the structure
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
  });
});