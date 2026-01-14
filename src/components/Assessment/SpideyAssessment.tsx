import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Alert, Modal, Space, Result, Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationTriangleOutlined,
  LoadingOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpideyAssessment, SpideySession } from '../../hooks/Assessment/useSpideyAssessment';
import { StartSpideyAssessmentResponseData, StartSpideyAssessmentResponseType } from '../../hooks/Assessment/start-spidey-assessment-response-type';
import { Stage1Quiz } from './Spidey/Stage1Quiz';
import { Stage2TaskValidation } from './Spidey/Stage2TaskValidation';
import { Stage3GoldenSolution } from './Spidey/Stage3GoldenSolution';
import { Stage4IntegrityTrap } from './Spidey/Stage4IntegrityTrap';
import { SpideyAssessmentInstructions } from './Spidey/SpideyAssessmentInstructions';

const { Title, Text, Paragraph } = Typography;

type AssessmentStatus = 
  | 'initializing'
  | 'instructions'
  | 'stage1' 
  | 'stage2' 
  | 'stage3' 
  | 'stage4' 
  | 'completed' 
  | 'failed'
  | 'loading';

interface SpideyAssessmentProps {
  // Optional props for when used within dashboard
  assessmentId?: string;
  onComplete?: (result: any) => void;
}

