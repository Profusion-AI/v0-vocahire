/**
 * Examples of using Google Generative AI types with VocaHire
 * This file demonstrates proper usage of official types from @google/generative-ai
 */

import { SchemaType } from '@google/generative-ai';
import type {
  FunctionDeclaration,
  Tool,
  Content,
  Part,
} from '@google/generative-ai';

// Example 1: Properly typed function declaration
export const exampleFunctionDeclaration: FunctionDeclaration = {
  name: 'getInterviewFeedback',
  description: 'Get feedback for a specific interview question',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      questionId: {
        type: SchemaType.STRING,
        description: 'The ID of the interview question'
      },
      responseQuality: {
        type: SchemaType.NUMBER,
        description: 'Quality score from 0 to 10'
      },
      categories: {
        type: SchemaType.ARRAY,
        description: 'Feedback categories',
        items: {
          type: SchemaType.STRING
        }
      }
    },
    required: ['questionId', 'responseQuality']
  }
};

// Example 2: Creating tools array with proper types
export const exampleTools: Tool[] = [
  {
    functionDeclarations: [
      exampleFunctionDeclaration,
      {
        name: 'analyzeAnswer',
        description: 'Analyze interview answer for key points',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            answer: {
              type: SchemaType.STRING,
              description: 'The answer to analyze'
            }
          },
          required: ['answer']
        }
      }
    ]
  }
];

// Example 3: Creating content with proper types
export const createInterviewContent = (role: string, text: string): Content => {
  return {
    role,
    parts: [{ text }] as Part[]
  };
};

// Example 4: Creating multi-part content
export const createMultiPartContent = (
  role: string,
  text: string,
  functionName?: string,
  functionArgs?: object
): Content => {
  const parts: Part[] = [{ text }];
  
  if (functionName && functionArgs) {
    parts.push({
      functionCall: {
        name: functionName,
        args: functionArgs
      }
    });
  }
  
  return { role, parts };
};

// Example 5: Type guard for Tool validation
export function isFunctionDeclarationsTool(tool: Tool): tool is { functionDeclarations: FunctionDeclaration[] } {
  return 'functionDeclarations' in tool && Array.isArray(tool.functionDeclarations);
}

// Example 6: Using SchemaType enum values
export const SCHEMA_TYPE_MAP = {
  string: SchemaType.STRING,
  number: SchemaType.NUMBER,
  integer: SchemaType.INTEGER,
  boolean: SchemaType.BOOLEAN,
  array: SchemaType.ARRAY,
  object: SchemaType.OBJECT,
} as const;

// Example 7: Creating a complex schema
export const complexSchema = {
  type: SchemaType.OBJECT,
  properties: {
    interviewData: {
      type: SchemaType.OBJECT,
      properties: {
        candidateName: {
          type: SchemaType.STRING,
          description: 'Full name of the candidate'
        },
        scores: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.NUMBER
          },
          description: 'Interview scores for each section'
        },
        passed: {
          type: SchemaType.BOOLEAN,
          description: 'Whether the candidate passed'
        }
      },
      required: ['candidateName', 'scores', 'passed']
    }
  },
  required: ['interviewData']
};