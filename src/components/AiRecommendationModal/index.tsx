import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Progress,
  Tag,
  Space,
  Alert,
  Typography,
  Row,
  Col,
  Input,
  Spin,
  Tooltip,
  Badge,
  notification,
  Checkbox,
  Form,
} from 'antd';
import {
  RobotOutlined,
  MailOutlined,
  WarningOutlined,
  SendOutlined,
  ReloadOutlined,
  EyeOutlined,
  GlobalOutlined,
  FileTextOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  useGetAiRecommendations,
  useSendBulkInvitations,
  type AnnotatorRecommendation,
} from '../../services/ai-recommendation-service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AiRecommendationModalProps {
  visible: boolean;
  onCancel: () => void;
  projectId: string;
  projectName: string;
}

const AiRecommendationModal: React.FC<AiRecommendationModalProps> = ({
  visible,
  onCancel,
  projectId,
  projectName,
}) => {
  const [selectedAnnotators, setSelectedAnnotators] = useState<string[]>([]);
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [form] = Form.useForm();

  // Use TanStack Query hooks
  const {
    recommendations: annotatorRecommendations,
    summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAiRecommendations({
    projectId,
    maxRecommendations: 20,
  });

  const sendBulkInvitationsMutation = useSendBulkInvitations();

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedAnnotators([]);
      setShowInvitationForm(false);
      setCustomMessage('');
      form.resetFields();
    }
  }, [visible, form]);

  const handleSelectAnnotator = (annotatorId: string, checked: boolean) => {
    if (checked) {
      setSelectedAnnotators(prev => [...prev, annotatorId]);
    } else {
      setSelectedAnnotators(prev => prev.filter(id => id !== annotatorId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnnotators(annotatorRecommendations.map((r: AnnotatorRecommendation) => r.annotator._id));
    } else {
      setSelectedAnnotators([]);
    }
  };

  const handleSendInvitations = async () => {
    if (selectedAnnotators.length === 0) {
      notification.warning({
        message: 'No Annotators Selected',
        description: 'Please select at least one annotator to invite.',
      });
      return;
    }

    sendBulkInvitationsMutation.mutate({
      projectId,
      annotatorIds: selectedAnnotators,
      customMessage,
    }, {
      onSuccess: () => {
        setShowInvitationForm(false);
        setSelectedAnnotators([]);
        setCustomMessage('');
        form.resetFields();
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#52c41a'; // Green
    if (score >= 70) return '#1890ff'; // Blue
    if (score >= 60) return '#fa8c16'; // Orange
    return '#f5222d'; // Red
  };

  const getScoreStatus = (score: number): 'success' | 'normal' | 'exception' => {
    if (score >= 75) return 'success';
    if (score >= 60) return 'normal';
    return 'exception';
  };

  const columns = [
    {
      title: '',
      key: 'select',
      width: 50,
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <Checkbox
          checked={selectedAnnotators.includes(record.annotator._id)}
          onChange={(e) => handleSelectAnnotator(record.annotator._id, e.target.checked)}
        />
      ),
    },
    {
      title: 'Annotator',
      key: 'annotator',
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {record.annotator.fullName}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            <MailOutlined /> {record.annotator.email}
          </div>
          {record.annotator.phone && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              <PhoneOutlined /> {record.annotator.phone}
            </div>
          )}
          {record.annotator.country && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              <EnvironmentOutlined /> {record.annotator.country}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'AI Match Score',
      key: 'score',
      width: 120,
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            size={60}
            percent={record.score}
            strokeColor={getScoreColor(record.score)}
            status={getScoreStatus(record.score)}
          />
          <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
            Match Score
          </div>
        </div>
      ),
    },
    {
      title: 'Skills & Domains',
      key: 'skills',
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <div>
          {record.annotator.domains.length > 0 ? (
            <Space wrap>
              {record.annotator.domains.slice(0, 3).map((domain, index) => (
                <Tag key={index} color="blue" style={{ fontSize: '11px' }}>
                  {domain}
                </Tag>
              ))}
              {record.annotator.domains.length > 3 && (
                <Tag color="default" style={{ fontSize: '11px' }}>
                  +{record.annotator.domains.length - 3} more
                </Tag>
              )}
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: '12px' }}>No domains listed</Text>
          )}
          
          {record.annotator.languages && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: 4 }}>Languages:</div>
              <Space wrap>
                {[
                  ...(record.annotator.languages.native_languages || []),
                  ...(record.annotator.languages.other_languages || [])
                ].slice(0, 3).map((lang, index) => (
                  <Tag key={index} color="green" style={{ fontSize: '10px' }}>
                    <GlobalOutlined /> {lang}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Profile',
      key: 'profile',
      width: 100,
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <div style={{ textAlign: 'center' }}>
          {record.annotator.hasResume ? (
            <Badge status="success" text={
              <span style={{ fontSize: '11px' }}>
                <FileTextOutlined /> Resume
              </span>
            } />
          ) : (
            <Badge status="default" text={
              <span style={{ fontSize: '11px' }}>
                No Resume
              </span>
            } />
          )}
        </div>
      ),
    },
    {
      title: 'Compatibility',
      key: 'compatibility',
      width: 150,
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: '11px', color: '#666' }}>Domain: </Text>
            <Progress 
              percent={record.matches.domain} 
              size="small" 
              strokeColor="#1890ff"
              showInfo={false}
              style={{ width: 60 }}
            />
            <Text style={{ fontSize: '11px', marginLeft: 8 }}>{record.matches.domain}%</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: '11px', color: '#666' }}>Language: </Text>
            <Progress 
              percent={record.matches.language} 
              size="small" 
              strokeColor="#52c41a"
              showInfo={false}
              style={{ width: 60 }}
            />
            <Text style={{ fontSize: '11px', marginLeft: 8 }}>{record.matches.language}%</Text>
          </div>
          <div>
            <Text style={{ fontSize: '11px', color: '#666' }}>Experience: </Text>
            <Progress 
              percent={record.matches.experience} 
              size="small" 
              strokeColor="#fa8c16"
              showInfo={false}
              style={{ width: 60 }}
            />
            <Text style={{ fontSize: '11px', marginLeft: 8 }}>{record.matches.experience}%</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Analysis',
      key: 'analysis',
      render: (_: unknown, record: AnnotatorRecommendation) => (
        <Tooltip title={record.reasoning}>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            style={{ padding: 0, fontSize: '11px' }}
          >
            View Analysis
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>AI Annotator Recommendations</span>
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {projectName}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width="90%"
      style={{ maxWidth: 1400 }}
      bodyStyle={{ padding: '20px' }}
    >
      <div>
        {/* Header Info */}
        {summary && (
          <Alert
            message={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RobotOutlined />
                <strong>AI Analysis Complete</strong>
              </div>
            }
            description={summary}
            type="success"
            showIcon={false}
            style={{ marginBottom: 20 }}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>AI is analyzing annotator profiles and project requirements...</Text>
            </div>
          </div>
        )}

        {/* Recommendations Table */}
        {!isLoading && annotatorRecommendations.length > 0 && (
          <>
            {/* Actions Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Space>
                  <Checkbox
                    checked={selectedAnnotators.length === annotatorRecommendations.length}
                    indeterminate={selectedAnnotators.length > 0 && selectedAnnotators.length < annotatorRecommendations.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    Select All ({annotatorRecommendations.length} annotators)
                  </Checkbox>
                  
                  {selectedAnnotators.length > 0 && (
                    <Tag color="blue">
                      {selectedAnnotators.length} selected
                    </Tag>
                  )}
                </Space>
              </Col>
              
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => refetch()}
                    loading={isLoading}
                  >
                    Refresh
                  </Button>
                  
                  <Button
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={() => setShowInvitationForm(true)}
                    disabled={selectedAnnotators.length === 0}
                  >
                    Send Invitations ({selectedAnnotators.length})
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Recommendations Table */}
            <Table
              columns={columns}
              dataSource={annotatorRecommendations}
              rowKey={(record) => record.annotator._id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} recommendations`,
              }}
              scroll={{ x: 1200 }}
              size="small"
            />
          </>
        )}

        {/* No Results */}
        {!isLoading && annotatorRecommendations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <WarningOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
            <Title level={4}>No Matching Annotators Found</Title>
            <Paragraph>
              Our AI couldn't find any annotators that meet the project requirements. 
              You may want to adjust the project requirements or check back later when more annotators join the platform.
            </Paragraph>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Title level={4}>Analyzing Annotators...</Title>
              <Paragraph type="secondary">
                Our AI is evaluating annotators based on your project requirements
              </Paragraph>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert
            message="Failed to Load Recommendations"
            description={error instanceof Error ? error.message : "Unable to fetch AI recommendations. Please try again."}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
            style={{ margin: '20px 0' }}
          />
        )}

        {/* Invitation Form Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SendOutlined style={{ color: '#52c41a' }} />
              <span>Send Bulk Invitations</span>
            </div>
          }
          open={showInvitationForm}
          onCancel={() => setShowInvitationForm(false)}
          onOk={handleSendInvitations}
          confirmLoading={sendBulkInvitationsMutation.isPending}
          okText={`Send to ${selectedAnnotators.length} Annotators`}
          width={600}
        >
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`Ready to send invitations to ${selectedAnnotators.length} selected annotators`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              label="Custom Message (Optional)"
              name="customMessage"
              help="Add a personalized message to include with the AI-generated invitation"
            >
              <TextArea
                rows={4}
                placeholder="e.g., We're excited to invite you to join this high-priority project..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Form>

          <Alert
            message="Email Preview"
            description="Each annotator will receive a personalized email explaining why they were selected by our AI, project details, and a direct link to apply."
            type="info"
            style={{ marginTop: 16 }}
          />
        </Modal>
      </div>
    </Modal>
  );
};

export default AiRecommendationModal;