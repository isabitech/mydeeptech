import { EyeOutlined } from "@ant-design/icons";
import { 
  Button, 
  Modal, 
  Tag, 
  Row,
  Col,
  Card,
  Descriptions 
} from "antd";
import { Assessment } from './types';
import { getAverageScore, getTotalScore, getScoreColor, getStatusColor, formatRatingDisplay } from './assessment-utils';

interface ViewAssessmentModalProps {
  visible: boolean;
  onCancel: () => void;
  assessment: Assessment | null;
}

const ViewAssessmentModal = ({ visible, onCancel, assessment }: ViewAssessmentModalProps) => {
  if (!assessment) return null;

  return (
    <Modal
      title={
        <div className="flex items-center">
          <EyeOutlined className="mr-2 text-[#F6921E]" />
          Assessment Details
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={800}
    >
      <div className="space-y-6">
        {/* Candidate Information */}
        <Card size="small" title="Candidate Information">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Name">{assessment.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{assessment.emailAddress}</Descriptions.Item>
            <Descriptions.Item label="User ID">{assessment.userId}</Descriptions.Item>
            <Descriptions.Item label="Clarity Rating">{assessment.instructionClarityRating}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Assessment Overview */}
        <Card size="small" title="Assessment Overview">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(assessment.reviewStatus)}>
                {assessment.reviewStatus.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Submitted Date">
              {new Date(assessment.dateOfSubmission).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Submission Time">
              {assessment.timeOfSubmission}
            </Descriptions.Item>
            <Descriptions.Item label="Google Drive Link">
              <a href={assessment.googleDriveLink} target="_blank" rel="noopener noreferrer">
                View Submission Files
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Issues Encountered">
              {assessment.encounteredIssues}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Score Details */}
        <Card size="small" title="Performance Metrics">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {assessment.englishTestScore}
                </div>
                <div className="text-gray-500">English Test</div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {assessment.problemSolvingScore}
                </div>
                <div className="text-gray-500">Problem Solving</div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-[#F6921E]">
                  {getAverageScore(assessment)}
                </div>
                <div className="text-gray-500">Average Score</div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {getTotalScore(assessment)}
                </div>
                <div className="text-gray-500">Total Score</div>
              </div>
            </Col>
          </Row>
          
          {/* Submission Status */}
          <div className="mt-4">
            <h5 className="font-semibold mb-2">Submission Status:</h5>
            <Row gutter={16}>
              <Col span={12} className="flex items-start flex-wrap gap-1">
                <Tag color={assessment.submissionStatus.englishTestUploaded ? "green" : "red"}>
                  English Test: {assessment.submissionStatus.englishTestUploaded ? "Uploaded" : "Not Uploaded"}
                </Tag>
                <Tag color={assessment.submissionStatus.problemSolvingTestUploaded ? "green" : "red"}>
                  Problem Solving: {assessment.submissionStatus.problemSolvingTestUploaded ? "Uploaded" : "Not Uploaded"}
                </Tag>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Review Information (if exists) */}
        {assessment.reviewRating && (
          <Card size="small" title="Review Information">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Rating">
                {assessment.reviewRating && (
                  <Tag color="blue" className="text-base px-3">
                    {formatRatingDisplay(assessment.reviewRating)}
                  </Tag>
                )}
              </Descriptions.Item>
              {assessment.reviewerComment && (
                <Descriptions.Item label="Review Comments">
                  {assessment.reviewerComment}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Reviewer ID">
                {assessment.reviewerId}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ViewAssessmentModal;