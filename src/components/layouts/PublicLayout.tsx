import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppLoadingFallback from '../AppLoadingFallback';
import ErrorBoundary from '../ErrorBoundary';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
        <ErrorBoundary>
         <Suspense fallback={<AppLoadingFallback message="" />}>
            <Outlet />
         </Suspense>
        </ErrorBoundary>
    </div>
  );
};

export default PublicLayout;