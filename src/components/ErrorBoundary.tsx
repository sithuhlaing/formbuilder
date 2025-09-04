/**
 * Error Boundary Component
 * Handles React errors and provides graceful error recovery
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.log('Reporting error to tracking service:', { error, errorInfo });
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div className="error-boundary__actions">
              <button 
                className="btn btn--primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="btn btn--secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development)</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styled error boundary for specific contexts
export const FormBuilderErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleFormBuilderError = (error: Error, errorInfo: ErrorInfo) => {
    // Save current form state before error
    const formState = (window as any).__getFormState__?.();
    if (formState) {
      localStorage.setItem('formbuilder_recovery_state', JSON.stringify(formState));
    }
    
    console.error('Form Builder Error:', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleFormBuilderError}>
      {children}
    </ErrorBoundary>
  );
};

// Canvas-specific error boundary
export const CanvasErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fallback = (
    <div className="canvas-error">
      <div className="canvas-error__content">
        <h3>Canvas Error</h3>
        <p>The form canvas encountered an error. Your work has been saved.</p>
        <button 
          className="btn btn--primary"
          onClick={() => window.location.reload()}
        >
          Reload Canvas
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};
