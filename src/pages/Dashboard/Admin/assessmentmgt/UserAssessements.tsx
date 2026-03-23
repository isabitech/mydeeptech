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
  Divider,
  Row,
  Col,
  Card,
  Descriptions
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Assessment {
  id: string;
  name: string;
  email: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  submittedDate: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'not-started';
  questions: number;
  correctAnswers: number;
  reviewRating?: number;
  reviewDescription?: string;
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

  // Mock data - replace with actual API call
  const assessments: Assessment[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@email.com",
      assessmentTitle: "Frontend Developer Assessment",
      score: 85,
      maxScore: 100,
      submittedDate: "2024-03-20",
      duration: "45 minutes",
      status: "completed",
      questions: 20,
      correctAnswers: 17,
      reviewRating: 4,
      reviewDescription: "Strong performance with good understanding of React concepts."
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      assessmentTitle: "Backend Developer Assessment",
      score: 92,
      maxScore: 100,
      submittedDate: "2024-03-19",
      duration: "50 minutes",
      status: "completed",
      questions: 25,
      correctAnswers: 23
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      assessmentTitle: "Full Stack Developer Assessment",
      score: 78,
      maxScore: 100,
      submittedDate: "2024-03-18",
      duration: "60 minutes",
      status: "completed",
      questions: 30,
      correctAnswers: 23
    }
  ];

  const filteredAssessments = assessments.filter(
    assessment =>
      assessment.name.toLowerCase().includes(searchText.toLowerCase()) ||
      assessment.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleReviewAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    if (assessment.reviewRating) {
      reviewForm.setFieldsValue({
        rating: assessment.reviewRating,
        description: assessment.reviewDescription
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

  const handleReviewSubmit = (values: ReviewFormData) => {
    console.log('Review submitted:', {
      assessmentId: selectedAssessment?.id,
      ...values
    });
    // Here you would typically make an API call to save the review
    setIsReviewModalVisible(false);
    reviewForm.resetFields();
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "green";
    if (percentage >= 70) return "orange";
    return "red";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "green";
      case "in-progress": return "blue";
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
          <div className="font-semibold">{record.name}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Assessment",
      dataIndex: "assessmentTitle",
      key: "assessmentTitle",
    },
    {
      title: "Score",
      key: "score",
      render: (record: Assessment) => (
        <div className="flex flex-col items-center justify-center">
          <Tag color={getScoreColor(record.score, record.maxScore)}>
            {record.score}/{record.maxScore}
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((record.score / record.maxScore) * 100)}%
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: Assessment) => (
        <Tag color={getStatusColor(record.status)}>
          {record.status.replace('-', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Submitted Date",
      dataIndex: "submittedDate",
      key: "submittedDate",
    },
    {
      title: "Actions",
      key: "actions",
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
      <Table
        columns={columns}
        dataSource={filteredAssessments}
        rowKey="id"
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
                  <h4 className="font-semibold text-lg">{selectedAssessment.name}</h4>
                  <p className="text-gray-600">{selectedAssessment.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedAssessment.assessmentTitle}</p>
                </div>
                <Tag color={getScoreColor(selectedAssessment.score, selectedAssessment.maxScore)} className="text-lg px-3 py-1">
                  {selectedAssessment.score}/{selectedAssessment.maxScore}
                </Tag>
              </div>
            </div>
            
            <Form
              form={reviewForm}
              onFinish={handleReviewSubmit}
              layout="vertical"
            >
              <Form.Item
                name="rating"
                label="Review Rating"
                rules={[{ required: true, message: "Please provide a rating" }]}
              >
                <Rate allowHalf />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="Review Description"
                rules={[{ required: true, message: "Please provide a review description" }]}
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
                  <Button type="primary" htmlType="submit">
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
                <Descriptions.Item label="Name">{selectedAssessment.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedAssessment.email}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Assessment Overview */}
            <Card size="small" title="Assessment Overview">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Assessment Title">
                  {selectedAssessment.assessmentTitle}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedAssessment.status)}>
                    {selectedAssessment.status.replace('-', ' ').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Submitted Date">
                  {selectedAssessment.submittedDate}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedAssessment.duration}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Score Details */}
            <Card size="small" title="Performance Metrics">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-[#F6921E]">
                      {selectedAssessment.score}/{selectedAssessment.maxScore}
                    </div>
                    <div className="text-gray-500">Total Score</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((selectedAssessment.score / selectedAssessment.maxScore) * 100)}%
                    </div>
                    <div className="text-gray-500">Percentage</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedAssessment.correctAnswers}/{selectedAssessment.questions}
                    </div>
                    <div className="text-gray-500">Correct Answers</div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Review Information (if exists) */}
            {selectedAssessment.reviewRating && (
              <Card size="small" title="Review Information">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Rating">
                    <Rate disabled value={selectedAssessment.reviewRating} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Review Description">
                    {selectedAssessment.reviewDescription}
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