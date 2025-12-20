import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Statistic,
  Row,
  Col,
  Select,
  Input,
  Typography,
  Alert,
  Tooltip,
  Avatar,
  Rate,
} from 'antd';
import {
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useGetPendingSubmissions } from '../../hooks/QA/useGetPendingSubmissions';
import { TaskReviewForm } from './TaskReviewForm';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface QAReviewDashboardProps {
  onReviewComplete?: (submissionId: string, decision: string) => void;
}

export const QAReviewDashboard: React.FC<QAReviewDashboardProps> = ({
  onReviewComplete,
}) => {
  const { getPendingSubmissions, loading, submissions, pagination } = useGetPendingSubmissions();
  
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'submittedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    filterBy: 'all',
    search: '',
  });

  // Load submissions on component mount and filter changes
  useEffect(() => {
    loadSubmissions();
  }, [filters]);

  const loadSubmissions = useCallback(async () => {
    const searchFilters = { ...filters };
    if (!searchFilters.search) {
      const { search, ...otherFilters } = searchFilters;
      await getPendingSubmissions(otherFilters);
    } else {
      await getPendingSubmissions(searchFilters);
    }
  }, [filters, getPendingSubmissions]);

  // Handle review submission completion
  const handleReviewComplete = useCallback((submissionId: string, decision: string) => {
    setShowReviewModal(false);
    setSelectedSubmission(null);
    loadSubmissions(); // Refresh the list
    if (onReviewComplete) {
      onReviewComplete(submissionId, decision);
    }
  }, [onReviewComplete, loadSubmissions]);

  // Table columns configuration
  const columns = [
    {
      title: 'Annotator',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{name}</div>
            <Text type="secondary" className="text-xs">{record.userEmail}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Assessment',
      dataIndex: 'assessmentTitle',
      key: 'assessmentTitle',
      render: (title: string) => (
        <Text strong className="text-sm">{title}</Text>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: any) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircleOutlined className="text-green-500" />
            <Text className="text-sm">{record.tasksCompleted}/{record.totalTasks} tasks</Text>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(record.tasksCompleted / record.totalTasks) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Average Score',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score: number) => (
        <div className="text-center">
          <Rate disabled defaultValue={score / 2} allowHalf className="text-xs" />
          <div className="text-sm font-medium">{score.toFixed(1)}/10</div>
        </div>
      ),
    },
    {
      title: 'Completion Time',
      dataIndex: 'completionTime',
      key: 'completionTime',
      render: (time: number) => {
        const minutes = Math.floor(time / 60000);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return (
          <div className="text-center">
            <ClockCircleOutlined className="text-gray-400 mr-1" />
            <Text className="text-sm">
              {hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Waiting Time',
      dataIndex: 'waitingTime',
      key: 'waitingTime',
      render: (time: number) => {
        const hours = Math.floor(time / 3600000);
        const priority = hours > 24 ? 'high' : hours > 12 ? 'medium' : 'low';
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
        
        return (
          <Tag color={color}>
            {hours > 24 ? `${Math.floor(hours / 24)}d` : `${hours}h`}
          </Tag>
        );
      },
    },
    {
      title: 'Attempt',
      dataIndex: 'attemptNumber',
      key: 'attemptNumber',
      render: (attempt: number) => (
        <Tag color={attempt > 1 ? 'orange' : 'blue'}>
          #{attempt}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          submitted: { color: 'blue', icon: <ExclamationCircleOutlined /> },
          in_review: { color: 'orange', icon: <ClockCircleOutlined /> },
          reviewed: { color: 'green', icon: <CheckCircleOutlined /> },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
        
        return (
          <Tag color={config.color} icon={config.icon}>
            {status.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedSubmission(record);
            setShowReviewModal(true);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  // Quick stats calculation
  const quickStats = {
    totalPending: submissions.length,
    highPriority: submissions.filter(s => s.waitingTime > 24 * 3600000).length,
    avgScore: submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.avgScore, 0) / submissions.length : 0,
    retakes: submissions.filter(s => s.attemptNumber > 1).length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>QA Review Dashboard</Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadSubmissions}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Pending Reviews" 
                value={quickStats.totalPending}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="High Priority" 
                value={quickStats.highPriority}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: quickStats.highPriority > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Average Score" 
                value={quickStats.avgScore}
                precision={1}
                suffix="/10"
                prefix={<StarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Retake Attempts" 
                value={quickStats.retakes}
                prefix={<ReloadOutlined />}
                valueStyle={{ color: quickStats.retakes > 0 ? '#ff7a00' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by name or email"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              onSearch={() => loadSubmissions()}
              enterButton
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.filterBy}
              onChange={(value) => setFilters({ ...filters, filterBy: value, page: 1 })}
              className="w-full"
            >
              <Option value="all">All Submissions</Option>
              <Option value="priority">High Priority</Option>
              <Option value="recent">Recent</Option>
              <Option value="retakes">Retakes</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.sortBy}
              onChange={(value) => setFilters({ ...filters, sortBy: value, page: 1 })}
              className="w-full"
            >
              <Option value="submittedAt">Submit Date</Option>
              <Option value="avgScore">Score</Option>
              <Option value="waitingTime">Wait Time</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.sortOrder}
              onChange={(value) => setFilters({ ...filters, sortOrder: value as 'asc' | 'desc', page: 1 })}
              className="w-full"
            >
              <Option value="desc">Descending</Option>
              <Option value="asc">Ascending</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.limit}
              onChange={(value) => setFilters({ ...filters, limit: value, page: 1 })}
              className="w-full"
            >
              <Option value={10}>10 per page</Option>
              <Option value={20}>20 per page</Option>
              <Option value={50}>50 per page</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          {submissions.length === 0 && !loading ? (
            <Alert
              message="No Pending Submissions"
              description="There are currently no submissions waiting for review."
              type="info"
              showIcon
              className="text-center"
            />
          ) : (
            <Table
              columns={columns}
              dataSource={submissions}
              loading={loading}
              pagination={{
                current: pagination?.currentPage || 1,
                pageSize: filters.limit,
                total: pagination?.totalItems || 0,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} submissions`,
                onChange: (page) => setFilters({ ...filters, page }),
              }}
              rowKey={(record) => `${record.userId}-${record.submittedAt}`}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </motion.div>

      {/* Review Modal */}
      <Modal
        title={`Review Submission - ${selectedSubmission?.userName}`}
        open={showReviewModal}
        onCancel={() => {
          setShowReviewModal(false);
          setSelectedSubmission(null);
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 1400 }}
        destroyOnClose
      >
        {selectedSubmission && (
          <TaskReviewForm
            submissionId={`${selectedSubmission.userId}-${selectedSubmission.submittedAt}`}
            onComplete={handleReviewComplete}
            onCancel={() => {
              setShowReviewModal(false);
              setSelectedSubmission(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};