/**
 * NEMT Platform - Error Boundary Component
 * 
 * Global error boundary to prevent component crashes from breaking the entire app.
 * Catches React errors during rendering, lifecycle methods, and constructors.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // Log error to electron-log if available
    if (typeof window !== 'undefined' && (window as unknown as { electronAPI?: { log: (msg: string) => void } }).electronAPI) {
      (window as unknown as { electronAPI: { log: (msg: string) => void } }).electronAPI.log(
        `React Error: ${error.message}\nStack: ${error.stack}\nComponent Stack: ${errorInfo.componentStack}`
      );
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#0d0d0d',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '2rem',
              borderRadius: '16px',
              backgroundColor: '#141414',
              border: '1px solid #2a2a2a',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: '#ffffff',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#a3a3a3',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {this.state.errorInfo && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#1a1a1a',
                  textAlign: 'left',
                }}
              >
                <summary
                  style={{
                    fontSize: '0.75rem',
                    color: '#737373',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details
                </summary>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: '#a3a3a3',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  backgroundColor: 'transparent',
                  color: '#a3a3a3',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3d3660';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.color = '#a3a3a3';
                }}
              >
                <Home size={16} />
                Try to Continue
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#6b21a8',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b21a8';
                }}
              >
                <RefreshCw size={16} />
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component for convenience
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
}: ErrorBoundaryWrapperProps): ReactNode {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}
