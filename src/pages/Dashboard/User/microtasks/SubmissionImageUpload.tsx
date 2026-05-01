import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Progress,
  Alert,
  Spin,
  notification,
  Image,
  Upload,
  Steps,
  Tag,
  Empty,
  Badge,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import type { UploadProps } from "antd/es/upload/interface";
import moment from "moment";
import { microTaskQueryService, microTaskMutationService } from "../../../../services/micro-task-service";
import { getErrorMessage } from "../../../../service/apiUtils";

const { Title, Text } = Typography;
const { Step } = Steps;

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
}

interface SubmissionImageUploadProps {
  submissionId?: string; // Optional for route-based usage
}

const SubmissionImageUpload: React.FC<SubmissionImageUploadProps> = ({ submissionId: propSubmissionId }) => {
  const navigate = useNavigate();
  const params = useParams();
  
  // Use submissionId from props or URL params
  const submissionId = propSubmissionId || params.submissionId || "";

  // TanStack Query hooks
  const {
    submission,
    isSubmissionLoading,
    isSubmissionError,
    submissionError,
  } = microTaskQueryService.useGetMicroTaskSubmissionDetails(submissionId);

  const {
    uploadImageMutation,
  } = microTaskMutationService.useUploadSubmissionImage();

  const {
    deleteImageMutation,
  } = microTaskMutationService.useDeleteSubmissionImage();

  const {
    submitForReviewMutation,
    isSubmitForReviewLoading,
  } = microTaskMutationService.useSubmitForReview();

  useEffect(() => {
    if (!submissionId) {
      notification.error({
        message: "Error",
        description: "Submission ID is required"
      });
      navigate("/dashboard/user/microtasks");
    }
  }, [submissionId, navigate]);

  useEffect(() => {
    if (isSubmissionError) {
      notification.error({
        message: "Error",
        description: submissionError?.message || "Failed to load submission"
      });
      navigate("/dashboard/user/microtasks");
    }
  }, [isSubmissionError, submissionError, navigate]);

  const handleImageUpload = async (file: File, slotId: string) => {
    try {
      await uploadImageMutation.mutateAsync({
        submissionId,
        file,
        slotId,
      });
      
      notification.success({
        message: "Image Uploaded",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      notification.error({
        message: "Upload Failed",
        description: errorMsg || "Failed to upload image"
      });
    }
  };

  const handleDeleteImage = async (slotId: string) => {
    try {
      await deleteImageMutation.mutateAsync({
        submissionId,
        slotId,
      });
      
      notification.success({
        message: "Image Deleted",
        description: "Image removed successfully"
      });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      notification.error({
        message: "Delete Failed",
        description: errorMsg || "Failed to delete image"
      });
    }
  };

  const handleSubmitTask = async () => {
    try {
      await submitForReviewMutation.mutateAsync(submissionId);
      
      notification.success({
        message: "Task Submitted",
        description: "Your task has been submitted for review"
      });
      
      navigate("/dashboard/user/microtasks");
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      notification.error({
        message: "Submission Failed",
        description: errorMsg || "Failed to submit task"
      });
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    accept: "image/*",
    multiple: false,
    showUploadList: false
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

  const getSlotInstruction = (slot: TaskSlot, category: string) => {
    if (category === "mask_collection") {
      return `Take a photo wearing a face mask with your face at a ${slot.angle} angle`;
    } else if (category === "age_progression") {
      return `Upload a photo from ${slot.time_period} showing ${slot.description}`;
    }
    return slot.description;
  };

  // Calculate current step based on progress
  const currentStep = submission ? (
    submission.completed_slots === 0 ? 0 :
    submission.completed_slots < submission.total_slots ? 1 : 2
  ) : 0;

  const isUploadingSlot = (slotId: string) => {
    return uploadImageMutation.isPending && 
           uploadImageMutation.variables?.slotId === slotId;
  };

  if (isSubmissionLoading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading task details...</div>
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
  const canSubmit = submission.completed_slots === submission.total_slots && submission.status === "in_progress";

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
          </Space>
        </Title>
        <Text type="secondary">{submission.taskId.description}</Text>
      </div>

      {/* Progress Steps */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep} size="small">
          <Step
            title="Start Upload"
            description="Begin uploading images"
            icon={<CameraOutlined />}
          />
          <Step
            title="Upload Images"
            description={`${submission.completed_slots}/${submission.total_slots} completed`}
            icon={<UploadOutlined />}
          />
          <Step
            title="Submit Task"
            description="Submit for review"
            icon={<SendOutlined />}
          />
        </Steps>
      </Card>

      {/* Task Info */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card size="small">
            <Space>
              <Badge status="processing" />
              <Text strong>Progress</Text>
            </Space>
            <Progress
              percent={submission.progress_percentage}
              status="active"
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card size="small">
            <Space>
              <Badge status="success" />
              <Text strong>Reward</Text>
            </Space>
            <div>
              <Title level={4} style={{ marginBottom: 0, color: "#52c41a" }}>
                {submission.taskId.payRateCurrency} {submission.taskId.payRate}
              </Title>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card size="small">
            <Space>
              <Badge status="warning" />
              <Text strong>Time Estimate</Text>
            </Space>
            <div>
              <Text strong>{submission.taskId.estimated_time}</Text>
              {submission.taskId.deadline && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Due: {moment(submission.taskId.deadline).format("MMM DD, HH:mm")}
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Instructions */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Alert
            message="Instructions"
            description={submission.taskId.instructions}
            type="info"
            showIcon
          />
        </Col>
        <Col span={12}>
          <Alert
            message="Quality Guidelines"
            description={submission.taskId.quality_guidelines}
            type="warning"
            showIcon
          />
        </Col>
      </Row>

      {/* Upload Slots */}
      <Card title="Upload Your Images" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {submission.slots.map((slot, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={slot._id}>
              <Card
                size="small"
                style={{
                  border: slot.uploaded ? "2px solid #52c41a" : "1px solid #d9d9d9",
                  position: "relative"
                }}
                bodyStyle={{ padding: 12 }}
              >
                {slot.uploaded && (
                  <div style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    zIndex: 2
                  }}>
                    <Badge status="success" />
                  </div>
                )}

                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <Title level={5} style={{ marginBottom: 4 }}>
                    #{index + 1} {slot.angle || slot.time_period}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {getSlotInstruction(slot, submission.taskId.category)}
                  </Text>
                </div>

                {slot.uploaded && slot.image_url ? (
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={slot.image_url}
                      alt={`Slot ${index + 1}`}
                      style={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 8
                      }}
                      preview={{
                        mask: <EyeOutlined />
                      }}
                    />
                    <Space>
                      <Tooltip title="Replace Image">
                        <Upload
                          {...uploadProps}
                          onChange={({ file }) => {
                            if (file.originFileObj) {
                              handleImageUpload(file.originFileObj, slot._id);
                            }
                          }}
                        >
                          <Button size="small" icon={<UploadOutlined />}>
                            Replace
                          </Button>
                        </Upload>
                      </Tooltip>
                      <Tooltip title="Delete Image">
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteImage(slot._id)}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </Space>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: 150,
                        border: "2px dashed #d9d9d9",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                        backgroundColor: "#fafafa"
                      }}
                    >
                      <CameraOutlined style={{ fontSize: 32, color: "#d9d9d9" }} />
                    </div>
                    <Upload
                      {...uploadProps}
                      onChange={({ file }) => {
                        if (file.originFileObj) {
                          handleImageUpload(file.originFileObj, slot._id);
                        }
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={isUploadingSlot(slot._id)}
                        size="small"
                        block
                      >
                        {isUploadingSlot(slot._id) ? "Uploading..." : "Upload Image"}
                      </Button>
                    </Upload>
                  </div>
                )}

                {/* Slot metadata */}
                {Object.keys(slot.metadata).length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11 }}>
                    {Object.entries(slot.metadata).map(([key, value]) => (
                      value && (
                        <Tag key={key} style={{ marginBottom: 2, fontSize: 12 }}>
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
      </Card>

      {/* Submit Button */}
      {submission.status === "in_progress" && (
        <Card>
          <div style={{ textAlign: "center" }}>
            {canSubmit ? (
              <Space direction="vertical" size="large">
                <Alert
                  message="Ready to Submit"
                  description="All images have been uploaded. You can now submit your task for review."
                  type="success"
                  showIcon
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  loading={isSubmitForReviewLoading}
                  onClick={handleSubmitTask}
                >
                  Submit Task for Review
                </Button>
              </Space>
            ) : (
              <Alert
                message={`Upload Progress: ${submission.completed_slots}/${submission.total_slots} images`}
                description="Please upload all required images before submitting."
                type="info"
                showIcon
              />
            )}
          </div>
        </Card>
      )}

      {/* Status Display for non-in-progress submissions */}
      {submission.status !== "in_progress" && (
        <Card>
          <div style={{ textAlign: "center" }}>
            <Alert
              message={`Task Status: ${submission.status.replace("_", " ").toUpperCase()}`}
              description={
                submission.status === "completed" ? "Your task has been submitted and is awaiting review." :
                submission.status === "under_review" ? "Your task is currently being reviewed." :
                submission.status === "approved" ? "Congratulations! Your task has been approved." :
                submission.status === "rejected" ? "Your task was rejected. Please check feedback and try again." :
                submission.status === "partially_rejected" ? "Some images were rejected. Please check feedback and resubmit." :
                "Unknown status"
              }
              type={
                submission.status === "approved" ? "success" :
                submission.status === "rejected" ? "error" :
                submission.status === "partially_rejected" ? "warning" :
                "info"
              }
              showIcon
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubmissionImageUpload;