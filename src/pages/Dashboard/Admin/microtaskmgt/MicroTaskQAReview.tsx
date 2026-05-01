import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  notification,
  Row,
  Col,
  Statistic,
  Typography,
  Image,
  Rate,
  Progress,
  Badge,
  Tooltip,
  Divider,
  Alert,
  Spin,
  Radio,
  Checkbox,
  InputNumber,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import moment from "moment";
import axiosInstance from "../../../../service/axiosApi";
import { endpoints } from "../../../../store/api/endpoints";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

interface SubmissionImage {
  _id: string;
  cloudinary_data: {
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  image_metadata: {
    angle: string;
    mask_type?: string;
    background_type?: string;
    time_period?: string;
    sequence: number;
  };
  review_status: "pending" | "approved" | "rejected" | "needs_replacement";
  rejection_reason: string;
  quality_check: {
    validation_notes: string;
  };
}

interface ReviewSlot {
  slot: {
    _id: string;
    slot_name: string;
    sequence: number;
    metadata: any;
    validation_rules: any;
    slot_instructions: string;
  };
  image: SubmissionImage | null;
  status: "pending" | "approved" | "rejected" | "needs_replacement" | "missing";
}

interface PendingSubmission {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    category: string;
    payRate: number;
    payRateCurrency: string;
  };
  userId: {
    _id: string;
    fullName: string;
    email: string;
    personal_info: {
      country: string;
    };
  };
  status: string;
  submission_date: string;
  progress_percentage: number;
  user_metadata: {
    full_name: string;
    country_of_residence: string;
    age: number;
    gender: string;
  };
  imageStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  reviewPriority: {
    daysPending: number;
    score: number;
  };
}

interface DetailedSubmission {
  _id: string;
  taskId: any;
  userId: any;
  reviewSlots: ReviewSlot[];
  totalImages: number;
  requiredImages: number;
  completionPercentage: number;
  user_metadata: any;
}

