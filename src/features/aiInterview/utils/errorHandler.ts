/**
 * AI Interview Error Handler
 * Provides user-friendly error messages for AI service errors
 * without revealing backend service details like "on_demand" tier usage
 */

export interface AiServiceError extends Error {
  code?: 'AI_RATE_LIMIT' | 'AI_SERVICE_ERROR';
  retryAfter?: number;
  response?: {
    data?: {
      code?: string;
      message?: string;
      retryAfter?: number;
    };
  };
}

// Helper function to safely get nested property
const getNestedProperty = (obj: unknown, path: string[]): unknown => {
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
};

// Helper function to safely check if value equals expected
const safeEquals = (value: unknown, expected: string): boolean => {
  return value === expected;
};

/**
 * Format AI service error into user-friendly message
 * @param error - The error object from API call
 * @returns Object with formatted message and additional info
 */
export const formatAiServiceError = (error: unknown) => {
  // Type guard to check if error is an object with expected properties
  const isErrorObject = (err: unknown): err is Record<string, unknown> => {
    return err !== null && typeof err === 'object';
  };

  if (!isErrorObject(error)) {
    return {
      message: "An unexpected error occurred.",
      isAiServiceError: false
    };
  }

  // Check if this is an AI rate limit error
  const errorCode = getNestedProperty(error, ['code']);
  const responseDataCode = getNestedProperty(error, ['response', 'data', 'code']);
  
  if (safeEquals(errorCode, 'AI_RATE_LIMIT') || safeEquals(responseDataCode, 'AI_RATE_LIMIT')) {
    const retryAfter = getNestedProperty(error, ['retryAfter']) || getNestedProperty(error, ['response', 'data', 'retryAfter']);
    const baseMessage = getNestedProperty(error, ['message']) || getNestedProperty(error, ['response', 'data', 'message']) || 
      "Our AI system is currently experiencing high demand. Please wait a moment and try again.";
    
    const retryTime = (typeof retryAfter === 'number') ? ` Please try again in ${retryAfter} seconds.` : '';
    
    return {
      message: `${baseMessage}${retryTime}`,
      code: 'AI_RATE_LIMIT',
      retryAfter: typeof retryAfter === 'number' ? retryAfter : undefined,
      isAiServiceError: true
    };
  }

  // Check if this is a general AI service error
  if (safeEquals(errorCode, 'AI_SERVICE_ERROR') || safeEquals(responseDataCode, 'AI_SERVICE_ERROR')) {
    const message = getNestedProperty(error, ['message']) || getNestedProperty(error, ['response', 'data', 'message']) || 
      "Our AI system is temporarily unavailable. Please try again shortly.";
    
    return {
      message: typeof message === 'string' ? message : "Our AI system is temporarily unavailable. Please try again shortly.",
      code: 'AI_SERVICE_ERROR',
      isAiServiceError: true
    };
  }

  // Not an AI service error, return original error details
  const fallbackMessage = getNestedProperty(error, ['message']) || getNestedProperty(error, ['response', 'data', 'message']) || "An unexpected error occurred.";
  return {
    message: typeof fallbackMessage === 'string' ? fallbackMessage : "An unexpected error occurred.",
    isAiServiceError: false
  };
};

/**
 * Check if error is a rate limit error specifically
 * @param error - Error object to check
 * @returns boolean indicating if it's a rate limit error
 */
export const isRateLimitError = (error: unknown): boolean => {
  // Type guard to check if error is an object
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  const errorCode = getNestedProperty(error, ['code']);
  const responseDataCode = getNestedProperty(error, ['response', 'data', 'code']);
  const responseStatus = getNestedProperty(error, ['response', 'status']);
  
  return safeEquals(errorCode, 'AI_RATE_LIMIT') || 
         safeEquals(responseDataCode, 'AI_RATE_LIMIT') ||
         responseStatus === 429;
};

/**
 * Check if error is any AI service error
 * @param error - Error object to check
 * @returns boolean indicating if it's an AI service error
 */
export const isAiServiceError = (error: unknown): boolean => {
  // Type guard to check if error is an object
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  const errorCode = getNestedProperty(error, ['code']);
  const responseDataCode = getNestedProperty(error, ['response', 'data', 'code']);
  
  return safeEquals(errorCode, 'AI_RATE_LIMIT') || 
         safeEquals(errorCode, 'AI_SERVICE_ERROR') ||
         safeEquals(responseDataCode, 'AI_RATE_LIMIT') ||
         safeEquals(responseDataCode, 'AI_SERVICE_ERROR');
};

/**
 * Get retry after time from rate limit error
 * @param error - Error object to extract retry time from
 * @returns number of seconds to wait before retrying, or null if not available
 */
export const getRetryAfterTime = (error: unknown): number | null => {
  // Type guard to check if error is an object
  if (!error || typeof error !== 'object') {
    return null;
  }
  
  const retryAfter = getNestedProperty(error, ['retryAfter']) || 
                    getNestedProperty(error, ['response', 'data', 'retryAfter']) || 
                    getNestedProperty(error, ['response', 'headers', 'retry-after']);
  
  return typeof retryAfter === 'number' ? retryAfter : null;
};