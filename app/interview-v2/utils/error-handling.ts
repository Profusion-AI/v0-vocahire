import { z } from 'zod';
import type { ErrorSchema } from '@/src/genkit/schemas/types';

// Error code mappings
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'UNAUTHORIZED': 'Please sign in to continue',
  'INVALID_TOKEN': 'Your session has expired. Please sign in again',
  
  // Credits errors
  'INSUFFICIENT_CREDITS': 'You don\'t have enough credits for this interview. Please purchase more credits.',
  'CREDIT_CHECK_FAILED': 'Unable to verify your credit balance. Please try again.',
  
  // Connection errors
  'CONNECTION_FAILED': 'Unable to connect to the interview server. Please check your internet connection.',
  'CONNECTION_LOST': 'Connection to the interview server was lost. Please refresh and try again.',
  'CONNECTION_ERROR': 'A connection error occurred. Please try again.',
  
  // Session errors
  'SESSION_NOT_FOUND': 'Interview session not found. Please start a new interview.',
  'SESSION_EXPIRED': 'Your interview session has expired. Please start a new interview.',
  'SESSION_ERROR': 'An error occurred with your session. Please try again.',
  
  // Audio errors
  'MICROPHONE_ACCESS_DENIED': 'Microphone access was denied. Please allow microphone access in your browser settings.',
  'MICROPHONE_NOT_FOUND': 'No microphone found. Please connect a microphone and try again.',
  'AUDIO_PROCESSING_ERROR': 'Error processing audio. Please check your microphone and try again.',
  
  // AI/Backend errors
  'AI_SERVICE_ERROR': 'The AI service is temporarily unavailable. Please try again in a few moments.',
  'LIVE_API_ERROR': 'Unable to connect to the interview AI. Please try again.',
  'GENKIT_FLOW_ERROR': 'An error occurred processing your interview. Please try again.',
  
  // Rate limiting
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment before trying again.',
  
  // Generic errors
  'INTERNAL_ERROR': 'An unexpected error occurred. Please try again.',
  'UNKNOWN_ERROR': 'Something went wrong. Please try again.',
  'STREAM_ERROR': 'Error streaming data. Please refresh and try again.',
};

// Get user-friendly error message
export function getUserFriendlyErrorMessage(error: z.infer<typeof ErrorSchema>): string {
  // First try exact code match
  if (ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Then try partial matches for grouped errors
  if (error.code.includes('AUTH')) {
    return ERROR_MESSAGES['UNAUTHORIZED'];
  }
  
  if (error.code.includes('CREDIT')) {
    return ERROR_MESSAGES['INSUFFICIENT_CREDITS'];
  }
  
  if (error.code.includes('CONNECTION')) {
    return ERROR_MESSAGES['CONNECTION_ERROR'];
  }
  
  if (error.code.includes('SESSION')) {
    return ERROR_MESSAGES['SESSION_ERROR'];
  }
  
  if (error.code.includes('AUDIO') || error.code.includes('MICROPHONE')) {
    return ERROR_MESSAGES['AUDIO_PROCESSING_ERROR'];
  }
  
  // If we have a custom message from backend, use it
  if (error.message && !error.message.includes('Error:')) {
    return error.message;
  }
  
  // Default fallback
  return ERROR_MESSAGES['UNKNOWN_ERROR'];
}

// Error recovery suggestions
export function getErrorRecoverySuggestions(error: z.infer<typeof ErrorSchema>): string[] {
  const suggestions: string[] = [];
  
  switch (error.code) {
    case 'INSUFFICIENT_CREDITS':
      suggestions.push('Purchase more credits to continue');
      suggestions.push('Check your credit balance in your profile');
      break;
      
    case 'MICROPHONE_ACCESS_DENIED':
    case 'MICROPHONE_NOT_FOUND':
      suggestions.push('Check your browser microphone permissions');
      suggestions.push('Ensure your microphone is connected and working');
      suggestions.push('Try using a different browser');
      break;
      
    case 'CONNECTION_FAILED':
    case 'CONNECTION_LOST':
      suggestions.push('Check your internet connection');
      suggestions.push('Refresh the page and try again');
      suggestions.push('Disable VPN if you\'re using one');
      break;
      
    case 'SESSION_EXPIRED':
    case 'SESSION_NOT_FOUND':
      suggestions.push('Start a new interview session');
      suggestions.push('Return to the interview setup page');
      break;
      
    case 'RATE_LIMIT_EXCEEDED':
      suggestions.push('Wait a few seconds before trying again');
      suggestions.push('Avoid making rapid repeated requests');
      break;
      
    default:
      if (error.retryable) {
        suggestions.push('Try again in a few moments');
      }
      suggestions.push('Refresh the page if the problem persists');
      suggestions.push('Contact support if you continue to experience issues');
  }
  
  return suggestions;
}

// Format error for display
export interface FormattedError {
  title: string;
  message: string;
  suggestions: string[];
  retryable: boolean;
  code: string;
}

export function formatErrorForDisplay(error: z.infer<typeof ErrorSchema>): FormattedError {
  return {
    title: getErrorTitle(error.code),
    message: getUserFriendlyErrorMessage(error),
    suggestions: getErrorRecoverySuggestions(error),
    retryable: error.retryable || false,
    code: error.code,
  };
}

// Get error title based on code
function getErrorTitle(code: string): string {
  if (code.includes('AUTH')) return 'Authentication Error';
  if (code.includes('CREDIT')) return 'Insufficient Credits';
  if (code.includes('CONNECTION')) return 'Connection Problem';
  if (code.includes('SESSION')) return 'Session Error';
  if (code.includes('AUDIO') || code.includes('MICROPHONE')) return 'Audio Problem';
  if (code.includes('RATE_LIMIT')) return 'Too Many Requests';
  return 'Error';
}