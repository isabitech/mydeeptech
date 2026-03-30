import React, { Suspense, ComponentType } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import AppLoadingFallback from './AppLoadingFallback';
import PageSkeleton from './PageSkeleton';

interface LazyWrapperProps {
  fallbackMessage?: string;
  skeletonType?: 'dashboard' | 'auth' | 'admin' | 'default';
  usePageSkeleton?: boolean;
}

// Error fallback component
const ErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while loading this page.';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

// HOC for wrapping lazy components
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: LazyWrapperProps = {}
) {
  const {
    fallbackMessage = 'Loading...',
    skeletonType = 'default',
    usePageSkeleton = false
  } = options;

  return function LazyWrapper(props: P) {
    const fallbackComponent = usePageSkeleton 
      ? <PageSkeleton type={skeletonType} message={fallbackMessage} />
      : <AppLoadingFallback message={fallbackMessage} />;

    return (
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={fallbackComponent}>
          <div className="lazy-component">
            <Component {...props} />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Pre-configured wrappers for common page types
export const withDashboardLoading = <P extends object>(Component: ComponentType<P>) =>
  withLazyLoading(Component, {
    fallbackMessage: 'Loading dashboard...',
    skeletonType: 'dashboard',
    usePageSkeleton: true
  });

export const withAuthLoading = <P extends object>(Component: ComponentType<P>) =>
  withLazyLoading(Component, {
    fallbackMessage: 'Loading...',
    skeletonType: 'auth',
    usePageSkeleton: true
  });

export const withAdminLoading = <P extends object>(Component: ComponentType<P>) =>
  withLazyLoading(Component, {
    fallbackMessage: 'Loading admin panel...',
    skeletonType: 'admin',
    usePageSkeleton: true
  });

export default withLazyLoading;