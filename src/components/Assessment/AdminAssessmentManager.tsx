import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Space,
  Typography,
  Alert,
  Tag,
  Upload,
  Progress,
  Statistic,
  Row,
  Col,
  Tooltip,
  Popconfirm,
} from 'antd';
import { toast } from 'sonner';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  BarChartOutlined,
  YoutubeOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { multimediaAssessmentApi } from '../../service/axiosApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface Project {
  id: string;
  name: string;
  status: string;
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

interface AssessmentStatistics {
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageTimeSpent: number;
  passRate: number;
}

interface CreatedBy {
  _id: string;
  fullName: string;
  email: string;
}

interface AssessmentConfig {
  id: string;
  title: string;
  description: string;
  project: Project;
  requirements: AssessmentRequirements;
  totalConfiguredReels: number;
  completionRate: number;
  statistics: AssessmentStatistics;
  isActive: boolean;
  createdBy: CreatedBy;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AssessmentConfigResponse {
  success: boolean;
  message: string;
  data: {
    assessmentConfigs: AssessmentConfig[];
    pagination: Pagination;
  };
}

interface VideoReel {
  _id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  niche: string;
  duration: number;
  usageCount: number;
  isActive: boolean;
  qualityScore: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReelStatistics {
  nicheBreakdown: Array<{
    niche: string;
    count: number;
  }>;
  totalActiveReels: number;
  totalApprovedReels: number;
  totalReels: number;
}

interface VideoReelsResponse {
  success: boolean;
  message: string;
  data: {
    videoReels: VideoReel[];
    pagination: Pagination;
    statistics: ReelStatistics;
  };
}

interface AdminReelAssessmentManagerProps {
  onAssessmentCreated?: (assessment: any) => void;
}

export const AdminReelAssessmentManager: React.FC<AdminReelAssessmentManagerProps> = ({
  onAssessmentCreated,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('assessments');
  const [assessments, setAssessments] = useState<AssessmentConfig[]>([]);
  const [videoReels, setVideoReels] = useState<VideoReel[]>([]);
  const [reelStatistics, setReelStatistics] = useState<ReelStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [editingReel, setEditingReel] = useState<VideoReel | null>(null);

  // Form instances
  const [assessmentForm] = Form.useForm();
  const [reelForm] = Form.useForm();
  const [bulkUploadForm] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    loadAssessments();
    loadVideoReels();
  }, []);