const MicroTaskQAReview: React.FC = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<DetailedSubmission | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SubmissionImage | null>(null);
  const [isImageReviewModalVisible, setIsImageReviewModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [queueSummary, setQueueSummary] = useState<any>(null);

  const [imageReviewForm] = Form.useForm();
  const [submissionReviewForm] = Form.useForm();

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("oldest_first");
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Selection for bulk operations
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  useEffect(() => {
    fetchPendingSubmissions();
    fetchStatistics();
    fetchQueueSummary();
  }, [pagination.current, pagination.pageSize, filterCategory, filterPriority, searchText]);

  const fetchPendingSubmissions = async () => {
    setTableLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(filterCategory !== "all" && { category: filterCategory }),
        priority: filterPriority,
        ...(searchText && { search: searchText })
      });

      const response = await fetch(`/api/micro-task-qa/queue?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPendingSubmissions(data.data.submissions);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total_items
        }));
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch pending submissions"
      });
    } finally {
      setTableLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/micro-task-qa/statistics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchQueueSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/micro-task-qa/queue/summary", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setQueueSummary(data.data);
      }
    } catch (error) {
      console.error("Error fetching queue summary:", error);
    }
  };

  const fetchSubmissionForReview = async (submissionId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/micro-task-qa/submissions/${submissionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedSubmission(data.data);
        setIsReviewModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching submission for review:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch submission details"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageReview = async (values: any) => {
    if (!selectedImage) return;

    setReviewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/micro-task-qa/images/${selectedImage._id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        notification.success({
          message: "Success",
          description: "Image review completed"
        });
        setIsImageReviewModalVisible(false);
        imageReviewForm.resetFields();
        
        // Refresh the detailed submission
        if (selectedSubmission) {
          await fetchSubmissionForReview(selectedSubmission._id);
        }
      }
    } catch (error) {
      console.error("Error reviewing image:", error);
      notification.error({
        message: "Error",
        description: "Failed to review image"
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmissionReview = async (values: any) => {
    if (!selectedSubmission) return;

    setReviewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/micro-task-qa/submissions/${selectedSubmission._id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        notification.success({
          message: "Success",
          description: "Submission review completed"
        });
        setIsReviewModalVisible(false);
        submissionReviewForm.resetFields();
        fetchPendingSubmissions();
        fetchStatistics();
        fetchQueueSummary();
      }
    } catch (error) {
      console.error("Error completing submission review:", error);
      notification.error({
        message: "Error",
        description: "Failed to complete submission review"
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBulkApproval = async () => {
    if (selectedSubmissionIds.length === 0) {
      notification.warning({
        message: "Warning",
        description: "Please select submissions to approve"
      });
      return;
    }

    Modal.confirm({
      title: "Bulk Approve Submissions",
      content: `Are you sure you want to approve ${selectedSubmissionIds.length} submissions? This will approve all pending images in these submissions.`,
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch("/api/micro-task-qa/submissions/bulk-approve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              submissionIds: selectedSubmissionIds
            })
          });

          const data = await response.json();
          if (data.success) {
            notification.success({
              message: "Success",
              description: `${data.data.approved.length} submissions approved, ${data.data.failed.length} failed`
            });
            setSelectedSubmissionIds([]);
            fetchPendingSubmissions();
            fetchStatistics();
          }
        } catch (error) {
          console.error("Error in bulk approval:", error);
          notification.error({
            message: "Error",
            description: "Failed to bulk approve submissions"
          });
        }
      }
    });
  };

  const getPriorityTag = (daysPending: number) => {
    if (daysPending >= 3) {
      return <Tag color="red">Urgent ({daysPending}d)</Tag>;
    } else if (daysPending >= 1) {
      return <Tag color="orange">Priority ({daysPending}d)</Tag>;
    } else {
      return <Tag color="green">Recent ({daysPending}d)</Tag>;
    }
  };

  const getImageStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      case "needs_replacement":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "missing":
        return <ExclamationCircleOutlined style={{ color: "#d9d9d9" }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: "#1890ff" }} />;
    }
  };

  const columns: ColumnsType<PendingSubmission> = [
    {
      title: "Task & User",
      key: "taskUser",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.taskId.title}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>
            by {record.userId.fullName}
          </div>
          <div style={{ color: "#999", fontSize: "11px" }}>
            {record.user_metadata.country_of_residence}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["taskId", "category"],
      key: "category",
      render: (category: string) => (
        <Tag color={category === "mask_collection" ? "blue" : "purple"}>
          {category === "mask_collection" ? "Mask Collection" : "Age Progression"}
        </Tag>
      ),
    },
    {
      title: "Priority",
      key: "priority",
      render: (_, record) => getPriorityTag(record.reviewPriority.daysPending),
    },
    {
      title: "Images",
      key: "images",
      render: (_, record) => (
        <div>
          <div>{record.imageStats.total} total</div>
          <Progress
            percent={Math.round((record.imageStats.total - record.imageStats.pending) / record.imageStats.total * 100)}
            size="small"
            status="active"
            format={() => `${record.imageStats.pending} pending`}
          />
        </div>
      ),
    },
    {
      title: "Pay Rate",
      key: "payRate",
      render: (_, record) => (
        `${record.taskId.payRateCurrency} ${record.taskId.payRate}`
      ),
    },
    {
      title: "Submitted",
      dataIndex: "submission_date",
      key: "submitted",
      render: (date: string) => moment(date).format("MMM DD, HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => fetchSubmissionForReview(record._id)}
          loading={loading}
        >
          Review
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedSubmissionIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedSubmissionIds(selectedRowKeys as string[]);
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={2}>Micro Task QA Review</Title>
        <Text type="secondary">
          Review and approve micro task submissions
        </Text>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Review"
                value={statistics.submissions.under_review}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Turnaround"
                value={statistics.review_performance.avg_turnaround_days}
                suffix="days"
                precision={1}
                valueStyle={{ 
                  color: statistics.review_performance.avg_turnaround_days > 2 ? '#f5222d' : '#52c41a' 
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Approved Today"
                value={statistics.submissions.approved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Images"
                value={statistics.images.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Queue Summary Alert */}
      {queueSummary && queueSummary.urgentReviews.length > 0 && (
        <Alert
          message={`${queueSummary.urgentReviews.length} submissions need urgent review (3+ days pending)`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Controls */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Search submissions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder="Filter by category"
            >
              <Option value="all">All Categories</Option>
              <Option value="mask_collection">Mask Collection</Option>
              <Option value="age_progression">Age Progression</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              value={filterPriority}
              onChange={setFilterPriority}
              placeholder="Sort by priority"
            >
              <Option value="oldest_first">Oldest First</Option>
              <Option value="newest_first">Newest First</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPendingSubmissions}
            >
              Refresh
            </Button>
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              disabled={selectedSubmissionIds.length === 0}
              onClick={handleBulkApproval}
            >
              Bulk Approve ({selectedSubmissionIds.length})
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Pending Submissions Table */}
      <Card>
        <Table
          dataSource={pendingSubmissions}
          columns={columns}
          loading={tableLoading}
          rowKey="_id"
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} submissions`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10
              }));
            }
          }}
        />
      </Card>

      {/* Review Modal */}
      {selectedSubmission && (
        <Modal
          title={`Review Submission: ${selectedSubmission.taskId.title}`}
          open={isReviewModalVisible}
          onCancel={() => {
            setIsReviewModalVisible(false);
            setSelectedSubmission(null);
            submissionReviewForm.resetFields();
          }}
          footer={null}
          width={1200}
          bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>Participant: </Text>
            <Text>{selectedSubmission.user_metadata.full_name}</Text>
            <Text style={{ marginLeft: 16 }}>
              ({selectedSubmission.user_metadata.age} years, {selectedSubmission.user_metadata.gender})
            </Text>
            <Text style={{ marginLeft: 16 }}>
              {selectedSubmission.user_metadata.country_of_residence}
            </Text>
          </div>

          <Progress
            percent={Math.round((selectedSubmission.totalImages / selectedSubmission.requiredImages) * 100)}
            status="active"
            format={() => `${selectedSubmission.totalImages}/${selectedSubmission.requiredImages} images`}
          />

          <Divider>Image Review</Divider>

          <Row gutter={[16, 16]}>
            {selectedSubmission.reviewSlots.map((slot, index) => (
              <Col span={8} key={slot.slot._id}>
                <Card
                  size="small"
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{slot.slot.slot_name}</span>
                      {getImageStatusIcon(slot.status)}
                    </div>
                  }
                  style={{
                    border: slot.status === "approved" ? "2px solid #52c41a" :
                           slot.status === "rejected" ? "2px solid #f5222d" :
                           slot.status === "needs_replacement" ? "2px solid #faad14" : 
                           "1px solid #d9d9d9"
                  }}
                >
                  {slot.image ? (
                    <div>
                      <Image
                        src={slot.image.cloudinary_data.secure_url}
                        alt={slot.slot.slot_name}
                        style={{ width: "100%", height: 150, objectFit: "cover" }}
                        preview={false}
                      />
                      <div style={{ marginTop: 8, textAlign: "center" }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedImage(slot.image);
                            setIsImageReviewModalVisible(true);
                            imageReviewForm.setFieldsValue({
                              status: slot.image?.review_status || "pending"
                            });
                          }}
                        >
                          Review
                        </Button>
                      </div>
                      {slot.image.rejection_reason && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#f5222d" }}>
                          {slot.image.rejection_reason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
                      No image uploaded
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <Divider>Complete Review</Divider>

          <Form
            form={submissionReviewForm}
            layout="vertical"
            onFinish={handleSubmissionReview}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Review Decision"
                  rules={[{ required: true, message: "Please select review decision" }]}
                >
                  <Select placeholder="Select decision">
                    <Option value="approved">Approve All</Option>
                    <Option value="rejected">Reject All</Option>
                    <Option value="partially_rejected">Partial Approval</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="quality_score"
                  label="Quality Score (0-100)"
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    placeholder="Overall quality score"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* Action buttons */}
              </Col>
            </Row>

            <Form.Item
              name="review_notes"
              label="Review Notes"
            >
              <TextArea
                rows={3}
                placeholder="Overall feedback for the participant"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={reviewLoading}
                  icon={<CheckCircleOutlined />}
                >
                  Complete Review
                </Button>
                <Button
                  onClick={() => {
                    setIsReviewModalVisible(false);
                    submissionReviewForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Image Review Modal */}
      {selectedImage && (
        <Modal
          title="Review Image"
          open={isImageReviewModalVisible}
          onCancel={() => {
            setIsImageReviewModalVisible(false);
            setSelectedImage(null);
            imageReviewForm.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Image
                src={selectedImage.cloudinary_data.secure_url}
                alt="Review Image"
                style={{ width: "100%" }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                <div>Angle: {selectedImage.image_metadata.angle}</div>
                <div>Size: {Math.round(selectedImage.cloudinary_data.bytes / 1024)}KB</div>
                <div>Resolution: {selectedImage.cloudinary_data.width}x{selectedImage.cloudinary_data.height}</div>
              </div>
            </Col>
            <Col span={12}>
              <Form
                form={imageReviewForm}
                layout="vertical"
                onFinish={handleImageReview}
              >
                <Form.Item
                  name="status"
                  label="Review Decision"
                  rules={[{ required: true, message: "Please select decision" }]}
                >
                  <Radio.Group>
                    <Radio value="approved">Approve</Radio>
                    <Radio value="rejected">Reject</Radio>
                    <Radio value="needs_replacement">Needs Replacement</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="rejection_reason"
                  label="Rejection/Feedback Reason"
                >
                  <TextArea
                    rows={3}
                    placeholder="Explain why this image is rejected or needs replacement"
                  />
                </Form.Item>

                <Form.Item
                  name="quality_notes"
                  label="Quality Notes"
                >
                  <TextArea
                    rows={2}
                    placeholder="Additional quality observations"
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={reviewLoading}
                    >
                      Submit Review
                    </Button>
                    <Button
                      onClick={() => {
                        setIsImageReviewModalVisible(false);
                        imageReviewForm.resetFields();
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Modal>
      )}
    </div>
  );
};

export default MicroTaskQAReview;