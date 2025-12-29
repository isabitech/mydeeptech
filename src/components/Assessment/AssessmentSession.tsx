import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, Progress, Button, Alert, Typography, Space, Divider, Tag, Modal } from 'antd';
import { toast } from 'sonner';
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
import { useParams } from 'react-router-dom';
import ConversationBuilder from './ConversationBuilder';
import AssessmentInstructions from './AssessmentInstructions';
import { useSubmitTask } from '../../hooks/Assessment/useSubmitTask';
import { useSaveTaskProgress } from '../../hooks/Assessment/useSaveTaskProgress';
import { MultimediaAssessmentSubmission, MultimediaConversation, VideoReel } from '../../types/multimedia-assessment.types';
import { multimediaAssessmentApi } from '../../service/axiosApi';

// Assessment Session Types
interface TimerState {
  isRunning: boolean;
  startTime: string;
  totalPausedDuration: number;
}

interface Submission {
  id: string;
  assessmentId: string;
  attemptNumber: number;
  status: 'in_progress' | 'completed' | 'expired';
  totalTimeSpent: number;
  timerState: TimerState;
  completionPercentage: number;
}

interface RetakePolicy {
  allowed: boolean;
  maxAttempts: number;
  cooldownHours: number;
}

interface AssessmentRequirements {
  retakePolicy: RetakePolicy;
  tasksPerAssessment: number;
  timeLimit: number;
  allowPausing: boolean;
}

interface ConversationTurns {
  min: number;
  max: number;
  recommended: number;
}

interface VideoSegmentLength {
  min: number;
  max: number;
  recommended: number;
}

interface TaskSettings {
  conversationTurns: ConversationTurns;
  videoSegmentLength: VideoSegmentLength;
  allowVideoAsStartingPoint: boolean;
  allowPromptAsStartingPoint: boolean;
}

interface ProjectInfo {
  id: string;
  name: string;
  description: string;
}

interface AssessmentData {
  id: string;
  title: string;
  description: string;
  instructions: string;
  requirements: AssessmentRequirements;
  taskSettings: TaskSettings;
  project: ProjectInfo;
}

interface AvailableReel {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  niche: string;
  duration: number;
  formattedDuration: string;
  aspectRatio: 'portrait' | 'landscape';
  tags: string[];
}

interface SessionInfo {
  startedAt: string;
  timeRemaining: number;
  allowPausing: boolean;
  tasksRequired: number;
}

interface AssessmentSessionData {
  submission: Submission;
  assessment: AssessmentData;
  availableReels: AvailableReel[];
  sessionInfo: SessionInfo;
}

interface AssessmentSessionResponse {
  success: boolean;
  message: string;
  data: AssessmentSessionData;
}

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

interface AssessmentSessionProps {
  assessmentId?: string;
  submissionId?: string;
  onComplete?: (submissionId: string, finalScore: number) => void;
  onExit?: () => void;
}

