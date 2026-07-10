/**
 * Centralized error logging utility
 * Replaces console.error statements with proper error handling
 */

export interface ErrorLogData {
  message: string;
  error?: unknown;
  context?: Record<string, unknown> | undefined;
  timestamp?: Date;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogData[] = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with optional context
   */
  logError(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorLog: ErrorLogData = {
      message,
      error,
      context,
      timestamp: new Date(),
    };

    // Store error for potential reporting
    this.logs.push(errorLog);

    // Always log to console in development and production for observability
    if (error !== undefined && error !== null) {
      console.error(`[ERROR] ${message}`, {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        context,
        timestamp: errorLog.timestamp
      });
    } else {
      console.log(`[LOG] ${message}`, {
        context,
        timestamp: errorLog.timestamp
      });
    }
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogData[] {
    return [...this.logs];
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export a singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience function for quick error logging
export const logError = (message: string, error?: unknown, context?: Record<string, unknown>): void => {
  errorLogger.logError(message, error, context);
};