  // Data loading functions
  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const response: AssessmentConfigResponse = await multimediaAssessmentApi.getAssessmentConfigs();
      if (response.success && response.data) {
        setAssessments(response.data.assessmentConfigs || []);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVideoReels = useCallback(async () => {
    try {
      setLoading(true);
      const response: VideoReelsResponse = await multimediaAssessmentApi.getAllVideoReels();
      if (response.success && response.data) {
        setVideoReels(response.data.videoReels || []);
        setReelStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Failed to load video reels:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Assessment management functions
  const handleCreateAssessment = useCallback(async (values: any) => {
    try {
      const response = await multimediaAssessmentApi.createAssessmentConfig(values);
      if (response.data?.success) {
        await loadAssessments();
        setShowAssessmentModal(false);
        assessmentForm.resetFields();
        if (onAssessmentCreated) {
          onAssessmentCreated(response.data.data.assessment);
        }
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  }, [assessmentForm, loadAssessments, onAssessmentCreated]);

  const handleUpdateAssessment = useCallback(async (values: any) => {
    try {
      if (!editingAssessment) return;
      
      const response = await multimediaAssessmentApi.updateAssessmentConfig(
        editingAssessment.id,
        values
      );
      
      if (response.data?.success) {
        await loadAssessments();
        setShowAssessmentModal(false);
        setEditingAssessment(null);
        assessmentForm.resetFields();
      }
    } catch (error) {
      console.error('Failed to update assessment:', error);
    }
  }, [editingAssessment, assessmentForm, loadAssessments]);

  const handleDeleteAssessment = useCallback(async (assessmentId: string) => {
    try {
      // API call would go here
      console.log('Delete assessment:', assessmentId);
      await loadAssessments();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  }, [loadAssessments]);

  // Video reel management functions with enhanced error handling
  const handleAddVideoReel = useCallback(async (values: any) => {
    try {
      setLoading(true);
      const response = await multimediaAssessmentApi.addVideoReel(values);
      if (response.data?.success) {
        await loadVideoReels();
        setShowReelModal(false);
        reelForm.resetFields();
        toast.success(response.data.message || 'Video reel added successfully!');
      }
    } catch (error: any) {
      console.error('Failed to add video reel:', error);
      
      // Handle YouTube-specific errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add video reel';
      const errorCode = error.response?.data?.code;
      
      let title = 'Error Adding Video';
      let content = errorMessage;
      
      switch (errorCode) {
        case 'INVALID_YOUTUBE_URL':
          title = 'Invalid YouTube URL';
          content = 'Please provide a valid YouTube URL. Supported formats: embed, shorts, watch, or youtu.be URLs.';
          break;
        case 'YOUTUBE_VIDEO_NOT_FOUND':
          title = 'Video Not Found';
          content = 'The YouTube video could not be found. It may be private, deleted, or the URL is incorrect.';
          break;
        case 'DUPLICATE_YOUTUBE_URL':
          title = 'Duplicate Video';
          content = 'This video has already been added to the system.';
          break;
        case 'YOUTUBE_API_ERROR':
          title = 'YouTube API Error';
          content = 'Failed to extract video information from YouTube. Please try again later.';
          break;
        case 'YOUTUBE_API_QUOTA_EXCEEDED':
          title = 'API Limit Reached';
          content = 'YouTube API quota exceeded. Please try again later.';
          break;
      }
      
      toast.error(`${title}: ${content}`);
    } finally {
      setLoading(false);
    }
  }, [reelForm, loadVideoReels]);

  const handleBulkAddReels = useCallback(async (values: any) => {
    try {
      setLoading(true);
      const urls = values.urls.split('\n').map((url: string) => url.trim()).filter(Boolean);
      
      const response = await multimediaAssessmentApi.bulkAddVideoReels({
        youtubeUrls: urls,
        defaultNiche: values.defaultNiche,
        defaultTags: values.defaultTags?.split(',').map((tag: string) => tag.trim()) || [],
      });

      console.log(response);
      
      if (response.success) {
        const result = response.data
        
        await loadVideoReels();
        setShowBulkUploadModal(false);
        bulkUploadForm.resetFields();
        
        // Show detailed results
        toast.success(response.data?.message || `Successfully processed ${result.summary.successful} videos. ${result.summary.failed > 0 ? `${result.summary.failed} failed.` : ''}`);
      }
    } catch (error: any) {
      console.error('Failed to bulk add reels:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to process bulk upload');
    } finally {
      setLoading(false);
    }
  }, [bulkUploadForm, loadVideoReels]);

  const handleUpdateVideoReel = useCallback(async (reelId: string, values: any) => {
    try {
      const response = await multimediaAssessmentApi.updateVideoReel(reelId, values);
      if (response?.success) {
        await loadVideoReels();
        setShowReelModal(false);
        setEditingReel(null);
        reelForm.resetFields();
      }
    } catch (error) {
      console.error('Failed to update video reel:', error);
    }
  }, [reelForm, loadVideoReels]);

  const handleDeleteVideoReel = useCallback(async (reelId: string) => {
    try {
      const response = await multimediaAssessmentApi.deleteVideoReel(reelId);
      if (response.data?.success) {
        await loadVideoReels();
      }
    } catch (error) {
      console.error('Failed to delete video reel:', error);
    }
  }, [loadVideoReels]);

  // Assessment table columns
  const assessmentColumns = [
    {
      title: 'Assessment Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: AssessmentConfig) => (
        <div>
          <div className="font-medium">{title}</div>
          <Text type="secondary" className="text-xs">{record.description}</Text>
          <div className="mt-1">
            <Tag color="blue" className="text-xs">
              {record.project.name}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Tasks',
      key: 'tasks',
      render: (record: AssessmentConfig) => (
        <Tag color="blue">{record.requirements.tasksPerAssessment} tasks</Tag>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: AssessmentConfig) => (
        <Text>{record.requirements.timeLimit} min</Text>
      ),
    },
    {
      title: 'Max Attempts',
      key: 'maxAttempts',
      render: (record: AssessmentConfig) => (
        <Text>{record.requirements.retakePolicy.maxAttempts}</Text>
      ),
    },
    {
      title: 'Configured Reels',
      dataIndex: 'totalConfiguredReels',
      key: 'totalConfiguredReels',
      render: (count: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-500">{count}</div>
          <Text type="secondary" className="text-xs">reels</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Statistics',
      key: 'statistics',
      render: (record: AssessmentConfig) => (
        <div className="text-center">
          <div className="text-lg font-bold">{record.statistics.totalAttempts}</div>
          <Text type="secondary" className="text-xs">attempts</Text>
          <div className="text-sm text-gray-500">
            {record.statistics.passRate.toFixed(1)}% pass rate
          </div>
        </div>
      ),
    },
    {
      title: 'Created By',
      key: 'createdBy',
      render: (record: AssessmentConfig) => (
        <div>
          <div className="font-medium text-sm">{record.createdBy.fullName}</div>
          <Text type="secondary" className="text-xs">{record.createdBy.email}</Text>
          <div className="text-xs text-gray-500">
            {new Date(record.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: AssessmentConfig) => (
        <Space>
          <Tooltip title="Edit Assessment">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingAssessment(record);
                // Map the API data structure to form fields
                assessmentForm.setFieldsValue({
                  title: record.title,
                  description: record.description,
                  numberOfTasks: record.requirements.tasksPerAssessment,
                  timeLimit: record.requirements.timeLimit,
                  maxRetries: record.requirements.retakePolicy.maxAttempts,
                  allowPausing: record.requirements.allowPausing,
                  isActive: record.isActive,
                });
                setShowAssessmentModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="View Analytics">
            <Button
              type="text"
              icon={<BarChartOutlined />}
              onClick={() => console.log('View analytics:', record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Assessment"
            description="Are you sure you want to delete this assessment?"
            onConfirm={() => handleDeleteAssessment(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Video reels table columns
  const reelColumns = [
    {
      title: 'Video',
      key: 'video',
      render: (record: VideoReel) => (
        <div className="flex items-center gap-3">
          <img
            src={record.thumbnailUrl}
            alt={record.title}
            className="w-16 h-16 rounded object-cover"
          />
          <div>
            <div className="font-medium">{record.title}</div>
            <Text type="secondary" className="text-xs">{record.description}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Niche',
      dataIndex: 'niche',
      key: 'niche',
      render: (niche: string) => <Tag color="purple">{niche}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (seconds: number) => <Text>{seconds}s</Text>,
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-500">{count}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Quality Score',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => (
        <div className="text-center">
          <Progress
            type="circle"
            size={40}
            percent={score * 10}
            format={(percent) => `${(percent || 0) / 10}`}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: VideoReel) => (
        <Space>
          <Tooltip title="Preview Video">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => window.open(record.youtubeUrl, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Edit Reel">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingReel(record);
                reelForm.setFieldsValue({
                  title: record.title,
                  description: record.description,
                  youtubeUrl: record.youtubeUrl,
                  niche: record.niche,
                  tags: record.tags?.join(', ') || '',
                  isActive: record.isActive,
                });
                setShowReelModal(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Video Reel"
            description="Are you sure you want to delete this video reel?"
            onConfirm={() => handleDeleteVideoReel(record._id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Assessment Management</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAssessment(null);
                assessmentForm.resetFields();
                setShowAssessmentModal(true);
              }}
            >
              New Assessment
            </Button>
            <Button 
              icon={<YoutubeOutlined />}
              onClick={() => {
                setEditingReel(null);
                reelForm.resetFields();
                setShowReelModal(true);
              }}
            >
              Add Video Reel
            </Button>
          </Space>
        </div>
      </motion.div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Assessment Configurations Tab */}
        <TabPane tab="Assessment Configurations" key="assessments">
          <Card>
            <Table
              columns={assessmentColumns}
              dataSource={assessments}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Video Reels Tab */}
        <TabPane tab="Video Reels Management" key="reels">
          <Card
            extra={
              <Space>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => setShowBulkUploadModal(true)}
                >
                  Bulk Upload
                </Button>
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingReel(null);
                    reelForm.resetFields();
                    setShowReelModal(true);
                  }}
                >
                  Add Single Reel
                </Button>
              </Space>
            }
          >
            <Table
              columns={reelColumns}
              dataSource={videoReels}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Analytics Tab */}
        <TabPane tab="Analytics & Reports" key="analytics">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Assessments"
                  value={assessments.length}
                  prefix={<SettingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Video Reels"
                  value={(videoReels as any[]).filter((r: any) => r.isActive).length}
                  prefix={<PlayCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Submissions"
                  value={assessments.reduce((sum, a) => sum + a.statistics.totalAttempts, 0)}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Avg Pass Rate"
                  value={assessments.length > 0 
                    ? (assessments.reduce((sum, a) => sum + a.statistics.passRate, 0) / assessments.length).toFixed(1)
                    : 0
                  }
                  precision={1}
                  suffix="%"
                  prefix={<EyeOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Assessment Creation/Edit Modal */}
      <Modal
        title={editingAssessment ? "Edit Assessment" : "Create New Assessment"}
        open={showAssessmentModal}
        onCancel={() => {
          setShowAssessmentModal(false);
          setEditingAssessment(null);
          assessmentForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={assessmentForm}
          layout="vertical"
          onFinish={editingAssessment ? handleUpdateAssessment : handleCreateAssessment}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Assessment Title"
                name="title"
                rules={[{ required: true, message: 'Please enter assessment title' }]}
              >
                <Input placeholder="e.g., Multimedia Annotation Assessment" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Number of Tasks"
                name="numberOfTasks"
                rules={[{ required: true, message: 'Please specify number of tasks' }]}
              >
                <InputNumber min={1} max={10} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Describe the assessment purpose and requirements" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Time Limit (minutes)"
                name="timeLimit"
                rules={[{ required: true, message: 'Please specify time limit' }]}
              >
                <InputNumber min={30} max={180} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Passing Score"
                name="passingScore"
                rules={[{ required: true, message: 'Please specify passing score' }]}
              >
                <InputNumber min={1} max={10} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Max Retries"
                name="maxRetries"
                rules={[{ required: true, message: 'Please specify max retries' }]}
              >
                <InputNumber min={1} max={5} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow Pausing"
                name={['requirements', 'allowPausing']}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Is Active"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
              </Button>
              <Button onClick={() => setShowAssessmentModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Video Reel Add/Edit Modal */}
      <Modal
        title={editingReel ? "Edit Video Reel" : "Add Video Reel"}
        open={showReelModal}
        onCancel={() => {
          setShowReelModal(false);
          setEditingReel(null);
          reelForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={reelForm}
          layout="vertical"
          onFinish={editingReel ? 
            (values) => handleUpdateVideoReel(editingReel._id, values) : 
            handleAddVideoReel
          }
        >
          <Form.Item
            label="YouTube URL"
            name="youtubeUrl"
            extra="Supported formats: embed, shorts, watch, or youtu.be URLs. System will auto-convert to embed format."
            rules={[
              { required: true, message: 'Please enter YouTube URL' },
              { 
                pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
                message: 'Please enter a valid YouTube URL'
              }
            ]}
          >
            <Input 
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
              prefix={<YoutubeOutlined />}
              addonAfter={
                <Tooltip title="The system accepts various YouTube URL formats and automatically converts them to embed URLs for better compatibility">
                  <LinkOutlined />
                </Tooltip>
              }
            />
          </Form.Item>

          <Alert
            message="YouTube URL Information"
            description="You can use any YouTube URL format. The system will automatically extract video metadata (title, description, duration) and convert URLs to embed format for optimal playback."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Title (Optional)"
                name="title"
              >
                <Input placeholder="Will be auto-extracted if not provided" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Niche Category"
                name="niche"
                rules={[{ required: true, message: 'Please select niche' }]}
              >
                <Select placeholder="Select category">
                  <Option value="technology">Technology</Option>
                  <Option value="lifestyle">Lifestyle</Option>
                  <Option value="education">Education</Option>
                  <Option value="entertainment">Entertainment</Option>
                  <Option value="fitness">Fitness</Option>
                  <Option value="sports">Sports</Option>
                  <Option value="fashion">Fashion</Option>
                  <Option value="food">Food & Cooking</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description (Optional)"
            name="description"
          >
            <TextArea rows={2} placeholder="Will be auto-extracted if not provided" />
          </Form.Item>

          <Form.Item
            label="Tags (comma-separated)"
            name="tags"
          >
            <Input placeholder="e.g., tutorial, beginner, javascript" />
          </Form.Item>

          <Form.Item
            label="Is Active"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingReel ? 'Update Reel' : 'Add Reel'}
              </Button>
              <Button onClick={() => setShowReelModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload YouTube Reels"
        open={showBulkUploadModal}
        onCancel={() => {
          setShowBulkUploadModal(false);
          bulkUploadForm.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Alert
          message="Bulk Upload Instructions"
          description="Enter one YouTube URL per line. The system will automatically extract video metadata."
          type="info"
          showIcon
          className="mb-4"
        />

        <Form
          form={bulkUploadForm}
          layout="vertical"
          onFinish={handleBulkAddReels}
        >
          <Form.Item
            label="YouTube URLs (one per line)"
            name="urls"
            rules={[{ required: true, message: 'Please enter at least one URL' }]}
          >
            <TextArea
              rows={8}
              placeholder={`https://www.youtube.com/embed/VIDEO_ID_1
https://www.youtube.com/embed/VIDEO_ID_2
https://youtu.be/VIDEO_ID_3`}
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Default Niche"
                name="defaultNiche"
                rules={[{ required: true, message: 'Please select default niche' }]}
              >
                <Select placeholder="Select category">
                  <Option value="technology">Technology</Option>
                  <Option value="lifestyle">Lifestyle</Option>
                  <Option value="education">Education</Option>
                  <Option value="entertainment">Entertainment</Option>
                  <Option value="fitness">Fitness</Option>
                  <Option value="sports">Sports</Option>
                  <Option value="fashion">Fashion</Option>
                  <Option value="food">Food & Cooking</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Default Tags (comma-separated)"
                name="defaultTags"
              >
                <Input placeholder="e.g., bulk-import, assessment" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Start Bulk Upload
              </Button>
              <Button onClick={() => setShowBulkUploadModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};