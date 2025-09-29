'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  hasError: boolean;
  addError: (error: Error | string, severity?: ErrorInfo['severity'], context?: Record<string, unknown>) => string;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  retryLastAction: () => void;
  setRetryAction: (action: () => void) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  autoReport?: boolean;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ 
  children, 
  maxErrors = 10,
  autoReport = false 
}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  // Remove the direct dependency on notification context to prevent circular dependency
  // const { showError } = useNotificationActions();

  // Generate unique ID for errors
  const generateId = useCallback(() => {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add error to the list
  const addError = useCallback((
    error: Error | string, 
    severity: ErrorInfo['severity'] = 'medium',
    context?: Record<string, unknown>
  ) => {
    const id = generateId();
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;

    const errorInfo: ErrorInfo = {
      id,
      message,
      stack,
      timestamp: Date.now(),
      severity,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    setErrors(prev => {
      const updated = [errorInfo, ...prev];
      return updated.slice(0, maxErrors);
    });

    // Show user notification for medium+ severity errors
    // Note: We can't directly use notifications here due to provider order
    // Individual components can use the error context to show their own notifications
    if (severity !== 'low') {
      console.warn(`Error (${severity}): ${message}`);
    }

    // Auto-report critical errors
    if (autoReport && severity === 'critical') {
      reportError(errorInfo);
    }

    return id;
  }, [generateId, maxErrors, autoReport]);

  // Clear specific error
  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Retry last action
  const retryLastAction = useCallback(() => {
    if (retryAction) {
      try {
        retryAction();
      } catch (error) {
        addError(error as Error, 'medium', { context: 'retry_action' });
      }
    }
  }, [retryAction, addError]);

  // Set retry action
  const handleSetRetryAction = useCallback((action: () => void) => {
    setRetryAction(() => action);
  }, []);

  // Global error handlers
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError(
        `Unhandled Promise Rejection: ${event.reason}`,
        'high',
        { type: 'promise_rejection', reason: event.reason }
      );
    };

    // Handle global JavaScript errors
    const handleError = (event: ErrorEvent) => {
      addError(
        event.error || event.message,
        'high',
        { 
          type: 'javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [addError]);

  // Auto-clear old errors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      setErrors(prev => prev.filter(error => now - error.timestamp < maxAge));
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  const hasError = errors.length > 0;

  const value: ErrorContextType = {
    errors,
    hasError,
    addError,
    clearError,
    clearAllErrors,
    retryLastAction,
    setRetryAction: handleSetRetryAction,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Error reporting function (can be extended to send to logging service)
const reportError = async (errorInfo: ErrorInfo) => {
  try {
    // In a real application, send to your error reporting service
    console.error('Critical Error Report:', {
      message: errorInfo.message,
      stack: errorInfo.stack,
      timestamp: new Date(errorInfo.timestamp).toISOString(),
      severity: errorInfo.severity,
      context: errorInfo.context,
      userAgent: errorInfo.userAgent,
      url: errorInfo.url,
    });
    
    // Example: Send to external service
    // await fetch('/api/error-report', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorInfo),
    // });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

// Convenience hook for error handling with try/catch wrapper
export const useErrorHandler = () => {
  const { addError, setRetryAction } = useError();

  const handleError = useCallback((
    error: Error | string, 
    severity?: ErrorInfo['severity'], 
    context?: Record<string, unknown>
  ) => {
    return addError(error, severity, context);
  }, [addError]);

  const withErrorHandling = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => R,
    severity: ErrorInfo['severity'] = 'medium',
    context?: Record<string, unknown>
  ) => {
    return (...args: T): R | undefined => {
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.catch(error => {
            handleError(error, severity, context);
            return undefined;
          }) as R;
        }
        
        return result;
      } catch (error) {
        handleError(error as Error, severity, context);
        return undefined;
      }
    };
  }, [handleError]);

  const withRetry = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => R,
    ...args: T
  ) => {
    const action = () => fn(...args);
    setRetryAction(action);
    return withErrorHandling(fn)(...args);
  }, [withErrorHandling, setRetryAction]);

  return {
    handleError,
    withErrorHandling,
    withRetry,
  };
};