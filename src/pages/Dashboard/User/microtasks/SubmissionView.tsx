import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Alert,
  Spin,
  notification,
  Image,
  Descriptions,
  List,
  Empty,
  Timeline,
  Badge,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../../../service/axiosApi";
import { endpoints } from "../../../../store/api/endpoints";

const { Title, Text, Paragraph } = Typography;

interface TaskSlot {
  _id: string;
  angle: string;
  time_period?: string;
  description: string;
  sort_order: number;
  uploaded: boolean;
  image_url?: string;
  image_id?: string;
  metadata: {
    angle?: string;
    time_period?: string;
    lighting?: string;
    background?: string;
    expression?: string;
  };
  review_status?: "approved" | "rejected" | "pending";
  feedback?: string;
}

interface MicroTaskSubmission {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    description: string;
    category: "mask_collection" | "age_progression";
    required_count: number;
    payRate: number;
    payRateCurrency: string;
    instructions: string;
    quality_guidelines: string;
    estimated_time: string;
    deadline: string | null;
  };
  status: "in_progress" | "completed" | "under_review" | "approved" | "rejected" | "partially_rejected";
  progress_percentage: number;
  completed_slots: number;
  total_slots: number;
  slots: TaskSlot[];
  createdAt: string;
  submission_date: string | null;
  review_date: string | null;
  quality_score: number | null;
  reviewer_feedback: string | null;
  payment_status: "pending" | "approved" | "paid" | "rejected";
  user_metadata: {
    name: string;
    age: number;
    gender: string;
    country: string;
    city: string;
  };
}

