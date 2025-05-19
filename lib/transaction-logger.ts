// Transaction logging utility for financial operations

type LogLevel = 'info' | 'warn' | 'error';

interface TransactionLog {
  timestamp: Date;
  level: LogLevel;
  userId: string;
  operation: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
  error?: string;
}

class TransactionLogger {
  private static instance: TransactionLogger;
  
  private constructor() {}
  
  public static getInstance(): TransactionLogger {
    if (!TransactionLogger.instance) {
      TransactionLogger.instance = new TransactionLogger();
    }
    return TransactionLogger.instance;
  }
  
  // Helper method to recursively convert Decimal values to JavaScript numbers
  private convertDecimalValues(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const key in obj) {
      const value = obj[key];
      if (value === null || value === undefined) {
        result[key] = value;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        result[key] = this.convertDecimalValues(value);
      } else if (Array.isArray(value)) {
        // Process arrays
        result[key] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? this.convertDecimalValues(item) 
            : (typeof item === 'number' || this.looksLikeDecimal(item) ? Number(item) : item)
        );
      } else if (this.looksLikeDecimal(value)) {
        // Convert Decimal-like values to numbers
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  // Helper to determine if a value might be a Decimal type
  private looksLikeDecimal(value: any): boolean {
    // Check if it has a toString method and can be parsed as a number
    return value !== null && 
           value !== undefined && 
           typeof value.toString === 'function' && 
           !isNaN(Number(value)) &&
           typeof value !== 'number'; // It's not already a JavaScript number
  }
  
  private formatLog(log: TransactionLog): string {
    const { timestamp, level, userId, operation, amount, currency, metadata, error } = log;
    const baseLog = `[${timestamp.toISOString()}] [${level.toUpperCase()}] [USER:${userId}] ${operation}`;
    
    const details: string[] = [];
    if (amount !== undefined && currency) {
      details.push(`Amount: ${amount} ${currency}`);
    }
    if (metadata && Object.keys(metadata).length > 0) {
      details.push(`Metadata: ${JSON.stringify(metadata)}`);
    }
    if (error) {
      details.push(`Error: ${error}`);
    }
    
    return details.length > 0 ? `${baseLog} - ${details.join(' | ')}` : baseLog;
  }
  
  public log(level: LogLevel, userId: string, operation: string, options?: {
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
    error?: string;
  }) {
    // Ensure numeric values are converted from potential Decimal types to JavaScript numbers
    let safeOptions = options;
    if (options) {
      safeOptions = {
        ...options,
        amount: options.amount !== undefined ? Number(options.amount) : undefined,
        metadata: options.metadata ? this.convertDecimalValues(options.metadata) : undefined
      };
    }
    
    const log: TransactionLog = {
      timestamp: new Date(),
      level,
      userId,
      operation,
      ...safeOptions
    };
    
    const formattedLog = this.formatLog(log);
    
    // Output to console
    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
    
    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to CloudWatch, Datadog, etc.
      // this.sendToExternalService(log);
    }
  }
  
  public info(userId: string, operation: string, options?: Omit<Parameters<TransactionLogger['log']>[3], 'error'>) {
    this.log('info', userId, operation, options);
  }
  
  public warn(userId: string, operation: string, options?: Parameters<TransactionLogger['log']>[3]) {
    this.log('warn', userId, operation, options);
  }
  
  public error(userId: string, operation: string, options: Parameters<TransactionLogger['log']>[3] & { error: string }) {
    this.log('error', userId, operation, options);
  }
}

// Export singleton instance
export const transactionLogger = TransactionLogger.getInstance();

// Predefined operation types for consistency
export const TransactionOperations = {
  CHECKOUT_SESSION_CREATED: 'checkout_session_created',
  CHECKOUT_SESSION_FAILED: 'checkout_session_failed',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  CREDITS_PURCHASED: 'credits_purchased',
  CREDITS_ADDED: 'credits_added',
  CREDITS_DEDUCTED: 'credits_deducted',
  REFUND_PROCESSED: 'refund_processed',
} as const;