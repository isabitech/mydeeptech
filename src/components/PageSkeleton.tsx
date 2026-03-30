import React from 'react';
import '../styles/transitions.css';

interface PageSkeletonProps {
  type?: 'dashboard' | 'auth' | 'admin' | 'default';
  message?: string;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  type = 'default', 
  message = 'Loading...' 
}) => {
  const renderDashboardSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="skeleton h-16 bg-white border-b"></div>
      <div className="flex">
        <div className="skeleton w-64 h-screen bg-white border-r"></div>
        <div className="flex-1 p-6">
          <div className="skeleton h-8 w-64 mb-6 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuthSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="skeleton h-8 w-48 mx-auto mb-8 rounded"></div>
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-10 w-full rounded"></div>
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-10 w-full rounded"></div>
            <div className="skeleton h-10 w-full rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminSkeleton = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="skeleton h-16 bg-white border-b"></div>
      <div className="flex">
        <div className="skeleton w-72 h-screen bg-white border-r"></div>
        <div className="flex-1">
          <div className="skeleton h-12 bg-white border-b"></div>
          <div className="p-6">
            <div className="skeleton h-8 w-64 mb-6 rounded"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="skeleton h-16 rounded-t-lg"></div>
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-12 mb-3 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="skeleton h-8 w-8 mx-auto mb-4 rounded-full animate-spin"></div>
        <div className="skeleton h-4 w-32 mx-auto rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="lazy-component">
      {type === 'dashboard' && renderDashboardSkeleton()}
      {type === 'auth' && renderAuthSkeleton()}
      {type === 'admin' && renderAdminSkeleton()}
      {type === 'default' && renderDefaultSkeleton()}
      
      {/* Optional message overlay */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded text-sm">
          {message}
        </div>
      )}
    </div>
  );
};

export default PageSkeleton;