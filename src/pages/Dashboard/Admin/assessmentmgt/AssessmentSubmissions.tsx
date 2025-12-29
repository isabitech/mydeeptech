import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Badge,
  Tag,
  Space,
  Empty,
  Spin,
  Select,
  Input,
  Row,
  Col,
  Statistic,
  Avatar,
  Modal,
  Descriptions,
} from 'antd';
import { toast } from 'sonner';
import {
  EyeOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { multimediaAssessmentApi } from '../../../../service/axiosApi';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface AssessmentSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: string;
  submittedAt: string;
  completedAt?: string;
  completionTime: number; // in milliseconds
  score?: number;
  maxScore?: number;
  percentageScore?: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress';
  tasksCompleted: number;
  totalTasks: number;
  attemptNumber: number;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  sessionData?: any;
}

interface AssessmentSubmissionsProps {
  assessment: {
    id: string;
    title: string;
    description: string;
    type: 'multimedia' | 'english_proficiency' | 'general';
    totalSubmissions: number;
    pendingReview: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    averageScore: number;
    passingScore: number;
    completionRate: number;
    averageCompletionTime: number;
    createdAt: string;
    isActive: boolean;
    lastSubmissionAt?: string;
  };
  onBack: () => void;
}

const AssessmentSubmissions: React.FC<AssessmentSubmissionsProps> = ({ 
  assessment, 
  onBack 
}) => {
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedSubmission, setSelectedSubmission] = useState<AssessmentSubmission | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [pagination.current, pagination.pageSize, statusFilter, userFilter, assessment.id, assessment.type]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        userId: userFilter || undefined,
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: 'submittedAt',
        sortOrder: 'desc',
      };

      let response;
      // Use the correct API endpoint based on assessment type
      if (assessment.type === 'multimedia') {
        // For multimedia assessments, use specific assessment ID
        response = await multimediaAssessmentApi.getAssessmentSubmissions(
          assessment.type, 
          assessment.id, 
          params
        );
      } else {
        // For other assessment types (english-proficiency, general), use type-based endpoint
        // Convert underscore to hyphen for API endpoint
        const apiType = assessment.type.replace('_', '-');
        response = await multimediaAssessmentApi.getAssessmentSubmissions(
          apiType, 
          undefined, 
          params
        );
      }
      
      if (response.success && response.data) {
        const submissions = response.data.submissions || response.data;
        setSubmissions(submissions);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || submissions.length,
        }));
      } else {
        console.error('Failed to load submissions:', response.message || 'Unknown error');
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      setSubmissions([]);
      
      toast.error('Failed to Load Submissions: Unable to fetch assessment submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission: AssessmentSubmission) => {
    setSelectedSubmission(submission);
    setDetailsModalVisible(true);
  };

  const handleReviewSubmission = (submission: AssessmentSubmission) => {
    // Navigate to review page (this would need to be implemented)
    console.log('Navigate to review submission:', submission.id);
    // For now, just show a message
    toast.info(`Review functionality for submission ${submission.id} needs to be implemented.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'processing';
      case 'submitted': return 'warning';
      case 'in_progress': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleOutlined />;
      case 'rejected': return <CloseCircleOutlined />;
      case 'under_review': return <ExclamationCircleOutlined />;
      case 'submitted': return <ClockCircleOutlined />;
      default: return null;
    }
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds === 0) return 'In Progress';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: AssessmentSubmission) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={record.userAvatar} 
            icon={<UserOutlined />}
            className="bg-[#F6921E]"
          />
          <div>
            <Text strong className="font-[gilroy-regular] text-[#333333]">
              {record.userName}
            </Text>
            <br />
            <Text className="text-gray-500 text-sm font-[gilroy-regular]">
              {record.userEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Score',
      key: 'score',
      render: (record: AssessmentSubmission) => (
        <div className="text-center">
          {record.percentageScore !== undefined ? (
            <>
              <div className={`text-2xl font-bold font-[gilroy-regular] ${
                record.percentageScore >= 70 ? 'text-green-600' : 'text-red-600'
              }`}>
                {record.percentageScore}%
              </div>
              <Text className="text-gray-500 text-sm font-[gilroy-regular]">
                {record.score}/{record.maxScore}
              </Text>
            </>
          ) : (
            <Text className="text-gray-500 font-[gilroy-regular]">
              Pending
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: AssessmentSubmission) => (
        <div className="text-center">
          <Text className="font-[gilroy-regular] text-[#333333]">
            {record.tasksCompleted}/{record.totalTasks}
          </Text>
          <br />
          <Text className="text-gray-500 text-sm font-[gilroy-regular]">
            Attempt {record.attemptNumber}
          </Text>
        </div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: AssessmentSubmission) => (
        <div className="text-center">
          <Text className="font-[gilroy-regular] text-[#333333]">
            {formatDuration(record.completionTime)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: AssessmentSubmission) => (
        <Badge
          status={getStatusColor(record.status)}
          text={
            <Text className="font-[gilroy-regular] capitalize">
              {record.status.replace('_', ' ')}
            </Text>
          }
        />
      ),
    },
    {
      title: 'Submitted',
      key: 'submitted',
      render: (record: AssessmentSubmission) => (
        <div>
          <Text className="font-[gilroy-regular] text-[#333333]">
            {new Date(record.submittedAt).toLocaleDateString()}
          </Text>
          <br />
          <Text className="text-gray-500 text-sm font-[gilroy-regular]">
            {new Date(record.submittedAt).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: AssessmentSubmission) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="font-[gilroy-regular]"
          >
            Details
          </Button>
          {(record.status === 'submitted' || record.status === 'under_review') && (
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => handleReviewSubmission(record)}
              className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
            >
              Review
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    avgScore: submissions.length > 0 && submissions.some(s => s.percentageScore !== undefined)
      ? (submissions
          .filter(s => s.percentageScore !== undefined)
          .reduce((acc, s) => acc + (s.percentageScore || 0), 0) / 
         submissions.filter(s => s.percentageScore !== undefined).length
        ).toFixed(1)
      : 'N/A',
  };

  return (
    <div className="p-6 font-[gilroy-regular]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            className="font-[gilroy-regular]"
          >
            Back to Assessments
          </Button>
        </div>
        
        <Title level={2} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
          <BookOutlined className="mr-3 text-[#F6921E]" />
          {assessment.title} - Submissions
        </Title>
        <Text className="text-gray-600 text-lg font-[gilroy-regular]">
          Review and manage submissions for this assessment
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Total Submissions</Text>}
              value={assessment.totalSubmissions}
              prefix={<FileTextOutlined className="text-[#F6921E]" />}
              valueStyle={{ color: '#F6921E', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Pending Review</Text>}
              value={assessment.pendingReview}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Approved</Text>}
              value={assessment.approvedSubmissions}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Average Score</Text>}
              value={assessment.averageScore.toFixed(1)}
              suffix="/10"
              prefix={<TrophyOutlined className="text-[#F6921E]" />}
              valueStyle={{ color: '#F6921E', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-md">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search by name or email"
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              className="font-[gilroy-regular]"
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by status"
              className="w-full font-[gilroy-regular]"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="submitted">Submitted</Option>
              <Option value="under_review">Under Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="in_progress">In Progress</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Submissions Table */}
      <Card className="border-0 shadow-md">
        <Spin spinning={loading}>
          {filteredSubmissions.length === 0 ? (
            <Empty
              description={
                <Text className="font-[gilroy-regular] text-gray-500">
                  No submissions found for this assessment
                </Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredSubmissions}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredSubmissions.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => (
                  <Text className="font-[gilroy-regular]">
                    {range[0]}-{range[1]} of {total} submissions
                  </Text>
                ),
                onChange: (page, size) => {
                  setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size || 10,
                  }));
                },
              }}
              scroll={{ x: 1200 }}
              className="font-[gilroy-regular]"
            />
          )}
        </Spin>
      </Card>

      {/* Submission Details Modal */}
      <Modal
        title="Submission Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedSubmission(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setDetailsModalVisible(false);
              setSelectedSubmission(null);
            }}
            className="font-[gilroy-regular]"
          >
            Close
          </Button>,
          selectedSubmission && (selectedSubmission.status === 'submitted' || selectedSubmission.status === 'under_review') && (
            <Button
              key="review"
              type="primary"
              onClick={() => {
                setDetailsModalVisible(false);
                handleReviewSubmission(selectedSubmission);
              }}
              className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
            >
              Review Submission
            </Button>
          ),
        ]}
        width={700}
      >
        {selectedSubmission && (
          <Descriptions bordered column={2} className="font-[gilroy-regular]">
            <Descriptions.Item label="User" span={2}>
              <div className="flex items-center gap-3">
                <Avatar 
                  src={selectedSubmission.userAvatar} 
                  icon={<UserOutlined />}
                  className="bg-[#F6921E]"
                />
                <div>
                  <Text strong className="font-[gilroy-regular]">
                    {selectedSubmission.userName}
                  </Text>
                  <br />
                  <Text className="text-gray-500 font-[gilroy-regular]">
                    {selectedSubmission.userEmail}
                  </Text>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Assessment">
              {selectedSubmission.assessmentTitle}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color="#F6921E" className="font-[gilroy-regular]">
                {selectedSubmission.assessmentType.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge
                status={getStatusColor(selectedSubmission.status)}
                text={
                  <Text className="font-[gilroy-regular] capitalize">
                    {selectedSubmission.status.replace('_', ' ')}
                  </Text>
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Attempt">
              #{selectedSubmission.attemptNumber}
            </Descriptions.Item>
            {selectedSubmission.percentageScore !== undefined && (
              <>
                <Descriptions.Item label="Score">
                  <span className={selectedSubmission.percentageScore >= 70 ? 'text-green-600' : 'text-red-600'}>
                    {selectedSubmission.percentageScore}% ({selectedSubmission.score}/{selectedSubmission.maxScore})
                  </span>
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Progress">
              {selectedSubmission.tasksCompleted}/{selectedSubmission.totalTasks} tasks completed
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {formatDuration(selectedSubmission.completionTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Submitted At">
              {new Date(selectedSubmission.submittedAt).toLocaleString()}
            </Descriptions.Item>
            {selectedSubmission.completedAt && (
              <Descriptions.Item label="Completed At">
                {new Date(selectedSubmission.completedAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {selectedSubmission.reviewedBy && (
              <>
                <Descriptions.Item label="Reviewed By">
                  {selectedSubmission.reviewedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Reviewed At">
                  {selectedSubmission.reviewedAt ? new Date(selectedSubmission.reviewedAt).toLocaleString() : 'N/A'}
                </Descriptions.Item>
              </>
            )}
            {selectedSubmission.feedback && (
              <Descriptions.Item label="Feedback" span={2}>
                <Text className="font-[gilroy-regular]">{selectedSubmission.feedback}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AssessmentSubmissions;