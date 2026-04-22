import React from 'react';
import { Spin, Typography, Empty, Button } from 'antd';

const { Text } = Typography;

interface LoadingStateProps {
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ className = '' }) => (
  <div className={`text-center py-16 ${className}`}>
    <Spin size="large" />
    <div className="mt-4">
      <Text className="text-gray-600">Loading your chat history...</Text>
    </div>
  </div>
);

interface ErrorStateProps {
  error: any;
  onRetry: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => (
  <div className={`text-center py-16 ${className}`}>
    <Text className="text-red-500">
      {error?.message || 'Failed to load chat history'}
    </Text>
    <div className="mt-4">
      <Button onClick={onRetry} type="primary">
        Try Again
      </Button>
    </div>
  </div>
);

interface EmptyStateProps {
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ className = '' }) => (
  <Empty 
    description={
      <div>
        <p className="text-gray-600 font-['gilroy-medium'] mb-2">
          No support conversations yet
        </p>
        <p className="text-sm text-gray-500">
          Start a conversation using the chat button to get help from our support team
        </p>
      </div>
    }
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    className={`py-16 ${className}`}
  />
);