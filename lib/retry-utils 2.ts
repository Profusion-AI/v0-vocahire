/**
 * Retry utility with exponential backoff for transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown, nextDelayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    // Retry on timeout errors, connection errors, and 503 errors
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const errorCode = (error as { code?: string })?.code;
    
    return (
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('503') ||
      message.includes('service unavailable') ||
      errorCode === 'P2024' || // Prisma connection pool timeout
      errorCode === 'P2025' || // Prisma operation timed out
      errorCode === 'P1001' // Can't reach database server
    );
  },
  onRetry: (attempt, error, nextDelayMs) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`[Retry] Attempt ${attempt} failed, retrying in ${nextDelayMs}ms:`, errorMessage);
  }
};

/**
 * Execute a function with exponential backoff retry logic
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns The result of the function or throws the last error
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delayMs = config.initialDelayMs;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === config.maxAttempts || !config.shouldRetry(error)) {
        throw error;
      }
      
      // Calculate next delay with jitter
      const jitter = Math.random() * 0.2 * delayMs; // 20% jitter
      const nextDelayMs = Math.min(delayMs + jitter, config.maxDelayMs);
      
      // Notify about retry
      config.onRetry(attempt, error, nextDelayMs);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, nextDelayMs));
      
      // Update delay for next iteration
      delayMs = Math.min(delayMs * config.backoffMultiplier, config.maxDelayMs);
    }
  }
  
  throw lastError;
}

/**
 * Retry specifically for database operations with appropriate timeouts
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return withExponentialBackoff(operation, {
    maxAttempts: 3,
    initialDelayMs: 200,
    maxDelayMs: 2000,
    onRetry: (attempt, error, nextDelayMs) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as { code?: string })?.code;
      
      console.log(`[Database Retry] ${operationName} - Attempt ${attempt} failed:`, {
        error: errorMessage,
        code: errorCode,
        nextRetryIn: `${nextDelayMs}ms`
      });
    }
  });
}