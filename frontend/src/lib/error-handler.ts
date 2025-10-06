// Error handling utilities for sBTC Treasury Manager

export class TreasuryError extends Error {
  constructor(
    public message: string,
    public code: string,
    public category: 'blockchain' | 'api' | 'validation' | 'network' = 'blockchain'
  ) {
    super(message);
    this.name = 'TreasuryError';
  }
}

export const ErrorCodes = {
  // Blockchain errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  TRANSACTION_TIMEOUT: 'TRANSACTION_TIMEOUT',
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  
  // Validation errors
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_THRESHOLD: 'INVALID_THRESHOLD',
  
  // API errors
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  BUSINESS_NOT_FOUND: 'BUSINESS_NOT_FOUND',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT'
} as const;

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  timeout: number = 30000
): Promise<T> {
  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => 
          reject(new TreasuryError(
            `Operation timed out after ${timeout}ms`,
            ErrorCodes.TIMEOUT,
            'network'
          )), timeout
        )
      )
    ]);
  } catch (error) {
    console.error(`${context} failed:`, error);
    
    if (error instanceof TreasuryError) {
      throw error;
    }
    
    // Map common error patterns to specific error types
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('wallet') || errorMessage.includes('not signed')) {
      throw new TreasuryError(
        'Wallet not connected or user not signed in',
        ErrorCodes.WALLET_NOT_CONNECTED,
        'blockchain'
      );
    }
    
    if (errorMessage.includes('timeout')) {
      throw new TreasuryError(
        `${context} timed out`,
        ErrorCodes.TRANSACTION_TIMEOUT,
        'network'
      );
    }
    
    if (errorMessage.includes('insufficient')) {
      throw new TreasuryError(
        'Insufficient funds for transaction',
        ErrorCodes.INSUFFICIENT_FUNDS,
        'blockchain'
      );
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new TreasuryError(
        'Network error occurred',
        ErrorCodes.NETWORK_ERROR,
        'network'
      );
    }
    
    // Default error
    throw new TreasuryError(
      `${context} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCodes.TRANSACTION_FAILED,
      'blockchain'
    );
  }
}

export function validateAddress(address: string): void {
  if (!address || typeof address !== 'string') {
    throw new TreasuryError(
      'Address is required and must be a string',
      ErrorCodes.INVALID_ADDRESS,
      'validation'
    );
  }
  
  if (!address.match(/^S[A-Z0-9]+$/)) {
    throw new TreasuryError(
      'Invalid Stacks address format',
      ErrorCodes.INVALID_ADDRESS,
      'validation'
    );
  }
}

export function validateAmount(amount: number): void {
  if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
    throw new TreasuryError(
      'Amount must be a positive number',
      ErrorCodes.INVALID_AMOUNT,
      'validation'
    );
  }
}

export function validateThreshold(threshold: number): void {
  if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
    throw new TreasuryError(
      'Threshold must be between 0 and 100',
      ErrorCodes.INVALID_THRESHOLD,
      'validation'
    );
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof TreasuryError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function getErrorDetails(error: unknown): {
  message: string;
  code: string;
  category: string;
} {
  if (error instanceof TreasuryError) {
    return {
      message: error.message,
      code: error.code,
      category: error.category
    };
  }
  
  return {
    message: getErrorMessage(error),
    code: 'UNKNOWN_ERROR',
    category: 'unknown'
  };
}

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry validation errors
      if (error instanceof TreasuryError && error.category === 'validation') {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
    }
  }
  
  throw lastError;
}