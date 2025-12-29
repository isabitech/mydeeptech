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
  Form,
  message,
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
import { useBatchReview } from '../../hooks/QA/useBatchReview';
import { TaskReviewForm } from './TaskReviewForm';
import { QAReviewMultimediaResponseType, Submission } from './QAReviews/qa-review-multimedia-response-type';
import { multimediaAssessmentApi } from '../../service/axiosApi';

const { Title, Text } = Typography;
const { Search, TextArea } = Input;
const { Option } = Select;

interface QAReviewDashboardProps {
  onReviewComplete?: (submissionId: string, decision: string) => void;
}

export const QAReviewDashboard: React.FC<QAReviewDashboardProps> = ({
  onReviewComplete,
}) => {
  const { getPendingSubmissions, loading, submissions, pagination } = useGetPendingSubmissions();
  const { batchReview, loading: batchLoading } = useBatchReview();
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [submissionStats, setSubmissionStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'submittedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    filterBy: 'all',
    search: '',
    status: 'pending',
  });

  const loadSubmissions = useCallback(async () => {
    const searchFilters = { ...filters, status: activeStatusTab };
    
    try {
      if (!searchFilters.search) {
        const { search, ...otherFilters } = searchFilters;
        await getPendingSubmissions(otherFilters);
      } else {
        await getPendingSubmissions(searchFilters);
      }
      
    } catch (error) {
      console.error(`Failed to load ${activeStatusTab} submissions:`, error);
      message.error(`Failed to load ${activeStatusTab} submissions`);
    }
  }, [getPendingSubmissions]); // Remove filters and activeStatusTab from dependencies

  // Load submissions when component mounts
  useEffect(() => {
    loadSubmissions();
  }, []); // Only run on mount

  // Load submissions when filters change (excluding status which is handled separately)
  useEffect(() => {
    loadSubmissions();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.filterBy, filters.search]);

  // Load submissions when active tab changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, status: activeStatusTab, page: 1 }));
    loadSubmissions();
  }, [activeStatusTab]);

  // Update stats when submissions change
  useEffect(() => {
    const stats = submissions.reduce((acc, sub) => {
      const status = sub.status === 'submitted' ? 'pending' : sub.status;
      acc[status as keyof typeof acc] = (acc[status as keyof typeof acc] || 0) + 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });
    setSubmissionStats(stats);
  }, [submissions]);

  // Handle batch review
  const handleBatchReview = useCallback(async (decision: 'Approve' | 'Reject' | 'Request Revision', feedback?: string) => {
    try {
      const result = await batchReview({
        submissionIds: selectedRowKeys,
        decision,
        overallFeedback: feedback
      });
      
      if (result.success) {
        setSelectedRowKeys([]);
        setShowBatchModal(false);
        // Manually call loadSubmissions instead of depending on it
        const searchFilters = { ...filters, status: activeStatusTab };
        if (!searchFilters.search) {
          const { search, ...otherFilters } = searchFilters;
          await getPendingSubmissions(otherFilters);
        } else {
          await getPendingSubmissions(searchFilters);
        }
        Modal.success({
          title: 'Batch Review Complete',
          content: `Successfully processed ${result.data?.processedCount || selectedRowKeys.length} submissions.`,
        });
      } else {
        Modal.error({
          title: 'Batch Review Failed',
          content: result.error || 'Failed to process batch review',
        });
      }
    } catch (error) {
      Modal.error({
        title: 'Batch Review Error',
        content: 'An unexpected error occurred during batch review',
      });
    }
  }, [selectedRowKeys, batchReview, filters, activeStatusTab, getPendingSubmissions]);

  // Handle review submission completion
  const handleReviewComplete = useCallback((submissionId: string, decision: string) => {
    setShowReviewModal(false);
    setSelectedSubmission(null);
    // Manually refresh submissions instead of depending on loadSubmissions
    const refreshSubmissions = async () => {
      const searchFilters = { ...filters, status: activeStatusTab };
      try {
        if (!searchFilters.search) {
          const { search, ...otherFilters } = searchFilters;
          await getPendingSubmissions(otherFilters);
        } else {
          await getPendingSubmissions(searchFilters);
        }
      } catch (error) {
        console.error('Failed to refresh submissions:', error);
      }
    };
    refreshSubmissions();
    if (onReviewComplete) {
      onReviewComplete(submissionId, decision);
    }
  }, [onReviewComplete, filters, activeStatusTab, getPendingSubmissions]);

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
            <div className="font-medium">{name || record.userName || 'Unknown'}</div>
            <Text type="secondary" className="text-xs">{record.userEmail || ''}</Text>
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
            <Text className="text-sm">{record.tasksCompleted ?? 0}/{record.totalTasks ?? record.tasksCompleted ?? 0} tasks</Text>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${record.totalTasks ? ((record.tasksCompleted ?? 0) / record.totalTasks) * 100 : 100}%` }}
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
          <div className="text-sm font-medium">{ score && score.toFixed(1)}/10</div>
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
          type={activeStatusTab === 'pending' ? 'primary' : 'default'}
          icon={<EyeOutlined />}
          onClick={async () => {
            try {
              // Fetch full submission details from backend before opening modal
              const resp = await multimediaAssessmentApi.getSubmissionForReview(record._id);
              if (resp?.success && resp.data?.submission) {
                setSelectedSubmission(resp.data.submission as Submission);
              } else {
                // Fallback to the lightweight record if backend didn't return full details
                setSelectedSubmission(record as any);
              }
            } catch (err) {
              console.error('Failed to fetch submission details:', err);
              setSelectedSubmission(record as any);
            } finally {
              setShowReviewModal(true);
            }
          }}
        >
          {activeStatusTab === 'pending' ? 'Review' : 
           activeStatusTab === 'approved' ? 'View Details' : 'View Review'}
        </Button>
      ),
    },
  ];

  // Quick stats calculation
  const quickStats = {
    totalPending: submissions.length,
    highPriority: submissions.filter(s => (s.waitingTime ?? 0) > 24 * 3600000).length,
    avgScore: submissions.length > 0 ? submissions.reduce((sum, s) => sum + (s.avgScore ?? 0), 0) / submissions.length : 0,
    retakes: submissions.filter(s => (s.attemptNumber ?? 0) > 1).length,
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
          <Space>
            {selectedRowKeys.length > 0 && (
              <Button 
                type="primary"
                ghost
                onClick={() => setShowBatchModal(true)}
                loading={batchLoading}
              >
                Batch Review ({selectedRowKeys.length})
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadSubmissions}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
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

        {/* Status Bar with Tabs */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="!mb-0">Submission Status Overview</Title>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadSubmissions}
              loading={loading}
              size="small"
            >
              Refresh Stats
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card 
                className={`cursor-pointer transition-all ${
                  activeStatusTab === 'pending' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => {
                  setActiveStatusTab('pending');
                }}
              >
                <Statistic
                  title="Pending Reviews"
                  value={submissionStats.pending}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ 
                    color: activeStatusTab === 'pending' ? '#1890ff' : '#666',
                    fontSize: '24px'
                  }}
                />
                {activeStatusTab === 'pending' && (
                  <Tag color="blue" className="mt-2">Currently Viewing</Tag>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                className={`cursor-pointer transition-all ${
                  activeStatusTab === 'approved' 
                    ? 'border-green-500 bg-green-50' 
                    : 'hover:border-green-300'
                }`}
                onClick={() => {
                  setActiveStatusTab('approved');
                }}
              >
                <Statistic
                  title="Approved Submissions"
                  value={submissionStats.approved}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ 
                    color: activeStatusTab === 'approved' ? '#52c41a' : '#666',
                    fontSize: '24px'
                  }}
                />
                {activeStatusTab === 'approved' && (
                  <Tag color="green" className="mt-2">Currently Viewing</Tag>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                className={`cursor-pointer transition-all ${
                  activeStatusTab === 'rejected' 
                    ? 'border-red-500 bg-red-50' 
                    : 'hover:border-red-300'
                }`}
                onClick={() => {
                  setActiveStatusTab('rejected');
                }}
              >
                <Statistic
                  title="Rejected Submissions"
                  value={submissionStats.rejected}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ 
                    color: activeStatusTab === 'rejected' ? '#ff4d4f' : '#666',
                    fontSize: '24px'
                  }}
                />
                {activeStatusTab === 'rejected' && (
                  <Tag color="red" className="mt-2">Currently Viewing</Tag>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
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
          <div className="mb-4">
            <Title level={4}>
              {activeStatusTab === 'pending' && 'Pending Submissions'}
              {activeStatusTab === 'approved' && 'Approved Submissions'}
              {activeStatusTab === 'rejected' && 'Rejected Submissions'}
            </Title>
          </div>
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
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys as string[]),
                getCheckboxProps: (record) => ({
                  disabled: record.status === 'reviewed' || record.status === 'approved',
                }),
              }}
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
              rowKey={(record) => record._id || record.annotatorId || `${record.userName || 'unknown'}-${record.submittedAt || ''}`}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </motion.div>

      {/* Review Modal */}
      <Modal
        title={`Review Submission - ${selectedSubmission?.annotatorId?.fullName || 'Submission'}`}
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
            submissionId={selectedSubmission._id}
            onComplete={handleReviewComplete}
            submission={selectedSubmission}
            onCancel={() => {
              setShowReviewModal(false);
              setSelectedSubmission(null);
            }}
          />
        )}
      </Modal>

      {/* Batch Review Modal */}
      <Modal
        title={`Batch Review - ${selectedRowKeys.length} Submissions`}
        open={showBatchModal}
        onCancel={() => setShowBatchModal(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="Batch Review"
            description={`You are about to review ${selectedRowKeys.length} submissions. This action will apply the same decision and feedback to all selected submissions.`}
            type="info"
            showIcon
          />
          
          <Form
            layout="vertical"
            onFinish={(values) => {
              handleBatchReview(values.decision, values.feedback);
            }}
          >
            <Form.Item
              name="decision"
              label="Decision"
              rules={[{ required: true, message: 'Please select a decision' }]}
            >
              <Select placeholder="Select decision for all submissions">
                <Option value="Approve">Approve All</Option>
                <Option value="Reject">Reject All</Option>
                <Option value="Request Revision">Request Revision for All</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="feedback"
              label="Overall Feedback (Optional)"
            >
              <TextArea 
                rows={4} 
                placeholder="Enter feedback that will be applied to all selected submissions..."
                maxLength={2000}
              />
            </Form.Item>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowBatchModal(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={batchLoading}
                danger={Form.useWatch('decision', {}) === 'Reject'}
              >
                Apply to {selectedRowKeys.length} Submissions
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};