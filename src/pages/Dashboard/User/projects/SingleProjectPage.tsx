import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Tag,
  Alert,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Empty,
  Typography,
  Space,
  Divider,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  CalendarOutlined,
  TagOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserProjects } from "../../../../hooks/Auth/User/Projects/useUserProjects";
import {
  Project,
  ApplyToProjectForm,
  Availability,
} from "../../../../types/project.types";
import { getErrorMessage } from "../../../../service/apiUtils";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AVAILABILITY_OPTIONS: Availability[] = ["full_time", "part_time", "flexible"];

const statusMap = {
  open: "Open",
  close: "Closed",
};

const SingleProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applicationForm] = Form.useForm();

  const {
    getProjectById,
    applyToProject,
    loading,
    error,
  } = useUserProjects();

  // Fetch the specific project
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const result = await getProjectById(projectId);
      if (result.success) {
        setSelectedProject(result.data);
      } else {
        message.error(result.error || "Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      message.error("Failed to fetch project details");
    }
  }, [getProjectById, projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const showApplicationModal = () => {
    setIsApplicationModalVisible(true);
    applicationForm.resetFields();
  };

  const handleApply = async () => {
    if (!selectedProject) return;

    try {
      const values = await applicationForm.validateFields();
      const applicationData: ApplyToProjectForm = {
        coverLetter: values.coverLetter,
        availability: values.availability,
        proposedRate: values.proposedRate,
        estimatedCompletionTime: values.estimatedCompletionTime,
        languageCode:
          typeof navigator !== "undefined" && navigator.language
            ? navigator.language
            : "en-US",
      };

      const result = await applyToProject(selectedProject._id, applicationData);

      if (result.success) {
        const returnedStatus =
          result.data?.applicationStatus ?? result.data?.application?.status ?? null;
        const interviewRequired = Boolean(
          result.data?.aiInterviewRequired ??
            selectedProject.aiInterviewRequired ??
            returnedStatus === "ai_interview_required",
        );
        const interviewSessionId = result.data?.aiInterview?.session?.id ?? null;

        if (interviewRequired) {
          if (!interviewSessionId) {
            message.error(
              "The project requires an AI interview, but no interview session was returned.",
            );
            return;
          }

          message.info(
            "AI interview required. Complete the interview before your application can move into review.",
          );
          setIsApplicationModalVisible(false);
          applicationForm.resetFields();
          navigate(`/dashboard/ai-interview/session/${interviewSessionId}`);
          return;
        }

        message.success("Application submitted successfully!");
        setIsApplicationModalVisible(false);
        applicationForm.resetFields();
        // Refresh the project data
        fetchProject();
      } else {
        message.error(result.error || "Failed to submit application");
      }
    } catch (error) {
      const errMsg = getErrorMessage(error);
      console.error("Application error:", errMsg);
      message.error(errMsg || "Failed to submit application");
    }
  };

  const handleBackToProjects = () => {
    navigate('/dashboard/projects?tab=available');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
        <span className="ml-3">Loading project details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToProjects}
          className="mb-4"
        >
          Back to Projects
        </Button>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={fetchProject} size="small">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToProjects}
          className="mb-4"
        >
          Back to Projects
        </Button>
        <Empty description="Project not found" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToProjects}
          className="mb-4"
        >
          Back to Projects
        </Button>
        
        {/* Welcome Message if this came from an email invitation */}
        <Alert
          message="Welcome! We've found a project that matches your skills."
          description={`You've been invited to apply for "${selectedProject.projectName}". Review the details below and apply if you're interested.`}
          type="info"
          showIcon
          icon={<RobotOutlined />}
          className="mb-6"
        />
      </div>

      {/* Project Details Card */}
      <Card className="shadow-lg">
        <div className="mb-6">
          <Title level={2} className="mb-2">
            {selectedProject.projectName}
          </Title>
          
          <Space wrap className="mb-4">
            <Tag color="blue" className="px-3 py-1">
              <TagOutlined className="mr-1" />
              {selectedProject.projectCategory}
            </Tag>
            <Tag 
              color={selectedProject.difficultyLevel === 'beginner' ? 'green' : 
                    selectedProject.difficultyLevel === 'intermediate' ? 'orange' : 
                    selectedProject.difficultyLevel === 'advanced' ? 'red' : 'purple'}
              className="px-3 py-1"
            >
              {selectedProject.difficultyLevel.toUpperCase()}
            </Tag>
            <Tag 
              color={selectedProject.status === 'active' ? 'green' : 'orange'} 
              className="px-3 py-1"
            >
              {selectedProject.status.toUpperCase()}
            </Tag>
            <Tag 
              color={selectedProject.aiInterviewRequired ? "volcano" : "green"}
              className="px-3 py-1"
            >
              {selectedProject.aiInterviewRequired ? "AI Interview Required" : "Direct Review"}
            </Tag>
          </Space>
        </div>

        <Divider />

        {/* Project Details Grid */}
        <Row gutter={[24, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle" className="w-full">
              <div>
                <Text strong className="flex items-center mb-2">
                  <DollarOutlined className="mr-2" />
                  Payment
                </Text>
                <Text className="text-lg font-semibold text-green-600">
                  {selectedProject.payRateCurrency} {selectedProject.payRate} {selectedProject.payRateType}
                </Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <ClockCircleOutlined className="mr-2" />
                  Duration
                </Text>
                <Text>{selectedProject.estimatedDuration || 'Not specified'}</Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <UserOutlined className="mr-2" />
                  Max Annotators
                </Text>
                <Text>{selectedProject.maxAnnotators || 'Unlimited'}</Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <InfoCircleOutlined className="mr-2" />
                  Applications
                </Text>
                <Text>{selectedProject.currentApplications || 0}</Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle" className="w-full">
              <div>
                <Text strong className="flex items-center mb-2">
                  <CalendarOutlined className="mr-2" />
                  Project Deadline
                </Text>
                <Text>
                  {selectedProject.deadline && moment(selectedProject.deadline).isValid()
                    ? moment(selectedProject.deadline).format('MMMM DD, YYYY')
                    : 'Not specified'
                  }
                </Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <CalendarOutlined className="mr-2" />
                  Application Deadline
                </Text>
                <Text>
                  {selectedProject.applicationDeadline && moment(selectedProject.applicationDeadline).isValid()
                    ? moment(selectedProject.applicationDeadline).format('MMMM DD, YYYY')
                    : 'Open until filled'
                  }
                  {selectedProject.daysUntilDeadline !== null && selectedProject.daysUntilDeadline !== undefined && (
                    <Text type="secondary" className="ml-2">
                      ({selectedProject.daysUntilDeadline} days left)
                    </Text>
                  )}
                </Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <InfoCircleOutlined className="mr-2" />
                  Min Experience
                </Text>
                <Text>{selectedProject.minimumExperience || 'None'}</Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <InfoCircleOutlined className="mr-2" />
                  Application Status
                </Text>
                <Text>
                  {statusMap[selectedProject.openCloseStatus as keyof typeof statusMap] || 'Unknown'}
                </Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <InfoCircleOutlined className="mr-2" />
                  Application Path
                </Text>
                <Text>
                  {selectedProject.aiInterviewRequired 
                    ? 'AI Interview + Admin Review' 
                    : 'Direct admin review after application'
                  }
                </Text>
              </div>

              <div>
                <Text strong className="flex items-center mb-2">
                  <TagOutlined className="mr-2" />
                  Required Skills
                </Text>
                <Space wrap>
                  {selectedProject.requiredSkills.map((skill, index) => (
                    <Tag key={index} className="mb-1">{skill}</Tag>
                  ))}
                </Space>
              </div>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* Project Description */}
        <div className="mb-6">
          <Title level={4} className="mb-3">
            Project Description
          </Title>
          <Paragraph className="text-gray-700 leading-relaxed">
            {selectedProject.projectDescription}
          </Paragraph>
        </div>

        {/* Language Requirements */}
        {selectedProject.languageRequirements && selectedProject.languageRequirements.length > 0 && (
          <div className="mb-6">
            <Title level={4} className="mb-3">
              Language Requirements
            </Title>
            <Space wrap>
              {selectedProject.languageRequirements.map((lang, index) => (
                <Tag key={index} color="geekblue">{lang}</Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center pt-4">
          {selectedProject.openCloseStatus === 'open' && selectedProject.canApply && !selectedProject.hasApplied ? (
            <Button
              type="primary"
              size="large"
              onClick={showApplicationModal}
              className="px-8"
            >
              {selectedProject.aiInterviewRequired ? "Apply and Start AI Interview" : "Apply to Project"}
            </Button>
          ) : selectedProject.hasApplied ? (
            <div>
              <Button type="default" disabled size="large" className="px-8 mb-2">
                <CheckCircleOutlined className="mr-2" />
                Application Submitted
              </Button>
              {selectedProject.userApplication && (
                <div className="text-center">
                  <Text type="secondary">
                    Status: <Tag color="blue">{selectedProject.userApplication.status}</Tag>
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <Button type="default" disabled size="large" className="px-8">
              Applications Closed
            </Button>
          )}
        </div>
      </Card>

      {/* Application Modal */}
      <Modal
        title="Apply to Project"
        open={isApplicationModalVisible}
        onOk={handleApply}
        onCancel={() => setIsApplicationModalVisible(false)}
        okText={selectedProject?.aiInterviewRequired ? "Start AI Interview" : "Submit Application"}
        cancelText="Cancel"
        okButtonProps={{ loading }}
        width={600}
      >
        {selectedProject && (
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-semibold">{selectedProject.projectName}</h4>
              <p className="text-sm text-gray-600">
                {selectedProject.payRateCurrency} {selectedProject.payRate} per {selectedProject.payRateType.replace('_', ' ')}
              </p>
              <Tag color={selectedProject.aiInterviewRequired ? "volcano" : "green"} className="mt-2">
                {selectedProject.aiInterviewRequired ? "AI Interview Required" : "Direct Admin Review"}
              </Tag>
            </div>

            {selectedProject.aiInterviewRequired && (
              <Alert
                type="warning"
                showIcon
                className="mb-4"
                message="This project requires an AI interview"
                description="After you apply, you will be routed into a project-specific AI interview. Your application only moves into admin review if the interview is passed."
              />
            )}

        <Form form={applicationForm} layout="vertical">
          <Form.Item
            name="coverLetter"
            label="Cover Letter"
            rules={[
              { required: true, message: "Please write a cover letter" },
              { max: 1000, message: "Cover letter cannot exceed 1000 characters" }
            ]}
          >
            <TextArea
              placeholder="Explain why you're interested in this project and what makes you a good fit..."
              rows={6}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="availability"
              label="Availability"
              rules={[{ required: true, message: "Please select your availability" }]}
            >
              <Select placeholder="Select availability">
                {AVAILABILITY_OPTIONS.map(option => (
                  <Option key={option} value={option}>
                    {option.replace('_', ' ').toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="proposedRate"
              label="Proposed Rate (Optional)"
              help="Leave empty to accept listed rate"
            >
              <InputNumber
                placeholder={`Default: ${selectedProject.payRateCurrency} ${selectedProject.payRate}`}
                min={0}
                precision={2}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="estimatedCompletionTime"
            label="Estimated Completion Time (Optional)"
          >
            <Input placeholder="e.g., 2 weeks, 1 month" />
          </Form.Item>
        </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SingleProjectPage;