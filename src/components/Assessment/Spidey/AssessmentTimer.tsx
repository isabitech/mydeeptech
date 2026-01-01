import React, { useEffect, useState } from 'react';
import { Progress, Typography, Alert } from 'antd';
import { ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AssessmentTimerProps {
  timeLimit: number; // in minutes
  onTimeUp: () => void;
  submissionId: string;
  stage: string;
  isActive?: boolean;
  className?: string;
}

export const AssessmentTimer: React.FC<AssessmentTimerProps> = ({
  timeLimit,
  onTimeUp,
  submissionId,
  stage,
  isActive = true,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(isActive);

  useEffect(() => {
    if (!isRunning || !isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isActive, onTimeUp]);

  useEffect(() => {
    setIsRunning(isActive);
  }, [isActive]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining < 300; // Last 5 minutes
  const isCriticalTime = timeRemaining < 60; // Last 1 minute
  
  const progressPercent = ((timeLimit * 60 - timeRemaining) / (timeLimit * 60)) * 100;
  
  const getProgressStatus = () => {
    if (isCriticalTime) return 'exception';
    if (isLowTime) return 'active';
    return 'normal';
  };

  const getProgressColor = () => {
    if (isCriticalTime) return '#ff4d4f';
    if (isLowTime) return '#faad14'; 
    return '#52c41a';
  };

  return (
    <div className={`assessment-timer ${isLowTime ? 'low-time' : ''} ${isCriticalTime ? 'critical-time' : ''} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className={isLowTime ? 'text-orange-500' : 'text-gray-500'} />
          <Text className="font-[gilroy-regular] text-sm text-gray-600">
            Time Remaining
          </Text>
        </div>
        {isLowTime && (
          <WarningOutlined className="text-orange-500" />
        )}
      </div>
      
      <div className="timer-display mb-3">
        <div className={`text-2xl font-bold font-[gilroy-regular] ${
          isCriticalTime ? 'text-red-500' : isLowTime ? 'text-orange-500' : 'text-gray-800'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <Progress
        percent={progressPercent}
        status={getProgressStatus()}
        strokeColor={getProgressColor()}
        showInfo={false}
        size="small"
      />

      {isCriticalTime && (
        <Alert
          message="Critical Time Warning"
          description="Less than 1 minute remaining! Your assessment will auto-submit when time expires."
          type="error"
          showIcon
          className="mt-2 font-[gilroy-regular]"
          banner
        />
      )}

      {isLowTime && !isCriticalTime && (
        <Alert
          message="Low Time Warning" 
          description="5 minutes or less remaining. Please prepare to submit your responses."
          type="warning"
          showIcon
          className="mt-2 font-[gilroy-regular]"
          banner
        />
      )}

      <style jsx>{`
        .assessment-timer.low-time {
          animation: pulse 2s infinite;
        }
        
        .assessment-timer.critical-time {
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};