export const SpideyAssessment: React.FC<SpideyAssessmentProps> = ({
  assessmentId: initialAssessmentId,
  onComplete
}) => {
  const { assessmentId: paramAssessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  
  // Use prop assessmentId if available, otherwise use URL param
  const assessmentId = initialAssessmentId || paramAssessmentId;
  
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>('instructions');
  const [sessionData, setSessionData] = useState<SpideySession | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [completionData, setCompletionData] = useState<any>(null);
  const [failureReason, setFailureReason] = useState<string>('');

  const {
    loading,
    error,
    submitStage1,
    submitStage2,
    uploadStage3Files,
    submitStage3,
    submitStage4,
    getAssessmentStatus,
    getAvailableSpideyAssessments,
    startSpideyAssessment
  } = useSpideyAssessment();

  // Load assessment data on mount for instructions only
  useEffect(() => {
    if (assessmentId) {
      // Start with instructions state and load assessment data
      loadAssessmentData();
    } else {
      setAssessmentStatus('failed');
      setFailureReason('Invalid assessment ID');
    }
  }, [assessmentId]);

  // Auto-save disabled for Spidey assessments - not supported by API
  // Spidey assessments use discrete stage submissions instead

  const loadAssessmentStatus = async () => {
    if (!submissionId) return;

    setAssessmentStatus('loading');
    
    try {
      const result = await getAssessmentStatus(submissionId);
      
      if (result.success && result.data) {
        const { currentStage, sessionData: data, status, assessmentInfo } = result.data;
        
        setSessionData(data);
        setCurrentStage(currentStage);
        
        // If assessment info is available, store it for instructions
        if (assessmentInfo) {
          setAssessmentData(assessmentInfo);
        }
        
        // Map backend status to frontend status
        switch (status) {
          case 'completed':
            setAssessmentStatus('completed');
            setCompletionData(result.data);
            break;
          case 'failed':
            setAssessmentStatus('failed');
            setFailureReason(result.data.failureReason || 'Assessment failed');
            break;
          case 'not_started':
            // Show instructions for new assessments
            setAssessmentStatus('instructions');
            break;
          default:
            // Set to current stage
            setAssessmentStatus(currentStage as AssessmentStatus);
        }
      } else {
        setAssessmentStatus('failed');
        setFailureReason(result.error || 'Failed to load assessment');
      }
    } catch (error) {
      setAssessmentStatus('failed');
      setFailureReason('Network error loading assessment');
    }
  };

  // Load assessment data for instructions
  const loadAssessmentData = async () => {
    if (!assessmentData && assessmentId) {
      try {
        const result = await getAvailableSpideyAssessments();
        if (result.success && result.data?.assessments) {
          // Find the assessment data that matches this ID
          const assessment = result.data.assessments.find((a: any) => a.id === assessmentId);
          if (assessment) {
            setAssessmentData(assessment);
          } else {
            setAssessmentStatus('failed');
            setFailureReason('Assessment not found');
          }
        }
      } catch (error) {
        console.error('Failed to load assessment data:', error);
        setAssessmentStatus('failed');
        setFailureReason('Failed to load assessment information');
      }
    }
  };

  // Handle instructions acceptance - start the assessment
  const handleInstructionsAccepted = async () => {
    if (!assessmentId) return;
    
    setAssessmentStatus('loading');
    
    try {
      // Start the assessment via API using assessmentId
      const result = await startSpideyAssessment(assessmentId);

      console.log(result)
      
      if (result.success && result.data) {
        // Handle the nested response structure: result.data.data contains the actual response
        const apiData = result.data as StartSpideyAssessmentResponseData;
        
        
        // Map the API response to SpideySession format
        const sessionData: SpideySession = {
          submissionId: apiData.submissionId,
          assessmentTitle: apiData.assessmentTitle,
          currentStage: apiData.currentStage as 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'completed',
          stage1Config: apiData.currentStage === 'stage1' ? {
            name: apiData.stageConfig.name,
            timeLimit: apiData.stageConfig.timeLimit,
            passingScore: apiData.stageConfig.passingScore,
            questions: apiData.stageConfig.questions.map(q => ({
              questionId: q.questionId,
              questionText: q.questionText,
              questionType: q.questionType as 'multiple_choice',
              options: q.options,
              isCritical: q.isCritical,
              points: q.points
            }))
          } : undefined,
          instructions: apiData.assessmentInfo?.description || '',
          sessionId: apiData.submissionId // Using submissionId as sessionId for now
        };
        
        // Set session data and submissionId
        setSessionData(sessionData);
        setSubmissionId(apiData.submissionId);
        setAssessmentStatus(apiData.currentStage as AssessmentStatus);
      } else {
        setAssessmentStatus('failed');
        setFailureReason(result.error || 'Failed to start assessment');
      }
    } catch (error) {
      setAssessmentStatus('failed');
      setFailureReason('Network error starting assessment');
    }
  };

  // Stage completion handlers
  const handleStage1Complete = async (responses: any, timeSpent: number) => {
    if (!submissionId) return;

    try {
      const result = await submitStage1(submissionId, { 
        submissionData: { responses }, 
        timeSpent 
      });
      
      if (result.success) {
        if (result.data?.nextStage) {
          setSessionData(prev => prev ? { ...prev, stage2Config: result.data.nextStage } : null);
          setAssessmentStatus('stage2');
        } else {
          // Stage 1 failed
          setAssessmentStatus('failed');
          setFailureReason(result.message || 'Failed to advance to Stage 2');
        }
      } else {
        setAssessmentStatus('failed');
        setFailureReason(result.error || 'Stage 1 submission failed');
      }
    } catch (error) {
      setAssessmentStatus('failed');
      setFailureReason('Network error during Stage 1 submission');
    }
  };

  const handleStage2Complete = async (data: any, timeSpent: number) => {
    if (!submissionId) return;

    try {
      const result = await submitStage2(submissionId, { ...data, timeSpent });
      
      if (result.success) {
        if (result.data?.nextStage) {
          setSessionData(prev => prev ? { ...prev, stage3Config: result.data.nextStage } : null);
          setAssessmentStatus('stage3');
        } else {
          setAssessmentStatus('failed');
          setFailureReason(result.message || 'Failed to advance to Stage 3');
        }
      } else {
        setAssessmentStatus('failed');
        setFailureReason(result.error || 'Stage 2 submission failed');
      }
    } catch (error) {
      setAssessmentStatus('failed');
      setFailureReason('Network error during Stage 2 submission');
    }
  };

  const handleStage3Complete = async (data: any, timeSpent: number) => {
    if (!submissionId) return;

    try {
      const result = await submitStage3(submissionId, { ...data, timeSpent });
      
      if (result.success) {
        if (result.data?.nextStage) {
          setSessionData(prev => prev ? { ...prev, stage4Config: result.data.nextStage } : null);
          setAssessmentStatus('stage4');
        } else {
          setAssessmentStatus('failed');
          setFailureReason(result.message || 'Failed to advance to Stage 4');
        }
      } else {
        setAssessmentStatus('failed');
        setFailureReason(result.error || 'Stage 3 submission failed');
      }
    } catch (error) {
      setAssessmentStatus('failed');
      setFailureReason('Network error during Stage 3 submission');
    }
  };

  const handleStage4Complete = async (data: any, timeSpent: number) => {
    if (!submissionId) return;

    try {
      const result = await submitStage4(submissionId, { ...data, timeSpent });
      
      if (result.success) {
        setAssessmentStatus('completed');
        setCompletionData(result.data);
        
        if (onComplete) {
          onComplete(result.data);
        }
      } else {
        setAssessmentStatus('failed');
        setFailureReason(result.error || 'Assessment completion failed');
      }
    } catch (error) {
      setAssessmentStatus('failed');
      setFailureReason('Network error during assessment completion');
    }
  };

  const handleAssessmentFailed = (reason: string) => {
    setAssessmentStatus('failed');
    setFailureReason(reason);
  };

  const handleFileUpload = async (files: File[]) => {
    if (!submissionId) return { success: false, error: 'No submission ID' };

    try {
      const result = await uploadStage3Files(submissionId, files);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'File upload failed' };
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard/assessments');
  };

  const handleRetryAssessment = () => {
    Modal.confirm({
      title: 'Retry Assessment',
      content: 'Are you sure you want to retry? This will start a completely new assessment session.',
      onOk: () => {
        navigate('/dashboard/assessments');
      }
    });
  };

  // Prevent browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (['stage1', 'stage2', 'stage3', 'stage4'].includes(assessmentStatus)) {
        e.preventDefault();
        e.returnValue = 'You have an assessment in progress. Are you sure you want to leave?';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (['stage1', 'stage2', 'stage3', 'stage4'].includes(assessmentStatus)) {
        e.preventDefault();
        Modal.confirm({
          title: 'Leave Assessment?',
          content: 'Your assessment is in progress. Leaving will result in failure. Continue anyway?',
          onOk: () => {
            handleAssessmentFailed('User navigation - Assessment abandoned');
          }
        });
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push current state to prevent back navigation
    if (['stage1', 'stage2', 'stage3', 'stage4'].includes(assessmentStatus)) {
      window.history.pushState(null, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [assessmentStatus]);

  // Loading state
  if (assessmentStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" indicator={<LoadingOutlined className="text-4xl" />} />
          <div className="mt-4">
            <Title level={4} className="!mb-2 font-[gilroy-regular]">Loading Assessment...</Title>
            <Text className="font-[gilroy-regular] text-gray-600">
              Initializing Spidey High-Discipline Assessment
            </Text>
          </div>
        </div>
      </div>
    );
  }

  // Instructions state - Show assessment briefing
  if (assessmentStatus === 'instructions') {
    if (!assessmentData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Spin size="large" indicator={<LoadingOutlined className="text-4xl" />} />
            <div className="mt-4">
              <Title level={4} className="!mb-2 font-[gilroy-regular]">Loading Assessment Instructions...</Title>
              <Text className="font-[gilroy-regular] text-gray-600">
                Preparing assessment briefing and requirements
              </Text>
            </div>
          </div>
        </div>
      );
    }

    return (
      <SpideyAssessmentInstructions
        assessment={assessmentData}
        onAcceptInstructions={handleInstructionsAccepted}
        loading={loading}
      />
    );
  }

  // Failure state
  if (assessmentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Result
            status="error"
            title={
              <Title level={3} className="font-[gilroy-regular] text-red-600">
                Assessment Failed
              </Title>
            }
            subTitle={
              <div className="space-y-2">
                <Paragraph className="font-[gilroy-regular] text-gray-600">
                  {failureReason}
                </Paragraph>
                <Alert
                  message="No Retakes Available"
                  description="Spidey Assessment allows only ONE attempt. You must wait 30 days before attempting again."
                  type="error"
                  showIcon
                  className="font-[gilroy-regular]"
                />
              </div>
            }
            extra={[
              <Button 
                key="dashboard" 
                type="primary" 
                onClick={handleReturnToDashboard}
                className="font-[gilroy-regular]"
              >
                Return to Dashboard
              </Button>
            ]}
          />
        </motion.div>
      </div>
    );
  }

  // Completion state
  if (assessmentStatus === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Result
            status="success"
            title={
              <Title level={2} className="font-[gilroy-regular] text-green-600">
                Assessment Complete!
              </Title>
            }
            subTitle={
              <div className="space-y-4">
                <Paragraph className="font-[gilroy-regular] text-gray-600 text-lg">
                  Your Spidey High-Discipline Assessment has been submitted successfully.
                </Paragraph>
                
                <Alert
                  message="Under Review"
                  description="Your submission is being evaluated. Results will be available within 24-48 hours via email and dashboard."
                  type="info"
                  showIcon
                  className="font-[gilroy-regular]"
                />

                {completionData && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm font-[gilroy-regular]">
                      <div>
                        <Text className="text-gray-600">Submission ID:</Text>
                        <div className="font-mono text-xs">{completionData.submissionId}</div>
                      </div>
                      <div>
                        <Text className="text-gray-600">Completed At:</Text>
                        <div className="text-xs">{new Date(completionData.completedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }
            extra={[
              <Button 
                key="dashboard" 
                type="primary" 
                icon={<TrophyOutlined />}
                onClick={handleReturnToDashboard}
                className="font-[gilroy-regular] bg-green-500 border-green-500 hover:bg-green-600"
              >
                Return to Dashboard
              </Button>
            ]}
          />
        </motion.div>
      </div>
    );
  }

  // Active assessment stages
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert
          message="Session Error"
          description="Assessment session data is not available. Please restart the assessment."
          type="error"
          showIcon
          action={
            <Button onClick={handleReturnToDashboard}>
              Return to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={assessmentStatus}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {/* Stage 1: Quiz */}
          {assessmentStatus === 'stage1' && sessionData.stage1Config && (
            <Stage1Quiz
              submissionId={submissionId!}
              stage1Config={sessionData.stage1Config}
              onStageComplete={handleStage1Complete}
              onAssessmentFailed={handleAssessmentFailed}
            />
          )}

          {/* Stage 2: Task Validation */}
          {assessmentStatus === 'stage2' && sessionData.stage2Config && (
            <Stage2TaskValidation
              submissionId={submissionId!}
              stage2Config={sessionData.stage2Config}
              onStageComplete={handleStage2Complete}
              onAssessmentFailed={handleAssessmentFailed}
            />
          )}

          {/* Stage 3: Golden Solution */}
          {assessmentStatus === 'stage3' && sessionData.stage3Config && (
            <Stage3GoldenSolution
              submissionId={submissionId!}
              stage3Config={sessionData.stage3Config}
              onStageComplete={handleStage3Complete}
              onAssessmentFailed={handleAssessmentFailed}
              onFileUpload={handleFileUpload}
            />
          )}

          {/* Stage 4: Integrity Trap */}
          {assessmentStatus === 'stage4' && sessionData.stage4Config && (
            <Stage4IntegrityTrap
              submissionId={submissionId!}
              stage4Config={sessionData.stage4Config}
              onAssessmentComplete={handleStage4Complete}
              onAssessmentFailed={handleAssessmentFailed}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};