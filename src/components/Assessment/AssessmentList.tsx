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
  Statistic,
} from 'antd';
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  HistoryOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { multimediaAssessmentApi } from '../../service/axiosApi';

const { Title, Text, Paragraph } = Typography;

interface AssessmentSection {
  name: string;
  questions: number;
}

interface ProjectInfo {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface VideoReels {
  totalAvailable: number;
  categories: string[];
}

interface UserStatus {
  hasAttempted: boolean;
  latestScore?: number;
  passed?: boolean;
  lastAttemptDate?: string | null;
  canRetake: boolean;
  nextRetakeAvailable?: string | null;
  status?: string;
  attempts?: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'multimedia_assessment' | 'english_proficiency' | 'akan_proficiency' | 'general';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  totalQuestions?: number;
  totalTasks?: number;
  passingScore: number;
  maxAttempts?: number | null;
  cooldownHours: number;
  isActive: boolean;
  requirements: string[];
  instructions: string;
  benefits: string[];
  userStatus: UserStatus;
  sections?: AssessmentSection[];
  projectInfo?: ProjectInfo;
  videoReels?: VideoReels;
}

interface AssessmentSummary {
  totalAssessments: number;
  englishProficiency: number;
  multimediaAssessments: number;
  userCanTake: number;
}

interface AssessmentInstructions {
  english: string;
  multimedia: string;
  general: string;
}

interface AvailableAssessmentsResponse {
  success: boolean;
  message: string;
  data: {
    assessments: Assessment[];
    summary: AssessmentSummary;
    instructions: AssessmentInstructions;
  };
}

const AssessmentList: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableAssessments();
  }, []);

  const loadAvailableAssessments = async () => {
    try {
      setLoading(true);

      const response: AvailableAssessmentsResponse = await multimediaAssessmentApi.getAvailableAssessments();

      console.log('Available Assessments Response:', response.data.assessments);

      if (response.success && response.data) {
        // Use the assessments directly from the backend response
        const assessmentData = response.data.assessments || [];
        setAssessments(assessmentData);
      } else {
        console.error('Failed to load assessments:', response.message || 'Unknown error');
        setAssessments([]);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (assessment: Assessment) => {
    if (assessment.type === 'multimedia_assessment') {
      navigate(`/dashboard/assessment/multimedia/${assessment.id}`);
    } else {
      // For other assessment types, navigate to general assessment page
      navigate(`/dashboard/assessment?type=${assessment.type}&id=${assessment.id}`);
    }

    try {
      // Call the correct API endpoint to start the assessment by type
      let response;
      if (assessment.type === 'multimedia_assessment') {
        response = await multimediaAssessmentApi.startUserAssessment(assessment.id);
      } else {
        response = await multimediaAssessmentApi.startGeneralAssessment(assessment.id);
      }

      if (response.success) {
        // Navigate to the assessment page after successful API call
      } else {
        console.error('Failed to start assessment:', response.message);
        // You might want to show a notification here
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      // You might want to show an error notification here
    }
  };

  const getStatusColor = (userStatus: Assessment['userStatus']) => {
    if (userStatus.hasAttempted) {
      if (userStatus.passed) return 'success';
      if (userStatus.latestScore !== undefined && userStatus.latestScore < 60) return 'error';
      return 'processing';
    }
    return 'default';
  };

  const getStatusIcon = (userStatus: Assessment['userStatus']) => {
    if (userStatus.hasAttempted) {
      if (userStatus.passed) return <CheckCircleOutlined />;
      if (userStatus.latestScore !== undefined && userStatus.latestScore < 60) return <ClockCircleOutlined />;
      return <HistoryOutlined />;
    }
    return <BookOutlined />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'orange';
      case 'Advanced': return 'red';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] font-[gilroy-regular]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 font-[gilroy-regular]">
      <div className="mb-8">
        <Title level={2} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
          <BookOutlined className="mr-3 text-[#F6921E]" />
          Available Assessments
        </Title>
        <Paragraph className="text-gray-600 text-lg font-[gilroy-regular]">
          Complete these assessments to qualify for different types of annotation projects.
        </Paragraph>
      </div>

      {assessments.length === 0 ? (
        <Empty
          description={<Text className="font-[gilroy-regular] text-gray-500">No assessments available</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[20, 20]}>
          {assessments.map((assessment) => (
            <Col key={assessment.id} xs={24} lg={12} xl={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card
                  className="!h-full grid grid-col-1 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl"
                  // styles={{ body: { padding: '24px' } }}
                // actions={
                //   assessment.userStatus.hasAttempted ? [
                //     <Button
                //       key="view-results"
                //       icon={<HistoryOutlined />}
                //       onClick={() => navigate('/dashboard/assessment-history')}
                //       size="large"
                //       className="font-[gilroy-regular] mr-2"
                //     >
                //       View Results
                //     </Button>,
                //     assessment.userStatus.canRetake ? (
                //       <Button
                //         key="retake"
                //         type="primary"
                //         icon={<PlayCircleOutlined />}
                //         onClick={() => handleStartAssessment(assessment)}
                //         size="large"
                //         className="font-[gilroy-regular] bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c]"
                //       >
                //         Retake
                //       </Button>
                //     ) : (
                //       <Button
                //         key="cooldown"
                //         disabled
                //         size="large"
                //         className="font-[gilroy-regular]"
                //       >
                //         Cooldown Active
                //       </Button>
                //     )
                //   ] : [
                //     <Button
                //       key="start"
                //       type="primary"
                //       icon={<PlayCircleOutlined />}
                //       onClick={() => handleStartAssessment(assessment)}
                //       size="large"
                //       block
                //       className="font-[gilroy-regular]] !w-[90%] !mt-auto mx-auto bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c]"
                //     >
                //       Start Assessment
                //     </Button>
                //   ]
                // }
                >
                  <div className="h-full flex flex-col">

                    <div className="mb-4">
                      <div className="flex items-start mb-3 gap-3">
                        <Title level={5} className="!mb-0 !text-[#333333] font-[gilroy-regular] w-[65%]">
                          {assessment.title}
                        </Title>
                        <Badge
                          status={getStatusColor(assessment.userStatus)}
                          className='flex items-center ml-auto'
                          text={
                            <Text className="font-[gilroy-regular] text-sm shrink-0 flex items-center">
                              {assessment.userStatus.hasAttempted
                                ? assessment.userStatus.passed
                                  ? 'Passed'
                                  : 'Failed'
                                : 'Not Started'}
                            </Text>
                          }
                        />
                      </div>

                      <Paragraph className="text-gray-600 mb-4 font-[gilroy-regular]">
                        {assessment.description}
                      </Paragraph>

                      <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <Tag
                            color={getDifficultyColor(assessment.difficulty)}
                            className="font-[gilroy-regular] px-3 py-1 text-sm border-0 rounded-full"
                          >
                            <StarOutlined className="mr-1" />
                            {assessment.difficulty}
                          </Tag>
                          <Tag
                            color="#F6921E"
                            className="font-[gilroy-regular] px-3 py-1 text-sm border-0 rounded-full"
                          >
                            {assessment.type.replace('_', ' ').toUpperCase()}
                          </Tag>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <Row gutter={16}>
                            <Col span={8}>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-[#F6921E] font-[gilroy-regular]">
                                  {assessment.totalQuestions || assessment.totalTasks || 'N/A'}
                                </div>
                                <Text className="text-gray-500 text-sm font-[gilroy-regular]">
                                  {assessment.totalQuestions ? 'Questions' : 'Tasks'}
                                </Text>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-[#F6921E] font-[gilroy-regular]">
                                  {assessment.estimatedDuration}
                                </div>
                                <Text className="text-gray-500 text-sm font-[gilroy-regular]">Minutes</Text>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-[#F6921E] font-[gilroy-regular]">
                                  {assessment.passingScore}%
                                </div>
                                <Text className="text-gray-500 text-sm font-[gilroy-regular]">Pass Score</Text>
                              </div>
                            </Col>
                          </Row>
                        </div>

                        {assessment.userStatus.hasAttempted && assessment.userStatus.lastAttemptDate && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-l-4 border-[#F6921E]">
                            <Text strong className="font-[gilroy-regular] text-[#333333]">Last Attempt: </Text>
                            <br />
                            <Text className="font-[gilroy-regular] text-gray-600">
                              Score: <span className={`font-semibold ${assessment.userStatus.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {assessment.userStatus.latestScore}%
                              </span> •{' '}
                              {new Date(assessment.userStatus.lastAttemptDate).toLocaleDateString()}
                            </Text>
                            {!assessment.userStatus.canRetake && assessment.userStatus.nextRetakeAvailable && (
                              <div className="mt-2">
                                <Text className="font-[gilroy-regular] text-sm text-gray-500">
                                  Next attempt available: {new Date(assessment.userStatus.nextRetakeAvailable).toLocaleDateString()}
                                </Text>
                              </div>
                            )}
                          </div>
                        )}
                      </Space>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 w-full">
                      {assessment.userStatus.hasAttempted ? (
                        <>
                          <Button
                            key="view-results"
                            icon={<HistoryOutlined />}
                            onClick={() => navigate('/dashboard/assessment-history')}
                            size="middle"
                            className="font-[gilroy-regular]"
                          >
                            View Results
                          </Button>
                          {assessment.userStatus.canRetake ? (
                            <Button
                              key="retake"
                              type="primary"
                              icon={<PlayCircleOutlined />}
                              onClick={() => handleStartAssessment(assessment)}
                              size="middle"
                              className="font-[gilroy-regular] bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c]"
                            >
                              Retake
                            </Button>
                          ) : (
                            <Button
                              key="cooldown"
                              disabled
                              size="middle"
                              className="font-[gilroy-regular]"
                            >
                              Cooldown Active
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          key="start"
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleStartAssessment(assessment)}
                          size="large"
                          className="font-[gilroy-regular] w-full mt-auto bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c]"
                        >
                          Start Assessment
                        </Button>
                      )}
                    </div>

                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AssessmentList;