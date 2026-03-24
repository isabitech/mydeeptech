import { BookOutlined, EyeOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { 
  Button, 
  Typography, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Rate, 
  Space, 
  Tag, 
  Row,
  Col,
  Card,
  Descriptions,
  Spin,
  message
} from "antd";
import { useState } from "react";
import assessmentQueryService from "../../../../services/assessement-service/assessement-query";
import { GetSubmissionsResponseSchema, SubmitReviewSchema } from "../../../../validators/assessment-reviews/assessment-reviews-schema";
import assessmentMutationService from "../../../../services/assessement-service/assessment-mutation";
import ErrorMessage from "../../../../lib/error-message";
import { useUserInfoActions } from "../../../../store/useAuthStore";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Assessment {
  _id: string;
  userId: string;
  fullName: string;
  emailAddress: string;
  dateOfSubmission: string;
  timeOfSubmission: string;
  submissionStatus: {
    englishTestUploaded: boolean;
    problemSolvingTestUploaded: boolean;
  };
  englishTestScore: string;
  problemSolvingScore: string;
  googleDriveLink: string;
  encounteredIssues: string;
  issueDescription: string | null;
  instructionClarityRating: number;
  reviewerComment: string | null;
  reviewStatus: string;
  reviewRating: number | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ReviewFormData {
  rating: number;
  description: string;
}

const UserAssessments = () => {
  const [searchText, setSearchText] = useState("");
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [reviewForm] = Form.useForm();
  const { setIsAssessmentSubmitted } = useUserInfoActions();
 
  const { assessmentReviews, isAssessmentReviewsLoading } = assessmentQueryService.useAssessmentReviews();
  const { updateReviewMutation, isUpdateReviewLoading } = assessmentMutationService.useUpdateReview();

  const filteredAssessments = assessmentReviews.filter((assessment: GetSubmissionsResponseSchema["data"]["assessmentReviews"][number]) =>
      assessment.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      assessment.emailAddress?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleReviewAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    if (assessment.reviewRating) {
      reviewForm.setFieldsValue({
        reviewRating: assessment.reviewRating,
        reviewerComment: assessment.reviewerComment
      });
    } else {
      reviewForm.resetFields();
    }
    setIsReviewModalVisible(true);
  };

  const handleViewAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsViewModalVisible(true);
  };

  const handleReviewSubmit = (values: SubmitReviewSchema) => {
    if (!selectedAssessment) return;
    if(isUpdateReviewLoading) return;

    const payload = {
      assessmentId: selectedAssessment._id,
      reviewStatus: "Reviewed",
      reviewRating: values.reviewRating,
     ...(values.reviewerComment && {reviewerComment: values.reviewerComment})
    };

    updateReviewMutation.mutate(payload, {
      onSuccess: () => {
        setIsReviewModalVisible(false);
        reviewForm.resetFields();
        setIsAssessmentSubmitted();
        message.success("Review submitted successfully");
      },
      onError: (error) => {
        message.error(ErrorMessage(error));
      },
    });
  };

  const getAverageScore = (assessment: Assessment) => {
    const englishScore = parseInt(assessment.englishTestScore);
    const problemSolvingScore = parseInt(assessment.problemSolvingScore);
    return Math.round((englishScore + problemSolvingScore) / 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "green";
    if (score >= 70) return "orange";
    return "red";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "green";
      case "pending": return "orange";
      case "reviewed": return "blue";
      case "not-started": return "default";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Candidate",
      key: "candidate",
      render: (record: Assessment) => (
        <div>
          <div className="font-semibold">{record.fullName}</div>
          <div className="text-gray-500 text-sm">{record.emailAddress}</div>
        </div>
      ),
    },
    {
      title: "Scores",
      key: "scores",
      align: 'center' as const,
      render: (record: Assessment) => {
        const averageScore = getAverageScore(record);
        return (
          <div className="flex flex-col items-center justify-center">
            <Tag color={getScoreColor(averageScore)}>
              Avg: {averageScore}
            </Tag>
            <div className="text-xs text-gray-500 mt-1">
              English: {record.englishTestScore} | Problem Solving: {record.problemSolvingScore}
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: 'center' as const,
      render: (record: Assessment) => (
        <Tag color={getStatusColor(record.reviewStatus)}>
          {record.reviewStatus.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Submitted Date",
      key: "submittedDate",
      align: 'center' as const,
      render: (record: Assessment) => {
        const date = new Date(record.dateOfSubmission);
        return (
          <div className="flex flex-col items-center justify-center">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{record.timeOfSubmission}</div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center' as const,
      render: (record: Assessment) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleViewAssessment(record)}
            size="small"
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleReviewAssessment(record)}
            size="small"
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  return (
     <div className="p-6 font-[gilroy-regular]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between flex-wrap gap-3 items-start mb-4">
          <div>
            <Title level={2} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
              <BookOutlined className="mr-3 text-[#F6921E]" />
              Review Assessments
            </Title>
            <Text className="text-gray-600 text-lg font-[gilroy-regular]">
              Review assessment performance and view detailed submission analytics
            </Text>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <Input
          placeholder="Search by name or email address"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value.trim())}
          size="middle"
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <Spin spinning={isAssessmentReviewsLoading}>
        <Table
          columns={columns}
          dataSource={filteredAssessments}
          rowKey="_id"
          loading={isAssessmentReviewsLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: "max-content" }}
          className="bg-white rounded-lg shadow-sm"
        />
      </Spin>

      {/* Review Assessment Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2 text-[#F6921E]" />
            Review Assessment
          </div>
        }
        open={isReviewModalVisible}
        onCancel={() => {
          setIsReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedAssessment && (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{selectedAssessment.fullName}</h4>
                  <p className="text-gray-600">{selectedAssessment.emailAddress}</p>
                </div>
                <div className="text-right">
                  <Tag color={getScoreColor(getAverageScore(selectedAssessment))} className="text-lg px-3 py-1">
                    Avg: {getAverageScore(selectedAssessment)}
                  </Tag>
                  <div className="text-xs text-gray-500 mt-1">
                    English: {selectedAssessment.englishTestScore} | Problem Solving: {selectedAssessment.problemSolvingScore}
                  </div>
                </div>
              </div>
            </div>
            
            <Form
              form={reviewForm}
              onFinish={handleReviewSubmit}
              layout="vertical"
            >
              <Form.Item
                name="reviewRating"
                label="Review Rating"
                rules={[{ required: true, message: "Please provide a rating" }]}
              >
                <Rate />
              </Form.Item>
              
              <Form.Item
                name="reviewerComment"
                label="Review Description"
              >
                <TextArea
                  rows={4}
                  placeholder="Provide detailed feedback about the candidate's performance..."
                />
              </Form.Item>
              
              <Form.Item className="mb-0 flex justify-end">
                <Space>
                  <Button onClick={() => setIsReviewModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button 
                      type="primary"
                      htmlType="submit" 
                      loading={isUpdateReviewLoading}
                      disabled={isUpdateReviewLoading}>
                      Submit Review
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* View Assessment Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EyeOutlined className="mr-2 text-[#F6921E]" />
            Assessment Details
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedAssessment && (
          <div className="space-y-6">
            {/* Candidate Information */}
            <Card size="small" title="Candidate Information">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Name">{selectedAssessment.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedAssessment.emailAddress}</Descriptions.Item>
                <Descriptions.Item label="User ID">{selectedAssessment.userId}</Descriptions.Item>
                <Descriptions.Item label="Clarity Rating">{selectedAssessment.instructionClarityRating}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Assessment Overview */}
            <Card size="small" title="Assessment Overview">
              <Descriptions column={2} size="small">
                {/* <Descriptions.Item label="Assessment Type">
                  Combined Assessment (English + Problem Solving)
                </Descriptions.Item> */}
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedAssessment.reviewStatus)}>
                    {selectedAssessment.reviewStatus.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Submitted Date">
                  {new Date(selectedAssessment.dateOfSubmission).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Submission Time">
                  {selectedAssessment.timeOfSubmission}
                </Descriptions.Item>
                <Descriptions.Item label="Google Drive Link">
                  <a href={selectedAssessment.googleDriveLink} target="_blank" rel="noopener noreferrer">
                    View Submission Files
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Issues Encountered">
                  {selectedAssessment.encounteredIssues}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Score Details */}
            <Card size="small" title="Performance Metrics">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedAssessment.englishTestScore}
                    </div>
                    <div className="text-gray-500">English Test</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedAssessment.problemSolvingScore}
                    </div>
                    <div className="text-gray-500">Problem Solving</div>
                  </div>
                </Col>
                   <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-[#F6921E]">
                      {getAverageScore(selectedAssessment)}
                    </div>
                    <div className="text-gray-500">Average Score</div>
                  </div>
                </Col>
              </Row>
              
              {/* Submission Status */}
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Submission Status: </h5>
                <Row gutter={16}>
                  <Col span={12}  className="flex items-start flex-wrap gap-1">
                    <Tag color={selectedAssessment.submissionStatus.englishTestUploaded ? "green" : "red"}>
                      English Test: {selectedAssessment.submissionStatus.englishTestUploaded ? "Uploaded" : "Not Uploaded"}
                    </Tag>
                     <Tag color={selectedAssessment.submissionStatus.problemSolvingTestUploaded ? "green" : "red"}>
                      Problem Solving: {selectedAssessment.submissionStatus.problemSolvingTestUploaded ? "Uploaded" : "Not Uploaded"}
                    </Tag>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* Review Information (if exists) */}
            {selectedAssessment.reviewRating && (
              <Card size="small" title="Review Information">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Rating">
                    <Rate disabled value={selectedAssessment.reviewRating} />
                  </Descriptions.Item>
                  {
                    selectedAssessment.reviewerComment ? (
                       <Descriptions.Item label="Review Comments">
                    {selectedAssessment.reviewerComment}
                  </Descriptions.Item>
                    ) : null
                  }
                  <Descriptions.Item label="Reviewer ID">
                    {selectedAssessment.reviewerId}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
   
    </div>
  )
}

export default UserAssessments