const AssessmentSession: React.FC<AssessmentSessionProps> = ({
  assessmentId: propAssessmentId,
  submissionId: initialSubmissionId,
  onComplete,
  onExit,
}) => {
  const { assessmentId: urlAssessmentId } = useParams<{ assessmentId: string }>();
  const assessmentId = propAssessmentId || urlAssessmentId || '';
  
  // Hook instances - only the ones we actually use
  const { submitTask, loading: submittingTask } = useSubmitTask();
  const { saveProgress, loading: savingProgress } = useSaveTaskProgress();

  // Ref to prevent multiple initializations
  const initializationRef = useRef(false);

  // State management
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>(initialSubmissionId || '');
  const [sessionData, setSessionData] = useState<AssessmentSessionData | null>(null);
  const [availableReels, setAvailableReels] = useState<AvailableReel[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskConversations, setTaskConversations] = useState<Record<number, MultimediaConversation>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<number, boolean>>({});
  const [lastSavedTask, setLastSavedTask] = useState<number | null>(null);
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(0); // in minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);



  // Computed values
  const totalTasks = useMemo(() => {
    return sessionData?.assessment.requirements.tasksPerAssessment || 0;
  }, [sessionData]);

  const completedTasks = useMemo(() => {
    return Math.floor((sessionData?.submission.completionPercentage || 0) * totalTasks / 100);
  }, [sessionData, totalTasks]);

  const assessmentProgress = useMemo(() => {
    return sessionData?.submission.completionPercentage || 0;
  }, [sessionData]);

  const currentReel = useMemo(() => {
    return availableReels[currentTaskIndex] || null;
  }, [availableReels, currentTaskIndex]);

  const currentConversation = useMemo(() => {
    if (!taskConversations[currentTaskIndex] && currentReel) {
      // Create default conversation for this task if it doesn't exist
      return {
        originalVideoId: currentReel.id,
        originalVideo: currentReel,
        turns: [],
        totalDuration: 0,
        startingPoint: 'video' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return taskConversations[currentTaskIndex] || {
      originalVideoId: '',
      originalVideo: {} as any,
      turns: [],
      totalDuration: 0,
      startingPoint: 'video' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [taskConversations, currentTaskIndex, currentReel]);

  // Initialize assessment session
  useEffect(() => {
    const initializeSession = async () => {
      // Only initialize if session should be initialized and not already initialized
      if (!sessionInitialized || initializationRef.current) {
        return;
      }
      
      if (!assessmentId) {
        setError('Assessment ID is required');
        setLoading(false);
        return;
      }

      try {
        initializationRef.current = true;
        setLoading(true);
        setError(null);

        // Call the correct API endpoint to start the assessment
        const response = await multimediaAssessmentApi.startUserAssessment(assessmentId);
        
        if (response.success && response.data) {
          setSessionData(response.data);
          setSubmissionId(response.data.submission.id);
          setAvailableReels(response.data.availableReels);
          
          // Initialize conversations for all tasks
          if (response.data.availableReels.length > 0) {
            const initialConversations: Record<number, MultimediaConversation> = {};
            const initialUnsavedStates: Record<number, boolean> = {};
            
            response.data.availableReels.forEach((reel:any, index:any) => {
              initialConversations[index] = {
                originalVideoId: reel.id,
                originalVideo: reel,
                turns: [],
                totalDuration: 0,
                startingPoint: 'video',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              initialUnsavedStates[index] = false;
            });
            
            setTaskConversations(initialConversations);
            setHasUnsavedChanges(initialUnsavedStates);
          }
        } else {
          throw new Error(response.message || 'Failed to start assessment');
        }
      } catch (error: any) {
        console.error('Failed to initialize assessment session:', error);
        setError(error.message || 'Failed to start assessment session');
        initializationRef.current = false; // Reset on error so user can retry
        setSessionInitialized(false); // Allow user to try again
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [sessionInitialized]); // Run when sessionInitialized changes

  // Initialize timer when session data is loaded
  useEffect(() => {
    if (sessionData && !startTime) {
      const timeLimit = sessionData.assessment.requirements.timeLimit || 45; // in minutes
      setTimeRemaining(timeLimit);
      setStartTime(new Date());
      setIsTimerRunning(true);
    }
  }, [sessionData, startTime]);

  // Timer countdown effect
  useEffect(() => {
    if (isTimerRunning && !isTimerPaused && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1/60) { // Less than 1 minute remaining
            handleTimeExpired();
            return 0;
          }
          if (prev <= 5 && !showTimeWarning) {
            setShowTimeWarning(true);
          }
          return prev - 1/60; // Decrease by 1 minute every 60 seconds
        });
      }, 1000); // Update every second
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, isTimerPaused, timeRemaining, showTimeWarning]);

  // Timer event handlers
  function handleTimeExpired() {
    setIsTimerRunning(false);
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

  const toggleTimer = useCallback(async () => {
    if (!sessionData?.assessment.requirements.allowPausing) return;
    
    try {
      const action = isTimerPaused ? 'resume' : 'pause';
      
      // Call timer control API
      await multimediaAssessmentApi.controlTimer(submissionId, action);
      
      // Update local state
      setIsTimerPaused(prev => !prev);
    } catch (error) {
      console.error('Failed to control timer:', error);
      // Still update local state for better UX, but log the error
      setIsTimerPaused(prev => !prev);
    }
  }, [sessionData, isTimerPaused, submissionId]);

  const formatTimeRemaining = useCallback(() => {
    const hours = Math.floor(timeRemaining / 60);
    const minutes = Math.floor(timeRemaining % 60);
    const seconds = Math.floor((timeRemaining % 1) * 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  const getProgressPercentage = useCallback(() => {
    const totalTime = sessionData?.assessment.requirements.timeLimit || 45;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  }, [timeRemaining, sessionData]);

  // Check session status periodically (every 30 seconds)
  useEffect(() => {
    if (!submissionId || !sessionData) return;

    const checkSessionStatus = async () => {
      try {
        const response = await multimediaAssessmentApi.getAssessmentSession(submissionId);
        if (response.data?.success) {
          const sessionStatus = response.data.data;
          
          // Update session data if there are changes
          if (sessionStatus.submission.status !== sessionData.submission.status) {
            setSessionData(sessionStatus);
          }
          
          // Handle session expiry or completion
          if (sessionStatus.submission.status === 'expired') {
            handleTimeExpired();
          }
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
    };

    // Check immediately and then every 30 seconds
    const interval = setInterval(checkSessionStatus, 30000);
    
    return () => clearInterval(interval);
  }, [submissionId, sessionData]);

  const isCloseToExpiring = useCallback(() => {
    return timeRemaining <= 5; // 5 minutes or less
  }, [timeRemaining]);

  // Conversation handlers
  const handleConversationChange = useCallback((conversation: MultimediaConversation) => {
    setTaskConversations(prev => ({
      ...prev,
      [currentTaskIndex]: conversation
    }));
    setHasUnsavedChanges(prev => ({
      ...prev,
      [currentTaskIndex]: true
    }));
  }, [currentTaskIndex]);

  // Save current task progress
  const handleSaveProgress = useCallback(async () => {
    if (!currentReel || !submissionId || !sessionData) return;

    try {
      const taskData = {
        taskNumber: currentTaskIndex + 1,
        conversation: {
          originalVideoId: currentReel.id,
          startingPoint: currentConversation.startingPoint,
          turns: currentConversation.turns.map(turn => ({
            turnNumber: turn.turnNumber,
            userPrompt: turn.userPrompt,
            aiResponse: {
              responseText: typeof turn.aiResponse === 'string' ? turn.aiResponse : turn.aiResponse.responseText,
              videoSegment: {
                startTime: turn.aiResponse.videoSegment.startTime,
                endTime: turn.aiResponse.videoSegment.endTime,
                segmentUrl: `${currentReel.youtubeUrl}?start=${Math.floor(turn.aiResponse.videoSegment.startTime)}&end=${Math.floor(turn.aiResponse.videoSegment.endTime)}`,
                content: turn.aiResponse.videoSegment.content || 'AI response segment'
              }
            }
          }))
        },
      };

      const result = await saveProgress(submissionId, taskData);
      if (result.success) {
        setHasUnsavedChanges(prev => ({
          ...prev,
          [currentTaskIndex]: false
        }));
        setLastSavedTask(currentTaskIndex);
        toast.success('Progress saved successfully!');
      } else {
        toast.error('Failed to save progress. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  }, [currentReel, submissionId, sessionData, currentTaskIndex, currentConversation, saveProgress]);

  // Submit current task
  const handleSubmitTask = useCallback(async () => {
    if (!currentReel || !submissionId || !sessionData) return;

    const minTurns = sessionData.assessment.taskSettings.conversationTurns.min || 3;
    
    // Validate task completion
    if (currentConversation.turns.length < minTurns) {
      Modal.error({
        title: 'Incomplete Task',
        content: `Please create at least ${minTurns} conversation turns before submitting this task.`,
      });
      return;
    }

    try {
      const taskData = {
        taskNumber: currentTaskIndex + 1,
        conversation: {
          originalVideoId: currentReel.id,
          startingPoint: currentConversation.startingPoint,
          turns: currentConversation.turns.map(turn => ({
            turnNumber: turn.turnNumber,
            userPrompt: turn.userPrompt,
            aiResponse: {
              responseText: typeof turn.aiResponse === 'string' ? turn.aiResponse : turn.aiResponse.responseText,
              videoSegment: {
                startTime: turn.aiResponse.videoSegment.startTime,
                endTime: turn.aiResponse.videoSegment.endTime,
                segmentUrl: `${currentReel.youtubeUrl}?start=${Math.floor(turn.aiResponse.videoSegment.startTime)}&end=${Math.floor(turn.aiResponse.videoSegment.endTime)}`,
                content: turn.aiResponse.videoSegment.content || 'AI response segment'
              }
            }
          }))
        },
      };

      const result = await submitTask(submissionId, taskData);
      if (result.success) {
        setHasUnsavedChanges(prev => ({
          ...prev,
          [currentTaskIndex]: false
        }));
        toast.success(`Task ${currentTaskIndex + 1} submitted successfully!`);
        
        // Update session data to reflect completion
        setSessionData(prev => {
          if (!prev) return prev;
          const newCompletionPercentage = Math.min(100, ((currentTaskIndex + 1) / totalTasks) * 100);
          return {
            ...prev,
            submission: {
              ...prev.submission,
              completionPercentage: newCompletionPercentage
            }
          };
        });
        
        // Move to next task or complete assessment
        if (currentTaskIndex < totalTasks - 1) {
          setCurrentTaskIndex(prev => prev + 1);
          // No need to reset conversation - each task maintains its own conversation
        } else {
          // All tasks completed - set assessment as completed
          setIsAssessmentCompleted(true);
          toast.success('🎉 Assessment completed successfully! All tasks have been submitted.');
        }
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
      toast.error('Failed to submit task. Please try again.');
    }
  }, [currentReel, submissionId, sessionData, currentTaskIndex, currentConversation, submitTask, totalTasks, availableReels]);

  // Force submit on time expiry
  const handleForceSubmit = useCallback(async () => {
    // Auto-submit current progress
    if (onComplete && sessionData) {
      const finalScore = (sessionData.submission.completionPercentage / 100) * 10; // Calculate based on completion
      onComplete(submissionId, finalScore);
    }
  }, [submissionId, sessionData, onComplete]);

  // Handle starting the assessment after instructions
  const handleStartAssessment = useCallback(() => {
    setAssessmentStarted(true);
    // Initialize the session after user confirms they've read instructions
    setSessionInitialized(true);
  }, []);

  // Handle navigation between tasks
  const handleTaskNavigation = useCallback((taskIndex: number) => {
    const currentTaskHasUnsavedChanges = hasUnsavedChanges[currentTaskIndex] || false;
    
    if (currentTaskHasUnsavedChanges) {
      confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes in the current task. Do you want to save before switching tasks?',
        okText: 'Save & Continue',
        cancelText: 'Continue Without Saving',
        onOk: async () => {
          await handleSaveProgress();
          setCurrentTaskIndex(taskIndex);
        },
        onCancel: () => {
          setCurrentTaskIndex(taskIndex);
          setHasUnsavedChanges(prev => ({
            ...prev,
            [currentTaskIndex]: false
          }));
        },
      });
    } else {
      setCurrentTaskIndex(taskIndex);
    }
  }, [hasUnsavedChanges, currentTaskIndex, handleSaveProgress]);

  // Handle assessment exit
  const handleExit = useCallback(() => {
    const hasAnyUnsavedChanges = Object.values(hasUnsavedChanges).some(Boolean);
    
    if (hasAnyUnsavedChanges) {
      confirm({
        title: 'Exit Assessment',
        content: 'You have unsaved changes in one or more tasks. Your progress will be lost. Are you sure you want to exit?',
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

  // Show instructions first if assessment hasn't started
  if (!assessmentStarted) {
    return (
      <AssessmentInstructions
        assessmentId={assessmentId}
        onStartAssessment={handleStartAssessment}
        loading={false}
      />
    );
  }

  // Loading states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-lg mb-4">Starting Assessment Session...</div>
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

  if (error || !sessionData) {
    return (
      <Card>
        <Alert
          message="Assessment Session Error"
          description={error || "Unable to load assessment session. Please refresh the page or contact support."}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  // Show full-page completion UI when all tasks are submitted
  if (isAssessmentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircleOutlined className="text-6xl mb-4" />
            </motion.div>
            <Title level={2} className="!text-white !mb-2">
              🎉 Assessment Completed Successfully!
            </Title>
            <Text className="text-green-100 text-lg">
              All {totalTasks} tasks have been submitted and your assessment is complete.
            </Text>
          </div>

          {/* Assessment Summary */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalTasks}</div>
                <Text className="text-gray-600">Tasks Completed</Text>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <Text className="text-gray-600">Completion Rate</Text>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Object.values(taskConversations).reduce((total, conv) => total + conv.turns.length, 0)}
                </div>
                <Text className="text-gray-600">Total Conversation Turns</Text>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <Title level={4} className="mb-4">Assessment Details</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Assessment:</Text>
                  <Text className="font-medium">{sessionData?.assessment.title}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Project:</Text>
                  <Text className="font-medium">{sessionData?.assessment.project?.name}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Submission ID:</Text>
                  <Text className="font-mono text-sm">{submissionId}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Completed At:</Text>
                  <Text className="font-medium">{new Date().toLocaleString()}</Text>
                </div>
              </div>
            </div>

            {/* Task Review Section */}
            <div className="mb-8">
              <Title level={4} className="mb-4">Review Your Tasks</Title>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: totalTasks }, (_, index) => {
                  const conversation = taskConversations[index];
                  const reel = availableReels[index];
                  return (
                    <Card
                      key={index}
                      size="small"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentTaskIndex(index)}
                      cover={
                        reel?.thumbnailUrl ? (
                          <img 
                            src={reel.thumbnailUrl} 
                            alt={reel.title}
                            className="h-32 object-cover"
                          />
                        ) : null
                      }
                    >
                      <Card.Meta
                        title={
                          <div className="flex items-center justify-between">
                            <span>Task {index + 1}</span>
                            <CheckCircleOutlined className="text-green-500" />
                          </div>
                        }
                        description={
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 truncate">
                              {reel?.title || 'Video Task'}
                            </div>
                            <div className="text-xs">
                              <Tag color="blue">
                                {conversation?.turns?.length || 0} turns
                              </Tag>
                              <Tag  color="green">
                                Submitted
                              </Tag>
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button 
                size="large"
                onClick={() => {
                  // Allow reviewing tasks by exiting completion mode
                  setIsAssessmentCompleted(false);
                }}
              >
                Review Tasks in Detail
              </Button>
              {onComplete && (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => {
                    const finalScore = 100; // Since all tasks are completed
                    onComplete(submissionId, finalScore);
                  }}
                >
                  Return to Dashboard
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Pause Overlay */}
      <AnimatePresence>
        {isTimerPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl"
            >
              <div className="mb-6">
                <PauseCircleOutlined className="text-6xl text-blue-500 mb-4" />
                <Title level={3} className="!mb-2">Assessment Paused</Title>
                <Text type="secondary" className="text-base">
                  Your assessment timer is currently paused. Click Resume to continue.
                </Text>
              </div>
              
              <Alert
                message="Important Warning"
                description="Do not refresh the page while paused, or you may lose your current progress. Make sure to save your work before pausing."
                type="warning"
                showIcon
                className="mb-6 text-left"
              />
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div>Time Remaining: <span className="font-semibold">{formatTimeRemaining()}</span></div>
                  <div>Current Task: <span className="font-semibold">Task {currentTaskIndex + 1} of {totalTasks}</span></div>
                </div>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  onClick={toggleTimer}
                  className="w-full"
                >
                  Resume Assessment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="!mb-2">
              {sessionData?.assessment.title}
            </Title>
            <Text type="secondary">
              Task {currentTaskIndex + 1} of {totalTasks} • Progress: {assessmentProgress.toFixed(0)}% • Attempt {sessionData?.submission.attemptNumber || 1}
            </Text>
            <div className="mt-2">
              <Text type="secondary" className="block">
                {sessionData?.assessment.description}
              </Text>
              {sessionData?.assessment.project && (
                <div className="mt-1">
                  <Tag color="blue" className="text-xs">
                    {sessionData.assessment.project.name}
                  </Tag>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4 mb-2">
              <Button
                icon={isTimerPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                onClick={toggleTimer}
                type={isTimerPaused ? "primary" : "default"}
                size="large"
                disabled={timeRemaining <= 0 || !sessionData?.assessment.requirements.allowPausing}
              >
                {isTimerPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                icon={<SaveOutlined />}
                onClick={handleSaveProgress}
                loading={savingProgress}
                disabled={!hasUnsavedChanges[currentTaskIndex]}
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
              <ClockCircleOutlined className={isCloseToExpiring() ? 'text-red-500' : 'text-gray-500'} />
              <Text className={isCloseToExpiring() ? 'text-red-500 font-semibold' : ''}>
                {formatTimeRemaining()}
              </Text>
            </div>
            {sessionData?.sessionInfo && (
              <div className="mt-2 text-sm text-gray-500">
                <Text type="secondary">
                  Started: {new Date(sessionData.sessionInfo.startedAt).toLocaleTimeString()}
                </Text>
              </div>
            )}
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
              <Text>{getProgressPercentage().toFixed(0)}%</Text>
            </div>
            <Progress 
              percent={Number(getProgressPercentage().toFixed(2))}
              strokeColor={isCloseToExpiring() ? "#ff4d4f" : "#52c41a"}
              trailColor="#f0f0f0"
            />
          </div>
        </div>

        {/* Task navigation */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalTasks }, (_, index) => {
            const isCompleted = index < completedTasks;
            const isCurrent = index === currentTaskIndex;
            return (
              <Button
                key={index}
                size="small"
                type={isCurrent ? "primary" : isCompleted ? "default" : "dashed"}
                onClick={() => handleTaskNavigation(index)}
                icon={isCompleted ? <CheckCircleOutlined /> : null}
              >
                Task {index + 1}
              </Button>
            );
          })}
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
            Task {currentTaskIndex + 1}: Create Multi-turn Conversation
          </Title>
          <Paragraph>
            {sessionData?.assessment.instructions}
          </Paragraph>
          
          {currentTaskIndex < completedTasks && (
            <Alert
              message="Task Completed"
              description={`Task ${currentTaskIndex + 1} has been completed successfully`}
              type="success"
              showIcon
            />
          )}
          
          {currentReel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Title level={5}>Current Video Reel</Title>
              <div className="flex gap-3 items-start">
                <img 
                  src={currentReel.thumbnailUrl} 
                  alt={currentReel.title}
                  className="w-20 h-20 rounded object-cover"
                />
                <div>
                  <div className="font-medium">{currentReel.title}</div>
                  <Text type="secondary" className="text-sm">{currentReel.description}</Text>
                  <div className="mt-1">
                    <Tag color="purple">{currentReel.niche}</Tag>
                    <Tag>{currentReel.formattedDuration}</Tag>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <ConversationBuilder
            selectedReel={currentReel || ({} as any)}
            onSaveConversation={handleConversationChange}
            initialConversation={currentConversation}
            isReadOnly={currentTaskIndex < completedTasks}
          />
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <div className="flex items-center gap-4">
            {hasUnsavedChanges[currentTaskIndex] && (
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
              disabled={!hasUnsavedChanges[currentTaskIndex]}
            >
              Save Progress
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmitTask}
              loading={submittingTask}
              disabled={currentTaskIndex < completedTasks || currentConversation.turns.length < (sessionData?.assessment.taskSettings.conversationTurns.min || 3) || hasUnsavedChanges[currentTaskIndex] || lastSavedTask !== currentTaskIndex}
            >
              Submit Task {currentTaskIndex + 1}
            </Button>
          </Space>
        </div>
      </motion.div>
    </div>
  );
};

export default AssessmentSession;