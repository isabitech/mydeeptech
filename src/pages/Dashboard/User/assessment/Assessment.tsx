
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Badge,
  Tag,
  Space,
  Empty,
  Spin,
  notification,
  Modal,
  Divider,
  Progress,
} from 'antd';
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  HistoryOutlined,
  StarOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../Header';
import { useAvailableAssessments, Assessment as AssessmentType } from '../../../../hooks/useAvailableAssessments';
import { useStartAssessment } from '../../../../hooks/useStartAssessment';
import { useSpideyAssessment, SpideyAssessment } from '../../../../hooks/Assessment/useSpideyAssessment';
import { SpideyAssessmentCard } from '../../../../components/Assessment/Spidey/SpideyAssessmentCard';
import { SpideyAssessment as SpideyAssessmentComponent } from '../../../../components/Assessment/SpideyAssessment';

const { Title, Text, Paragraph } = Typography;

const Assessment: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [selectedSpideyAssessment, setSelectedSpideyAssessment] = useState<SpideyAssessment | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if URL contains spidey assessment parameters
  const assessmentType = searchParams.get('type');
  const assessmentId = searchParams.get('id');
  const isSpideyAssessmentRoute = assessmentType === 'spidey_assessment' && assessmentId;

  const {
    loading: loadingAssessments,
    error: assessmentsError,
    assessments,
    getAvailableAssessments,
    resetState: resetAssessments
  } = useAvailableAssessments();

  const {
    loading: startingAssessment,
    error: startError,
    startAssessment,
    resetState: resetStart
  } = useStartAssessment();

  const {
    loading: loadingSpideyAssessments,
    error: spideyError,
    getAvailableSpideyAssessments,
    startSpideyAssessment
  } = useSpideyAssessment();

  const [spideyAssessments, setSpideyAssessments] = useState<SpideyAssessment[]>([]);

  useEffect(() => {
    loadAssessments();
    loadSpideyAssessments();
  }, []);

  const loadAssessments = async () => {
    const result = await getAvailableAssessments();
    if (!result.success && result.error) {
      notification.open({
        type: 'error',
        message: 'Failed to Load Assessments',
        description: result.error,
        placement: 'topRight',
      });
    }
  };

  const loadSpideyAssessments = async () => {
    const result = await getAvailableSpideyAssessments();
    if (result.success && result.data) {
      setSpideyAssessments(result.data.assessments || []);
    } else if (result.error) {
      notification.open({
        type: 'error',
        message: 'Failed to Load Spidey Assessments',
        description: result.error,
        placement: 'topRight',
      });
    }
  };

  const handleStartSpideyAssessment = async (assessment: SpideyAssessment) => {
    const result = await startSpideyAssessment();
    
    if (result.success && result.data) {
      notification.open({
        type: 'success',
        message: 'Spidey Assessment Started',
        description: result.message || 'Spidey assessment has been started successfully',
        placement: 'topRight',
      });
      
      // Navigate to Spidey assessment with the submission ID
      navigate(`/assessment/spidey/${result.data.submissionId}`, {
        state: { 
          sessionData: result.data 
        }
      });
    } else {
      notification.open({
        type: 'error',
        message: 'Failed to Start Spidey Assessment',
        description: result.error || 'Unable to start Spidey assessment. Please try again.',
        placement: 'topRight',
      });
    }
  };

  const handleStartAssessment = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment);
    setShowStartModal(true);
  };

  const handleConfirmStart = async () => {
    if (!selectedAssessment) return;

    const result = await startAssessment(selectedAssessment.id);
    
    if (result.success && result.data) {
      notification.open({
        type: 'success',
        message: 'Assessment Started',
        description: result.message || 'Assessment has been started successfully',
        placement: 'topRight',
      });
      
      // Navigate to the assessment session with the submission ID
      if (selectedAssessment.type === 'multimedia') {
        navigate(`/user/assessment/multimedia/${result.data.submissionId}`);
      } else {
        navigate(`/user/assessment/session/${result.data.submissionId}`, {
          state: { 
            assessmentType: selectedAssessment.type,
            sessionData: result.data 
          }
        });
      }
    } else {
      notification.open({
        type: 'error',
        message: 'Failed to Start Assessment',
        description: result.error || 'Unable to start assessment. Please try again.',
        placement: 'topRight',
      });
    }
    
    setShowStartModal(false);
    setSelectedAssessment(null);
  };

  const getStatusColor = (status?: string): 'default' | 'success' | 'processing' | 'error' | 'warning' => {
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

  const getStatusIcon = (status?: string) => {
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

  const getDifficultyColor = (difficulty: string) => {
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const canStartAssessment = (assessment: AssessmentType) => {
    if (!assessment.userStatus) return true;
    
    return (
      assessment.userStatus === 'not_started' ||
      (assessment.userStatus === 'failed' && assessment.lastAttempt?.canRetake) ||
      (assessment.userStatus === 'completed' && assessment.lastAttempt?.canRetake)
    );
  };

  const getActionButton = (assessment: AssessmentType) => {
    if (!canStartAssessment(assessment)) {
      if (assessment.userStatus === 'in_progress') {
        return (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
            onClick={() => handleStartAssessment(assessment)}
          >
            Continue
          </Button>
        );
      }
      
      if (assessment.userStatus === 'passed') {
        return (
          <Space>
            <Button
              icon={<HistoryOutlined />}
              className="font-[gilroy-regular]"
              onClick={() => {
                // Navigate to results view
                navigate(`/user/assessment/results/${assessment.lastAttempt?.id}`);
              }}
            >
              View Results
            </Button>
            {assessment.lastAttempt?.canRetake && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                className="bg-green-500 border-green-500 hover:bg-green-600 font-[gilroy-regular]"
                onClick={() => handleStartAssessment(assessment)}
              >
                Retake
              </Button>
            )}
          </Space>
        );
      }
      
      return null;
    }

    return (
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        size="large"
        className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
        onClick={() => handleStartAssessment(assessment)}
      >
        {assessment.userStatus === 'not_started' ? 'Start Assessment' : 'Retake Assessment'}
      </Button>
    );
  };

  if (loadingAssessments || loadingSpideyAssessments) {
    return (
      <div className="font-[gilroy-regular] p-6">
        <Header title="Assessments" />
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  // If URL contains spidey assessment parameters, render SpideyAssessment component
  if (isSpideyAssessmentRoute && assessmentId) {
    return <SpideyAssessmentComponent submissionId={assessmentId} />;
  }

  return (
    <div className="font-[gilroy-regular] p-6">
      <Header title="Assessments" />
      
      <div className="mb-8">
        <Title level={2} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
          Available Assessments
        </Title>
        <Text className="text-gray-600 text-lg font-[gilroy-regular]">
          Complete assessments to demonstrate your skills and unlock new opportunities
        </Text>
      </div>

      {(assessmentsError || spideyError) && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <Space direction="vertical" className="w-full">
              {assessmentsError && (
                <Space>
                  <ExclamationCircleOutlined className="text-red-500" />
                  <Text className="text-red-600 font-[gilroy-regular]">{assessmentsError}</Text>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={loadAssessments}
                    className="font-[gilroy-regular]"
                  >
                    Retry Regular Assessments
                  </Button>
                </Space>
              )}
              {spideyError && (
                <Space>
                  <ExclamationCircleOutlined className="text-red-500" />
                  <Text className="text-red-600 font-[gilroy-regular]">{spideyError}</Text>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={loadSpideyAssessments}
                    className="font-[gilroy-regular]"
                  >
                    Retry Spidey Assessments
                  </Button>
                </Space>
              )}
            </Space>
          </Card>
        </div>
      )}

      {assessments.length === 0 && spideyAssessments.length === 0 ? (
        <Empty
          description={
            <Text className="font-[gilroy-regular] text-gray-500">
              No assessments available at the moment
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div>
          {/* Spidey Assessments Section */}
          {spideyAssessments.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <Title level={3} className="!mb-2 !text-red-600 font-[gilroy-regular]">
                  ⚡ High-Discipline Assessments
                </Title>
                <Text className="text-red-500 text-base font-[gilroy-regular] font-semibold">
                  Critical assessments with zero tolerance policies. Single attempt only.
                </Text>
              </div>
              <Row gutter={[24, 24]}>
                {spideyAssessments.map((assessment) => (
                  <Col xs={24} lg={12} xl={8} key={assessment.id}>
                    <SpideyAssessmentCard 
                      assessment={assessment}
                      onStartAssessment={handleStartSpideyAssessment}
                      loading={loadingSpideyAssessments}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Regular Assessments Section */}
          {assessments.length > 0 && (
            <div>
              <div className="mb-4">
                <Title level={3} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
                  {spideyAssessments.length > 0 ? 'Standard Assessments' : 'Available Assessments'}
                </Title>
                <Text className="text-gray-600 text-base font-[gilroy-regular]">
                  Regular assessments with multiple attempts and flexible policies
                </Text>
              </div>
              <Row gutter={[24, 24]}>
                {assessments.map((assessment) => (
                  <Col xs={24} lg={12} xl={8} key={assessment.id}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300"
                        bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                      >
                        {/* Assessment Header */}
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <Title level={4} className="!mb-0 font-[gilroy-regular] text-[#333333]">
                              {assessment.title}
                            </Title>
                            <Badge
                              status={getStatusColor(assessment.userStatus)}
                              text={
                                <Text className="font-[gilroy-regular] text-sm capitalize">
                                  {assessment.userStatus?.replace('_', ' ') || 'Available'}
                                </Text>
                              }
                            />
                          </div>
                          
                          <Space wrap className="mb-3">
                            <Tag 
                              color="#F6921E" 
                              className="font-[gilroy-regular]"
                            >
                              {assessment.type.replace('_', ' ').toUpperCase()}
                            </Tag>
                            <Tag 
                              color={getDifficultyColor(assessment.difficulty)}
                              className="font-[gilroy-regular]"
                            >
                              {assessment.difficulty}
                            </Tag>
                          </Space>

                          <Paragraph 
                            className="text-gray-600 font-[gilroy-regular] mb-0"
                            ellipsis={{ rows: 2 }}
                          >
                            {assessment.description}
                          </Paragraph>
                        </div>

                        {/* Assessment Details */}
                        <div className="flex-grow">
                          <Row gutter={[12, 12]} className="mb-4">
                            <Col span={12}>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <BookOutlined className="text-[#F6921E] text-lg mb-1" />
                                <div className="text-xs text-gray-600 font-[gilroy-regular]">Tasks</div>
                                <div className="font-semibold text-sm font-[gilroy-regular]">
                                  {assessment.numberOfTasks}
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <ClockCircleOutlined className="text-[#F6921E] text-lg mb-1" />
                                <div className="text-xs text-gray-600 font-[gilroy-regular]">Duration</div>
                                <div className="font-semibold text-sm font-[gilroy-regular]">
                                  {formatDuration(assessment.estimatedDuration)}
                                </div>
                              </div>
                            </Col>
                          </Row>

                          <Row gutter={[12, 12]} className="mb-4">
                            <Col span={12}>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <TrophyOutlined className="text-[#F6921E] text-lg mb-1" />
                                <div className="text-xs text-gray-600 font-[gilroy-regular]">Pass Score</div>
                                <div className="font-semibold text-sm font-[gilroy-regular]">
                                  {assessment.passingScore}%
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <StarOutlined className="text-[#F6921E] text-lg mb-1" />
                                <div className="text-xs text-gray-600 font-[gilroy-regular]">Attempts</div>
                                <div className="font-semibold text-sm font-[gilroy-regular]">
                                  {assessment.currentAttempts || 0}/{assessment.maxAttempts || '∞'}
                                </div>
                              </div>
                            </Col>
                          </Row>

                          {/* Last Attempt Results */}
                          {assessment.lastAttempt && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <Text className="font-[gilroy-regular] text-sm font-semibold">
                                  Last Attempt
                                </Text>
                                <Badge
                                  status={getStatusColor(assessment.lastAttempt.status)}
                                  text={
                                    <Text className="font-[gilroy-regular] text-xs capitalize">
                                      {assessment.lastAttempt.status}
                                    </Text>
                                  }
                                />
                              </div>
                              {assessment.lastAttempt.score !== undefined && (
                                <div className="mb-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <Text className="font-[gilroy-regular] text-xs">Score</Text>
                                    <Text className="font-[gilroy-regular] text-xs font-semibold">
                                      {assessment.lastAttempt.score}%
                                    </Text>
                                  </div>
                                  <Progress 
                                    percent={assessment.lastAttempt.score} 
                                    size="small"
                                    strokeColor={
                                      assessment.lastAttempt.score >= assessment.passingScore 
                                        ? '#52c41a' 
                                        : '#f5222d'
                                    }
                                  />
                                </div>
                              )}
                              {assessment.lastAttempt.completedAt && (
                                <Text className="font-[gilroy-regular] text-xs text-gray-600">
                                  Completed: {new Date(assessment.lastAttempt.completedAt).toLocaleDateString()}
                                </Text>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="mt-auto">
                          {getActionButton(assessment)}
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}

      {/* Start Assessment Confirmation Modal */}
      <Modal
        title="Start Assessment"
        open={showStartModal}
        onCancel={() => {
          setShowStartModal(false);
          setSelectedAssessment(null);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setShowStartModal(false);
              setSelectedAssessment(null);
            }}
            className="font-[gilroy-regular]"
          >
            Cancel
          </Button>,
          <Button
            key="start"
            type="primary"
            loading={startingAssessment}
            onClick={handleConfirmStart}
            className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
          >
            Start Assessment
          </Button>,
        ]}
        width={600}
      >
        {selectedAssessment && (
          <div>
            <div className="mb-4">
              <Title level={4} className="!mb-2 font-[gilroy-regular]">
                {selectedAssessment.title}
              </Title>
              <Paragraph className="text-gray-600 font-[gilroy-regular]">
                {selectedAssessment.description}
              </Paragraph>
            </div>

            <Divider />

            <Row gutter={[16, 16]} className="mb-4">
              <Col span={8}>
                <div className="text-center">
                  <BookOutlined className="text-[#F6921E] text-2xl mb-2" />
                  <div className="text-sm text-gray-600 font-[gilroy-regular]">Tasks</div>
                  <div className="font-semibold font-[gilroy-regular]">
                    {selectedAssessment.numberOfTasks}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <ClockCircleOutlined className="text-[#F6921E] text-2xl mb-2" />
                  <div className="text-sm text-gray-600 font-[gilroy-regular]">Time Limit</div>
                  <div className="font-semibold font-[gilroy-regular]">
                    {formatDuration(selectedAssessment.timeLimit)}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <TrophyOutlined className="text-[#F6921E] text-2xl mb-2" />
                  <div className="text-sm text-gray-600 font-[gilroy-regular]">Pass Score</div>
                  <div className="font-semibold font-[gilroy-regular]">
                    {selectedAssessment.passingScore}%
                  </div>
                </div>
              </Col>
            </Row>

            {selectedAssessment.instructions && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <Title level={5} className="!mb-2 font-[gilroy-regular] text-blue-800">
                  Instructions
                </Title>
                <Paragraph className="!mb-0 text-blue-700 font-[gilroy-regular]">
                  {selectedAssessment.instructions}
                </Paragraph>
              </div>
            )}

            {selectedAssessment.prerequisites && selectedAssessment.prerequisites.length > 0 && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                <Title level={5} className="!mb-2 font-[gilroy-regular] text-orange-800">
                  Prerequisites
                </Title>
                <ul className="!mb-0 text-orange-700 font-[gilroy-regular]">
                  {selectedAssessment.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Space>
                <ExclamationCircleOutlined className="text-yellow-600" />
                <Text className="font-[gilroy-regular] text-yellow-800">
                  Once started, the timer cannot be paused. Make sure you have enough time to complete the assessment.
                </Text>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Assessment;