const SubmissionView: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<MicroTaskSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${endpoints.microTaskSubmissions.getSubmissionDetails}/${submissionId}`);

      if (response.data.success) {
        setSubmission(response.data.data);
      } else {
        notification.error({
          message: "Error",
          description: "Failed to load submission"
        });
        navigate("/dashboard/user/microtasks");
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      notification.error({
        message: "Error",
        description: "Failed to load submission"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "mask_collection":
        return { name: "Mask Collection", icon: "😷", color: "blue" };
      case "age_progression":
        return { name: "Age Progression", icon: "📅", color: "purple" };
      default:
        return { name: category, icon: "📋", color: "default" };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "in_progress":
        return { text: "In Progress", color: "processing", icon: <ExclamationCircleOutlined /> };
      case "completed":
        return { text: "Submitted", color: "warning", icon: <ExclamationCircleOutlined /> };
      case "under_review":
        return { text: "Under Review", color: "default", icon: <ExclamationCircleOutlined /> };
      case "approved":
        return { text: "Approved", color: "success", icon: <CheckCircleOutlined /> };
      case "rejected":
        return { text: "Rejected", color: "error", icon: <CloseCircleOutlined /> };
      case "partially_rejected":
        return { text: "Partially Approved", color: "warning", icon: <ExclamationCircleOutlined /> };
      default:
        return { text: status, color: "default", icon: <ExclamationCircleOutlined /> };
    }
  };

  const getSlotStatusIcon = (slot: TaskSlot) => {
    if (!slot.uploaded) return null;
    
    if (slot.review_status === "approved") {
      return <Badge status="success" />;
    } else if (slot.review_status === "rejected") {
      return <Badge status="error" />;
    } else {
      return <Badge status="processing" />;
    }
  };

  const getTimelineItems = () => {
    const items = [];

    items.push({
      dot: <Badge status="success" />,
      children: (
        <div>
          <Text strong>Task Started</Text>
          <br />
          <Text type="secondary">{moment(submission!.createdAt).format("MMM DD, YYYY HH:mm")}</Text>
        </div>
      )
    });

    if (submission!.submission_date) {
      items.push({
        dot: <Badge status="processing" />,
        children: (
          <div>
            <Text strong>Task Submitted</Text>
            <br />
            <Text type="secondary">{moment(submission!.submission_date).format("MMM DD, YYYY HH:mm")}</Text>
          </div>
        )
      });
    }

    if (submission!.review_date) {
      const statusInfo = getStatusInfo(submission!.status);
      items.push({
        dot: statusInfo.icon,
        children: (
          <div>
            <Text strong>Review Completed</Text>
            <br />
            <Text type="secondary">{moment(submission!.review_date).format("MMM DD, YYYY HH:mm")}</Text>
            <br />
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </div>
        )
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading submission details...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Empty description="Submission not found" />
        <Button onClick={() => navigate("/dashboard/user/microtasks")}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(submission.taskId.category);
  const statusInfo = getStatusInfo(submission.status);
  const approvedSlots = submission.slots.filter(slot => slot.review_status === "approved").length;
  const rejectedSlots = submission.slots.filter(slot => slot.review_status === "rejected").length;

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard/user/microtasks")}
          style={{ marginBottom: 16 }}
        >
          Back to Tasks
        </Button>
        
        <Title level={2} style={{ marginBottom: 0 }}>
          <Space>
            <span>{categoryInfo.icon}</span>
            {submission.taskId.title}
            <Tag color={categoryInfo.color}>{categoryInfo.name}</Tag>
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
              {statusInfo.text}
            </Tag>
          </Space>
        </Title>
        <Text type="secondary">{submission.taskId.description}</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Images Submitted"
              value={submission.completed_slots}
              suffix={`/ ${submission.total_slots}`}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Task Reward"
              value={submission.taskId.payRate}
              prefix={<DollarOutlined />}
              suffix={submission.taskId.payRateCurrency}
              valueStyle={{ 
                color: submission.status === 'approved' ? '#52c41a' : 
                       submission.status === 'rejected' ? '#ff4d4f' : '#1890ff' 
              }}
            />
          </Card>
        </Col>

        {submission.quality_score && (
          <Col span={6}>
            <Card>
              <Statistic
                title="Quality Score"
                value={submission.quality_score}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ 
                  color: submission.quality_score >= 80 ? '#52c41a' : 
                         submission.quality_score >= 60 ? '#faad14' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
        )}

        <Col span={6}>
          <Card>
            <Statistic
              title="Completion Time"
              value={submission.submission_date ? 
                moment(submission.submission_date).diff(moment(submission.createdAt), 'hours') : 0}
              suffix="hours"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Column - Timeline & Details */}
        <Col span={8}>
          {/* Timeline */}
          <Card title="Progress Timeline" style={{ marginBottom: 24 }}>
            <Timeline items={getTimelineItems()} />
          </Card>

          {/* Task Details */}
          <Card title="Task Details">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Category">
                <Tag color={categoryInfo.color}>{categoryInfo.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Required Images">
                {submission.taskId.required_count}
              </Descriptions.Item>
              <Descriptions.Item label="Estimated Time">
                {submission.taskId.estimated_time}
              </Descriptions.Item>
              <Descriptions.Item label="Pay Rate">
                {submission.taskId.payRateCurrency} {submission.taskId.payRate}
              </Descriptions.Item>
              {submission.taskId.deadline && (
                <Descriptions.Item label="Deadline">
                  {moment(submission.taskId.deadline).format("MMM DD, YYYY HH:mm")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Payment Status">
                <Tag color={
                  submission.payment_status === "paid" ? "success" :
                  submission.payment_status === "approved" ? "processing" :
                  submission.payment_status === "rejected" ? "error" :
                  "default"
                }>
                  {submission.payment_status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column - Images & Feedback */}
        <Col span={16}>
          {/* Feedback Section */}
          {submission.reviewer_feedback && (
            <Alert
              message="Reviewer Feedback"
              description={submission.reviewer_feedback}
              type={submission.status === "approved" ? "success" : "warning"}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* Images Grid */}
          <Card 
            title={
              <Space>
                <span>Submitted Images</span>
                {approvedSlots > 0 && (
                  <Tag color="success">{approvedSlots} Approved</Tag>
                )}
                {rejectedSlots > 0 && (
                  <Tag color="error">{rejectedSlots} Rejected</Tag>
                )}
              </Space>
            }
          >
            {submission.slots.filter(slot => slot.uploaded).length === 0 ? (
              <Empty description="No images uploaded" />
            ) : (
              <Row gutter={[16, 16]}>
                {submission.slots
                  .filter(slot => slot.uploaded)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((slot, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={slot._id}>
                      <Card
                        size="small"
                        style={{
                          border: 
                            slot.review_status === "approved" ? "2px solid #52c41a" :
                            slot.review_status === "rejected" ? "2px solid #ff4d4f" :
                            "1px solid #d9d9d9",
                          position: "relative"
                        }}
                        bodyStyle={{ padding: 8 }}
                      >
                        {getSlotStatusIcon(slot) && (
                          <div style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            zIndex: 2
                          }}>
                            {getSlotStatusIcon(slot)}
                          </div>
                        )}

                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 12 }}>
                            #{slot.sort_order} {slot.angle || slot.time_period}
                          </Text>
                        </div>

                        {slot.image_url && (
                          <Image
                            src={slot.image_url}
                            alt={`Slot ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 4
                            }}
                            preview={{
                              mask: <EyeOutlined />
                            }}
                          />
                        )}

                        {slot.review_status && (
                          <div style={{ marginTop: 8, textAlign: "center" }}>
                            <Tag 
                              color={
                                slot.review_status === "approved" ? "success" :
                                slot.review_status === "rejected" ? "error" :
                                "default"
                              }
                            >
                              {slot.review_status.toUpperCase()}
                            </Tag>
                          </div>
                        )}

                        {slot.feedback && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {slot.feedback}
                            </Text>
                          </div>
                        )}

                        {/* Slot metadata */}
                        {Object.keys(slot.metadata).length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {Object.entries(slot.metadata).map(([key, value]) => (
                              value && (
                                <Tag key={key} style={{ marginBottom: 2, fontSize: 10 }}>
                                  {key}: {value}
                                </Tag>
                              )
                            ))}
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SubmissionView;