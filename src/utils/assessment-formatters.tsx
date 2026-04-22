import React from 'react';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined, 
  PlayCircleOutlined 
} from '@ant-design/icons';

/**
 * Get status color for Ant Design Badge/Tag
 */
export const getStatusColor = (status?: string): 'default' | 'success' | 'processing' | 'error' | 'warning' => {
  switch (status) {
    case 'completed':
    case 'passed':
      return 'success';
    case 'failed':
      return 'error';
    case 'in_progress':
      return 'processing';
    default:
      return 'default';
  }
};

/**
 * Get icon based on assessment status
 */
export const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed':
    case 'passed':
      return <CheckCircleOutlined />;
    case 'failed':
      return <ExclamationCircleOutlined />;
    case 'in_progress':
      return <ClockCircleOutlined />;
    default:
      return <PlayCircleOutlined />;
  }
};

/**
 * Get color for difficulty level
 */
export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return '#52c41a';
    case 'Intermediate':
      return '#faad14';
    case 'Advanced':
      return '#f5222d';
    default:
      return '#1890ff';
  }
};

/**
 * Format duration in minutes to a human-readable string
 */
export const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
