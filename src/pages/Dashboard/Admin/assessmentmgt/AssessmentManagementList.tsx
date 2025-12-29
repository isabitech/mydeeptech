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
} from 'antd';
import {
  EyeOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { multimediaAssessmentApi } from '../../../../service/axiosApi';
import AssessmentSubmissions from './AssessmentSubmissions';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Assessment {
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
}

interface AssessmentStatistics {
  totalAssessments: number;
  activeAssessments: number;
  totalSubmissions: number;
  totalPendingReview: number;
  totalApproved: number;
  totalRejected: number;
  averageCompletionRate: number;
}

interface AssessmentOverviewResponse {
  success: boolean;
  message: string;
  data: {
    assessments: Assessment[];
    statistics: AssessmentStatistics;
  };
}

const AssessmentManagementList = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [statistics, setStatistics] = useState<AssessmentStatistics | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, [statusFilter, typeFilter]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      
      const response = await multimediaAssessmentApi.getAssessmentOverview();
      
      if (response.success && response.data) {
        // Handle the nested response structure
        const { assessments, statistics } = response.data;
        setAssessments(assessments);
        setStatistics(statistics);
      } else {
        console.error('Failed to load assessments:', response.message || 'Unknown error');
        setAssessments([]);
        setStatistics(null);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssessment = (assessment: Assessment) => {
    // Set the selected assessment to view its submissions
    setSelectedAssessment(assessment);
  };

  const handleBackToAssessments = () => {
    setSelectedAssessment(null);
  };

  const handleCreateAssessment = () => {
    // Navigate to create assessment page or open modal
    console.log('Create assessment clicked');
    // For now, you can implement navigation or modal opening here
    navigate('/admin/assessments/multimedia');
  };

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'success' : 'default';
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return '#10b981'; // green
    if (rate >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getApprovalRate = (assessment: Assessment) => {
    if (assessment.totalSubmissions === 0) return 0;
    return (assessment.approvedSubmissions / assessment.totalSubmissions) * 100;
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && assessment.pendingReview > 0) ||
      (statusFilter === 'approved' && assessment.approvedSubmissions > 0) ||
      (statusFilter === 'rejected' && assessment.rejectedSubmissions > 0);
    
    const matchesType = typeFilter === 'all' || assessment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Use backend statistics when available, fallback to calculated values
  const stats = statistics ? {
    totalAssessments: statistics.totalAssessments,
    activeAssessments: statistics.activeAssessments,
    totalSubmissions: statistics.totalSubmissions,
    pendingReviews: statistics.totalPendingReview,
    avgCompletionRate: statistics.averageCompletionRate.toFixed(1),
  } : {
    totalAssessments: assessments.length,
    activeAssessments: assessments.filter(a => a.isActive).length,
    totalSubmissions: assessments.reduce((acc, a) => acc + a.totalSubmissions, 0),
    pendingReviews: assessments.reduce((acc, a) => acc + a.pendingReview, 0),
    avgCompletionRate: assessments.length > 0 
      ? (assessments.reduce((acc, a) => acc + a.completionRate, 0) / assessments.length).toFixed(1)
      : '0.0',
  };

  // If an assessment is selected, show the submissions component
  if (selectedAssessment) {
    return (
      <AssessmentSubmissions 
        assessment={selectedAssessment} 
        onBack={handleBackToAssessments} 
      />
    );
  }

  return (
    <div className="p-6 font-[gilroy-regular]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
              <BookOutlined className="mr-3 text-[#F6921E]" />
              Assessment Management
            </Title>
            <Text className="text-gray-600 text-lg font-[gilroy-regular]">
              Monitor assessment performance and view detailed submission analytics
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateAssessment}
            className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
            size="large"
          >
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Total Assessments</Text>}
              value={stats.totalAssessments}
              prefix={<BookOutlined className="text-[#F6921E]" />}
              valueStyle={{ color: '#F6921E', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Active Assessments</Text>}
              value={stats.activeAssessments}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Total Submissions</Text>}
              value={stats.totalSubmissions}
              prefix={<FileTextOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center border-0 shadow-md">
            <Statistic
              title={<Text className="font-[gilroy-regular]">Pending Reviews</Text>}
              value={stats.pendingReviews}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-md">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search assessments by title, description, or type"
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
              <Option value="pending">Has Pending</Option>
              <Option value="approved">Has Approved</Option>
              <Option value="rejected">Has Rejected</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Filter by type"
              className="w-full font-[gilroy-regular]"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Types</Option>
              <Option value="multimedia">Multimedia</Option>
              <Option value="english_proficiency">English Proficiency</Option>
              <Option value="general">General Skills</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Assessment Cards */}
      <Spin spinning={loading}>
        {filteredAssessments.length === 0 ? (
          <Empty
            description={
              <Text className="font-[gilroy-regular] text-gray-500">
                No assessments found
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredAssessments.map((assessment) => (
              <Col xs={24} sm={12} lg={8} key={assessment.id}>
                <Card
                  className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewAssessment(assessment)}
                  bodyStyle={{ padding: '24px' }}
                >
                  {/* Assessment Header */}
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Title level={4} className="!mb-0 font-[gilroy-regular] text-[#333333]">
                        {assessment.title}
                      </Title>
                      <Badge
                        status={getStatusColor(assessment.isActive ? 'active' : 'inactive')}
                        text={
                          <Text className="font-[gilroy-regular] text-sm">
                            {assessment.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        }
                      />
                    </div>
                    <Tag 
                      color="#F6921E" 
                      className="font-[gilroy-regular] mb-2"
                    >
                      {assessment.type.replace('_', ' ').toUpperCase()}
                    </Tag>
                    <Text className="text-gray-600 text-sm font-[gilroy-regular] block">
                      {assessment.description}
                    </Text>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    {/* Submissions Overview */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <Text className="font-[gilroy-regular] text-sm text-gray-600">
                        Total Submissions
                      </Text>
                      <Text className="font-[gilroy-regular] text-lg font-semibold text-[#F6921E]">
                        {assessment.totalSubmissions}
                      </Text>
                    </div>

                    {/* Approval Rate */}
                    <div className="flex justify-between items-center">
                      <Text className="font-[gilroy-regular] text-sm text-gray-600">
                        Approval Rate
                      </Text>
                      <Text className="font-[gilroy-regular] text-sm font-semibold text-green-600">
                        {getApprovalRate(assessment).toFixed(1)}%
                      </Text>
                    </div>

                    {/* Average Score */}
                    <div className="flex justify-between items-center">
                      <Text className="font-[gilroy-regular] text-sm text-gray-600">
                        Average Score
                      </Text>
                      <Text className="font-[gilroy-regular] text-sm font-semibold text-[#F6921E]">
                        {assessment.averageScore.toFixed(1)}/10
                      </Text>
                    </div>

                    {/* Completion Rate */}
                    <div className="flex justify-between items-center">
                      <Text className="font-[gilroy-regular] text-sm text-gray-600">
                        Completion Rate
                      </Text>
                      <Text 
                        className="font-[gilroy-regular] text-sm font-semibold"
                        style={{ color: getCompletionRateColor(assessment.completionRate) }}
                      >
                        {assessment.completionRate.toFixed(1)}%
                      </Text>
                    </div>

                    {/* Average Time */}
                    <div className="flex justify-between items-center">
                      <Text className="font-[gilroy-regular] text-sm text-gray-600">
                        Avg. Completion Time
                      </Text>
                      <Text className="font-[gilroy-regular] text-sm font-semibold text-gray-700">
                        {formatDuration(assessment.averageCompletionTime)}
                      </Text>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="mt-4 flex justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <Text className="font-[gilroy-regular] text-gray-600">
                          {assessment.pendingReview} pending
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <Text className="font-[gilroy-regular] text-gray-600">
                          {assessment.approvedSubmissions} approved
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="font-[gilroy-regular] text-gray-600">
                          {assessment.rejectedSubmissions} rejected
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Text className="font-[gilroy-regular] text-xs text-gray-500">
                      Last submission: {assessment.lastSubmissionAt 
                        ? new Date(assessment.lastSubmissionAt).toLocaleDateString()
                        : 'No submissions yet'
                      }
                    </Text>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <Button
                      type="primary"
                      block
                      icon={<EyeOutlined />}
                      className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
                    >
                      View Submissions
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default AssessmentManagementList;