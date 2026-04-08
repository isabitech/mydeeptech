import React from 'react';
import { Spin } from 'antd';

interface AppLoadingFallbackProps {
  message?: string;
}

const AppLoadingFallback: React.FC<AppLoadingFallbackProps> = ({message = "" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default AppLoadingFallback;