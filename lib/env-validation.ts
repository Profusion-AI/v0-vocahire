// Environment variable validation

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Required environment variables
const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
] as const;

// Required in production only
const productionRequiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
] as const;

// Stripe-specific validation
export function validateStripeEnv() {
  const errors: string[] = [];

  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY is required');
  } else if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET && isProduction) {
    errors.push('STRIPE_WEBHOOK_SECRET is required in production');
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
  } else if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
  }

  if (errors.length > 0) {
    throw new EnvValidationError(`Stripe environment validation failed:\n${errors.join('\n')}`);
  }
}

// General environment validation
export function validateEnv() {
  const errors: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`${varName} is required`);
    }
  }

  // Check production-only required variables
  if (isProduction) {
    for (const varName of productionRequiredVars) {
      if (!process.env[varName]) {
        errors.push(`${varName} is required in production`);
      }
    }
  }

  // Specific validations
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgres')) {
    errors.push('DATABASE_URL must be a PostgreSQL connection string');
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL);
    } catch {
      errors.push('NEXT_PUBLIC_APP_URL must be a valid URL');
    }
  }

  if (errors.length > 0) {
    throw new EnvValidationError(`Environment validation failed:\n${errors.join('\n')}`);
  }
}

// Export a function to validate all environments at once
export function validateAllEnv() {
  validateEnv();
  if (process.env.STRIPE_SECRET_KEY || isProduction) {
    validateStripeEnv();
  }
}