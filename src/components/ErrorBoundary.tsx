import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  homeRoute?: string; // Configurable home route
  navigate?: (path: string, options?: { replace?: boolean }) => void; // React Router navigate function
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    // Reset the error boundary state to retry rendering
    this.setState({ hasError: false, error: undefined });
    
    // If that doesn't work, fall back to page reload
    if (this.state.hasError) {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    const { navigate, homeRoute = '/dashboard' } = this.props;
    
    if (navigate) {
      // Use React Router navigation (no page refresh)
      navigate(homeRoute, { replace: true });
    } else {
      // Fallback to page navigation
      console.warn('No navigate function provided to ErrorBoundary. Using window.location which causes page refresh.');
      window.location.href = homeRoute;
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try reloading the page or contact support if the problem persists."
            extra={[
              <Button key="reload" type="default" icon={<ReloadOutlined />} onClick={this.handleReload}>
                Retry
              </Button>,
              <Button key="home" type="primary" icon={<HomeOutlined />} onClick={this.handleGoHome}>
                Go to Dashboard
              </Button>
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-left max-w-2xl mx-auto">
                <h4 className="text-red-800 font-medium mb-2">Error Details (Development)</h4>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides React Router navigation to the ErrorBoundary
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  homeRoute?: string;
}

export const ErrorBoundaryWithRouter: React.FC<ErrorBoundaryWrapperProps> = (props) => {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary {...props} navigate={navigate} />
  );
};

// Export the original class component as well
export { ErrorBoundary };

// Default export is the router-enabled version
export default ErrorBoundaryWithRouter;