import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Progress, Button, Alert, Typography, Space, Divider, Tag, Modal } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  SendOutlined 
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationBuilder from './ConversationBuilder';
import { useStartAssessment } from '../../hooks/Assessment/useStartAssessment';
import { useGetAssessmentSession } from '../../hooks/Assessment/useGetAssessmentSession';
import { useAssessmentTimer } from '../../hooks/Assessment/useAssessmentTimer';
import { useSubmitTask } from '../../hooks/Assessment/useSubmitTask';
import { useSaveTaskProgress } from '../../hooks/Assessment/useSaveTaskProgress';
import { MultimediaAssessmentSubmission, MultimediaConversation, VideoReel } from '../../types/multimedia-assessment.types';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

interface AssessmentSessionProps {
  assessmentId: string;
  submissionId?: string;
  onComplete?: (submissionId: string, finalScore: number) => void;
  onExit?: () => void;
}

export const AssessmentSession: React.FC<AssessmentSessionProps> = ({
  assessmentId,
  submissionId: initialSubmissionId,
  onComplete,
  onExit,
}) => {
  // Hook instances
  const { startAssessment, loading: startingAssessment } = useStartAssessment();
  const { getSession, session, loading: loadingSession } = useGetAssessmentSession();
  const { submitTask, loading: submittingTask } = useSubmitTask();
  const { saveProgress, loading: savingProgress } = useSaveTaskProgress();

  // State management
  const [submissionId, setSubmissionId] = useState<string>(initialSubmissionId || '');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentConversation, setCurrentConversation] = useState<MultimediaConversation>({
    originalVideoId: '',
    originalVideo: {} as any,
    turns: [],
    totalDuration: 0,
    startingPoint: 'video',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Timer integration
  const timer = useAssessmentTimer({
    submissionId,
    initialTimeLimit: 90, // Default 90 minutes
    initialTimeSpent: session?.totalTimeSpent || 0,
    autoSaveInterval: 30, // Auto-save every 30 seconds
    onTimeExpired: handleTimeExpired,
    onTimerUpdate: handleTimerUpdate,
  });

  // Computed values
  const currentTask = useMemo(() => {
    return session?.tasks?.[currentTaskIndex];
  }, [session, currentTaskIndex]);

  const completedTasks = useMemo(() => {
    return session?.tasks?.filter((task: any) => task.isCompleted).length || 0;
  }, [session]);

  const totalTasks = useMemo(() => {
    return session?.tasks?.length || 0;
  }, [session]);

  const assessmentProgress = useMemo(() => {
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }, [completedTasks, totalTasks]);

  // Initialize assessment session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (submissionId) {
          // Load existing session
          await getSession(submissionId);
        } else {
          // Start new assessment
          const result = await startAssessment(assessmentId);
          if (result.success && result.data) {
            const submissionId = result.data._id || '';
            setSubmissionId(submissionId);
            await getSession(submissionId);
          }
        }
      } catch (error) {
        console.error('Failed to initialize assessment session:', error);
      }
    };

    initializeSession();
  }, [assessmentId, submissionId]);

  // Update timer's current task data for auto-save
  useEffect(() => {
    if (currentTask && hasUnsavedChanges) {
      timer.updateCurrentTaskData({
        taskNumber: currentTask.taskNumber,
        conversation: currentConversation,
        notes: `Auto-saved at ${new Date().toLocaleTimeString()}`,
      });
    }
  }, [currentConversation, hasUnsavedChanges, currentTask, timer]);

  // Timer event handlers
  function handleTimeExpired() {
    setShowTimeWarning(false);
    confirm({
      title: 'Time Limit Reached',
      icon: <ExclamationCircleOutlined />,
      content: 'Your assessment time has expired. The assessment will be automatically submitted with current progress.',
      okText: 'Understand',
      cancelButtonProps: { style: { display: 'none' } },
      onOk: handleForceSubmit,
    });
  }

  function handleTimerUpdate() {
    // Show warning when 5 minutes remaining
    if (timer.isCloseToExpiring() && !showTimeWarning) {
      setShowTimeWarning(true);
    }
  }

  // Conversation handlers
  const handleConversationChange = useCallback((conversation: MultimediaConversation) => {
    setCurrentConversation(conversation);
    setHasUnsavedChanges(true);
  }, []);

  // Save current task progress
  const handleSaveProgress = useCallback(async () => {
    if (!currentTask || !submissionId) return;

    try {
      const taskData = {
        taskNumber: currentTask.taskNumber,
        conversation: {
          turns: currentConversation.turns.map(turn => {
            // Create separate user and assistant entries
            const userTurn = {
              speaker: 'user' as const,
              message: turn.userPrompt,
              timestamp: turn.timestamp
            };
            const assistantTurn = {
              speaker: 'assistant' as const,
              message: typeof turn.aiResponse === 'string' ? turn.aiResponse : turn.aiResponse.responseText,
              timestamp: turn.timestamp
            };
            return [userTurn, assistantTurn];
          }).flat()
        },
        notes: `Manually saved at ${new Date().toLocaleTimeString()}`,
      };

      const result = await saveProgress(submissionId, taskData);
      if (result.success) {
        setHasUnsavedChanges(false);
        // Show success feedback
        console.log('Progress saved successfully');
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [currentTask, submissionId, currentConversation, saveProgress]);

  // Submit current task
  const handleSubmitTask = useCallback(async () => {
    if (!currentTask || !submissionId) return;

    // Validate task completion
    if (currentConversation.turns.length < 4) {
      Modal.error({
        title: 'Incomplete Task',
        content: 'Please create at least 4 conversation turns before submitting this task.',
      });
      return;
    }

    try {
      const taskData = {
        taskNumber: currentTask.taskNumber,
        conversation: {
          turns: currentConversation.turns.map(turn => {
            // Create separate user and assistant entries
            const userTurn = {
              speaker: 'user' as const,
              message: turn.userPrompt,
              timestamp: turn.timestamp
            };
            const assistantTurn = {
              speaker: 'assistant' as const,
              message: typeof turn.aiResponse === 'string' ? turn.aiResponse : turn.aiResponse.responseText,
              timestamp: turn.timestamp
            };
            return [userTurn, assistantTurn];
          }).flat()
        },
      };

      const result = await submitTask(submissionId, taskData);
      if (result.success) {
        setHasUnsavedChanges(false);
        
        // Refresh session to get updated data
        await getSession(submissionId);
        
        // Move to next task or complete assessment
        if (currentTaskIndex < totalTasks - 1) {
          setCurrentTaskIndex(prev => prev + 1);
          setCurrentConversation({
            originalVideoId: '',
            originalVideo: {} as any,
            turns: [],
            totalDuration: 0,
            startingPoint: 'video',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // All tasks completed, show final submission
          handleFinalSubmission();
        }
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  }, [currentTask, submissionId, currentConversation, submitTask, getSession, currentTaskIndex, totalTasks]);

  // Handle final assessment submission
  const handleFinalSubmission = useCallback(() => {
    confirm({
      title: 'Complete Assessment',
      icon: <CheckCircleOutlined />,
      content: 'Are you ready to submit your assessment? Once submitted, you cannot make any changes.',
      okText: 'Submit Assessment',
      okType: 'primary',
      cancelText: 'Review Tasks',
      onOk: async () => {
        // Submit final assessment logic here
        if (onComplete && session) {
          const finalScore = completedTasks / totalTasks * 10; // Calculate based on completion
          onComplete(submissionId, finalScore);
        }
      },
    });
  }, [submissionId, session, onComplete]);

  // Force submit on time expiry
  const handleForceSubmit = useCallback(async () => {
    // Auto-submit current progress
    if (onComplete && session) {
      const finalScore = completedTasks / totalTasks * 10; // Calculate based on completion
      onComplete(submissionId, finalScore);
    }
  }, [submissionId, session, onComplete]);

  // Handle navigation between tasks
  const handleTaskNavigation = useCallback((taskIndex: number) => {
    if (hasUnsavedChanges) {
      confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Do you want to save before switching tasks?',
        okText: 'Save & Continue',
        cancelText: 'Continue Without Saving',
        onOk: async () => {
          await handleSaveProgress();
          setCurrentTaskIndex(taskIndex);
        },
        onCancel: () => {
          setCurrentTaskIndex(taskIndex);
          setHasUnsavedChanges(false);
        },
      });
    } else {
      setCurrentTaskIndex(taskIndex);
    }
  }, [hasUnsavedChanges, handleSaveProgress]);

  // Handle assessment exit
  const handleExit = useCallback(() => {
    if (hasUnsavedChanges) {
      confirm({
        title: 'Exit Assessment',
        content: 'You have unsaved changes. Your progress will be lost. Are you sure you want to exit?',
        okText: 'Exit Without Saving',
        okType: 'danger',
        cancelText: 'Stay',
        onOk: onExit,
      });
    } else {
      confirm({
        title: 'Exit Assessment',
        content: 'Are you sure you want to exit? Your progress has been saved.',
        okText: 'Exit',
        cancelText: 'Stay',
        onOk: onExit,
      });
    }
  }, [hasUnsavedChanges, onExit]);

  // Loading states
  if (startingAssessment || loadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-lg mb-4">Loading Assessment Session...</div>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!session || !currentTask) {
    return (
      <Card>
        <Alert
          message="Assessment Session Error"
          description="Unable to load assessment session. Please refresh the page or contact support."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="!mb-2">
              Assessment Session - {session.assessmentId}
            </Title>
            <Text type="secondary">
              Task {currentTaskIndex + 1} of {totalTasks} • Progress: {assessmentProgress.toFixed(0)}%
            </Text>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4 mb-2">
              <Button
                icon={timer.isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={timer.toggleTimer}
                type={timer.isRunning ? "default" : "primary"}
                size="large"
                disabled={timer.isTimeExpired}
              >
                {timer.isRunning ? 'Pause' : 'Resume'}
              </Button>
              <Button 
                icon={<SaveOutlined />}
                onClick={handleSaveProgress}
                loading={savingProgress}
                disabled={!hasUnsavedChanges}
              >
                Save Progress
              </Button>
              <Button 
                danger
                onClick={handleExit}
              >
                Exit
              </Button>
            </div>
            <div className="flex items-center gap-2 text-lg">
              <ClockCircleOutlined className={timer.isCloseToExpiring() ? 'text-red-500' : 'text-gray-500'} />
              <Text className={timer.isCloseToExpiring() ? 'text-red-500 font-semibold' : ''}>
                {timer.getFormattedTimeRemaining()}
              </Text>
            </div>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <Text>Assessment Progress</Text>
              <Text>{assessmentProgress.toFixed(0)}%</Text>
            </div>
            <Progress 
              percent={assessmentProgress} 
              strokeColor="#1890ff"
              trailColor="#f0f0f0"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <Text>Time Progress</Text>
              <Text>{timer.getProgressPercentage().toFixed(0)}%</Text>
            </div>
            <Progress 
              percent={timer.getProgressPercentage()}
              strokeColor={timer.isCloseToExpiring() ? "#ff4d4f" : "#52c41a"}
              trailColor="#f0f0f0"
            />
          </div>
        </div>

        {/* Task navigation */}
        <div className="flex gap-2 mt-4">
          {session.tasks.map((task: any, index: number) => (
            <Button
              key={task.taskNumber}
              size="small"
              type={index === currentTaskIndex ? "primary" : task.isCompleted ? "default" : "dashed"}
              onClick={() => handleTaskNavigation(index)}
              icon={task.isCompleted ? <CheckCircleOutlined /> : null}
            >
              Task {task.taskNumber}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Time Warning Alert */}
      <AnimatePresence>
        {showTimeWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert
              message="Time Warning"
              description="You have less than 5 minutes remaining. Please prepare to submit your assessment."
              type="warning"
              showIcon
              closable
              onClose={() => setShowTimeWarning(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Task Section */}
      <motion.div
        key={currentTaskIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <div className="p-6 border-b">
          <Title level={4}>
            Task {currentTask.taskNumber}: Create Multi-turn Conversation
          </Title>
          <Paragraph>
            Select a video reel and create an engaging multi-turn conversation based on its content. 
            Your conversation should demonstrate understanding of the video and create meaningful dialogue.
          </Paragraph>
          
          {currentTask.isCompleted && (
            <Alert
              message="Task Completed"
              description={`Task ${currentTask.taskNumber} • ${currentTask.isCompleted ? 'Completed' : 'In Progress'}`}
              type="success"
              showIcon
            />
          )}
        </div>

        <div className="p-6">
          <ConversationBuilder
            selectedReel={currentTask?.conversation?.originalVideo || ({} as any)}
            onSaveConversation={handleConversationChange}
            initialConversation={currentConversation}
            isReadOnly={currentTask?.isCompleted}
          />
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <Tag color="orange">
                <SaveOutlined /> Unsaved Changes
              </Tag>
            )}
            <Text type="secondary">
              Conversation turns: {currentConversation.turns.length}
            </Text>
          </div>
          
          <Space>
            <Button 
              onClick={handleSaveProgress}
              loading={savingProgress}
              disabled={!hasUnsavedChanges}
            >
              Save Progress
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmitTask}
              loading={submittingTask}
              disabled={currentTask.isCompleted || currentConversation.turns.length < 4}
            >
              Submit Task {currentTask.taskNumber}
            </Button>
          </Space>
        </div>
      </motion.div>

      {/* Assessment Summary (when all tasks completed) */}
      {completedTasks === totalTasks && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <div className="text-center py-8">
              <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
              <Title level={3}>All Tasks Completed!</Title>
              <Paragraph>
                You have successfully completed all {totalTasks} tasks. 
                Review your work or submit your final assessment.
              </Paragraph>
              <Space size="large" className="mt-6">
                <Button size="large" onClick={() => setCurrentTaskIndex(0)}>
                  Review Tasks
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handleFinalSubmission}
                >
                  Submit Final Assessment
                </Button>
              </Space>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};