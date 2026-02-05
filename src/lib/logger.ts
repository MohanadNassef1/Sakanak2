/**
 * Secure logging utility that prevents information leakage in production.
 * 
 * SECURITY: Console error logging can expose detailed error information
 * including stack traces and sensitive data to browser developer tools.
 * This utility only logs detailed errors in development mode.
 */

const isDev = import.meta.env.DEV;

/**
 * Log an error with context. In production, only logs a sanitized message.
 * In development, logs full error details.
 */
export const logError = (context: string, error: unknown): void => {
  if (isDev) {
    console.error(`[${context}]`, error);
  } else {
    // In production, only log context without sensitive details
    console.error(`[${context}] An error occurred`);
  }
};

/**
 * Log a warning message. Only logs in development mode.
 */
export const logWarning = (context: string, message: string): void => {
  if (isDev) {
    console.warn(`[${context}]`, message);
  }
};

/**
 * Log debug information. Only logs in development mode.
 */
export const logDebug = (context: string, ...args: unknown[]): void => {
  if (isDev) {
    console.log(`[${context}]`, ...args);
  }
};

/**
 * Log info that should always appear (non-sensitive operational logs).
 */
export const logInfo = (context: string, message: string): void => {
  console.info(`[${context}] ${message}`);
};