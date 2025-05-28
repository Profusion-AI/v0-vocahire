# Google Generative AI Migration Guide

## Overview
VocaHire has been updated to use the official `@google/generative-ai` package (v0.24.1) for better type safety and future compatibility with Google's AI services.

## Changes Made

### 1. Added Official Package
```bash
pnpm add @google/generative-ai@^0.24.1
```

### 2. Updated Type Imports
All Google AI types are now imported from the official package:

```typescript
// Before (custom types)
export type SchemaType = 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';

// After (official types)
import { SchemaType } from '@google/generative-ai';
import type { 
  Schema,
  FunctionDeclaration,
  Tool,
  GenerationConfig,
  Content,
  Part
} from '@google/generative-ai';
```

### 3. New Utility Module
Created `lib/google-ai-utils.ts` with helper functions:
- `arrayBufferToBase64()` - Convert audio data to base64
- `base64ToArrayBuffer()` - Convert base64 to audio data
- `createContent()` - Create properly typed Content objects
- `createTextPart()` - Create text parts
- `createInlineDataPart()` - Create inline data parts
- `validateTools()` - Validate tool configurations

### 4. Type Definitions
Added comprehensive type definitions in `types/google-ai.d.ts`:
- Re-exports all official types
- Extends with VocaHire-specific types like `LiveAPIGenerationConfig`
- Provides WebSocket message type definitions

### 5. Examples
Created `lib/google-ai-examples.ts` demonstrating:
- Proper function declaration structure
- Tool array creation
- Content creation patterns
- Type guards for validation
- Schema type usage

## Benefits

1. **Type Safety**: Official TypeScript types ensure compile-time checking
2. **Future Compatibility**: Updates from Google will be easier to integrate
3. **Better IDE Support**: IntelliSense and autocomplete work correctly
4. **Reduced Maintenance**: No need to maintain custom type definitions

## Migration Checklist

- [x] Install `@google/generative-ai` package
- [x] Update `lib/google-live-api.ts` to use official types
- [x] Create utility functions module
- [x] Add comprehensive type definitions
- [x] Create usage examples
- [x] Verify backward compatibility
- [x] Type check all updated files

## Usage Examples

### Creating a Function Declaration
```typescript
import { SchemaType } from '@google/generative-ai';
import type { FunctionDeclaration } from '@google/generative-ai';

const myFunction: FunctionDeclaration = {
  name: 'processInterview',
  description: 'Process interview response',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      response: {
        type: SchemaType.STRING,
        description: 'User response'
      }
    },
    required: ['response']
  }
};
```

### Creating Tools
```typescript
import type { Tool } from '@google/generative-ai';

const tools: Tool[] = [
  {
    functionDeclarations: [myFunction]
  },
  {
    googleSearch: {}
  }
];
```

### Working with Content
```typescript
import { createContent, createTextPart } from '@/lib/google-ai-utils';

const content = createContent('user', [
  createTextPart('Hello, how are you?')
]);
```

## Cloud Run Compatibility

The implementation remains fully compatible with Cloud Run:
- WebSocket connections work as before
- Type definitions don't affect runtime behavior
- All existing APIs remain unchanged

## Next Steps

1. Monitor for updates to `@google/generative-ai` package
2. Consider migrating to official WebSocket client when available
3. Update Genkit integration to use official types