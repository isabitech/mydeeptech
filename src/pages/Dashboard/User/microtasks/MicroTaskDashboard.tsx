import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Statistic,
  Alert,
  List,
  Modal,
  Progress,
  notification,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../service/axiosApi";
import { endpoints } from "../../../../store/api/endpoints";

const { Title, Text, Paragraph } = Typography;

interface MicroTask {
  _id: string;
  title: string;
  description: string;
  category: "mask_collection" | "age_progression";
  required_count: number;
  payRate: number;
  payRateCurrency: string;
  maxParticipants: number | null;
  deadline: string | null;
  instructions: string;
  quality_guidelines: string;
  estimated_time: string;
  slots: number;
}

interface UserSubmission {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    category: string;
    payRate: number;
    payRateCurrency: string;
  };
  status: "in_progress" | "completed" | "under_review" | "approved" | "rejected" | "partially_rejected";
  progress_percentage: number;
  completed_slots: number;
  total_slots: number;
  createdAt: string;
  submission_date: string | null;
  quality_score: number | null;
  payment_status: "pending" | "approved" | "paid" | "rejected";
}

const MicroTaskDashboard: React.FC = () => {
  const [availableTasks, setAvailableTasks] = useState<MicroTask[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MicroTask | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableTasks();
    fetchUserSubmissions();
  }, []);

  const fetchAvailableTasks = async () => {
    try {
      const response = await axiosInstance.get(endpoints.microTasks.getAvailableTasks);

      if (response.data.success) {
        setAvailableTasks(response.data.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching available tasks:", error);
    }
  };

  const fetchUserSubmissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.microTaskSubmissions.getUserSubmissions);

      if (response.data.success) {
        // Ensure we always set an array, even if API returns null/undefined/object
        const submissions = Array.isArray(response.data.data) ? response.data.data : [];
        setUserSubmissions(submissions);
      }
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      // Set empty array on error to prevent filter errors
      setUserSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/micro-task-submissions/tasks/${taskId}/eligibility`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error checking eligibility:", error);
      return null;
    }
  };

  const handleStartTask = async (task: MicroTask) => {
    // First check eligibility
    const eligibility = await checkEligibility(task._id);
    
    if (!eligibility?.canStart) {
      if (eligibility?.reason === "Profile incomplete") {
        setProfileComplete(false);
        setRequiredFields(eligibility.requiredFields || []);
        return;
      } else if (eligibility?.existingSubmission) {
        // Navigate to existing submission
        navigate(`/dashboard/user/microtasks/submission/${eligibility.existingSubmission.id}`);
        return;
      } else {
        notification.warning({
          message: "Cannot Start Task",
          description: eligibility?.reason || "You cannot start this task at the moment"
        });
        return;
      }
    }

    try {
      const response = await axiosInstance.post(`${endpoints.microTaskSubmissions.startSubmission}/${task._id}/start`);

      if (response.data.success) {
        notification.success({
          message: "Task Started",
          description: "You can now upload your images for this task"
        });
        
        // Navigate to upload interface
        navigate(`/dashboard/user/microtasks/submission/${response.data.data._id}`);
      } else if (response.data.code === "PROFILE_INCOMPLETE") {
        setProfileComplete(false);
        setRequiredFields(response.data.required_fields || []);
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to start task"
        });
      }
    } catch (error) {
      console.error("Error starting task:", error);
      notification.error({
        message: "Error",
        description: "Failed to start task"
      });
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "mask_collection":
        return {
          name: "Mask Collection",
          description: "Upload 20 face mask images with different angles",
          color: "blue",
          icon: "😷"
        };
      case "age_progression":
        return {
          name: "Age Progression",
          description: "Upload 15 images across different time periods",
          color: "purple",
          icon: "📅"
        };
      default:
        return { name: category, description: "", color: "default", icon: "📋" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "processing";
      case "completed":
        return "warning";
      case "under_review":
        return "default";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "partially_rejected":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Submitted";
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "partially_rejected":
        return "Partial Approval";
      default:
        return status;
    }
  };

  const calculateEarnings = () => {
    const approvedSubmissions = (Array.isArray(userSubmissions) ? userSubmissions : []).filter(s => s.status === "approved");
    return approvedSubmissions.reduce((total, submission) => {
      return total + submission.taskId.payRate;
    }, 0);
  };

  const calculatePendingEarnings = () => {
    const pendingSubmissions = (Array.isArray(userSubmissions) ? userSubmissions : []).filter(s => 
      ["completed", "under_review"].includes(s.status)
    );
    return pendingSubmissions.reduce((total, submission) => {
      return total + submission.taskId.payRate;
    }, 0);
  };

  if (!profileComplete) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Profile Incomplete"
          description={
            <div>
              <p>Please complete your profile before participating in micro tasks.</p>
              <p><strong>Required fields:</strong></p>
              <ul>
                {requiredFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          }
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate("/dashboard/user/profile")}>
              Complete Profile
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Micro Tasks</Title>
        <Text type="secondary">
          Complete structured data collection tasks and earn money
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Available Tasks"
              value={availableTasks.length}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Submissions"
              value={(Array.isArray(userSubmissions) ? userSubmissions : []).filter(s => ["in_progress", "completed", "under_review"].includes(s.status)).length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Earnings (Approved)"
              value={calculateEarnings()}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Earnings"
              value={calculatePendingEarnings()}
              prefix={<ClockCircleOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Available Tasks */}
        <Col span={12}>
          <Card title="Available Tasks" style={{ height: '600px' }}>
            {availableTasks.length === 0 ? (
              <Empty
                description="No available tasks"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={availableTasks}
                renderItem={(task) => {
                  const categoryInfo = getCategoryInfo(task.category);
                  return (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setSelectedTask(task);
                            setIsTaskModalVisible(true);
                          }}
                        >
                          Details
                        </Button>,
                        <Button
                          type="primary"
                          onClick={() => handleStartTask(task)}
                        >
                          Start Task
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>{categoryInfo.icon}</span>
                            {task.title}
                            <Tag color={categoryInfo.color}>{categoryInfo.name}</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{task.description}</div>
                            <Space style={{ marginTop: 8 }}>
                              <Text strong>{task.payRateCurrency} {task.payRate}</Text>
                              <Text type="secondary">• {task.estimated_time}</Text>
                              <Text type="secondary">• {task.required_count} images</Text>
                              {task.deadline && (
                                <Text type="secondary">
                                  • Due {moment(task.deadline).fromNow()}
                                </Text>
                              )}
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        {/* My Submissions */}
        <Col span={12}>
          <Card title="My Submissions" style={{ height: '600px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
              </div>
            ) : !Array.isArray(userSubmissions) || userSubmissions.length === 0 ? (
              <Empty
                description="No submissions yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={Array.isArray(userSubmissions) ? userSubmissions : []}
                renderItem={(submission) => {
                  const categoryInfo = getCategoryInfo(submission.taskId.category);
                  return (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() => {
                            if (submission.status === "in_progress") {
                              navigate(`/dashboard/user/microtasks/submission/${submission._id}`);
                            } else {
                              navigate(`/dashboard/user/microtasks/submission/${submission._id}/view`);
                            }
                          }}
                        >
                          {submission.status === "in_progress" ? "Continue" : "View"}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>{categoryInfo.icon}</span>
                            {submission.taskId.title}
                            <Tag color={getStatusColor(submission.status)}>
                              {getStatusText(submission.status)}
                            </Tag>
                            {submission.status === "approved" && (
                              <Tag color="green">+{submission.taskId.payRateCurrency} {submission.taskId.payRate}</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <div>
                            <Progress
                              percent={submission.progress_percentage}
                              size="small"
                              status={
                                submission.status === "approved" ? "success" :
                                submission.status === "rejected" ? "exception" :
                                "active"
                              }
                              format={() => `${submission.completed_slots}/${submission.total_slots} images`}
                            />
                            <Space style={{ marginTop: 4 }}>
                              <Text type="secondary">
                                Started {moment(submission.createdAt).fromNow()}
                              </Text>
                              {submission.submission_date && (
                                <Text type="secondary">
                                  • Submitted {moment(submission.submission_date).fromNow()}
                                </Text>
                              )}
                              {submission.quality_score && (
                                <Text type="secondary">
                                  • Quality: {submission.quality_score}%
                                </Text>
                              )}
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          title={`Task Details: ${selectedTask.title}`}
          open={isTaskModalVisible}
          onCancel={() => {
            setIsTaskModalVisible(false);
            setSelectedTask(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsTaskModalVisible(false);
                setSelectedTask(null);
              }}
            >
              Close
            </Button>,
            <Button
              key="start"
              type="primary"
              onClick={() => {
                setIsTaskModalVisible(false);
                handleStartTask(selectedTask);
              }}
            >
              Start Task
            </Button>
          ]}
          width={600}
        >
          <div style={{ marginBottom: 16 }}>
            <Tag color={getCategoryInfo(selectedTask.category).color} style={{ marginBottom: 8 }}>
              {getCategoryInfo(selectedTask.category).name}
            </Tag>
            <Paragraph>{selectedTask.description}</Paragraph>
          </div>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="Pay Rate"
                value={`${selectedTask.payRateCurrency} ${selectedTask.payRate}`}
                prefix={<DollarOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Images Required"
                value={selectedTask.required_count}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Estimated Time"
                value={selectedTask.estimated_time}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
          </Row>

          {selectedTask.deadline && (
            <Alert
              message={`Deadline: ${moment(selectedTask.deadline).format("MMM DD, YYYY HH:mm")}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}

          {selectedTask.instructions && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Instructions</Title>
              <Paragraph>{selectedTask.instructions}</Paragraph>
            </div>
          )}

          {selectedTask.quality_guidelines && (
            <div>
              <Title level={5}>Quality Guidelines</Title>
              <Paragraph>{selectedTask.quality_guidelines}</Paragraph>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MicroTaskDashboard;