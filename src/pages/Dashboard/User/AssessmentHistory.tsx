import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Button, Modal, Statistic, Row, Col, Alert, Spin } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAssessmentSystem } from '../../../hooks/Auth/User/useAssessmentSystem';

const { Title, Text } = Typography;

interface AssessmentRecord {
  _id: string;
  assessmentType: string;
  scorePercentage: number;
  passed: boolean;
  timeSpentMinutes: number;
  attemptNumber: number;
  createdAt: string;
  questions?: Array<{
    questionId: string;
    questionText: string;
    userAnswer: string;
    isCorrect: boolean;
  }>;
}

interface AssessmentStatistics {
  _id: string;
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttempt: string;
}

const AssessmentHistory: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [statistics, setStatistics] = useState<AssessmentStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [canRetake, setCanRetake] = useState(false);
  const [nextRetakeTime, setNextRetakeTime] = useState<string | null>(null);

  const { getAssessmentHistory, checkRetakeEligibility } = useAssessmentSystem();

  // Load assessment history
  const loadAssessmentHistory = async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAssessmentHistory(page, 10);
      
      if (result.success && result.data) {
        setAssessments(result.data.assessments || []);
        setStatistics(result.data.statistics || []);
        setTotalCount(result.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error loading assessment history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check retake eligibility
  const loadRetakeEligibility = async () => {
    try {
      const result = await checkRetakeEligibility();
      if (result.success && result.data) {
        setCanRetake(result.data.canRetake);
        setNextRetakeTime(result.data.nextRetakeTime);
      }
    } catch (error) {
      console.error('Error checking retake eligibility:', error);
    }
  };

  useEffect(() => {
    loadAssessmentHistory();
    loadRetakeEligibility();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAssessmentHistory(page);
  };

  // Show assessment details
  const showDetails = (assessment: AssessmentRecord) => {
    setSelectedAssessment(assessment);
    setDetailsModalVisible(true);
  };

  // Format date display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get grade color
  const getGradeColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
      sorter: true,
    },
    {
      title: 'Assessment Type',
      dataIndex: 'assessmentType',
      key: 'assessmentType',
      render: (type: string) => (
        <Text className="font-[gilroy-regular] capitalize">
          {type.replace('_', ' ')}
        </Text>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'scorePercentage',
      key: 'scorePercentage',
      render: (score: number) => (
        <Tag color={getGradeColor(score)} className="font-[gilroy-regular]">
          {score}%
        </Tag>
      ),
      sorter: true,
    },
    {
      title: 'Result',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed: boolean) => (
        <Tag 
          color={passed ? 'success' : 'error'} 
          icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          className="font-[gilroy-regular]"
        >
          {passed ? 'PASSED' : 'FAILED'}
        </Tag>
      ),
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpentMinutes',
      key: 'timeSpentMinutes',
      render: (minutes: number) => (
        <Text className="font-[gilroy-regular]">
          <ClockCircleOutlined className="mr-1" />
          {minutes}m
        </Text>
      ),
    },
    {
      title: 'Attempt',
      dataIndex: 'attemptNumber',
      key: 'attemptNumber',
      render: (attempt: number) => (
        <Tag color="blue" className="font-[gilroy-regular]">
          #{attempt}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AssessmentRecord) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
          className="font-[gilroy-regular]"
        >
          View Details
        </Button>
      ),
    },
  ];

  // Render statistics cards
  const renderStatistics = () => {
    if (!statistics.length) return null;

    const stats = statistics[0]; // Assuming one assessment type for now
    const passRate = stats.totalAttempts > 0 ? (stats.passedAttempts / stats.totalAttempts * 100).toFixed(1) : '0';

    return (
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Total Attempts"
              value={stats.totalAttempts}
              valueStyle={{ color: '#F6921E', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Pass Rate"
              value={passRate}
              suffix="%"
              valueStyle={{ color: '#52c41a', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Best Score"
              value={stats.bestScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Average Score"
              value={stats.averageScore.toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#722ed1', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
            Assessment History
          </Title>
          <Text className="text-gray-600 font-[gilroy-regular]">
            Track your assessment performance and progress
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => loadAssessmentHistory(currentPage)}
          className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
        >
          Refresh
        </Button>
      </div>

      {/* Retake Eligibility Alert */}
      {!canRetake && nextRetakeTime && (
        <Alert
          message="Retake Available Soon"
          description={`You can retake the assessment after ${formatDate(nextRetakeTime)}`}
          type="info"
          showIcon
          className="mb-6 font-[gilroy-regular]"
        />
      )}

      {canRetake && (
        <Alert
          message="Retake Available"
          description="You are eligible to retake the assessment now!"
          type="success"
          showIcon
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => window.location.href = '/dashboard/assessment'}
              className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
            >
              Take Assessment
            </Button>
          }
          className="mb-6 font-[gilroy-regular]"
        />
      )}

      {/* Statistics */}
      {renderStatistics()}

      {/* Assessment History Table */}
      <Card className="shadow-xl border-0 rounded-xl">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={assessments}
            rowKey="_id"
            pagination={{
              current: currentPage,
              total: totalCount,
              pageSize: 10,
              onChange: handlePageChange,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} assessments`,
            }}
            className="font-[gilroy-regular]"
          />
        </Spin>
      </Card>

      {/* Assessment Details Modal */}
      <Modal
        title={
          <span className="text-[#333333] font-[gilroy-regular] text-lg">
            Assessment Details
          </span>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
        className="font-[gilroy-regular]"
      >
        {selectedAssessment && (
          <div>
            {/* Assessment Summary */}
            <Row gutter={16} className="mb-6">
              <Col span={12}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Score"
                    value={selectedAssessment.scorePercentage}
                    suffix="%"
                    valueStyle={{ 
                      color: getGradeColor(selectedAssessment.scorePercentage),
                      fontFamily: 'gilroy-regular' 
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Time Spent"
                    value={selectedAssessment.timeSpentMinutes}
                    suffix="min"
                    valueStyle={{ fontFamily: 'gilroy-regular' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Question Details */}
            {selectedAssessment.questions && selectedAssessment.questions.length > 0 && (
              <div>
                <Title level={5} className="!text-[#333333] font-[gilroy-regular]">
                  Question Breakdown
                </Title>
                <div className="max-h-96 overflow-y-auto">
                  {selectedAssessment.questions.map((question, index) => (
                    <Card 
                      key={question.questionId}
                      size="small" 
                      className={`mb-3 ${question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Text strong className="font-[gilroy-regular]">
                            Q{index + 1}: {question.questionText}
                          </Text>
                          <br />
                          <Text className="font-[gilroy-regular]">
                            Your answer: <Text strong>{question.userAnswer}</Text>
                          </Text>
                        </div>
                        <Tag 
                          color={question.isCorrect ? 'success' : 'error'}
                          icon={question.isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        >
                          {question.isCorrect ? 'Correct' : 'Incorrect'}
                        </Tag>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssessmentHistory;